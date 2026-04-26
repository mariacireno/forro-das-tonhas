const express = require('express');
const router = express.Router({ mergeParams: true });
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM checklist_items WHERE task_id = ? ORDER BY created_at ASC').all(req.params.taskId);
  res.json(items);
});

router.post('/', (req, res) => {
  const { texto } = req.body;
  if (!texto?.trim()) return res.status(400).json({ error: 'Texto obrigatório' });
  const id = uuidv4();
  db.prepare('INSERT INTO checklist_items (id, task_id, texto) VALUES (?, ?, ?)').run(id, req.params.taskId, texto.trim());
  res.status(201).json(db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(id));
});

router.put('/:itemId', (req, res) => {
  const { texto, concluido } = req.body;
  const item = db.prepare('SELECT * FROM checklist_items WHERE id = ? AND task_id = ?').get(req.params.itemId, req.params.taskId);
  if (!item) return res.status(404).json({ error: 'Item não encontrado' });
  db.prepare('UPDATE checklist_items SET texto = ?, concluido = ? WHERE id = ?').run(
    texto ?? item.texto,
    concluido !== undefined ? (concluido ? 1 : 0) : item.concluido,
    req.params.itemId
  );
  res.json(db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(req.params.itemId));
});

router.delete('/:itemId', (req, res) => {
  const result = db.prepare('DELETE FROM checklist_items WHERE id = ? AND task_id = ?').run(req.params.itemId, req.params.taskId);
  if (result.changes === 0) return res.status(404).json({ error: 'Item não encontrado' });
  res.json({ success: true });
});

module.exports = router;
