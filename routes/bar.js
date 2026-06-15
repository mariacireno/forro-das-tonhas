const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../database')

// --- Cardápio (global, sem evento_id) ---

router.get('/cardapio', (req, res) => {
  res.json(db.prepare('SELECT * FROM cardapio ORDER BY categoria, nome COLLATE NOCASE').all())
})

router.post('/cardapio', (req, res) => {
  const { nome, categoria, preco, custo } = req.body
  if (!nome || preco == null) return res.status(400).json({ error: 'Nome e preço obrigatórios' })
  const id = uuidv4()
  db.prepare('INSERT INTO cardapio (id, nome, categoria, preco, custo) VALUES (?, ?, ?, ?, ?)')
    .run(id, nome.trim(), categoria || 'bebida', parseFloat(preco), parseFloat(custo) || 0)
  res.status(201).json(db.prepare('SELECT * FROM cardapio WHERE id = ?').get(id))
})

router.put('/cardapio/:id', (req, res) => {
  const { nome, categoria, preco, custo, ativo } = req.body
  const item = db.prepare('SELECT * FROM cardapio WHERE id = ?').get(req.params.id)
  if (!item) return res.status(404).json({ error: 'Item não encontrado' })
  db.prepare('UPDATE cardapio SET nome=?, categoria=?, preco=?, custo=?, ativo=? WHERE id=?')
    .run(
      nome?.trim() ?? item.nome,
      categoria ?? item.categoria,
      preco != null ? parseFloat(preco) : item.preco,
      custo != null ? parseFloat(custo) : item.custo,
      ativo != null ? (ativo ? 1 : 0) : item.ativo,
      req.params.id,
    )
  res.json(db.prepare('SELECT * FROM cardapio WHERE id = ?').get(req.params.id))
})

router.delete('/cardapio/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM cardapio WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: 'Item não encontrado' })
  db.prepare('DELETE FROM cardapio WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// --- Vendas do bar ---

router.get('/vendas', (req, res) => {
  const eventoId = req.eventoId
  if (!eventoId) return res.json([])
  res.json(db.prepare('SELECT * FROM vendas_bar WHERE evento_id=? ORDER BY created_at DESC').all(eventoId))
})

router.get('/summary', (req, res) => {
  const eventoId = req.eventoId
  if (!eventoId) return res.json({ porItem: [], totais: { receita: 0, custo_total: 0, lucro: 0, qtd_total: 0 } })

  const porItem = db.prepare(`
    SELECT
      item_id, nome_item, cardapio.categoria,
      SUM(quantidade) AS qtd_total,
      SUM(CASE WHEN cortesia=0 THEN total ELSE 0 END) AS receita,
      SUM(quantidade * custo_unitario) AS custo_total,
      SUM(CASE WHEN cortesia=0 THEN total - quantidade * custo_unitario ELSE -quantidade * custo_unitario END) AS lucro,
      SUM(CASE WHEN cortesia=1 THEN quantidade ELSE 0 END) AS qtd_cortesia
    FROM vendas_bar
    JOIN cardapio ON cardapio.id = vendas_bar.item_id
    WHERE vendas_bar.evento_id=?
    GROUP BY item_id
    ORDER BY receita DESC
  `).all(eventoId)

  const totais = db.prepare(`
    SELECT
      SUM(CASE WHEN cortesia=0 THEN total ELSE 0 END) AS receita,
      SUM(quantidade * custo_unitario) AS custo_total,
      SUM(CASE WHEN cortesia=0 THEN total - quantidade * custo_unitario ELSE -quantidade * custo_unitario END) AS lucro,
      SUM(quantidade) AS qtd_total
    FROM vendas_bar
    WHERE evento_id=?
  `).get(eventoId)

  res.json({ porItem, totais })
})

router.post('/vendas', (req, res) => {
  const { itens, cortesia = false } = req.body
  if (!Array.isArray(itens) || itens.length === 0)
    return res.status(400).json({ error: 'Nenhum item informado' })

  const eventoId = req.eventoId
  const evento = eventoId ? db.prepare('SELECT * FROM eventos WHERE id=?').get(eventoId) || {} : {}
  const gerarReceita = !cortesia && evento.bar_gerar_receita == 1

  const insVenda = db.prepare(
    'INSERT INTO vendas_bar (id, item_id, nome_item, quantidade, preco_unitario, custo_unitario, total, cortesia, evento_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const insTx = gerarReceita
    ? db.prepare("INSERT INTO transactions (id, tipo, categoria, valor, descricao, evento_id) VALUES (?, 'receita', 'bar', ?, ?, ?)")
    : null

  const venda = db.transaction(() => {
    const registros = []
    for (const { item_id, quantidade } of itens) {
      const item = db.prepare('SELECT * FROM cardapio WHERE id = ?').get(item_id)
      if (!item) throw new Error(`Item ${item_id} não encontrado`)
      const qty = parseInt(quantidade) || 1
      const total = qty * item.preco
      const id = uuidv4()
      insVenda.run(id, item.id, item.nome, qty, item.preco, item.custo, total, cortesia ? 1 : 0, eventoId)
      if (insTx) insTx.run(uuidv4(), total, `${qty}× ${item.nome} (bar)`, eventoId)
      registros.push({ id, item, qty, total })
    }
    return registros
  })()

  res.status(201).json(venda)
})

router.delete('/vendas/:id', (req, res) => {
  const v = db.prepare('SELECT * FROM vendas_bar WHERE id = ?').get(req.params.id)
  if (!v) return res.status(404).json({ error: 'Venda não encontrada' })
  db.prepare('DELETE FROM vendas_bar WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
