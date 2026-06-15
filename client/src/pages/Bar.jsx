import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Trash2, Edit2, X, Check, TrendingUp, Package } from 'lucide-react'
import { api } from '../api'
import { formatBRL } from '../utils/format'

const CATEGORIAS = ['bebida', 'comida', 'outro']
const CAT_LABEL = { bebida: 'Bebida', comida: 'Comida', outro: 'Outro' }
const CAT_COLOR = { bebida: 'bg-tonha-sky/20 text-tonha-sky', comida: 'bg-tonha-sage/20 text-tonha-sage', outro: 'bg-tonha-sand text-tonha-brown/60' }

function Badge({ cat }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLOR[cat] || CAT_COLOR.outro}`}>
      {CAT_LABEL[cat] || cat}
    </span>
  )
}

/* ── Formulário de item ── */
function ItemForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    nome: initial?.nome || '',
    categoria: initial?.categoria || 'bebida',
    preco: initial?.preco ?? '',
    custo: initial?.custo ?? '',
  })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const valid = form.nome.trim() && form.preco !== '' && parseFloat(form.preco) >= 0

  return (
    <div className="card space-y-3">
      <p className="font-semibold text-tonha-brown text-sm">{initial ? 'Editar item' : 'Novo item'}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Nome</label>
          <input className="input" value={form.nome} onChange={set('nome')} placeholder="ex: Heineken" />
        </div>
        <div>
          <label className="label">Categoria</label>
          <select className="input" value={form.categoria} onChange={set('categoria')}>
            {CATEGORIAS.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Preço de venda (R$)</label>
          <input className="input" type="number" min="0" step="0.5" value={form.preco} onChange={set('preco')} placeholder="0,00" />
        </div>
        <div>
          <label className="label">Custo unitário (R$)</label>
          <input className="input" type="number" min="0" step="0.5" value={form.custo} onChange={set('custo')} placeholder="0,00" />
        </div>
        {form.preco !== '' && form.custo !== '' && parseFloat(form.preco) > 0 && (
          <div className="col-span-2 bg-tonha-sage/10 rounded-xl px-3 py-2 text-sm text-tonha-brown/70">
            Margem: <strong className="text-tonha-brown">
              {Math.round(((parseFloat(form.preco) - parseFloat(form.custo || 0)) / parseFloat(form.preco)) * 100)}%
            </strong>
            {' · '}Lucro por unid.: <strong className="text-tonha-brown">{formatBRL(parseFloat(form.preco) - parseFloat(form.custo || 0))}</strong>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({ ...form, preco: parseFloat(form.preco), custo: parseFloat(form.custo) || 0 })}
          disabled={!valid}
          className="btn-primary flex-1">
          <Check size={15} /> Salvar
        </button>
        <button onClick={onCancel} className="btn-secondary px-4"><X size={15} /></button>
      </div>
    </div>
  )
}

/* ── Aba Cardápio ── */
function TabCardapio({ cardapio, onReload }) {
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)

  const criar = async (data) => {
    await api.createItemCardapio(data)
    setShowForm(false)
    onReload()
  }

  const editar = async (data) => {
    await api.updateItemCardapio(editando.id, data)
    setEditando(null)
    onReload()
  }

  const excluir = async (id) => {
    if (!confirm('Remover item do cardápio?')) return
    await api.deleteItemCardapio(id)
    onReload()
  }

  const toggleAtivo = async (item) => {
    await api.updateItemCardapio(item.id, { ativo: !item.ativo })
    onReload()
  }

  const grupos = CATEGORIAS.map(cat => ({
    cat,
    itens: cardapio.filter(i => i.categoria === cat),
  })).filter(g => g.itens.length > 0)

  return (
    <div className="space-y-4">
      {!showForm && !editando && (
        <button onClick={() => setShowForm(true)} className="btn-primary w-full">
          <Plus size={16} /> Adicionar item
        </button>
      )}
      {showForm && <ItemForm onSave={criar} onCancel={() => setShowForm(false)} />}

      {grupos.map(({ cat, itens }) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-tonha-brown/50 uppercase tracking-wider mb-2">{CAT_LABEL[cat]}</p>
          <div className="space-y-2">
            {itens.map(item => (
              editando?.id === item.id
                ? <ItemForm key={item.id} initial={item} onSave={editar} onCancel={() => setEditando(null)} />
                : (
                  <div key={item.id} className={`card flex items-center gap-3 ${!item.ativo ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-tonha-brown text-sm">{item.nome}</p>
                        <Badge cat={item.categoria} />
                        {!item.ativo && <span className="text-xs text-tonha-brown/40">inativo</span>}
                      </div>
                      <div className="flex gap-4 mt-0.5 text-xs text-tonha-brown/60">
                        <span>Venda: <strong className="text-tonha-brown">{formatBRL(item.preco)}</strong></span>
                        <span>Custo: <strong className="text-tonha-brown">{formatBRL(item.custo)}</strong></span>
                        <span>Margem: <strong className="text-tonha-sage">{item.preco > 0 ? Math.round(((item.preco - item.custo) / item.preco) * 100) : 0}%</strong></span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => toggleAtivo(item)} title={item.ativo ? 'Desativar' : 'Ativar'}
                        className="p-1.5 rounded-lg text-tonha-brown/40 hover:text-tonha-brown hover:bg-tonha-sand transition-colors">
                        {item.ativo ? <X size={14} /> : <Check size={14} />}
                      </button>
                      <button onClick={() => setEditando(item)}
                        className="p-1.5 rounded-lg text-tonha-brown/40 hover:text-tonha-sky hover:bg-tonha-sky/10 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => excluir(item.id)}
                        className="p-1.5 rounded-lg text-tonha-brown/40 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
            ))}
          </div>
        </div>
      ))}

      {cardapio.length === 0 && (
        <div className="text-center py-12 text-tonha-brown/40">
          <Package size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum item no cardápio ainda.</p>
        </div>
      )}
    </div>
  )
}

