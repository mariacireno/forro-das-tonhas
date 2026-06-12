const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../database')
const { buildPixPayload } = require('../utils/pix')
const { sendConfirmacaoIngresso, sendNotificacaoNovaVenda } = require('../utils/email')
const { buildTicketPdf } = require('../utils/pdf')

// --- helpers ---
const getConf = (k) => db.prepare('SELECT valor FROM config WHERE chave = ?').get(k)?.valor ?? ''

// --- portaria (tickets) ---

router.get('/summary', (req, res) => {
  const total = db.prepare('SELECT COALESCE(SUM(quantidade),0) as qty, COALESCE(SUM(quantidade*valor_unitario),0) as receita FROM tickets').get()
  const porTipo = db.prepare('SELECT tipo, SUM(quantidade) as qty, SUM(quantidade*valor_unitario) as receita FROM tickets GROUP BY tipo').all()
  const porCanal = db.prepare('SELECT canal, SUM(quantidade) as qty FROM tickets GROUP BY canal').all()
  res.json({ ...total, porTipo, porCanal })
})

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM tickets ORDER BY created_at DESC').all())
})

router.post('/', (req, res) => {
  const { tipo, quantidade, valor_unitario, canal, data } = req.body
  if (!tipo || !quantidade || !valor_unitario) {
    return res.status(400).json({ error: 'Tipo, quantidade e valor unitário obrigatórios' })
  }

  const id = uuidv4()
  const qty = parseInt(quantidade)
  const unit = parseFloat(valor_unitario)
  const total = qty * unit

  db.prepare('INSERT INTO tickets (id, tipo, quantidade, valor_unitario, canal, data) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, tipo, qty, unit, canal || 'portaria', data || null)

  db.prepare("INSERT INTO transactions (id, tipo, categoria, valor, descricao, data) VALUES (?, 'receita', 'ingressos', ?, ?, ?)")
    .run(uuidv4(), total, `${qty}x ingresso ${tipo} (${canal || 'portaria'})`, data || null)

  const insC = db.prepare('INSERT INTO ticket_checkins (id, venda_id, tipo, nome, seq) VALUES (?, ?, ?, ?, ?)')
  for (let i = 0; i < qty; i++) insC.run(uuidv4(), id, tipo, 'Portaria', i + 1)

  res.status(201).json(db.prepare('SELECT * FROM tickets WHERE id = ?').get(id))
})

router.get('/:id/pdf', async (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id)
  if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado' })
  let checkins = db.prepare('SELECT * FROM ticket_checkins WHERE venda_id = ? ORDER BY seq').all(req.params.id)
  if (!checkins.length) {
    const insC = db.prepare('INSERT INTO ticket_checkins (id, venda_id, tipo, nome, seq) VALUES (?, ?, ?, ?, ?)')
    for (let i = 0; i < ticket.quantidade; i++) insC.run(uuidv4(), ticket.id, ticket.tipo, 'Portaria', i + 1)
    checkins = db.prepare('SELECT * FROM ticket_checkins WHERE venda_id = ? ORDER BY seq').all(req.params.id)
  }
  try {
    const venda = { nome: 'Portaria', valor_total: ticket.quantidade * ticket.valor_unitario }
    const pdfBuffer = await buildTicketPdf(venda, checkins)
    const filename = `ingressos-portaria-${ticket.id.slice(0, 8)}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(pdfBuffer)
  } catch (err) {
    console.error('Erro ao gerar PDF de portaria:', err.message)
    res.status(500).json({ error: 'Erro ao gerar PDF' })
  }
})

router.delete('/:id', (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id)
  if (!ticket) return res.status(404).json({ error: 'Registro não encontrado' })
  db.prepare('DELETE FROM tickets WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// --- vendas online (ticket_vendas) ---

router.get('/vendas', (req, res) => {
  res.json(db.prepare('SELECT * FROM ticket_vendas ORDER BY created_at DESC').all())
})

router.get('/vendas/:id', (req, res) => {
  const venda = db.prepare('SELECT id, nome, email, status, valor_total, quantidade_lote_promo, quantidade_lote2, quantidade_mesa FROM ticket_vendas WHERE id = ?').get(req.params.id)
  if (!venda) return res.status(404).json({ error: 'Venda não encontrada' })
  res.json(venda)
})

router.post('/venda', (req, res) => {
  if (getConf('vendas_ativas') === '0')
    return res.status(503).json({ error: 'Vendas temporariamente suspensas.' })

  const { nome, email, cpf, telefone, quantidade_lote_promo } = req.body
  if (!nome || !email) return res.status(400).json({ error: 'Nome e email são obrigatórios' })

  const qty = parseInt(quantidade_lote_promo) || 0
  if (qty === 0) return res.status(400).json({ error: 'Selecione pelo menos 1 ingresso' })

  const limite = parseInt(getConf('limite_por_compra')) || 4
  if (qty > limite) return res.status(400).json({ error: `Máximo de ${limite} por pedido` })

  // Verifica capacidade global de cortesias
  const limiteCortesia = parseInt(getConf('limite_cortesia')) || 60
  const totalCheckins = db.prepare('SELECT COUNT(*) AS n FROM ticket_checkins').get().n
  const disponiveis = limiteCortesia - totalCheckins
  if (disponiveis <= 0) return res.status(400).json({ error: 'Ingressos esgotados' })
  if (qty > disponiveis) return res.status(400).json({ error: `Restam apenas ${disponiveis} ${disponiveis === 1 ? 'ingresso' : 'ingressos'}` })

  const id = uuidv4()
  db.prepare(`
    INSERT INTO ticket_vendas (id, nome, email, cpf, telefone, tipo, quantidade, quantidade_lote_promo, valor_total, status)
    VALUES (?, ?, ?, ?, ?, 'cortesia', ?, ?, 0, 'pago')
  `).run(id, nome, email, cpf || null, telefone || null, qty, qty)

  const insC = db.prepare('INSERT INTO ticket_checkins (id, venda_id, tipo, nome, seq) VALUES (?, ?, ?, ?, ?)')
  for (let i = 0; i < qty; i++) insC.run(uuidv4(), id, 'Cortesia', nome, i + 1)

  const vendaCriada = db.prepare('SELECT * FROM ticket_vendas WHERE id = ?').get(id)
  const checkins = db.prepare('SELECT * FROM ticket_checkins WHERE venda_id = ? ORDER BY seq').all(id)
  sendConfirmacaoIngresso(vendaCriada, checkins).catch(err =>
    console.error('Email de confirmação falhou:', err.message)
  )

  res.status(201).json({ venda: vendaCriada })
})

router.get('/vendas/:id/pdf', async (req, res) => {
  const venda = db.prepare('SELECT * FROM ticket_vendas WHERE id = ?').get(req.params.id)
  if (!venda) return res.status(404).json({ error: 'Venda não encontrada' })
  if (venda.status !== 'pago') return res.status(400).json({ error: 'Ingresso ainda não confirmado' })
  const checkins = db.prepare('SELECT * FROM ticket_checkins WHERE venda_id = ? ORDER BY seq').all(req.params.id)
  try {
    const pdfBuffer = await buildTicketPdf(venda, checkins)
    const filename = `ingresso-forro-das-tonhas-${venda.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(pdfBuffer)
  } catch (err) {
    console.error('Erro ao gerar PDF do ingresso:', err.message)
    res.status(500).json({ error: 'Erro ao gerar PDF' })
  }
})

router.patch('/vendas/:id/confirmar', (req, res) => {
  const venda = db.prepare('SELECT * FROM ticket_vendas WHERE id = ?').get(req.params.id)
  if (!venda) return res.status(404).json({ error: 'Venda não encontrada' })
  if (venda.status === 'pago') return res.status(400).json({ error: 'Venda já confirmada' })

  db.prepare("UPDATE ticket_vendas SET status = 'pago' WHERE id = ?").run(req.params.id)

  const partes = []
  if (venda.quantidade_lote_promo > 0) partes.push(`${venda.quantidade_lote_promo}x lote promo`)
  if (venda.quantidade_lote2 > 0) partes.push(`${venda.quantidade_lote2}x 2º lote`)
  if (venda.quantidade_mesa > 0) partes.push(`${venda.quantidade_mesa}x mesa`)
  if (!partes.length && venda.quantidade_inteira > 0) partes.push(`${venda.quantidade_inteira}x inteira`)
  if (!partes.length && venda.quantidade_meia > 0) partes.push(`${venda.quantidade_meia}x meia`)
  const descIngresso = (partes.length ? partes.join(' + ') : `${venda.quantidade}x ${venda.tipo}`) + ` - ${venda.nome}`

  db.prepare("INSERT INTO transactions (id, tipo, categoria, valor, descricao, data) VALUES (?, 'receita', 'ingressos', ?, ?, datetime('now'))")
    .run(uuidv4(), venda.valor_total, descIngresso)

  // Cria entradas individuais de check-in por ingresso
  const insC = db.prepare('INSERT INTO ticket_checkins (id, venda_id, tipo, nome, seq) VALUES (?, ?, ?, ?, ?)')
  let seq = 1
  for (let i = 0; i < (venda.quantidade_lote_promo || 0); i++) insC.run(uuidv4(), req.params.id, 'Lote Promo', venda.nome, seq++)
  for (let i = 0; i < (venda.quantidade_lote2 || 0); i++)      insC.run(uuidv4(), req.params.id, '2º Lote',    venda.nome, seq++)
  for (let i = 0; i < (venda.quantidade_mesa || 0) * 4; i++)   insC.run(uuidv4(), req.params.id, 'Mesa',       venda.nome, seq++)

  const vendaConfirmada = db.prepare('SELECT * FROM ticket_vendas WHERE id = ?').get(req.params.id)
  const checkins = db.prepare('SELECT * FROM ticket_checkins WHERE venda_id = ? ORDER BY seq').all(req.params.id)
  sendConfirmacaoIngresso(vendaConfirmada, checkins).catch(err =>
    console.error('Email de confirmação falhou:', err.message)
  )
  res.json(vendaConfirmada)
})

// Check-in individual por ingresso
router.get('/checkins', (req, res) => {
  const checkins = db.prepare(`
    SELECT c.*, v.email
    FROM ticket_checkins c
    JOIN ticket_vendas v ON c.venda_id = v.id
    ORDER BY c.nome COLLATE NOCASE, c.venda_id, c.seq
  `).all()
  res.json(checkins)
})

router.patch('/checkins/:id/toggle', (req, res) => {
  const c = db.prepare('SELECT * FROM ticket_checkins WHERE id = ?').get(req.params.id)
  if (!c) return res.status(404).json({ error: 'Ingresso não encontrado' })
  const novo = c.check_in ? 0 : 1
  db.prepare('UPDATE ticket_checkins SET check_in = ?, check_in_at = ? WHERE id = ?')
    .run(novo, novo ? new Date().toISOString() : null, req.params.id)
  res.json(db.prepare('SELECT * FROM ticket_checkins WHERE id = ?').get(req.params.id))
})

router.patch('/checkins/:id/scan', (req, res) => {
  const c = db.prepare('SELECT * FROM ticket_checkins WHERE id = ?').get(req.params.id)
  if (!c) return res.status(404).json({ error: 'QR Code inválido' })
  if (c.check_in) return res.status(409).json({ error: 'Ingresso já utilizado', checkin: c })
  db.prepare('UPDATE ticket_checkins SET check_in = 1, check_in_at = ? WHERE id = ?')
    .run(new Date().toISOString(), req.params.id)
  res.json(db.prepare('SELECT * FROM ticket_checkins WHERE id = ?').get(req.params.id))
})

router.delete('/vendas/:id', (req, res) => {
  const venda = db.prepare('SELECT * FROM ticket_vendas WHERE id = ?').get(req.params.id)
  if (!venda) return res.status(404).json({ error: 'Venda não encontrada' })
  if (venda.status === 'pago') return res.status(400).json({ error: 'Não é possível cancelar uma venda já confirmada' })
  db.prepare("UPDATE ticket_vendas SET status = 'cancelado' WHERE id = ?").run(req.params.id)
  res.json({ success: true })
})

module.exports = router
