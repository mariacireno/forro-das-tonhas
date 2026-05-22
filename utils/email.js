const { Resend } = require('resend')
const QRCode = require('qrcode')
const { buildTicketPdf } = require('./pdf')

function qtdDesc(venda) {
  const partes = []
  if (venda.quantidade_lote_promo > 0) partes.push(`${venda.quantidade_lote_promo}× Lote Promocional`)
  if (venda.quantidade_lote2 > 0)      partes.push(`${venda.quantidade_lote2}× 2º Lote`)
  if (venda.quantidade_mesa > 0)       partes.push(`${venda.quantidade_mesa}× Mesa (4 pessoas)`)
  if (venda.quantidade_inteira > 0)    partes.push(`${venda.quantidade_inteira}× Inteira`)
  if (venda.quantidade_meia > 0)       partes.push(`${venda.quantidade_meia}× Meia-entrada`)
  return partes.join(' + ') || `${venda.quantidade}× ingresso`
}

function brl(v) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

function buildHtml(venda, qrItems = []) {
  const desc  = qtdDesc(venda)
  const valor = brl(venda.valor_total)

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ingresso Confirmado — Forró das Tonhas</title>
</head>
<body style="margin:0;padding:0;background:#F1ECDB;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1ECDB;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#F7F2E2;border:2.5px solid #16143A;border-radius:18px;overflow:hidden;box-shadow:0 4px 0 0 #16143A;">

  <!-- HEADER -->
  <tr>
    <td style="background:#16143A;padding:28px 28px 20px;text-align:center;">
      <!-- Pill tag -->
      <div style="display:inline-block;background:#1EA84A;color:#F7F2E2;border-radius:999px;padding:5px 14px;font-size:11px;letter-spacing:0.18em;font-weight:700;text-transform:uppercase;margin-bottom:14px;">
        ✅ &nbsp;INGRESSO CONFIRMADO
      </div>
      <!-- Wordmark -->
      <div style="font-family:'Arial Black','Impact',Arial,sans-serif;font-size:44px;font-weight:900;color:#1EA84A;letter-spacing:-1px;line-height:0.9;text-transform:uppercase;
        -webkit-text-stroke:1.5px #F7F2E2;text-shadow:-1px -1px 0 #F7F2E2,1px -1px 0 #F7F2E2,-1px 1px 0 #F7F2E2,1px 1px 0 #F7F2E2;">
        FORRÓ DAS TONHAS
      </div>
      <!-- Tagline -->
      <div style="margin-top:10px;font-size:12px;color:#F7F2E2;opacity:0.7;letter-spacing:0.12em;text-transform:uppercase;">
        PÉ DE SERRA · RAIZ · OLINDA
      </div>
    </td>
  </tr>

  <!-- DATE STRIP -->
  <tr>
    <td style="background:#16143A;padding:0 28px 24px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;background:#1E1C3A;border:2px solid #3A3865;border-radius:14px;padding:14px 18px;">
        <tr>
          <td style="width:60px;text-align:center;vertical-align:middle;padding-right:16px;border-right:1px solid #3A3865;">
            <div style="font-family:'Arial Black',Arial,sans-serif;font-size:38px;font-weight:900;color:#F2C82E;line-height:1;">13</div>
            <div style="font-size:11px;color:#F7F2E2;letter-spacing:0.12em;text-transform:uppercase;opacity:0.8;">JUN 2026</div>
          </td>
          <td style="vertical-align:middle;padding-left:16px;">
            <div style="font-size:10px;color:#F7F2E2;letter-spacing:0.16em;text-transform:uppercase;opacity:0.6;">SÁBADO</div>
            <div style="font-size:17px;font-weight:700;color:#F7F2E2;margin:3px 0;">16h às 22h</div>
            <div style="font-size:12px;color:#F7F2E2;opacity:0.75;">
              📍 <a href="https://www.instagram.com/becodoalto.olinda/" style="color:#F7F2E2;text-decoration:none;">@becodoalto.olinda</a>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- GREETING -->
  <tr>
    <td style="padding:24px 28px 0;">
      <p style="margin:0;font-size:16px;color:#16143A;line-height:1.5;">
        Olá, <strong>${venda.nome}</strong>! 🎉<br>
        Seu pagamento foi confirmado e seu ingresso está garantido. Te esperamos no sábado!
      </p>
    </td>
  </tr>

  <!-- ORDER CARD -->
  <tr>
    <td style="padding:20px 28px 0;">
      <table cellpadding="0" cellspacing="0" style="width:100%;background:#F1ECDB;border:2px solid #16143A;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="background:#16143A;padding:10px 16px;">
            <span style="font-family:'Arial Black',Arial,sans-serif;font-size:12px;color:#F7F2E2;letter-spacing:0.14em;text-transform:uppercase;">SEU PEDIDO</span>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 16px;">
            <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;color:#16143A;">
              <tr>
                <td style="padding:4px 0;color:#3A3865;">Ingressos</td>
                <td style="padding:4px 0;font-weight:700;text-align:right;">${desc}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding:6px 0;"><hr style="border:none;border-top:1px solid #E6DCBF;margin:0;"></td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#3A3865;">Valor pago</td>
                <td style="padding:4px 0;font-family:'Arial Black',Arial,sans-serif;font-size:20px;font-weight:900;color:#137A35;text-align:right;">${valor}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#3A3865;">Status</td>
                <td style="padding:4px 0;text-align:right;">
                  <span style="background:#1EA84A;color:#F7F2E2;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:700;">✓ Pago</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- QR CODES -->
  ${qrItems.length > 0 ? `<tr><td style="padding:20px 28px 0;">
    <div style="font-family:'Arial Black',Arial,sans-serif;font-size:12px;color:#16143A;text-transform:uppercase;letter-spacing:0.14em;font-weight:700;margin-bottom:12px;">Seus ingressos</div>
    ${qrItems.map(q => `
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#F1ECDB;border:2px solid #16143A;border-radius:14px;overflow:hidden;margin-bottom:10px;">
      <tr><td style="background:#16143A;padding:8px 14px;">
        <span style="font-size:11px;color:#F7F2E2;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;">${q.tipo}</span>
      </td></tr>
      <tr><td style="padding:14px;text-align:center;">
        <img src="cid:${q.cid}" alt="QR Code" width="160" height="160" style="display:block;margin:0 auto;border:2px solid #16143A;border-radius:8px;" />
        <div style="margin-top:8px;font-size:11px;color:#3A3865;">Apresente este QR Code na entrada</div>
      </td></tr>
    </table>`).join('')}
  </td></tr>` : ''}

  <!-- LOCATION -->
  <tr>
    <td style="padding:20px 28px 0;">
      <table cellpadding="0" cellspacing="0" style="width:100%;background:#F1ECDB;border-left:4px solid #1EA84A;border-radius:0 10px 10px 0;padding:12px 16px;">
        <tr>
          <td>
            <div style="font-size:12px;font-weight:700;color:#16143A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">📍 Local do evento</div>
            <div style="font-size:13px;color:#3A3865;line-height:1.5;">
              Rua 27 de Janeiro (Rua da Pitombeira), 211<br>
              Sítio Histórico · Olinda · PE
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- INSTAGRAM -->
  <tr>
    <td style="padding:16px 28px 24px;">
      <p style="margin:0;font-size:13px;color:#3A3865;">
        Siga a gente no Instagram:
        <a href="https://www.instagram.com/becodoalto.olinda/" style="color:#1EA84A;font-weight:700;text-decoration:none;">@becodoalto.olinda</a>
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#E6DCBF;border-top:2px solid #16143A;padding:14px 28px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#3A3865;line-height:1.5;">
        Guarde este e-mail como comprovante e apresente na entrada.<br>
        Dúvidas? Entre em contato pelo Instagram
        <a href="https://www.instagram.com/becodoalto.olinda/" style="color:#16143A;">@becodoalto.olinda</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`
}

async function sendNotificacaoNovaVenda(venda) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const from   = process.env.EMAIL_FROM || 'ingressos@becodoalto.com.br'
  const desc   = qtdDesc(venda)
  const valor  = brl(venda.valor_total)

  await resend.emails.send({
    from:    `Forró das Tonhas <${from}>`,
    to:      'becodoalto211@gmail.com',
    subject: `🎟️ Nova intenção de compra — ${venda.nome}`,
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F1ECDB;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1ECDB;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#F7F2E2;border:2.5px solid #16143A;border-radius:18px;overflow:hidden;box-shadow:0 4px 0 0 #16143A;">

  <tr>
    <td style="background:#16143A;padding:22px 28px 18px;text-align:center;">
      <div style="display:inline-block;background:#F2C82E;color:#16143A;border-radius:999px;padding:5px 14px;font-size:11px;letter-spacing:0.18em;font-weight:700;text-transform:uppercase;margin-bottom:12px;">
        🎟️ &nbsp;NOVA INTENÇÃO DE COMPRA
      </div>
      <div style="font-family:'Arial Black','Impact',Arial,sans-serif;font-size:36px;font-weight:900;color:#F2C82E;letter-spacing:-1px;line-height:0.9;text-transform:uppercase;">
        FORRÓ DAS TONHAS
      </div>
    </td>
  </tr>

  <tr>
    <td style="padding:24px 28px 0;">
      <p style="margin:0;font-size:15px;color:#16143A;line-height:1.6;">
        Uma nova compra foi recebida e aguarda sua confirmação no painel.
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:20px 28px 0;">
      <table cellpadding="0" cellspacing="0" style="width:100%;background:#F1ECDB;border:2px solid #16143A;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="background:#16143A;padding:10px 16px;">
            <span style="font-size:12px;color:#F7F2E2;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;">DADOS DO COMPRADOR</span>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 16px;">
            <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;color:#16143A;">
              <tr>
                <td style="padding:4px 0;color:#3A3865;width:90px;">Nome</td>
                <td style="padding:4px 0;font-weight:700;">${venda.nome}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#3A3865;">E-mail</td>
                <td style="padding:4px 0;">${venda.email}</td>
              </tr>
              ${venda.telefone ? `<tr><td style="padding:4px 0;color:#3A3865;">Telefone</td><td style="padding:4px 0;">${venda.telefone}</td></tr>` : ''}
              <tr>
                <td colspan="2" style="padding:6px 0;"><hr style="border:none;border-top:1px solid #E6DCBF;margin:0;"></td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#3A3865;">Ingressos</td>
                <td style="padding:4px 0;font-weight:700;">${desc}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#3A3865;">Valor total</td>
                <td style="padding:4px 0;font-family:'Arial Black',Arial,sans-serif;font-size:18px;font-weight:900;color:#137A35;">${valor}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#3A3865;">Status</td>
                <td style="padding:4px 0;">
                  <span style="background:#F2C82E;color:#16143A;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:700;">⏳ Aguardando confirmação</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:20px 28px 28px;">
      <p style="margin:0;font-size:13px;color:#3A3865;line-height:1.6;">
        Acesse o painel em <strong>Ingressos → Vendas Online</strong> para confirmar o pagamento e liberar o ingresso.
      </p>
    </td>
  </tr>

  <tr>
    <td style="background:#E6DCBF;border-top:2px solid #16143A;padding:12px 28px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#3A3865;">Forró das Tonhas · 13 de junho de 2026 · Olinda, PE</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`,
  })
}

