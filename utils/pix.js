function field(id, value) {
  const len = String(value.length).padStart(2, '0')
  return `${id}${len}${value}`
}

function crc16(str) {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function stripAccents(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function buildPixPayload({ chave, nome, cidade, valor, txid = '***' }) {
  const merchantAccount = field('00', 'BR.GOV.BCB.PIX') + field('01', chave)
  const safeNome = stripAccents(nome).slice(0, 25)
  const safeCidade = stripAccents(cidade).slice(0, 15)
  const safeTxid = txid.replace(/\W/g, '').slice(0, 25) || '***'

  let payload =
    field('00', '01') +
    field('26', merchantAccount) +
    field('52', '0000') +
    field('53', '986') +
    (valor ? field('54', Number(valor).toFixed(2)) : '') +
    field('58', 'BR') +
    field('59', safeNome) +
    field('60', safeCidade) +
    field('62', field('05', safeTxid)) +
    '6304'

  return payload + crc16(payload)
}

module.exports = { buildPixPayload }
