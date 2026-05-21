import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { formatBRL } from '../utils/format'

export default function VendaPublica() {
  const [config, setConfig] = useState({})
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [form, setForm] = useState({ nome: '', email: '', tipo: 'inteira', quantidade: 1 })
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
  const preco = form.tipo === 'meia' ? parseFloat(config.valor_meia) || 0 : parseFloat(config.valor_inteira) || 0
  const total = preco * (parseInt(form.quantidade) || 1)

  const submit = async (e) => {
    e.preventDefault()
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
                  <label className="label">Tipo de ingresso</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'inteira', label: 'Inteira', preco: parseFloat(config.valor_inteira) || 0 },
                      { value: 'meia', label: 'Meia-entrada', preco: parseFloat(config.valor_meia) || 0 },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set('tipo', opt.value)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                          form.tipo === opt.value
                            ? 'bg-tonha-terra/20 border-tonha-terra text-tonha-darkterra'
                            : 'border-tonha-sand text-tonha-brown/60'
                        }`}
                      >
                        <span className="block">{opt.label}</span>
                        {opt.preco > 0 && (
                          <span className="block text-xs mt-0.5 opacity-80">{formatBRL(opt.preco)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Quantidade (máx. {limite})</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max={limite}
                    value={form.quantidade}
                    onChange={e => set('quantidade', Math.min(parseInt(e.target.value) || 1, limite))}
                    required
                  />
                </div>
                {total > 0 && (
                  <div className="bg-tonha-amber/20 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-tonha-brown/60">Total a pagar via PIX</p>
                    <p className="text-2xl font-bold text-tonha-brown">{formatBRL(total)}</p>
                  </div>
                )}
                {erro && (
                  <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl py-2 px-3">{erro}</p>
                )}
                <button type="submit" disabled={enviando} className="btn-primary w-full">
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
                  {resultado.venda.quantidade}x ingresso {resultado.venda.tipo}
                  {' · '}
                  <strong>{formatBRL(resultado.venda.valor_total)}</strong>
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
