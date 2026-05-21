const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM orcamentos ORDER BY tipo, created_at DESC').all();
  res.json(items);
});

router.post('/', (req, res) => {
  const { tipo, categoria, valor, descricao } = req.body;
  if (!tipo || !valor) return res.status(400).json({ error: 'Tipo e valor obrigatórios' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO orcamentos (id, tipo, categoria, valor, descricao)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, tipo, categoria || 'outros', parseFloat(valor), descricao || null);

  res.status(201).json(db.prepare('SELECT * FROM orcamentos WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const { tipo, categoria, valor, descricao } = req.body;
  const result = db.prepare(`
    UPDATE orcamentos SET tipo=?, categoria=?, valor=?, descricao=? WHERE id=?
  `).run(tipo, categoria || 'outros', parseFloat(valor), descricao || null, req.params.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Orçamento não encontrado' });
  res.json(db.prepare('SELECT * FROM orcamentos WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM orcamentos WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Orçamento não encontrado' });
  res.json({ success: true });
});

router.get('/summary', (req, res) => {
  const receitas = db.prepare("SELECT COALESCE(SUM(valor),0) as total FROM orcamentos WHERE tipo='receita'").get().total;
  const custos = db.prepare("SELECT COALESCE(SUM(valor),0) as total FROM orcamentos WHERE tipo='custo'").get().total;
  const resultado = receitas - custos;
  const reinvestimento = resultado > 0 ? resultado * 0.5 : 0;
  const distribuido = resultado > 0 ? resultado * 0.5 : 0;

  res.json({
    receitas_orcadas: receitas,
    custos_orcados: custos,
    resultado_previsto: resultado,
    reinvestimento_previsto: reinvestimento,
    distribuido_previsto: distribuido,
    socias_previsto: {
      Renata:   { share: distribuido / 3, reimbursement: 0, total: distribuido / 3 },
      Maria:    { share: distribuido / 3, reimbursement: 0, total: distribuido / 3 },
      Catarina: { share: distribuido / 3, reimbursement: 0, total: distribuido / 3 },
    },
  });
});

module.exports = router;
