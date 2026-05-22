const PDFDocument = require('pdfkit')
const QRCode = require('qrcode')

const TIPO_LABEL = {
  'Lote Promo': 'Lote Promocional',
  '2º Lote':    '2º Lote',
  'Mesa':       'Mesa — 4 pessoas',
  'Inteira':    'Inteira',
  'Meia':       'Meia-entrada',
}

function brl(v) {
  return `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`
}

async function buildTicketPdf(venda, checkins) {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: [400, 600], margin: 0, autoFirstPage: false })
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    for (const c of checkins) {
      doc.addPage()

      // fundo escuro no topo
      doc.rect(0, 0, 400, 160).fill('#16143A')

      // pill tag
      doc.roundedRect(140, 20, 120, 18, 9).fill('#1EA84A')
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#F7F2E2')
        .text('🎟  INGRESSO CONFIRMADO', 148, 25, { width: 104, align: 'center' })

      // nome do evento
      doc.font('Helvetica-Bold').fontSize(28).fillColor('#F2C82E')
        .text('FORRÓ DAS TONHAS', 0, 52, { width: 400, align: 'center' })

      // data e local
      doc.font('Helvetica').fontSize(11).fillColor('#F7F2E2').opacity(0.7)
        .text('SÁBADO · 13 DE JUNHO DE 2026 · 16h às 22h', 0, 90, { width: 400, align: 'center' })
      doc.opacity(1)
      doc.font('Helvetica').fontSize(10).fillColor('#F7F2E2').opacity(0.6)
        .text('@becodoalto.olinda · Olinda, PE', 0, 108, { width: 400, align: 'center' })
      doc.opacity(1)

      // separador tracejado estilo tear-off
      doc.moveTo(20, 165).lineTo(380, 165).dash(6, { space: 4 }).strokeColor('#16143A').lineWidth(1).stroke()
      doc.undash()

      // QR code
      const qrDataUrl = await QRCode.toDataURL(`checkin:${c.id}`, { width: 200, margin: 2, color: { dark: '#16143A', light: '#F7F2E2' } })
      const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '')
      const qrBuf = Buffer.from(qrBase64, 'base64')
      doc.image(qrBuf, 100, 180, { width: 200, height: 200 })

      doc.font('Helvetica').fontSize(9).fillColor('#3A3865')
        .text('APONTE PARA O LEITOR NA ENTRADA', 0, 390, { width: 400, align: 'center' })

      // separador
      doc.moveTo(40, 412).lineTo(360, 412).strokeColor('#E6DCBF').lineWidth(1).stroke()

      // dados do ingresso
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#16143A')
        .text(venda.nome, 0, 425, { width: 400, align: 'center' })

      const tipoLabel = TIPO_LABEL[c.tipo] || c.tipo
      doc.roundedRect(120, 454, 160, 24, 12).fill('#16143A')
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#F7F2E2')
        .text(tipoLabel.toUpperCase(), 120, 460, { width: 160, align: 'center' })

      // valor
      doc.font('Helvetica').fontSize(11).fillColor('#3A3865')
        .text(`Valor total do pedido: ${brl(venda.valor_total)}`, 0, 492, { width: 400, align: 'center' })

      // rodapé
      doc.rect(0, 540, 400, 60).fill('#E6DCBF')
      doc.font('Helvetica').fontSize(9).fillColor('#3A3865')
        .text('Guarde este ingresso e apresente o QR Code na entrada.', 0, 552, { width: 400, align: 'center' })
      doc.text(`ID: ${c.id.slice(0, 18)}...`, 0, 566, { width: 400, align: 'center' })
    }

    doc.end()
  })
}

module.exports = { buildTicketPdf }
