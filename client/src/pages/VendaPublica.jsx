import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { formatBRL } from '../utils/format'

function Stepper({ label, preco, value, onInc, onDec, maxReached }) {
  return (
    <div className="flex items-center justify-between p-3 bg-tonha-sand/30 rounded-xl border border-tonha-sand">
      <div>
        <p className="text-sm font-medium text-tonha-brown">{label}</p>
        {preco > 0
          ? <p className="text-xs text-tonha-brown/50">{formatBRL(preco)} cada</p>
          : <p className="text-xs text-tonha-brown/40">valor não configurado</p>
        }
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDec}
          disabled={value === 0}
          className="w-8 h-8 rounded-full border border-tonha-sand bg-white text-tonha-brown font-bold text-lg leading-none disabled:opacity-30 transition-opacity"
        >
          −
        </button>
        <span className="w-5 text-center font-bold text-tonha-brown text-base">{value}</span>
        <button
          type="button"
          onClick={onInc}
          disabled={maxReached}
          className="w-8 h-8 rounded-full border border-tonha-terra bg-tonha-terra/10 text-tonha-darkterra font-bold text-lg leading-none disabled:opacity-30 transition-opacity"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default function VendaPublica() {
  const [config, setConfig] = useState({})
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [form, setForm] = useState({ nome: '', email: '', quantidade_inteira: 0, quantidade_meia: 0 })
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(c => { setConfig(c); setLoadingConfig(false) })
      .catch(() => setLoadingConfig(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const limite = parseInt(config.limite_por_compra) || 4
  const precoInteira = parseFloat(config.valor_inteira) || 0
  const precoMeia = parseFloat(config.valor_meia) || 0
  const totalQtd = form.quantidade_inteira + form.quantidade_meia
  const total = (form.quantidade_inteira * precoInteira) + (form.quantidade_meia * precoMeia)

  const submit = async (e) => {
    e.preventDefault()
    if (totalQtd === 0) { setErro('Selecione pelo menos 1 ingresso'); return }
    setErro('')
    setEnviando(true)
    try {
      const res = await fetch('/api/tickets/venda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar')
      const qrDataUrl = await QRCode.toDataURL(data.pixString, { width: 260, margin: 2 })
      setResultado({ ...data, qrDataUrl })
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const copiar = () => {
    navigator.clipboard.writeText(resultado.pixString)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const descVenda = (() => {
    if (!resultado) return ''
    const v = resultado.venda
    const partes = []
    if (v.quantidade_inteira > 0) partes.push(`${v.quantidade_inteira}x inteira`)
    if (v.quantidade_meia > 0) partes.push(`${v.quantidade_meia}x meia`)
    return partes.length ? partes.join(' + ') : `${v.quantidade}x ${v.tipo}`
  })()

  if (loadingConfig) {
    return (
      <div className="min-h-screen bg-tonha-cream flex items-center justify-center">
        <p className="text-tonha-brown/50">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tonha-cream flex flex-col">
      <header className="bg-tonha-terra text-white text-center py-6 px-4">
        <p className="text-sm opacity-75">🪗 Ingressos Antecipados</p>
        <h1 className="text-2xl font-bold mt-1">Forró das Tonhas</h1>
        <p className="text-sm opacity-60 mt-1">13 de junho · 16h às 22h</p>
      </header>

      <div className="flex-1 flex items-start justify-center p-4 pt-8 pb-12">
        <div className="w-full max-w-sm">
          {!resultado ? (
            <div className="card">
              <h2 className="font-semibold text-tonha-brown mb-5">Comprar ingresso</h2>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="label">Nome completo *</label>
                  <input
                    className="input"
                    value={form.nome}
                    onChange={e => set('nome', e.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div>
                  <label className="label">E-mail *</label>
                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Ingressos</label>
                    <span className="text-xs text-tonha-brown/40">máx. {limite} por pedido</span>
                  </div>
                  <div className="space-y-2">
                    <Stepper
                      label="Inteira"
                      preco={precoInteira}
                      value={form.quantidade_inteira}
                      onInc={() => set('quantidade_inteira', form.quantidade_inteira + 1)}
                      onDec={() => set('quantidade_inteira', Math.max(0, form.quantidade_inteira - 1))}
                      maxReached={totalQtd >= limite}
                    />
                    <Stepper
                      label="Meia-entrada"
                      preco={precoMeia}
                      value={form.quantidade_meia}
                      onInc={() => set('quantidade_meia', form.quantidade_meia + 1)}
                      onDec={() => set('quantidade_meia', Math.max(0, form.quantidade_meia - 1))}
                      maxReached={totalQtd >= limite}
                    />
                  </div>
                </div>

                {total > 0 && (
                  <div className="bg-tonha-amber/20 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-tonha-brown/60">Total a pagar via PIX</p>
                    <p className="text-2xl font-bold text-tonha-brown">{formatBRL(total)}</p>
                    <p className="text-xs text-tonha-brown/40 mt-0.5">{totalQtd} ingresso{totalQtd > 1 ? 's' : ''}</p>
                  </div>
                )}

                {erro && (
                  <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl py-2 px-3">{erro}</p>
                )}
                <button type="submit" disabled={enviando || totalQtd === 0} className="btn-primary w-full disabled:opacity-50">
                  {enviando ? 'Gerando PIX...' : 'Gerar QR Code PIX'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card text-center space-y-5">
              <div>
                <p className="text-4xl">✅</p>
                <h2 className="font-semibold text-tonha-brown mt-2">Pedido registrado!</h2>
                <p className="text-sm text-tonha-brown/60 mt-1">
                  {descVenda} · <strong>{formatBRL(resultado.venda.valor_total)}</strong>
                </p>
              </div>
              <p className="text-xs text-tonha-brown/50">
                Escaneie o QR Code ou copie o código PIX para pagar
              </p>
              <div className="flex justify-center">
                <img
                  src={resultado.qrDataUrl}
                  alt="QR Code PIX"
                  className="w-52 h-52 rounded-2xl border border-tonha-sand"
                />
              </div>
              <button
                onClick={copiar}
                className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  copiado
                    ? 'bg-green-50 border-green-400 text-green-700'
                    : 'border-tonha-terra text-tonha-terra hover:bg-tonha-terra/10'
                }`}
              >
                {copiado ? '✓ Código copiado!' : 'Copiar código PIX'}
              </button>
              <p className="text-xs text-tonha-brown/40 leading-relaxed">
                Após o pagamento, seu ingresso será confirmado pelo organizador. Guarde esta página como comprovante do pedido.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