/* ── Aba Caixa (PDV) ── */
function TabCaixa({ cardapio, onVenda }) {
  const [carrinho, setCarrinho] = useState({})
  const [registrando, setRegistrando] = useState(false)
  const [ok, setOk] = useState(false)
  const [modoCortesia, setModoCortesia] = useState(false)

  const ativos = cardapio.filter(i => i.ativo)
  const grupos = CATEGORIAS.map(cat => ({
    cat,
    itens: ativos.filter(i => i.categoria === cat),
  })).filter(g => g.itens.length > 0)

  const add = (id, delta) => {
    setCarrinho(c => {
      const next = Math.max(0, (c[id] || 0) + delta)
      if (next === 0) { const { [id]: _, ...rest } = c; return rest }
      return { ...c, [id]: next }
    })
  }

  const total = Object.entries(carrinho).reduce((s, [id, qty]) => {
    const item = cardapio.find(i => i.id === id)
    return s + (item ? qty * item.preco : 0)
  }, 0)

  const itensCarrinho = Object.entries(carrinho).filter(([, q]) => q > 0)

  const registrar = async () => {
    if (itensCarrinho.length === 0) return
    setRegistrando(true)
    try {
      await api.registrarVendaBar(
        itensCarrinho.map(([item_id, quantidade]) => ({ item_id, quantidade })),
        modoCortesia,
      )
      setCarrinho({})
      setOk(true)
      setTimeout(() => setOk(false), 2000)
      onVenda()
    } finally {
      setRegistrando(false)
    }
  }

  if (ativos.length === 0) {
    return (
      <div className="text-center py-12 text-tonha-brown/40">
        <ShoppingCart size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">Nenhum item ativo no cardápio.</p>
        <p className="text-xs mt-1">Adicione itens na aba Cardápio.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toggle cortesia */}
      <button
        onClick={() => { setModoCortesia(m => !m); setCarrinho({}) }}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-colors text-sm font-medium ${
          modoCortesia
            ? 'bg-tonha-sky/10 border-tonha-sky text-tonha-sky'
            : 'border-tonha-sand text-tonha-brown/50 hover:border-tonha-brown/30'
        }`}
      >
        <span>{modoCortesia ? 'Modo cortesia ativo' : 'Modo venda'}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${modoCortesia ? 'bg-tonha-sky/20' : 'bg-tonha-sand'}`}>
          {modoCortesia ? 'não contabiliza receita' : 'clique para cortesia'}
        </span>
      </button>

      {grupos.map(({ cat, itens }) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-tonha-brown/50 uppercase tracking-wider mb-2">{CAT_LABEL[cat]}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {itens.map(item => {
              const qty = carrinho[item.id] || 0
              const activeColor = modoCortesia ? 'ring-tonha-sky bg-tonha-sky/5' : 'ring-tonha-terra bg-tonha-terra/5'
              const badgeColor = modoCortesia ? 'bg-tonha-sky' : 'bg-tonha-terra'
              return (
                <button
                  key={item.id}
                  onClick={() => add(item.id, 1)}
                  className={`relative card text-left transition-all active:scale-95 select-none ${qty > 0 ? `ring-2 ${activeColor}` : 'hover:bg-tonha-sand/60'}`}
                >
                  {qty > 0 && (
                    <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${badgeColor} text-white text-xs font-bold flex items-center justify-center shadow`}>
                      {qty}
                    </span>
                  )}
                  <p className="font-semibold text-tonha-brown text-sm leading-tight">{item.nome}</p>
                  <p className="text-tonha-terra font-bold mt-1">{formatBRL(item.preco)}</p>
                  {qty > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); add(item.id, -1) }}
                      className="mt-1 text-xs text-tonha-brown/50 hover:text-red-500"
                    >
                      − remover
                    </button>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Resumo do carrinho */}
      <div className={`card sticky bottom-20 md:bottom-4 border-2 transition-colors ${
        itensCarrinho.length > 0
          ? modoCortesia ? 'border-tonha-sky bg-white' : 'border-tonha-terra bg-white'
          : 'border-tonha-sand'
      }`}>
        {itensCarrinho.length > 0 && (
          <div className="mb-3 space-y-1">
            {itensCarrinho.map(([id, qty]) => {
              const item = cardapio.find(i => i.id === id)
              return item ? (
                <div key={id} className="flex justify-between text-sm text-tonha-brown">
                  <span>{qty}× {item.nome}</span>
                  <span className="font-medium">{modoCortesia ? 'cortesia' : formatBRL(qty * item.preco)}</span>
                </div>
              ) : null
            })}
            <div className="border-t border-tonha-sand pt-2 flex justify-between font-bold text-tonha-brown">
              <span>Total</span>
              <span className={modoCortesia ? 'text-tonha-sky' : 'text-tonha-terra'}>
                {modoCortesia ? 'Cortesia' : formatBRL(total)}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={registrar}
          disabled={itensCarrinho.length === 0 || registrando}
          className={`w-full transition-all btn-primary ${
            ok ? 'bg-green-600 border-green-600' :
            modoCortesia && itensCarrinho.length > 0 ? 'bg-tonha-sky border-tonha-sky' : ''
          }`}
        >
          {ok
            ? <><Check size={16} /> Registrado!</>
            : registrando ? 'Registrando...'
            : itensCarrinho.length === 0 ? 'Selecione os itens'
            : modoCortesia ? `Registrar cortesia`
            : `Registrar venda · ${formatBRL(total)}`}
        </button>
      </div>
    </div>
  )
}

/* ── Aba Relatório ── */
function TabRelatorio({ summary, vendas, onReload }) {
  if (!summary) return <div className="text-center py-12 text-tonha-brown/40 text-sm">Carregando...</div>

  const { porItem, totais } = summary
  const temDados = porItem?.length > 0

  const excluir = async (id) => {
    if (!confirm('Remover este lançamento do estoque?')) return
    await api.deletarVendaBar(id)
    onReload()
  }

  return (
    <div className="space-y-4">
      {/* Totais */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Receita bar', value: formatBRL(totais?.receita || 0), color: 'text-tonha-sage' },
          { label: 'Custo total', value: formatBRL(totais?.custo_total || 0), color: 'text-red-500' },
          { label: 'Lucro bar',   value: formatBRL(totais?.lucro || 0),    color: 'text-tonha-terra' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className="text-xs text-tonha-brown/50 mb-1">{label}</p>
            <p className={`font-bold text-lg ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Por item */}
      {temDados && (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-tonha-sand">
            <p className="font-semibold text-sm text-tonha-brown flex items-center gap-2"><TrendingUp size={15} /> Por item</p>
          </div>
          <div className="divide-y divide-tonha-sand">
            {porItem.map(item => {
              const margem = item.receita > 0 ? Math.round((item.lucro / item.receita) * 100) : 0
              return (
                <div key={item.item_id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm text-tonha-brown">{item.nome_item}</p>
                      <p className="text-xs text-tonha-brown/50 mt-0.5">{item.qtd_total} unid. vendidas</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-tonha-terra">{formatBRL(item.lucro)}</p>
                      <p className="text-xs text-tonha-brown/50">margem {margem}%</p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-tonha-brown/60">
                    <span>Receita: {formatBRL(item.receita)}</span>
                    <span>Custo: {formatBRL(item.custo_total)}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-tonha-sand rounded-full overflow-hidden">
                    <div className="h-full bg-tonha-terra rounded-full" style={{ width: `${Math.max(0, Math.min(100, margem))}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Histórico de lançamentos */}
      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-tonha-sand">
          <p className="font-semibold text-sm text-tonha-brown">Histórico de lançamentos</p>
        </div>
        {vendas.length === 0 ? (
          <p className="text-center py-8 text-sm text-tonha-brown/40">Nenhum lançamento ainda.</p>
        ) : (
          <div className="divide-y divide-tonha-sand">
            {vendas.map(v => (
              <div key={v.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-tonha-brown font-medium">{v.quantidade}× {v.nome_item}</p>
                    {v.cortesia ? <span className="text-xs px-1.5 py-0.5 rounded-full bg-tonha-sky/15 text-tonha-sky font-medium">cortesia</span> : null}
                  </div>
                  <p className="text-xs text-tonha-brown/40">{new Date(v.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} · {v.cortesia ? '–' : formatBRL(v.total)}</p>
                </div>
                <button
                  onClick={() => excluir(v.id)}
                  className="p-1.5 rounded-lg text-tonha-brown/30 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {!temDados && vendas.length === 0 && (
        <div className="text-center py-8 text-tonha-brown/40">
          <TrendingUp size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma venda registrada ainda.</p>
        </div>
      )}
    </div>
  )
}

/* ── Página principal ── */
const TABS = [
  { id: 'caixa',     label: 'Caixa',    icon: ShoppingCart },
  { id: 'cardapio',  label: 'Cardápio', icon: Package },
  { id: 'relatorio', label: 'Relatório', icon: TrendingUp },
]

export default function Bar() {
  const [tab, setTab] = useState('caixa')
  const [cardapio, setCardapio] = useState([])
  const [summary, setSummary] = useState(null)
  const [vendas, setVendas] = useState([])
  const [loading, setLoading] = useState(true)
  const [gerarReceita, setGerarReceita] = useState(false)
  const [toggling, setToggling] = useState(false)

  const loadCardapio = () => api.getCardapio().then(setCardapio)
  const loadSummary = () => api.getBarSummary().then(setSummary)
  const loadVendas = () => api.getVendasBar().then(setVendas)

  const load = () => Promise.all([
    loadCardapio(),
    loadSummary(),
    loadVendas(),
    api.getConfig().then(c => setGerarReceita(c.bar_gerar_receita === '1')),
  ]).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const toggleGerarReceita = async () => {
    setToggling(true)
    const novo = gerarReceita ? '0' : '1'
    await api.updateConfig('bar_gerar_receita', novo)
    setGerarReceita(!gerarReceita)
    setToggling(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-tonha-brown/50">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-tonha-brown">Bar & Comidas</h1>
          <p className="text-tonha-brown/60 text-sm">Registre vendas e acompanhe o lucro por item.</p>
        </div>
        <button
          onClick={toggleGerarReceita}
          disabled={toggling}
          className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            gerarReceita
              ? 'bg-tonha-sage/15 border-tonha-sage text-tonha-sage'
              : 'border-tonha-sand text-tonha-brown/50 hover:border-tonha-brown/30'
          }`}
        >
          <span className={`w-3 h-3 rounded-full border ${gerarReceita ? 'bg-tonha-sage border-tonha-sage' : 'border-tonha-brown/30'}`} />
          {gerarReceita ? 'Gera receita' : 'Só estoque'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-tonha-sand rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id ? 'bg-white text-tonha-terra shadow-sm' : 'text-tonha-brown/60 hover:text-tonha-brown'
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === 'caixa'     && <TabCaixa    cardapio={cardapio} onVenda={() => { loadSummary(); loadVendas() }} />}
      {tab === 'cardapio'  && <TabCardapio cardapio={cardapio} onReload={loadCardapio} />}
      {tab === 'relatorio' && <TabRelatorio summary={summary} vendas={vendas} onReload={() => { loadSummary(); loadVendas() }} />}
    </div>
  )
}
