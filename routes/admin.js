const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

router.delete('/reset-vendas', (req, res) => {
  const db = require('../database')
  db.prepare('DELETE FROM ticket_checkins').run()
  db.prepare('DELETE FROM ticket_vendas').run()
  db.prepare("DELETE FROM transactions WHERE categoria = 'ingressos'").run()
  res.json({ ok: true })
})

router.get('/backup', (req, res) => {
  const dbDir = process.env.DB_PATH || path.join(__dirname, '..')
  const dbPath = path.join(dbDir, 'forro.db')
  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: 'Banco de dados não encontrado' })
  }
  const date = new Date().toISOString().slice(0, 10)
  res.download(dbPath, `forro-backup-${date}.db`)
})

module.exports = router
