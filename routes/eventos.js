const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../database')

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM eventos ORDER BY data ASC').all())
})

router.post('/', (req, res) => {
  const { nome, data, descricao, local, hora_inicio, hora_fim } = req.body
  if (!nome || !data) return res.status(400).json({ error: 'Nome e data obrigatórios' })
  const id = uuidv4()
  db.prepare(`INSERT INTO eventos (id, nome, data, descricao, local, hora_inicio, hora_fim) VALUES (?,?,?,?,?,?,?)`)
    .run(id, nome, data, descricao || null, local || 'Olinda, PE', hora_inicio || '16:00', hora_fim || '22:00')
  res.status(201).json(db.prepare('SELECT * FROM eventos WHERE id=?').get(id))
})

router.put('/:id', (req, res) => {
  const evt = db.prepare('SELECT * FROM eventos WHERE id=?').get(req.params.id)
  if (!evt) return res.status(404).json({ error: 'Evento não encontrado' })
  const fields = ['nome','data','descricao','local','hora_inicio','hora_fim','pix_chave','pix_nome','pix_cidade','valor_lote_promo','valor_lote2','valor_mesa','limite_por_compra','estoque_lote_promo','estoque_lote2','estoque_mesa','vendas_ativas','limite_cortesia','bar_gerar_receita']
  const updates = {}
  for (const f of fields) if (req.body[f] !== undefined) updates[f] = req.body[f]
  if (Object.keys(updates).length === 0) return res.json(evt)
  const sets = Object.keys(updates).map(k => `${k}=?`).join(',')
  db.prepare(`UPDATE eventos SET ${sets} WHERE id=?`).run(...Object.values(updates), req.params.id)
  res.json(db.prepare('SELECT * FROM eventos WHERE id=?').get(req.params.id))
})

router.delete('/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM eventos WHERE id=?').get(req.params.id))
    return res.status(404).json({ error: 'Evento não encontrado' })
  db.prepare('DELETE FROM eventos WHERE id=?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
