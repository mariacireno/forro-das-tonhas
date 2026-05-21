import { useEffect, useState } from 'react'
import { Plus, Trash2, Ticket, Banknote, Settings, ChevronDown, Check, X } from 'lucide-react'
import { api } from '../api'
import Modal from '../components/Modal'
import { formatBRL, formatDate } from '../utils/format'

function TicketForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    tipo: 'inteiro', quantidade: '', valor_unitario: '', canal: 'antecipado', data: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const subtotal = (parseFloat(form.quantidade) || 0) * (parseFloat(form.valor_unitario) || 0)

  const submit = (e) => {
    e.preventDefault()
    if (!form.quantidade || !form.valor_unitario) return
    onSave({ ...form, quantidade: parseInt(form.quantidade), valor_unitario: parseFloat(form.valor_unitario), data: form.data || null })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Tipo de ingresso</label>
        <div className="flex gap-2">
          {['inteiro', 'meia'].map(t => (
            <button key={t} type="button" onClick={() => set('tipo', t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                form.tipo === t ? 'bg-tonha-terra/20 border-tonha-terra text-tonha-darkterra' : 'border-tonha-sand text-tonha-brown/60'
              }`}>
              {t === 'inteiro' ? 'Inteiro' : 'Meia-entrada'}
            </button>
          ))}
        </div>
      </div>
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Canal de venda</label>
          <select className="select" value={form.canal} onChange={e => set('canal', e.target.value)}>
            <option value="antecipado">Antecipado</option>
            <option value="portaria">Portaria</option>
          </select>
        </div>
        <div>
          <label className="label">Data</label>
          <input type="date" className="input" value={form.data} onChange={e => set('data', e.target.value)} />
        </div>
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
  const [conf, setConf] = useState({ pix_chave: '', pix_nome: '', pix_cidade: '', valor_inteira: '', valor_meia: '', limite_por_compra: '4' })
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
          <label className="label">Valor inteiro (R$)</label>
          <input className="input" type="number" step="0.01" min="0" value={conf.valor_inteira} onChange={e => set('valor_inteira', e.target.value)} placeholder="25,00" />
        </div>
        <div>
          <label className="label">Valor meia-entrada (R$)</label>
          <input className="input" type="number" step="0.01" min="0" value={conf.valor_meia} onChange={e => set('valor_meia', e.target.value)} placeholder="12,50" />
        </div>
        <div>
          <label className="label">Máx. ingressos por compra</label>
          <input className="input" type="number" min="1" max="20" value={conf.limite_por_compra} onChange={e => set('limite_por_compra', e.target.value)} placeholder="4" />
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

  const load = () => api.getVendas().then(v => setVendas(v)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

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
                <span className={`badge mt-0.5 shrink-0 ${v.status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {v.status === 'pago' ? '✅ pago' : '⏳ pendente'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tonha-brown truncate">{v.nome}</p>
                  <p className="text-xs text-tonha-brown/50 truncate">{v.email}</p>
                  <p className="text-xs text-tonha-brown/60">
                    {v.quantidade}x {v.tipo} · <strong>{formatBRL(v.valor_total || 0)}</strong>
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

  useEffect(() => { load() }, [])

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

  const inteiro = summary?.porTipo?.find(t => t.tipo === 'inteiro')
  const meia = summary?.porTipo?.find(t => t.tipo === 'meia')
  const antecipado = summary?.porCanal?.find(c => c.canal === 'antecipado')
  const portaria = summary?.porCanal?.find(c => c.canal === 'portaria')

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-tonha-brown">Ingressos</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-tonha-sand/40 p-1 rounded-xl">
        {[
          { key: 'portaria', label: 'Portaria' },
          { key: 'online', label: 'Vendas Online' },
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                <div className="card">
                  <p className="text-xs text-tonha-brown/60 mb-3">Por tipo</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-tonha-brown/70">Inteiro</span>
                      <span className="font-medium text-tonha-brown">{inteiro?.qty ?? 0} · {formatBRL(inteiro?.receita ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-tonha-brown/70">Meia</span>
                      <span className="font-medium text-tonha-brown">{meia?.qty ?? 0} · {formatBRL(meia?.receita ?? 0)}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-tonha-sand">
                    <p className="text-xs text-tonha-brown/60 mb-2">Por canal</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-tonha-brown/70">Antecipado</span>
                        <span className="font-medium text-tonha-brown">{antecipado?.qty ?? 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-tonha-brown/70">Portaria</span>
                        <span className="font-medium text-tonha-brown">{portaria?.qty ?? 0}</span>
                      </div>
                    </div>
                  </div>
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
                        <div className={`badge ${t.tipo === 'inteiro' ? 'bg-tonha-terra/20 text-tonha-darkterra' : 'bg-tonha-sky/30 text-tonha-darksky'}`}>
                          {t.tipo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-tonha-brown">{t.quantidade}x {formatBRL(t.valor_unitario)}</p>
                          <p className="text-xs text-tonha-brown/50">{t.canal} · {formatDate(t.data)}</p>
                        </div>
                        <p className="font-semibold text-green-600 text-sm">{formatBRL(t.quantidade * t.valor_unitario)}</p>
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
      ) : (
        <VendasOnline />
      )}
    </div>
  )
}
