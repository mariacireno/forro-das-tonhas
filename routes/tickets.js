const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

router.get('/', (req, res) => {
  const tickets = db.prepare('SELECT * FROM tickets ORDER BY created_at DESC').all();
  res.json(tickets);
});

router.post('/', (req, res) => {
  const { tipo, quantidade, valor_unitario, canal, data } = req.body;
  if (!tipo || !quantidade || !valor_unitario) {
    return res.status(400).json({ error: 'Tipo, quantidade e valor unitário obrigatórios' });
  }

  const id = uuidv4();
  const qty = parseInt(quantidade);
  const unit = parseFloat(valor_unitario);
  const total = qty * unit;

  db.prepare(`
    INSERT INTO tickets (id, tipo, quantidade, valor_unitario, canal, data)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, tipo, qty, unit, canal || 'portaria', data || null);

  // Registra automaticamente como receita
  db.prepare(`
    INSERT INTO transactions (id, tipo, categoria, valor, descricao, data)
    VALUES (?, 'receita', 'ingressos', ?, ?, ?)
  `).run(uuidv4(), total, `${qty}x ingresso ${tipo} (${canal || 'portaria'})`, data || null);

  res.status(201).json(db.prepare('SELECT * FROM tickets WHERE id = ?').get(id));
});

router.delete('/:id', (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Registro não encontrado' });

  db.prepare('DELETE FROM tickets WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.get('/summary', (req, res) => {
  const total = db.prepare('SELECT COALESCE(SUM(quantidade),0) as qty, COALESCE(SUM(quantidade*valor_unitario),0) as receita FROM tickets').get();
  const porTipo = db.prepare('SELECT tipo, SUM(quantidade) as qty, SUM(quantidade*valor_unitario) as receita FROM tickets GROUP BY tipo').all();
  const porCanal = db.prepare('SELECT canal, SUM(quantidade) as qty FROM tickets GROUP BY canal').all();

  res.json({ ...total, porTipo, porCanal });
});

module.exports = router;
