const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

router.get('/', (req, res) => {
  const transactions = db.prepare('SELECT * FROM transactions ORDER BY data DESC, created_at DESC').all();
  res.json(transactions);
});

router.post('/', (req, res) => {
  const { tipo, categoria, valor, descricao, data } = req.body;
  if (!tipo || !valor) return res.status(400).json({ error: 'Tipo e valor obrigatórios' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO transactions (id, tipo, categoria, valor, descricao, data)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, tipo, categoria || 'outros', parseFloat(valor), descricao || null, data || null);

  res.status(201).json(db.prepare('SELECT * FROM transactions WHERE id = ?').get(id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Transação não encontrada' });
  res.json({ success: true });
});

router.get('/summary', (req, res) => {
  const receitas = db.prepare("SELECT COALESCE(SUM(valor),0) as total FROM transactions WHERE tipo='receita'").get().total;
  const custos = db.prepare("SELECT COALESCE(SUM(valor),0) as total FROM transactions WHERE tipo='custo'").get().total;

  // Ingressos também são receita — já devem estar em transactions
  const lucro = receitas - custos;
  const reinvestimento = lucro > 0 ? lucro * 0.5 : 0;
  const distribuido = lucro > 0 ? lucro * 0.5 : 0;

  res.json({
    receitas,
    custos,
    lucro,
    reinvestimento,
    distribuido,
    socias: {
      Renata: distribuido * 0.5,
      Maria: distribuido * 0.25,
      Catarina: distribuido * 0.25,
    },
  });
});

module.exports = router;
