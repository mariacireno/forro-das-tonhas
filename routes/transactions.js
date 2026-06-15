const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const SOCIAS = ['Renata', 'Maria', 'Catarina'];

router.get('/', (req, res) => {
  const eventoId = req.eventoId
  if (!eventoId) return res.json([])
  const transactions = db.prepare('SELECT * FROM transactions WHERE evento_id=? ORDER BY data DESC, created_at DESC').all(eventoId);
  res.json(transactions);
});

router.post('/', (req, res) => {
  const { tipo, categoria, valor, descricao, data, pago_por } = req.body;
  if (!tipo || !valor) return res.status(400).json({ error: 'Tipo e valor obrigatórios' });

  const eventoId = req.eventoId
  const id = uuidv4();
  // pago_por só faz sentido para custos
  const pagador = tipo === 'custo' && SOCIAS.includes(pago_por) ? pago_por : null;

  db.prepare(`
    INSERT INTO transactions (id, tipo, categoria, valor, descricao, data, pago_por, evento_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tipo, categoria || 'outros', parseFloat(valor), descricao || null, data || null, pagador, eventoId);

  res.status(201).json(db.prepare('SELECT * FROM transactions WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const { tipo, categoria, valor, descricao, data, pago_por } = req.body;
  if (!tipo || !valor) return res.status(400).json({ error: 'Tipo e valor obrigatórios' });
  const pagador = tipo === 'custo' && SOCIAS.includes(pago_por) ? pago_por : null;
  const result = db.prepare(`
    UPDATE transactions SET tipo=?, categoria=?, valor=?, descricao=?, data=?, pago_por=? WHERE id=?
  `).run(tipo, categoria || 'outros', parseFloat(valor), descricao || null, data || null, pagador, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Transação não encontrada' });
  res.json(db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Transação não encontrada' });
  res.json({ success: true });
});

router.get('/summary', (req, res) => {
  const eventoId = req.eventoId
  if (!eventoId) {
    const empty = { receitas: 0, custos: 0, lucro: 0, reinvestimento: 0, distribuido: 0, socias: {} }
    SOCIAS.forEach(n => { empty.socias[n] = { share: 0, reimbursement: 0, total: 0 } })
    return res.json(empty)
  }

  const receitas = db.prepare("SELECT COALESCE(SUM(valor),0) as total FROM transactions WHERE tipo='receita' AND evento_id=?").get(eventoId).total;
  const custos   = db.prepare("SELECT COALESCE(SUM(valor),0) as total FROM transactions WHERE tipo='custo' AND evento_id=?").get(eventoId).total;
  const lucro = receitas - custos;

  const reinvestimento = lucro > 0 ? lucro * 0.5 : 0;
  const distribuido    = lucro > 0 ? lucro * 0.5 : 0;
  const share = distribuido / 3;

  // Quanto cada sócia pagou de despesas do próprio bolso
  const reembolsos = {};
  SOCIAS.forEach(nome => {
    reembolsos[nome] = db.prepare(
      "SELECT COALESCE(SUM(valor),0) as total FROM transactions WHERE tipo='custo' AND pago_por=? AND evento_id=?"
    ).get(nome, eventoId).total;
  });

  const socias = {};
  SOCIAS.forEach(nome => {
    socias[nome] = {
      share:        share,
      reimbursement: reembolsos[nome],
      total:        share + reembolsos[nome],
    };
  });

  res.json({ receitas, custos, lucro, reinvestimento, distribuido, socias });
});

module.exports = router;
