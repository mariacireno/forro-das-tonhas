import { useEffect, useState } from 'react'
import { Plus, Trash2, Ticket, Users, Banknote } from 'lucide-react'
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
    onSave({
      ...form,
      quantidade: parseInt(form.quantidade),
      valor_unitario: parseFloat(form.valor_unitario),
      data: form.data || null,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Tipo de ingresso</label>
        <div className="flex gap-2">
          {['inteiro', 'meia'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => set('tipo', t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                form.tipo === t
                  ? 'bg-tonha-terra/20 border-tonha-terra text-tonha-darkterra'
                  : 'border-tonha-sand text-tonha-brown/60'
              }`}
            >
              {t === 'inteiro' ? 'Inteiro' : 'Meia-entrada'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Quantidade *</label>
          <input
            type="number" min="1" className="input"
            value={form.quantidade} onChange={e => set('quantidade', e.target.value)}
            placeholder="10" required
          />
        </div>
        <div>
          <label className="label">Valor unitário (R$) *</label>
          <input
            type="number" step="0.01" min="0" className="input"
            value={form.valor_unitario} onChange={e => set('valor_unitario', e.target.value)}
            placeholder="30,00" required
          />
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

export default function Ingressos() {
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

  if (loading) return <div className="text-tonha-brown/50 p-8">Carregando...</div>

  const inteiro = summary?.porTipo?.find(t => t.tipo === 'inteiro')
  const meia = summary?.porTipo?.find(t => t.tipo === 'meia')
  const antecipado = summary?.porCanal?.find(c => c.canal === 'antecipado')
  const portaria = summary?.porCanal?.find(c => c.canal === 'portaria')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-tonha-brown">Ingressos</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> Registrar venda
        </button>
      </div>

      {/* Resumo */}
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

      {/* Histório de vendas */}
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
                  <p className="text-sm text-tonha-brown">
                    {t.quantidade}x {formatBRL(t.valor_unitario)}
                  </p>
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

      {showModal && (
        <Modal title="Registrar venda de ingresso" onClose={() => setShowModal(false)}>
          <TicketForm onSave={handleSave} onClose={() => setShowModal(false)} />
        </Modal>
      )}
    </div>
  )
}
