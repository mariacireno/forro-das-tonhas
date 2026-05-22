const nodemailer = require('nodemailer')

function getTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
}

function qtdDesc(venda) {
  const partes = []
  if (venda.quantidade_lote_promo > 0) partes.push(`${venda.quantidade_lote_promo}x Lote Promocional`)
  if (venda.quantidade_lote2 > 0) partes.push(`${venda.quantidade_lote2}x 2º Lote`)
  if (venda.quantidade_mesa > 0) partes.push(`${venda.quantidade_mesa}x Mesa (4 pessoas)`)
  if (venda.quantidade_inteira > 0) partes.push(`${venda.quantidade_inteira}x Inteira`)
  if (venda.quantidade_meia > 0) partes.push(`${venda.quantidade_meia}x Meia-entrada`)
  return partes.join(', ') || `${venda.quantidade}x ingresso`
}

async function sendConfirmacaoIngresso(venda) {
  const transporter = getTransporter()
  if (!transporter) return

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER
  const desc = qtdDesc(venda)
  const valor = `R$ ${Number(venda.valor_total).toFixed(2).replace('.', ',')}`

  await transporter.sendMail({
    from: `"Forró das Tonhas" <${from}>`,
    to: venda.email,
    subject: '✅ Ingresso confirmado — Forró das Tonhas 2026',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#faf5e8;font-family:sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
    <div style="background:#7c3d1e;color:#fff;padding:28px 24px;text-align:center;">
      <p style="margin:0;font-size:13px;opacity:.8;">🪗 Ingresso Confirmado</p>
      <h1 style="margin:8px 0 4px;font-size:22px;font-weight:700;">Forró das Tonhas</h1>
      <p style="margin:0;font-size:13px;opacity:.7;">13 de junho de 2026 · 16h às 22h</p>
    </div>

    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:15px;color:#3d2010;">
        Olá, <strong>${venda.nome}</strong>! Seu pagamento foi confirmado e seu ingresso está garantido. Até sábado! 🎉
      </p>

      <div style="background:#fef9ed;border:1px solid #f5d76e;border-radius:12px;padding:16px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3d2010;">
          <tr><td style="padding:4px 0;color:#7c5b3e;">Ingressos</td><td style="padding:4px 0;font-weight:600;text-align:right;">${desc}</td></tr>
          <tr><td style="padding:4px 0;color:#7c5b3e;">Valor pago</td><td style="padding:4px 0;font-weight:600;text-align:right;">${valor}</td></tr>
          <tr><td style="padding:4px 0;color:#7c5b3e;">Data</td><td style="padding:4px 0;text-align:right;">Sábado, 13 de junho de 2026</td></tr>
          <tr><td style="padding:4px 0;color:#7c5b3e;">Horário</td><td style="padding:4px 0;text-align:right;">16h às 22h</td></tr>
        </table>
      </div>

      <div style="border-left:3px solid #7c3d1e;padding-left:12px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;color:#5c4030;font-weight:600;">📍 Local do evento</p>
        <p style="margin:4px 0 0;font-size:13px;color:#5c4030;">Rua 27 de Janeiro (Rua da Pitombeira), 211<br>Olinda — PE</p>
      </div>

      <p style="margin:0;font-size:13px;color:#888;">
        Siga a gente: <a href="https://www.instagram.com/becodoalto.olinda/" style="color:#7c3d1e;">@becodoalto.olinda</a>
      </p>
    </div>

    <div style="background:#f5ede0;padding:14px 24px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#a08060;">Você receberá este e-mail como comprovante. Guarde-o para apresentar na entrada.</p>
    </div>
  </div>
</body>
</html>`,
  })
}

module.exports = { sendConfirmacaoIngresso }