async function sendConfirmacaoIngresso(venda, checkins = []) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const from   = process.env.EMAIL_FROM || 'ingressos@becodoalto.com.br'

  // Gera QR codes como buffers PNG para inline attachments (cid:)
  const qrItems = await Promise.all(checkins.map(async (c, i) => {
    const buf = await QRCode.toBuffer(`checkin:${c.id}`, { width: 200, margin: 1, color: { dark: '#16143A', light: '#F7F2E2' } })
    return { tipo: c.tipo, cid: `qr${i}`, buffer: buf }
  }))

  // Gera PDF com um ingresso por página
  const pdfBuffer = checkins.length > 0 ? await buildTicketPdf(venda, checkins) : null

  const inlineAttachments = qrItems.map(q => ({
    filename:   `qr-${q.cid}.png`,
    content:    q.buffer.toString('base64'),
    content_id: q.cid,
    inline:     true,
  }))

  const pdfAttachment = pdfBuffer ? [{
    filename: `ingresso-forro-das-tonhas-${venda.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`,
    content:  pdfBuffer.toString('base64'),
  }] : []

  const payload = {
    from:        `Forró das Tonhas <${from}>`,
    to:          venda.email,
    subject:     '✅ Ingresso confirmado — Forró das Tonhas 2026',
    html:        buildHtml(venda, qrItems),
    attachments: [...inlineAttachments, ...pdfAttachment],
  }

  await resend.emails.send(payload)
}

module.exports = { sendConfirmacaoIngresso, sendNotificacaoNovaVenda }
