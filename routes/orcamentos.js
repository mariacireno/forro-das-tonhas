const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

router.get('/', (req, res) => {
  const eventoId = req.eventoId
  if (!eventoId) return res.json([])
  const items = db.prepare('SELECT * FROM orcamentos WHERE evento_id=? ORDER BY tipo, created_at DESC').all(eventoId);
  res.json(items);
});

router.post('/', (req, res) => {
  const { tipo, categoria, valor, descricao } = req.body;
  if (!tipo || !valor) return res.status(400).json({ error: 'Tipo e valor obrigatórios' });
  if (!['receita', 'custo'].includes(tipo)) return res.status(400).json({ error: 'Tipo deve ser "receita" ou "custo"' });
  const valorNum = parseFloat(valor);
  if (isNaN(valorNum) || valorNum <= 0 || valorNum > 1000000) return res.status(400).json({ error: 'Valor deve ser um número positivo' });

  const eventoId = req.eventoId
  const id = uuidv4();
  db.prepare(`
    INSERT INTO orcamentos (id, tipo, categoria, valor, descricao, evento_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, tipo, categoria || 'outros', valorNum, descricao || null, eventoId);

  res.status(201).json(db.prepare('SELECT * FROM orcamentos WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const { tipo, categoria, valor, descricao } = req.body;
  if (!tipo || !valor) return res.status(400).json({ error: 'Tipo e valor obrigatórios' });
  if (!['receita', 'custo'].includes(tipo)) return res.status(400).json({ error: 'Tipo deve ser "receita" ou "custo"' });
  const valorNum = parseFloat(valor);
  if (isNaN(valorNum) || valorNum <= 0 || valorNum > 1000000) return res.status(400).json({ error: 'Valor deve ser um número positivo' });
  const result = db.prepare(`
    UPDATE orcamentos SET tipo=?, categoria=?, valor=?, descricao=? WHERE id=?
  `).run(tipo, categoria || 'outros', valorNum, descricao || null, req.params.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Orçamento não encontrado' });
  res.json(db.prepare('SELECT * FROM orcamentos WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM orcamentos WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Orçamento não encontrado' });
  res.json({ success: true });
});

router.get('/summary', (req, res) => {
  const eventoId = req.eventoId
  if (!eventoId) {
    return res.json({
      receitas_orcadas: 0, custos_orcados: 0, resultado_previsto: 0,
      reinvestimento_previsto: 0, distribuido_previsto: 0,
      socias_previsto: {
        Renata:   { share: 0, reimbursement: 0, total: 0 },
        Maria:    { share: 0, reimbursement: 0, total: 0 },
        Catarina: { share: 0, reimbursement: 0, total: 0 },
      },
    })
  }

  const receitas = db.prepare("SELECT COALESCE(SUM(valor),0) as total FROM orcamentos WHERE tipo='receita' AND evento_id=?").get(eventoId).total;
  const custos = db.prepare("SELECT COALESCE(SUM(valor),0) as total FROM orcamentos WHERE tipo='custo' AND evento_id=?").get(eventoId).total;
  const resultado = receitas - custos;
  const reinvestimento = resultado > 0 ? resultado * 0.5 : 0;
  const distribuido = resultado > 0 ? resultado * 0.5 : 0;
  const share = resultado > 0 ? distribuido / 3 : resultado / 3;

  res.json({
    receitas_orcadas: receitas,
    custos_orcados: custos,
    resultado_previsto: resultado,
    reinvestimento_previsto: reinvestimento,
    distribuido_previsto: distribuido,
    socias_previsto: {
      Renata:   { share, reimbursement: 0, total: share },
      Maria:    { share, reimbursement: 0, total: share },
      Catarina: { share, reimbursement: 0, total: share },
    },
  });
});

module.exports = router;
