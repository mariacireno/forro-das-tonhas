import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown, PiggyBank, Users } from 'lucide-react'
import { api } from '../api'
import Modal from '../components/Modal'
import { formatBRL, formatDate, CATEGORIAS_CUSTO } from '../utils/format'

const CATEGORIAS_RECEITA = [
  { value: 'ingressos', label: 'Ingressos' },
  { value: 'bar',       label: 'Bar' },
  { value: 'outros',    label: 'Outros' },
]

// ─── Formulário compartilhado (transação real e orçamento) ──────────────────
function LancamentoForm({ inicial, onSave, onClose }) {
  const [form, setForm] = useState({
    tipo: 'custo', categoria: 'outros', valor: '', descricao: '', data: '',
    ...inicial,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.valor || isNaN(parseFloat(form.valor))) return
    onSave({ ...form, valor: parseFloat(form.valor), data: form.data || null })
  }

  const categoriasAtivas = form.tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_CUSTO

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Tipo</label>
        <div className="flex gap-2">
          {['receita', 'custo'].map(t => (
            <button key={t} type="button" onClick={() => set('tipo', t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                form.tipo === t
                  ? t === 'receita' ? 'bg-tonha-sage/40 border-tonha-sage text-green-700' : 'bg-tonha-terra/20 border-tonha-terra text-tonha-darkterra'
                  : 'border-tonha-sand text-tonha-brown/60'
              }`}>
              {t === 'receita' ? '↑ Receita' : '↓ Custo'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Valor (R$) *</label>
          <input type="number" step="0.01" min="0" className="input" value={form.valor}
            onChange={e => set('valor', e.target.value)} placeholder="0,00" required />
        </div>
        <div>
          <label className="label">Categoria</label>
          <select className="select" value={form.categoria} onChange={e => set('categoria', e.target.value)}>
            {categoriasAtivas.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Descrição</label>
        <input className="input" value={form.descricao || ''} onChange={e => set('descricao', e.target.value)}
          placeholder="Ex: Toldo — Estruturas Nordeste" />
      </div>

      {/* Data só faz sentido para lançamentos reais */}
      {inicial?.showData !== false && (
        <div>
          <label className="label">Data</label>
          <input type="date" className="input" value={form.data || ''} onChange={e => set('data', e.target.value)} />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1">Salvar</button>
        <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  )
}

// ─── Cards de resumo ────────────────────────────────────────────────────────
function SummaryCards({ receitas, custos, lucro, reinvestimento }) {
  const positivo = lucro >= 0
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="card text-center">
        <TrendingUp size={20} className="text-green-600 mx-auto mb-2" />
        <p className="text-xs text-tonha-brown/60">Receitas</p>
        <p className="text-lg font-bold text-green-700">{formatBRL(receitas)}</p>
      </div>
      <div className="card text-center">
        <TrendingDown size={20} className="text-tonha-darkterra mx-auto mb-2" />
        <p className="text-xs text-tonha-brown/60">Custos</p>
        <p className="text-lg font-bold text-tonha-darkterra">{formatBRL(custos)}</p>
      </div>
      <div className={`card text-center ${positivo ? 'bg-tonha-sage/10' : 'bg-red-50'}`}>
        <p className="text-xs text-tonha-brown/60">Resultado</p>
        <p className={`text-lg font-bold ${positivo ? 'text-green-700' : 'text-red-600'}`}>
          {formatBRL(lucro)}
        </p>
      </div>
      <div className="card text-center bg-tonha-amber/10">
        <PiggyBank size={20} className="text-amber-700 mx-auto mb-2" />
        <p className="text-xs text-tonha-brown/60">Reinvestimento</p>
        <p className="text-lg font-bold text-amber-700">{formatBRL(reinvestimento)}</p>
      </div>
    </div>
  )
}

// ─── Comparativo orçado vs real ─────────────────────────────────────────────
function Comparativo({ real, orcamento }) {
  if (!real || !orcamento) return null

  const rows = [
    { label: 'Receitas',   orc: orcamento.receitas_orcadas,   rel: real.receitas,        positivo: true },
    { label: 'Custos',     orc: orcamento.custos_orcados,     rel: real.custos,           positivo: false },
    { label: 'Resultado',  orc: orcamento.resultado_previsto, rel: real.lucro,            positivo: real.lucro >= 0 },
  ]

  return (
    <div className="card">
      <h2 className="font-semibold text-tonha-brown mb-4">Orçado × Real</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-tonha-brown/50 border-b border-tonha-sand">
              <th className="text-left pb-2 font-medium"></th>
              <th className="text-right pb-2 font-medium">Orçado</th>
              <th className="text-right pb-2 font-medium">Real</th>
              <th className="text-right pb-2 font-medium">Diferença</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tonha-sand">
            {rows.map(({ label, orc, rel, positivo }) => {
              const diff = rel - orc
              const diffColor = label === 'Custos'
                ? (diff <= 0 ? 'text-green-600' : 'text-red-500')
                : (diff >= 0 ? 'text-green-600' : 'text-red-500')
              return (
                <tr key={label}>
                  <td className="py-3 text-tonha-brown font-medium">{label}</td>
                  <td className="py-3 text-right text-tonha-brown/60">{formatBRL(orc)}</td>
                  <td className={`py-3 text-right font-semibold ${positivo ? 'text-green-700' : 'text-tonha-darkterra'}`}>
                    {formatBRL(rel)}
                  </td>
                  <td className={`py-3 text-right font-semibold ${diffColor}`}>
                    {diff >= 0 ? '+' : ''}{formatBRL(diff)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Lista de itens (transações ou orçamentos) ───────────────────────────────
function ListaItens({ items, onDelete, onEdit, showData }) {
  if (items.length === 0)
    return <p className="text-center text-tonha-brown/50 py-8">Nenhum item cadastrado.</p>

  return (
    <ul className="divide-y divide-tonha-sand">
      {items.map(t => (
        <li key={t.id} className="flex items-center gap-3 py-3">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.tipo === 'receita' ? 'bg-green-500' : 'bg-tonha-terra'}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-tonha-brown truncate">{t.descricao || t.categoria}</p>
            <p className="text-xs text-tonha-brown/50">
              {showData && t.data ? `${formatDate(t.data)} · ` : ''}{t.categoria}
            </p>
          </div>
          <p className={`font-semibold text-sm flex-shrink-0 ${t.tipo === 'receita' ? 'text-green-600' : 'text-tonha-darkterra'}`}>
            {t.tipo === 'receita' ? '+' : '−'} {formatBRL(t.valor)}
          </p>
          {onEdit && (
            <button onClick={() => onEdit(t)} className="text-tonha-brown/30 hover:text-tonha-brown transition-colors p-1">
              <Pencil size={14} />
            </button>
          )}
          <button onClick={() => onDelete(t.id)} className="text-tonha-brown/30 hover:text-red-400 transition-colors p-1">
            <Trash2 size={14} />
          </button>
        </li>
      ))}
    </ul>
  )
}

// ─── Distribuição às sócias ──────────────────────────────────────────────────
function Distribuicao({ distribuido, socias, titulo }) {
  if (!distribuido || distribuido <= 0) return null
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Users size={16} className="text-tonha-darksky" />
        <h2 className="font-semibold text-tonha-brown">{titulo}</h2>
        <span className="text-xs text-tonha-brown/50 ml-1">(50% do resultado = {formatBRL(distribuido)})</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { name: 'Renata',   pct: '50%', color: 'bg-tonha-terra/20 border-tonha-terra/30' },
          { name: 'Maria',    pct: '25%', color: 'bg-tonha-sky/20 border-tonha-sky/30' },
          { name: 'Catarina', pct: '25%', color: 'bg-tonha-sage/20 border-tonha-sage/30' },
        ].map(({ name, pct, color }) => (
          <div key={name} className={`rounded-xl p-4 border text-center ${color}`}>
            <p className="font-semibold text-tonha-brown">{name}</p>
            <p className="text-xs text-tonha-brown/50 mb-1">{pct}</p>
            <p className="text-lg font-bold text-tonha-brown">{formatBRL(socias[name])}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function Financeiro() {
  const [tab, setTab] = useState('real')
  const [transactions, setTransactions] = useState([])
  const [orcamentos, setOrcamentos] = useState([])
  const [summary, setSummary] = useState(null)
  const [orcSummary, setOrcSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filterTipo, setFilterTipo] = useState('todas')

  const load = () =>
    Promise.all([
      api.getTransactions(),
      api.getFinancialSummary(),
      api.getOrcamentos(),
      api.getOrcamentoSummary(),
    ]).then(([t, s, o, os]) => {
      setTransactions(t)
      setSummary(s)
      setOrcamentos(o)
      setOrcSummary(os)
    }).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  // Transações reais
  const handleSaveTransaction = async (data) => {
    await api.createTransaction(data)
    setShowModal(false)
    load()
  }
  const handleDeleteTransaction = async (id) => {
    if (!confirm('Remover este lançamento?')) return
    await api.deleteTransaction(id)
    load()
  }

  // Orçamentos
  const handleSaveOrcamento = async (data) => {
    if (editItem) {
      await api.updateOrcamento(editItem.id, data)
      setEditItem(null)
    } else {
      await api.createOrcamento(data)
    }
    setShowModal(false)
    load()
  }
  const handleDeleteOrcamento = async (id) => {
    if (!confirm('Remover este item do orçamento?')) return
    await api.deleteOrcamento(id)
    load()
  }
  const handleEditOrcamento = (item) => {
    setEditItem(item)
    setShowModal(true)
  }

  const filteredTransactions = transactions.filter(t => filterTipo === 'todas' || t.tipo === filterTipo)
  const filteredOrcamentos   = orcamentos.filter(t => filterTipo === 'todas' || t.tipo === filterTipo)

  if (loading) return <div className="text-tonha-brown/50 p-8">Carregando...</div>

  const isOrcamento = tab === 'orcamento'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-tonha-brown">Financeiro</h1>
        <button onClick={() => { setEditItem(null); setShowModal(true) }} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> {isOrcamento ? 'Novo orçamento' : 'Novo lançamento'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-tonha-sand rounded-xl p-1">
        {[
          { key: 'real',       label: 'Real' },
          { key: 'orcamento',  label: 'Orçamento' },
          { key: 'comparativo', label: 'Comparativo' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-tonha-brown shadow-sm' : 'text-tonha-brown/60 hover:text-tonha-brown'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Aba Real ── */}
      {tab === 'real' && (
        <>
          <SummaryCards
            receitas={summary?.receitas}
            custos={summary?.custos}
            lucro={summary?.lucro}
            reinvestimento={summary?.reinvestimento}
          />
          <Distribuicao
            distribuido={summary?.distribuido}
            socias={summary?.socias ?? {}}
            titulo="Distribuição às sócias"
          />
          <div className="card">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-semibold text-tonha-brown">Lançamentos</h2>
              <FiltroTipo value={filterTipo} onChange={setFilterTipo} />
            </div>
            <ListaItens items={filteredTransactions} onDelete={handleDeleteTransaction} showData />
          </div>
        </>
      )}

      {/* ── Aba Orçamento ── */}
      {tab === 'orcamento' && (
        <>
          <SummaryCards
            receitas={orcSummary?.receitas_orcadas}
            custos={orcSummary?.custos_orcados}
            lucro={orcSummary?.resultado_previsto}
            reinvestimento={orcSummary?.reinvestimento_previsto}
          />
          <Distribuicao
            distribuido={orcSummary?.distribuido_previsto}
            socias={orcSummary?.socias_previsto ?? {}}
            titulo="Previsão de distribuição"
          />
          <div className="card">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-semibold text-tonha-brown">Itens orçados</h2>
              <FiltroTipo value={filterTipo} onChange={setFilterTipo} />
            </div>
            <ListaItens
              items={filteredOrcamentos}
              onDelete={handleDeleteOrcamento}
              onEdit={handleEditOrcamento}
              showData={false}
            />
          </div>
        </>
      )}

      {/* ── Aba Comparativo ── */}
      {tab === 'comparativo' && (
        <Comparativo real={summary} orcamento={orcSummary} />
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          title={isOrcamento ? (editItem ? 'Editar orçamento' : 'Novo orçamento') : 'Novo lançamento'}
          onClose={() => { setShowModal(false); setEditItem(null) }}
        >
          <LancamentoForm
            inicial={editItem ? { ...editItem, showData: false } : { showData: !isOrcamento }}
            onSave={isOrcamento ? handleSaveOrcamento : handleSaveTransaction}
            onClose={() => { setShowModal(false); setEditItem(null) }}
          />
        </Modal>
      )}
    </div>
  )
}

function FiltroTipo({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {['todas', 'receita', 'custo'].map(f => (
        <button key={f} onClick={() => onChange(f)}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            value === f ? 'bg-tonha-terra text-white' : 'bg-tonha-sand text-tonha-brown hover:bg-tonha-terra/20'
          }`}>
          {f === 'todas' ? 'Todas' : f === 'receita' ? 'Receitas' : 'Custos'}
        </button>
      ))}
    </div>
  )
}
