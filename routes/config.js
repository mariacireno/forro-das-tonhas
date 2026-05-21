const express = require('express')
const router = express.Router()
const db = require('../database')

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT chave, valor FROM config').all()
  res.json(Object.fromEntries(rows.map(r => [r.chave, r.valor])))
})

router.put('/', (req, res) => {
  const { chave, valor } = req.body
  if (!chave) return res.status(400).json({ error: 'Chave obrigatória' })
  db.prepare('INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)').run(chave, String(valor ?? ''))
  res.json({ ok: true })
})

module.exports = router
