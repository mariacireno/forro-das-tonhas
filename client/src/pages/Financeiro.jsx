import { useEffect, useState } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, PiggyBank, Users } from 'lucide-react'
import { api } from '../api'
import Modal from '../components/Modal'
import { formatBRL, formatDate, CATEGORIAS_CUSTO } from '../utils/format'

function TransactionForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    tipo: 'custo', categoria: 'outros', valor: '', descricao: '', data: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.valor || isNaN(parseFloat(form.valor))) return
    onSave({ ...form, valor: parseFloat(form.valor), data: form.data || null })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Tipo</label>
        <div className="flex gap-2">
          {['receita', 'custo'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => set('tipo', t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                form.tipo === t
                  ? t === 'receita'
                    ? 'bg-tonha-sage/40 border-tonha-sage text-green-700'
                    : 'bg-tonha-terra/20 border-tonha-terra text-tonha-darkterra'
                  : 'border-tonha-sand text-tonha-brown/60'
              }`}
            >
              {t === 'receita' ? '↑ Receita' : '↓ Custo'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Valor (R$) *</label>
          <input
            type="number" step="0.01" min="0"
            className="input" value={form.valor}
            onChange={e => set('valor', e.target.value)}
            placeholder="0,00" required
          />
        </div>
        <div>
          <label className="label">Data</label>
          <input type="date" className="input" value={form.data} onChange={e => set('data', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Categoria</label>
        <select className="select" value={form.categoria} onChange={e => set('categoria', e.target.value)}>
          {form.tipo === 'receita'
            ? <><option value="ingressos">Ingressos</option><option value="bar">Bar</option><option value="outros">Outros</option></>
            : CATEGORIAS_CUSTO.map(c => <option key={c.value} value={c.value}>{c.label}</option>)
          }
        </select>
      </div>
      <div>
        <label className="label">Descrição</label>
        <input className="input" value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Ex: Pagamento toldo (Estruturas Nordeste)" />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1">Salvar</button>
        <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  )
}

export default function Financeiro() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterTipo, setFilterTipo] = useState('todas')

  const load = () => Promise.all([api.getTransactions(), api.getFinancialSummary()])
    .then(([t, s]) => { setTransactions(t); setSummary(s) })
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleSave = async (data) => {
    await api.createTransaction(data)
    setShowModal(false)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Remover este lançamento?')) return
    await api.deleteTransaction(id)
    load()
  }

  const filtered = transactions.filter(t => filterTipo === 'todas' || t.tipo === filterTipo)

  if (loading) return <div className="text-tonha-brown/50 p-8">Carregando...</div>

  const lucroPositivo = (summary?.lucro ?? 0) >= 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-tonha-brown">Financeiro</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> Novo lançamento
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card text-center">
          <TrendingUp size={20} className="text-green-600 mx-auto mb-2" />
          <p className="text-xs text-tonha-brown/60">Receitas</p>
          <p className="text-lg font-bold text-green-700">{formatBRL(summary?.receitas)}</p>
        </div>
        <div className="card text-center">
          <TrendingDown size={20} className="text-tonha-darkterra mx-auto mb-2" />
          <p className="text-xs text-tonha-brown/60">Custos</p>
          <p className="text-lg font-bold text-tonha-darkterra">{formatBRL(summary?.custos)}</p>
        </div>
        <div className={`card text-center ${lucroPositivo ? 'bg-tonha-sage/10' : 'bg-red-50'}`}>
          <p className="text-xs text-tonha-brown/60">Lucro líquido</p>
          <p className={`text-lg font-bold ${lucroPositivo ? 'text-green-700' : 'text-red-600'}`}>
            {formatBRL(summary?.lucro)}
          </p>
        </div>
        <div className="card text-center bg-tonha-amber/10">
          <PiggyBank size={20} className="text-amber-700 mx-auto mb-2" />
          <p className="text-xs text-tonha-brown/60">Reinvestimento</p>
          <p className="text-lg font-bold text-amber-700">{formatBRL(summary?.reinvestimento)}</p>
        </div>
      </div>

      {/* Divisão por sócia */}
      {summary && summary.lucro > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-tonha-darksky" />
            <h2 className="font-semibold text-tonha-brown">Distribuição às sócias</h2>
            <span className="text-xs text-tonha-brown/50 ml-1">(50% do lucro = {formatBRL(summary.distribuido)})</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Renata',   pct: '50%', color: 'bg-tonha-terra/20 border-tonha-terra/30' },
              { name: 'Maria',    pct: '25%', color: 'bg-tonha-sky/20 border-tonha-sky/30' },
              { name: 'Catarina', pct: '25%', color: 'bg-tonha-sage/20 border-tonha-sage/30' },
            ].map(({ name, pct, color }) => (
              <div key={name} className={`rounded-xl p-4 border text-center ${color}`}>
                <p className="font-semibold text-tonha-brown">{name}</p>
                <p className="text-xs text-tonha-brown/50 mb-1">{pct} do distribuído</p>
                <p className="text-lg font-bold text-tonha-brown">{formatBRL(summary.socias[name])}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extrato */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-semibold text-tonha-brown">Lançamentos</h2>
          <div className="flex gap-2">
            {['todas', 'receita', 'custo'].map(f => (
              <button
                key={f}
                onClick={() => setFilterTipo(f)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  filterTipo === f ? 'bg-tonha-terra text-white' : 'bg-tonha-sand text-tonha-brown hover:bg-tonha-terra/20'
                }`}
              >
                {f === 'todas' ? 'Todas' : f === 'receita' ? 'Receitas' : 'Custos'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-tonha-brown/50 py-8">Nenhum lançamento encontrado.</p>
        ) : (
          <ul className="divide-y divide-tonha-sand">
            {filtered.map(t => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.tipo === 'receita' ? 'bg-green-500' : 'bg-tonha-terra'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-tonha-brown truncate">{t.descricao || t.categoria}</p>
                  <p className="text-xs text-tonha-brown/50">{formatDate(t.data)} · {t.categoria}</p>
                </div>
                <p className={`font-semibold text-sm flex-shrink-0 ${t.tipo === 'receita' ? 'text-green-600' : 'text-tonha-darkterra'}`}>
                  {t.tipo === 'receita' ? '+' : '−'} {formatBRL(t.valor)}
                </p>
                <button onClick={() => handleDelete(t.id)} className="text-tonha-brown/30 hover:text-red-400 transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showModal && (
        <Modal title="Novo lançamento" onClose={() => setShowModal(false)}>
          <TransactionForm onSave={handleSave} onClose={() => setShowModal(false)} />
        </Modal>
      )}
    </div>
  )
}
