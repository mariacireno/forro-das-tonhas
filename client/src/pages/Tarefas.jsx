import { useEffect, useState } from 'react'
import { Plus, Trash2, AlertTriangle, Filter, CheckCircle2 } from 'lucide-react'
import { api } from '../api'
import Modal from '../components/Modal'
import Checklist from '../components/Checklist'
import {
  formatDate, daysUntil, CATEGORIAS_TAREFA, STATUS_COLORS, STATUS_LABELS, SOCIAS
} from '../utils/format'

const CAT_COLORS = {
  estrutura:   'bg-tonha-terra/20 text-tonha-darkterra',
  bar:         'bg-tonha-amber/40 text-amber-800',
  musica:      'bg-purple-100 text-purple-700',
  seguranca:   'bg-tonha-sky/30 text-tonha-darksky',
  ingressos:   'bg-tonha-sage/40 text-green-700',
  divulgacao:  'bg-pink-100 text-pink-700',
  geral:       'bg-tonha-sand text-tonha-brown',
}

function TaskForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    titulo: '', categoria: 'geral', responsavel: '', prazo: '',
    status: 'pendente', urgente: false, observacoes: '',
    ...initial,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) return
    onSave({
      ...form,
      responsavel: form.responsavel || null,
      prazo: form.prazo || null,
      observacoes: form.observacoes || null,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Título *</label>
        <input className="input" value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ex: Contratar toldo" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Categoria</label>
          <select className="select" value={form.categoria} onChange={e => set('categoria', e.target.value)}>
            {CATEGORIAS_TAREFA.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Responsável</label>
          <select className="select" value={form.responsavel || ''} onChange={e => set('responsavel', e.target.value)}>
            <option value="">Sem responsável</option>
            {SOCIAS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Prazo</label>
          <input type="date" className="input" value={form.prazo || ''} onChange={e => set('prazo', e.target.value)} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em andamento</option>
            <option value="concluida">Concluída</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Observações</label>
        <textarea className="input min-h-[60px] resize-none" value={form.observacoes || ''} onChange={e => set('observacoes', e.target.value)} placeholder="Detalhes, contatos, links..." />
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" className="rounded" checked={form.urgente} onChange={e => set('urgente', e.target.checked)} />
        <span className="text-sm text-tonha-brown">Marcar como urgente</span>
      </label>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1">Salvar</button>
        <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  )
}

function TaskModal({ task, onClose, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(false)

  const handleSave = async (data) => {
    await api.updateTask(task.id, data)
    setEditing(false)
    onSaved()
  }

  const handleDelete = async () => {
    if (!confirm('Remover esta tarefa?')) return
    await api.deleteTask(task.id)
    onDeleted()
  }

  return (
    <Modal title={editing ? 'Editar tarefa' : task.titulo} onClose={onClose}>
      {editing ? (
        <TaskForm initial={task} onSave={handleSave} onClose={() => setEditing(false)} />
      ) : (
        <div className="space-y-5">
          {/* Info da tarefa */}
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${CAT_COLORS[task.categoria] || CAT_COLORS.geral}`}>
              {CATEGORIAS_TAREFA.find(c => c.value === task.categoria)?.label || task.categoria}
            </span>
            <span className={`badge ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span>
            {task.urgente === 1 && (
              <span className="badge bg-tonha-terra/20 text-tonha-darkterra flex items-center gap-1">
                <AlertTriangle size={11} /> Urgente
              </span>
            )}
          </div>

          {(task.responsavel || task.prazo) && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {task.responsavel && (
                <div>
                  <p className="text-xs text-tonha-brown/50 mb-0.5">Responsável</p>
                  <p className="font-medium text-tonha-brown">{task.responsavel}</p>
                </div>
              )}
              {task.prazo && (
                <div>
                  <p className="text-xs text-tonha-brown/50 mb-0.5">Prazo</p>
                  <p className="font-medium text-tonha-brown">{formatDate(task.prazo)}</p>
                </div>
              )}
            </div>
          )}

          {task.observacoes && (
            <div>
              <p className="text-xs text-tonha-brown/50 mb-1">Observações</p>
              <p className="text-sm text-tonha-brown bg-tonha-cream rounded-xl px-3 py-2">{task.observacoes}</p>
            </div>
          )}

          {/* Checklist */}
          <div>
            <p className="text-xs text-tonha-brown/50 mb-2 uppercase tracking-wide">Checklist</p>
            <Checklist taskId={task.id} />
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-1 border-t border-tonha-sand">
            <button onClick={() => setEditing(true)} className="btn-secondary flex-1">Editar</button>
            <button onClick={handleDelete} className="btn-ghost text-red-400 hover:text-red-500">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default function Tarefas() {
  const [tasks, setTasks] = useState([])
  const [checklistCounts, setChecklistCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('todas')
  const [filterCat, setFilterCat] = useState('todas')
  const [filterResp, setFilterResp] = useState('todas')

  const load = async () => {
    const t = await api.getTasks()
    setTasks(t)
    // Busca contagem de checklist para todas as tarefas
    const counts = {}
    await Promise.all(t.map(async task => {
      const items = await api.getChecklist(task.id)
      counts[task.id] = { total: items.length, done: items.filter(i => i.concluido).length }
    }))
    setChecklistCounts(counts)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleCreate = async (data) => {
    await api.createTask(data)
    setShowNew(false)
    load()
  }

  const handleToggle = async (task, e) => {
    e.stopPropagation()
    const next = task.status === 'concluida' ? 'pendente' : 'concluida'
    await api.updateTask(task.id, { status: next })
    load()
  }

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'todas' && t.status !== filterStatus) return false
    if (filterCat !== 'todas' && t.categoria !== filterCat) return false
    if (filterResp !== 'todas' && t.responsavel !== filterResp) return false
    return true
  })

  if (loading) return <div className="text-tonha-brown/50 p-8">Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-tonha-brown">Tarefas</h1>
          <p className="text-sm text-tonha-brown/60">
            {tasks.filter(t => t.status === 'concluida').length}/{tasks.length} concluídas
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> Nova tarefa
        </button>
      </div>

      {/* Filtros */}
      <div className="card py-3 flex flex-wrap gap-2 items-center">
        <Filter size={14} className="text-tonha-brown/40 hidden sm:block" />
        <select className="select w-auto text-xs py-1.5" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="todas">Todos status</option>
          <option value="pendente">Pendente</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluida">Concluída</option>
        </select>
        <select className="select w-auto text-xs py-1.5" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="todas">Todas categorias</option>
          {CATEGORIAS_TAREFA.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="select w-auto text-xs py-1.5" value={filterResp} onChange={e => setFilterResp(e.target.value)}>
          <option value="todas">Todas</option>
          {SOCIAS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-tonha-brown/50 ml-auto">{filtered.length} tarefa{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-tonha-brown/50">
          <p>Nenhuma tarefa encontrada.</p>
          <button onClick={() => setShowNew(true)} className="mt-3 text-tonha-terra text-sm hover:underline">Criar uma agora</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => {
            const dias = task.prazo ? daysUntil(task.prazo) : null
            const cl = checklistCounts[task.id]
            return (
              <div
                key={task.id}
                className={`card cursor-pointer hover:shadow-md transition-shadow ${task.status === 'concluida' ? 'opacity-60' : ''}`}
                onClick={() => setSelected(task)}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={e => handleToggle(task, e)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                      task.status === 'concluida'
                        ? 'bg-tonha-sage border-tonha-sage'
                        : 'border-tonha-sand hover:border-tonha-sage'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium text-tonha-brown ${task.status === 'concluida' ? 'line-through' : ''}`}>
                        {task.titulo}
                      </p>
                      {task.urgente === 1 && task.status !== 'concluida' && (
                        <AlertTriangle size={13} className="text-tonha-terra flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex gap-2 mt-1.5 flex-wrap items-center">
                      <span className={`badge ${CAT_COLORS[task.categoria] || CAT_COLORS.geral}`}>
                        {CATEGORIAS_TAREFA.find(c => c.value === task.categoria)?.label || task.categoria}
                      </span>
                      {task.responsavel && (
                        <span className="text-xs text-tonha-brown/60">{task.responsavel}</span>
                      )}
                      {dias !== null && (
                        <span className={`text-xs font-medium ${dias < 0 ? 'text-red-500' : dias <= 3 ? 'text-tonha-terra' : 'text-tonha-brown/50'}`}>
                          {dias < 0 ? `${Math.abs(dias)}d atraso` : dias === 0 ? 'hoje' : `${dias}d`}
                        </span>
                      )}
                      {cl && cl.total > 0 && (
                        <span className="flex items-center gap-1 text-xs text-tonha-brown/50">
                          <CheckCircle2 size={12} className={cl.done === cl.total ? 'text-tonha-sage' : ''} />
                          {cl.done}/{cl.total}
                        </span>
                      )}
                    </div>
                    {/* Mini barra de progresso do checklist */}
                    {cl && cl.total > 0 && (
                      <div className="mt-2 w-full bg-tonha-sand rounded-full h-1">
                        <div
                          className="bg-tonha-sage h-1 rounded-full transition-all"
                          style={{ width: `${(cl.done / cl.total) * 100}%` }}
                        />
                      </div>
                    )}
                    {task.observacoes && (
                      <p className="text-xs text-tonha-brown/50 mt-1 truncate">{task.observacoes}</p>
                    )}
                  </div>
                  <span className={`badge ${STATUS_COLORS[task.status]} flex-shrink-0 hidden sm:inline-flex`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showNew && (
        <Modal title="Nova tarefa" onClose={() => setShowNew(false)}>
          <TaskForm onSave={handleCreate} onClose={() => setShowNew(false)} />
        </Modal>
      )}

      {selected && (
        <TaskModal
          task={selected}
          onClose={() => setSelected(null)}
          onSaved={() => { load(); setSelected(null) }}
          onDeleted={() => { load(); setSelected(null) }}
        />
      )}
    </div>
  )
}
