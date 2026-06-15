const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

router.get('/', (req, res) => {
  const eventoId = req.eventoId
  if (!eventoId) return res.json([])
  const tasks = db.prepare(`
    SELECT * FROM tasks
    WHERE evento_id=?
    ORDER BY
      CASE status WHEN 'em_andamento' THEN 0 WHEN 'pendente' THEN 1 WHEN 'concluida' THEN 2 ELSE 3 END,
      urgente DESC,
      prazo ASC,
      created_at DESC
  `).all(eventoId);
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { titulo, categoria, responsavel, prazo, status, urgente, observacoes } = req.body;
  if (!titulo) return res.status(400).json({ error: 'Título obrigatório' });

  const eventoId = req.eventoId
  const id = uuidv4();
  db.prepare(`
    INSERT INTO tasks (id, titulo, categoria, responsavel, prazo, status, urgente, observacoes, evento_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, titulo, categoria || 'geral', responsavel || null, prazo || null, status || 'pendente', urgente ? 1 : 0, observacoes || null, eventoId);

  res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const { titulo, categoria, responsavel, prazo, status, urgente, observacoes } = req.body;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });

  db.prepare(`
    UPDATE tasks SET titulo=?, categoria=?, responsavel=?, prazo=?, status=?, urgente=?, observacoes=?
    WHERE id=?
  `).run(
    titulo ?? task.titulo,
    categoria ?? task.categoria,
    responsavel !== undefined ? responsavel : task.responsavel,
    prazo !== undefined ? prazo : task.prazo,
    status ?? task.status,
    urgente !== undefined ? (urgente ? 1 : 0) : task.urgente,
    observacoes !== undefined ? observacoes : task.observacoes,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
  res.json({ success: true });
});

module.exports = router;
