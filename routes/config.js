const express = require('express')
const router = express.Router()
const db = require('../database')

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT chave, valor FROM config').all()
  const config = Object.fromEntries(rows.map(r => [r.chave, r.valor]))

  // Calcula disponibilidade em tempo real (só vendas confirmadas contam)
  const vendidos = db.prepare(`
    SELECT
      COALESCE(SUM(quantidade_lote_promo), 0) AS promo,
      COALESCE(SUM(quantidade_lote2), 0)      AS lote2,
      COALESCE(SUM(quantidade_mesa), 0)       AS mesa
    FROM ticket_vendas WHERE status = 'pago'
  `).get()

  const estoque = {
    promo: parseInt(config.estoque_lote_promo) || 0,
    lote2: parseInt(config.estoque_lote2)      || 0,
    mesa:  parseInt(config.estoque_mesa)       || 0,
  }

  // null = ilimitado; número = quantidade restante (pode ser 0 = esgotado)
  config.disponivel_lote_promo = estoque.promo > 0 ? String(Math.max(0, estoque.promo - vendidos.promo)) : null
  config.disponivel_lote2      = estoque.lote2 > 0 ? String(Math.max(0, estoque.lote2 - vendidos.lote2)) : null
  config.disponivel_mesa       = estoque.mesa  > 0 ? String(Math.max(0, estoque.mesa  - vendidos.mesa))  : null

  res.json(config)
})

router.put('/', (req, res) => {
  const { chave, valor } = req.body
  if (!chave) return res.status(400).json({ error: 'Chave obrigatória' })
  db.prepare('INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)').run(chave, String(valor ?? ''))
  res.json({ ok: true })
})

module.exports = router
