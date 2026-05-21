const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../database')
const { buildPixPayload } = require('../utils/pix')

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

  res.status(201).json(db.prepare('SELECT * FROM tickets WHERE id = ?').get(id))
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

router.post('/venda', (req, res) => {
  const { nome, email, tipo, quantidade } = req.body
  if (!nome || !email) return res.status(400).json({ error: 'Nome e email são obrigatórios' })

  const qty = parseInt(quantidade) || 1
  const limite = parseInt(getConf('limite_por_compra')) || 4
  if (qty > limite) return res.status(400).json({ error: `Máximo de ${limite} ingressos por compra` })

  const tipoNorm = tipo === 'meia' ? 'meia' : 'inteira'
  const precoStr = tipoNorm === 'meia' ? getConf('valor_meia') : getConf('valor_inteira')
  const valorUnitario = parseFloat(precoStr) || 0
  const valorTotal = valorUnitario * qty

  const pixChave = getConf('pix_chave')
  if (!pixChave) return res.status(400).json({ error: 'Chave PIX não configurada. Contate o organizador.' })

  const pixNome = getConf('pix_nome') || 'Forro das Tonhas'
  const pixCidade = getConf('pix_cidade') || 'Brasil'

  const id = uuidv4()
  db.prepare(`
    INSERT INTO ticket_vendas (id, nome, email, tipo, quantidade, valor_unitario, valor_total, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')
  `).run(id, nome, email, tipoNorm, qty, valorUnitario, valorTotal)

  const pixString = buildPixPayload({
    chave: pixChave,
    nome: pixNome,
    cidade: pixCidade,
    valor: valorTotal,
    txid: id.replace(/-/g, '').slice(0, 25),
  })

  res.status(201).json({ venda: db.prepare('SELECT * FROM ticket_vendas WHERE id = ?').get(id), pixString })
})

router.patch('/vendas/:id/confirmar', (req, res) => {
  const venda = db.prepare('SELECT * FROM ticket_vendas WHERE id = ?').get(req.params.id)
  if (!venda) return res.status(404).json({ error: 'Venda não encontrada' })
  if (venda.status === 'pago') return res.status(400).json({ error: 'Venda já confirmada' })

  db.prepare("UPDATE ticket_vendas SET status = 'pago' WHERE id = ?").run(req.params.id)

  db.prepare("INSERT INTO transactions (id, tipo, categoria, valor, descricao, data) VALUES (?, 'receita', 'ingressos', ?, ?, datetime('now'))")
    .run(uuidv4(), venda.valor_total, `${venda.quantidade}x ingresso ${venda.tipo} - ${venda.nome}`)

  res.json(db.prepare('SELECT * FROM ticket_vendas WHERE id = ?').get(req.params.id))
})

router.delete('/vendas/:id', (req, res) => {
  const venda = db.prepare('SELECT * FROM ticket_vendas WHERE id = ?').get(req.params.id)
  if (!venda) return res.status(404).json({ error: 'Venda não encontrada' })
  if (venda.status === 'pago') return res.status(400).json({ error: 'Não é possível cancelar uma venda já confirmada' })
  db.prepare('DELETE FROM ticket_vendas WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

module.exports = router
