const express = require('express')
const router = express.Router()
const db = require('../database')

router.get('/', (req, res) => {
  const eventoId = req.query.evento_id || req.eventoId
  const evento = eventoId ? db.prepare('SELECT * FROM eventos WHERE id=?').get(eventoId) : null

  if (!evento) return res.json({})

  // Constrói objeto de config a partir das colunas do evento
  const config = {
    pix_chave: evento.pix_chave || '',
    pix_nome: evento.pix_nome || '',
    pix_cidade: evento.pix_cidade || '',
    valor_lote_promo: String(evento.valor_lote_promo || ''),
    valor_lote2: String(evento.valor_lote2 || ''),
    valor_mesa: String(evento.valor_mesa || ''),
    limite_por_compra: String(evento.limite_por_compra || '4'),
    estoque_lote_promo: String(evento.estoque_lote_promo || '0'),
    estoque_lote2: String(evento.estoque_lote2 || '0'),
    estoque_mesa: String(evento.estoque_mesa || '0'),
    vendas_ativas: String(evento.vendas_ativas || '0'),
    limite_cortesia: String(evento.limite_cortesia || '60'),
    bar_gerar_receita: String(evento.bar_gerar_receita || '0'),
  }

  // Calcula disponível em tempo real (só vendas confirmadas contam)
  const vendidos = db.prepare(`
    SELECT COALESCE(SUM(quantidade_lote_promo),0) AS promo,
           COALESCE(SUM(quantidade_lote2),0) AS lote2,
           COALESCE(SUM(quantidade_mesa),0) AS mesa
    FROM ticket_vendas WHERE status='pago' AND evento_id=?
  `).get(eventoId)

  const estoquePromo = parseInt(config.estoque_lote_promo) || 0
  const estoqueLote2 = parseInt(config.estoque_lote2) || 0
  const estoqueMesa  = parseInt(config.estoque_mesa) || 0
  config.disponivel_lote_promo = estoquePromo > 0 ? String(Math.max(0, estoquePromo - vendidos.promo)) : null
  config.disponivel_lote2      = estoqueLote2 > 0 ? String(Math.max(0, estoqueLote2 - vendidos.lote2)) : null
  config.disponivel_mesa       = estoqueMesa  > 0 ? String(Math.max(0, estoqueMesa  - vendidos.mesa))  : null

  const totalCheckins = db.prepare(`
    SELECT COUNT(*) AS n FROM ticket_checkins c
    JOIN ticket_vendas v ON c.venda_id = v.id
    WHERE v.evento_id=?
  `).get(eventoId).n
  config.disponivel_cortesia = String(Math.max(0, (parseInt(config.limite_cortesia) || 60) - totalCheckins))

  res.json(config)
})

router.put('/', (req, res) => {
  const eventoId = req.eventoId
  if (!eventoId) return res.status(400).json({ error: 'evento_id obrigatório' })
  const { chave, valor } = req.body
  if (!chave) return res.status(400).json({ error: 'Chave obrigatória' })
  // Mapeia chave de config para coluna do evento
  const allowed = ['pix_chave','pix_nome','pix_cidade','valor_lote_promo','valor_lote2','valor_mesa','limite_por_compra','estoque_lote_promo','estoque_lote2','estoque_mesa','vendas_ativas','limite_cortesia','bar_gerar_receita']
  if (!allowed.includes(chave)) return res.status(400).json({ error: 'Chave não permitida' })
  db.prepare(`UPDATE eventos SET ${chave}=? WHERE id=?`).run(String(valor ?? ''), eventoId)
  res.json({ ok: true })
})

module.exports = router
