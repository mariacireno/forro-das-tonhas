import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Ticket, Banknote, Settings, ChevronDown, Check, X, Search, ScanLine, Download } from 'lucide-react'
import { api } from '../api'
import Modal from '../components/Modal'
import { formatBRL, formatDate } from '../utils/format'

function TicketForm({ onSave, onClose }) {
  const [form, setForm] = useState({ quantidade: '', valor_unitario: '', data: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const subtotal = (parseFloat(form.quantidade) || 0) * (parseFloat(form.valor_unitario) || 0)

  const submit = (e) => {
    e.preventDefault()
    if (!form.quantidade || !form.valor_unitario) return
    onSave({ tipo: 'portaria', canal: 'portaria', quantidade: parseInt(form.quantidade), valor_unitario: parseFloat(form.valor_unitario), data: form.data || null })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Quantidade *</label>
          <input type="number" min="1" className="input" value={form.quantidade} onChange={e => set('quantidade', e.target.value)} placeholder="10" required />
        </div>
        <div>
          <label className="label">Valor unitário (R$) *</label>
          <input type="number" step="0.01" min="0" className="input" value={form.valor_unitario} onChange={e => set('valor_unitario', e.target.value)} placeholder="30,00" required />
        </div>
      </div>
      <div>
        <label className="label">Data</label>
        <input type="date" className="input" value={form.data} onChange={e => set('data', e.target.value)} />
      </div>
      {subtotal > 0 && (
        <div className="bg-tonha-amber/20 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-tonha-brown/60">Subtotal</p>
          <p className="text-xl font-bold text-tonha-brown">{formatBRL(subtotal)}</p>
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1">Registrar venda</button>
        <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  )
}

function ConfigPix() {
  const [conf, setConf] = useState({ pix_chave: '', pix_nome: '', pix_cidade: '', valor_lote_promo: '', valor_lote2: '', valor_mesa: '', limite_por_compra: '4', estoque_lote_promo: '0', estoque_lote2: '0', estoque_mesa: '0' })
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const set = (k, v) => setConf(c => ({ ...c, [k]: v }))

  useEffect(() => {
    api.getConfig().then(c => { setConf(prev => ({ ...prev, ...c })); setLoading(false) })
  }, [])

  const salvar = async () => {
    setSalvando(true)
    await Promise.all(Object.entries(conf).map(([k, v]) => api.updateConfig(k, v)))
    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  if (loading) return <p className="text-tonha-brown/40 text-sm py-2">Carregando...</p>

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="label">Chave PIX</label>
          <input className="input" value={conf.pix_chave} onChange={e => set('pix_chave', e.target.value)} placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória" />
        </div>
        <div>
          <label className="label">Nome do recebedor (máx. 25)</label>
          <input className="input" maxLength={25} value={conf.pix_nome} onChange={e => set('pix_nome', e.target.value)} placeholder="Forro das Tonhas" />
        </div>
        <div>
          <label className="label">Cidade (máx. 15, sem acentos)</label>
          <input className="input" maxLength={15} value={conf.pix_cidade} onChange={e => set('pix_cidade', e.target.value)} placeholder="Sao Paulo" />
        </div>
        <div>
          <label className="label">Valor Lote Promocional (R$)</label>
          <input className="input" type="number" step="0.01" min="0" value={conf.valor_lote_promo} onChange={e => set('valor_lote_promo', e.target.value)} placeholder="20,00" />
        </div>
        <div>
          <label className="label">Valor 2º Lote (R$)</label>
          <input className="input" type="number" step="0.01" min="0" value={conf.valor_lote2} onChange={e => set('valor_lote2', e.target.value)} placeholder="25,00" />
        </div>
        <div>
          <label className="label">Valor Mesa — 4 pessoas (R$)</label>
          <input className="input" type="number" step="0.01" min="0" value={conf.valor_mesa} onChange={e => set('valor_mesa', e.target.value)} placeholder="80,00" />
        </div>
        <div>
          <label className="label">Máx. por compra</label>
          <input className="input" type="number" min="1" max="20" value={conf.limite_por_compra} onChange={e => set('limite_por_compra', e.target.value)} placeholder="4" />
        </div>
        <div>
          <label className="label">Estoque Lote Promo (0 = ilimitado)</label>
          <input className="input" type="number" min="0" value={conf.estoque_lote_promo} onChange={e => set('estoque_lote_promo', e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="label">Estoque 2º Lote (0 = ilimitado)</label>
          <input className="input" type="number" min="0" value={conf.estoque_lote2} onChange={e => set('estoque_lote2', e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="label">Estoque Mesas (0 = ilimitado)</label>
          <input className="input" type="number" min="0" value={conf.estoque_mesa} onChange={e => set('estoque_mesa', e.target.value)} placeholder="0" />
        </div>
      </div>
      <button onClick={salvar} disabled={salvando} className="btn-primary">
        {salvando ? 'Salvando...' : salvo ? '✓ Salvo!' : 'Salvar configuração'}
      </button>
    </div>
  )
}

function VendasOnline() {
  const [vendas, setVendas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfig, setShowConfig] = useState(false)
  const [vendasAtivas, setVendasAtivas] = useState(true)
  const [togglingVendas, setTogglingVendas] = useState(false)

  const load = () => api.getVendas().then(v => setVendas(v)).finally(() => setLoading(false))
  useEffect(() => {
    load()
    api.getConfig().then(c => setVendasAtivas(c.vendas_ativas !== '0'))
    const id = setInterval(load, 20000)
    return () => clearInterval(id)
  }, [])

  const toggleVendas = async () => {
    const novoValor = vendasAtivas ? '0' : '1'
    if (!confirm(vendasAtivas ? 'Suspender as vendas no site?' : 'Reativar as vendas no site?')) return
    setTogglingVendas(true)
    await api.updateConfig('vendas_ativas', novoValor)
    setVendasAtivas(!vendasAtivas)
    setTogglingVendas(false)
  }

  const confirmar = async (id) => {
    if (!confirm('Confirmar pagamento desta venda?')) return
    await api.confirmarVenda(id)
    load()
  }

  const deletar = async (id) => {
    if (!confirm('Cancelar esta venda pendente?')) return
    await api.deleteVenda(id)
    load()
  }

  const resetarTeste = async () => {
    if (!confirm('⚠️ Isso vai apagar TODAS as vendas (incluindo confirmadas) e seus check-ins. Usar apenas para limpar dados de teste. Confirmar?')) return
    if (!confirm('Tem certeza? Esta ação não pode ser desfeita.')) return
    await fetch('/api/admin/reset-vendas', { method: 'DELETE', headers: { 'x-admin-password': sessionStorage.getItem('adminPwd') || '' } })
    load()
  }

  const pendentes = vendas.filter(v => v.status === 'pendente')
  const pagas = vendas.filter(v => v.status === 'pago')
  const totalConfirmado = pagas.reduce((s, v) => s + (v.valor_total || 0), 0)
  const linkPublico = `${window.location.origin}/venda`

  if (loading) return <div className="text-tonha-brown/50 py-6 text-center">Carregando...</div>

  return (
    <div className="space-y-4">
      {/* Contadores */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-3">
          <p className="text-xl font-bold text-amber-600">{pendentes.length}</p>
          <p className="text-xs text-tonha-brown/50">pendentes</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-xl font-bold text-green-600">{pagas.length}</p>
          <p className="text-xs text-tonha-brown/50">confirmados</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-lg font-bold text-tonha-brown">{formatBRL(totalConfirmado)}</p>
          <p className="text-xs text-tonha-brown/50">confirmado</p>
        </div>
      </div>

      {/* Toggle vendas */}
      <div className={`card flex items-center justify-between gap-4 ${vendasAtivas ? 'bg-green-50' : 'bg-red-50'}`}>
        <div>
          <p className={`font-semibold text-sm ${vendasAtivas ? 'text-green-700' : 'text-red-700'}`}>
            {vendasAtivas ? 'Vendas ativas' : 'Vendas suspensas'}
          </p>
          <p className="text-xs text-tonha-brown/50 mt-0.5">
            {vendasAtivas ? 'Clientes podem comprar no site.' : 'Nenhuma nova compra é aceita.'}
          </p>
        </div>
        <button
          onClick={toggleVendas}
          disabled={togglingVendas}
          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
            vendasAtivas
              ? 'border-red-300 text-red-600 hover:bg-red-100'
              : 'border-green-400 text-green-700 hover:bg-green-100'
          }`}
        >
          {togglingVendas ? '...' : vendasAtivas ? 'Suspender' : 'Reativar'}
        </button>
      </div>

      {/* Link público */}
      <div className="card bg-tonha-sky/10">
        <p className="text-xs text-tonha-brown/60 mb-1.5">Link público de vendas</p>
        <div className="flex items-center gap-2">
          <code className="text-sm text-tonha-brown flex-1 truncate">{linkPublico}</code>
          <button
            onClick={() => navigator.clipboard.writeText(linkPublico)}
            className="text-xs border border-tonha-sky/50 text-tonha-brown/60 px-2 py-1 rounded-lg hover:bg-tonha-sky/20 transition-colors shrink-0"
          >
            Copiar
          </button>
        </div>
      </div>

      {/* Configuração PIX (acordeão) */}
      <div className="card">
        <button onClick={() => setShowConfig(c => !c)} className="flex items-center justify-between w-full text-left">
          <span className="font-medium text-tonha-brown flex items-center gap-2">
            <Settings size={16} /> Configuração PIX
          </span>
          <ChevronDown size={16} className={`text-tonha-brown/50 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
        </button>
        {showConfig && (
          <div className="mt-4 pt-4 border-t border-tonha-sand">
            <ConfigPix />
          </div>
        )}
      </div>

      {/* Lista de vendas */}
      <div className="card">
        <h3 className="font-semibold text-tonha-brown mb-4">Vendas online</h3>
        {vendas.length === 0 ? (
          <p className="text-center text-tonha-brown/50 py-6">Nenhuma venda online ainda.</p>
        ) : (
          <ul className="divide-y divide-tonha-sand">
            {vendas.map(v => (
              <li key={v.id} className="py-3 flex items-start gap-3">
                <span className={`badge mt-0.5 shrink-0 ${
                  v.status === 'pago' ? 'bg-green-100 text-green-700' :
                  v.status === 'cancelado' ? 'bg-gray-100 text-gray-500' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {v.status === 'pago' ? '✅ pago' : v.status === 'cancelado' ? '✕ cancelado' : '⏳ pendente'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tonha-brown truncate">{v.nome}</p>
                  <p className="text-xs text-tonha-brown/50 truncate">{v.email}</p>
                  <p className="text-xs text-tonha-brown/60">
                    {(() => {
                      const partes = []
                      if (v.quantidade_lote_promo > 0) partes.push(`${v.quantidade_lote_promo}x lote promo`)
                      if (v.quantidade_lote2 > 0) partes.push(`${v.quantidade_lote2}x 2º lote`)
                      if (v.quantidade_mesa > 0) partes.push(`${v.quantidade_mesa}x mesa`)
                      if (v.quantidade_inteira > 0) partes.push(`${v.quantidade_inteira}x inteira`)
                      if (v.quantidade_meia > 0) partes.push(`${v.quantidade_meia}x meia`)
                      return partes.length ? partes.join(' + ') : `${v.quantidade}x ${v.tipo}`
                    })()} · <strong>{formatBRL(v.valor_total || 0)}</strong>
                  </p>
                  <p className="text-xs text-tonha-brown/40">{formatDate(v.created_at?.slice(0, 10))}</p>
                </div>
                {v.status === 'pendente' && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => confirmar(v.id)} title="Confirmar pago"
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Check size={15} />
                    </button>
                    <button onClick={() => deletar(v.id)} title="Cancelar venda"
                      className="p-1.5 text-tonha-brown/30 hover:text-red-400 rounded-lg transition-colors">
                      <X size={15} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {vendas.length > 0 && (
        <button onClick={resetarTeste} className="w-full text-xs text-tonha-brown/30 hover:text-red-400 transition-colors py-2">
          Limpar dados de teste
        </button>
      )}
    </div>
  )
}

function QrScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)

  useEffect(() => {
    let stopped = false
    import('@zxing/browser').then(({ BrowserQRCodeReader, BrowserCodeReader }) => {
      if (stopped) return
      const hints = new Map()
      const reader = new BrowserQRCodeReader(hints, { delayBetweenScanAttempts: 300 })
      readerRef.current = reader
      BrowserCodeReader.listVideoInputDevices().then(devices => {
        if (stopped || !devices.length) return
        // prefere câmera traseira em mobile
        const back = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[devices.length - 1]
        reader.decodeFromVideoDevice(back.deviceId, videoRef.current, (result, err) => {
          if (stopped || !result) return
          const text = result.getText()
          if (text.startsWith('checkin:')) {
            onScan(text.replace('checkin:', ''))
          }
        })
      })
    })
    return () => {
      stopped = true
      readerRef.current?.reset?.()
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-tonha-dark">
        <span className="text-white font-medium text-sm">Aponte para o QR Code do ingresso</span>
        <button onClick={onClose} className="text-white p-1"><X size={22} /></button>
      </div>
      <div className="flex-1 relative">
        <video ref={videoRef} className="w-full h-full object-cover" />
        {/* mira */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{ width: 220, height: 220, border: '3px solid #1EA84A', borderRadius: 18, boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }} />
        </div>
      </div>
    </div>
  )
}

function CheckIn() {
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [scanning, setScanning] = useState(false)
  const [feedback, setFeedback] = useState(null) // { ok, nome, tipo, hora } | { ok: false, msg }

  const load = () =>
    api.getCheckins()
      .then(setCheckins)
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
    const id = setInterval(load, 20000)
    return () => clearInterval(id)
  }, [])

  const handleScan = async (checkinId) => {
    setScanning(false)
    const pwd = sessionStorage.getItem('adminPwd') || ''
    try {
      const res = await fetch(`/api/tickets/checkins/${checkinId}/scan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pwd },
      })
      const data = await res.json()
      if (res.ok) {
        setFeedback({ ok: true, nome: data.nome, tipo: data.tipo, hora: new Date(data.check_in_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) })
        load()
      } else if (res.status === 409) {
        const at = data.checkin?.check_in_at ? new Date(data.checkin.check_in_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
        setFeedback({ ok: false, msg: `Ingresso já utilizado${at ? ` às ${at}` : ''}`, nome: data.checkin?.nome, tipo: data.checkin?.tipo })
      } else {
        setFeedback({ ok: false, msg: data.error || 'QR Code inválido' })
      }
    } catch {
      setFeedback({ ok: false, msg: 'Erro de conexão' })
    }
    setTimeout(() => setFeedback(null), 4000)
  }

  const entraram = checkins.filter(c => c.check_in)
  const pendentes = checkins.filter(c => !c.check_in)

  const filtrados = busca
    ? checkins.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(busca.toLowerCase())
      )
    : checkins

  const imprimirLista = () => {
    const rows = checkins.map((c, i) => `
      <tr style="background:${c.check_in ? '#f0fdf4' : '#fff'}">
        <td>${i + 1}</td>
        <td><strong>${c.nome}</strong><br><span style="font-size:11px;color:#888">${c.email || ''}</span></td>
        <td>${c.tipo}</td>
        <td style="text-align:center">${c.check_in ? `✓ ${c.check_in_at ? new Date(c.check_in_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}` : ''}</td>
      </tr>`).join('')
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
      <title>Lista de Presença — Forró das Tonhas</title>
      <style>body{font-family:sans-serif;padding:24px;color:#222}h1{font-size:18px;margin:0}p{font-size:13px;color:#666;margin:4px 0 16px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid #ddd;padding:7px 10px;text-align:left;vertical-align:top}th{background:#f5f5f5;font-weight:600}</style>
      </head><body>
      <h1>Forró das Tonhas — Lista de Presença</h1>
      <p>Gerada em ${new Date().toLocaleString('pt-BR')} · ${checkins.length} ingressos · ${entraram.length} já entraram</p>
      <table><thead><tr><th>#</th><th>Nome / E-mail</th><th>Tipo</th><th>Check-in</th></tr></thead>
      <tbody>${rows}</tbody></table><script>window.print()</script>
    </body></html>`
    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
  }

  if (loading) return <div className="text-tonha-brown/50 py-6 text-center">Carregando...</div>

  return (
    <div className="space-y-4">
      {/* Feedback de scan */}
      {feedback && (
        <div className={`rounded-2xl p-4 border-2 ${feedback.ok ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
          <p className={`text-lg font-bold ${feedback.ok ? 'text-green-700' : 'text-red-600'}`}>
            {feedback.ok ? '✅ Entrada confirmada!' : '❌ ' + feedback.msg}
          </p>
          {feedback.nome && <p className="text-sm mt-1 text-tonha-brown">{feedback.nome} · {feedback.tipo}</p>}
          {feedback.ok && feedback.hora && <p className="text-xs text-green-600">às {feedback.hora}</p>}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-green-600">{entraram.length}</p>
          <p className="text-xs text-tonha-brown/50">entraram</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-tonha-terra">{pendentes.length}</p>
          <p className="text-xs text-tonha-brown/50">pendentes</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-tonha-brown">{checkins.length}</p>
          <p className="text-xs text-tonha-brown/50">total</p>
        </div>
      </div>

      <button
        onClick={() => setScanning(true)}
        className="btn-primary flex items-center justify-center gap-2 w-full"
      >
        <ScanLine size={18} /> Escanear QR Code
      </button>

      {checkins.length > 0 && (
        <button onClick={imprimirLista} className="btn-ghost flex items-center gap-1.5 text-sm w-full justify-center">
          🖨️ Imprimir lista de presença
        </button>
      )}

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-tonha-brown/30" />
        <input
          className="input pl-8"
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      <div className="card">
        {checkins.length === 0 ? (
          <p className="text-center text-tonha-brown/50 py-8">Nenhum ingresso confirmado ainda.</p>
        ) : filtrados.length === 0 ? (
          <p className="text-center text-tonha-brown/50 py-6">Nenhum resultado para "{busca}".</p>
        ) : (
          <ul className="divide-y divide-tonha-sand">
            {filtrados.map(c => (
              <li key={c.id} className={`flex items-center gap-3 py-3 transition-opacity ${c.check_in ? 'opacity-60' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tonha-brown truncate">{c.nome}</p>
                  <p className="text-xs text-tonha-brown/50">{c.tipo}</p>
                  {c.check_in && c.check_in_at && (
                    <p className="text-xs text-green-600">
                      Entrou às {new Date(c.check_in_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <span className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                  c.check_in ? 'bg-green-50 border-green-300 text-green-700' : 'border-tonha-sand text-tonha-brown/40'
                }`}>
                  {c.check_in ? '✓ Entrou' : 'Aguardando'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {scanning && <QrScanner onScan={handleScan} onClose={() => setScanning(false)} />}
    </div>
  )
}

export default function Ingressos() {
  const [aba, setAba] = useState('portaria')
  const [tickets, setTickets] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const load = () => Promise.all([api.getTickets(), api.getTicketSummary()])
    .then(([t, s]) => { setTickets(t); setSummary(s) })
    .finally(() => setLoading(false))

  useEffect(() => {
    load()
    const id = setInterval(load, 20000)
    return () => clearInterval(id)
  }, [])

  const handleSave = async (data) => {
    await api.createTicket(data)
    setShowModal(false)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Remover este registro? A receita correspondente não será estornada automaticamente.')) return
    await api.deleteTicket(id)
    load()
  }

  const handleDownloadPdf = async (id) => {
    try {
      const blob = await api.getPortariaPdf(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ingressos-portaria-${id.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message)
    }
  }


  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-tonha-brown">Ingressos</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-tonha-sand/40 p-1 rounded-xl">
        {[
          { key: 'portaria', label: 'Portaria' },
          { key: 'online', label: 'Vendas Online' },
          { key: 'checkin', label: 'Check-in' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setAba(tab.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              aba === tab.key ? 'bg-white text-tonha-brown shadow-sm' : 'text-tonha-brown/50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {aba === 'portaria' ? (
        <>
          <div className="flex justify-end">
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
              <Plus size={16} /> Registrar venda
            </button>
          </div>

          {loading ? (
            <div className="text-tonha-brown/50 py-6 text-center">Carregando...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="card text-center">
                  <Ticket size={22} className="text-tonha-terra mx-auto mb-2" />
                  <p className="text-xs text-tonha-brown/60">Total vendidos</p>
                  <p className="text-2xl font-bold text-tonha-brown">{summary?.qty ?? 0}</p>
                  <p className="text-xs text-tonha-brown/50 mt-0.5">ingressos</p>
                </div>
                <div className="card text-center bg-tonha-amber/10">
                  <Banknote size={22} className="text-amber-700 mx-auto mb-2" />
                  <p className="text-xs text-tonha-brown/60">Total arrecadado</p>
                  <p className="text-2xl font-bold text-amber-700">{formatBRL(summary?.receita)}</p>
                </div>
              </div>

              <div className="card">
                <h2 className="font-semibold text-tonha-brown mb-4">Histórico de vendas</h2>
                {tickets.length === 0 ? (
                  <p className="text-center text-tonha-brown/50 py-8">Nenhuma venda registrada ainda.</p>
                ) : (
                  <ul className="divide-y divide-tonha-sand">
                    {tickets.map(t => (
                      <li key={t.id} className="flex items-center gap-3 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-tonha-brown">{t.quantidade}x ingresso · {formatBRL(t.valor_unitario)} cada</p>
                          <p className="text-xs text-tonha-brown/50">{formatDate(t.data)}</p>
                        </div>
                        <p className="font-semibold text-green-600 text-sm">{formatBRL(t.quantidade * t.valor_unitario)}</p>
                        <button onClick={() => handleDownloadPdf(t.id)} title="Baixar PDF com QR codes" className="text-tonha-brown/30 hover:text-tonha-terra transition-colors p-1">
                          <Download size={14} />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="text-tonha-brown/30 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {showModal && (
            <Modal title="Registrar venda de ingresso" onClose={() => setShowModal(false)}>
              <TicketForm onSave={handleSave} onClose={() => setShowModal(false)} />
            </Modal>
          )}
        </>
      ) : aba === 'online' ? (
        <VendasOnline />
      ) : (
        <CheckIn />
      )}
    </div>
  )
}
