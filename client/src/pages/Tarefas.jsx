import { useEffect, useState } from 'react'
import { Plus, Trash2, AlertTriangle, Filter } from 'lucide-react'
import { api } from '../api'
import Modal from '../components/Modal'
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
        <textarea className="input min-h-[70px] resize-none" value={form.observacoes || ''} onChange={e => set('observacoes', e.target.value)} placeholder="Detalhes, contatos, links..." />
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

export default function Tarefas() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterStatus, setFilterStatus] = useState('todas')
  const [filterCat, setFilterCat] = useState('todas')
  const [filterResp, setFilterResp] = useState('todas')

  const load = () => api.getTasks().then(setTasks).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleSave = async (data) => {
    if (editing) {
      await api.updateTask(editing.id, data)
    } else {
      await api.createTask(data)
    }
    setShowModal(false)
    setEditing(null)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Remover esta tarefa?')) return
    await api.deleteTask(id)
    load()
  }

  const handleToggle = async (task) => {
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

  const openEdit = (task) => { setEditing(task); setShowModal(true) }
  const openNew = () => { setEditing(null); setShowModal(true) }

  if (loading) return <div className="text-tonha-brown/50 p-8">Carregando...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-tonha-brown">Tarefas</h1>
          <p className="text-sm text-tonha-brown/60">
            {tasks.filter(t => t.status === 'concluida').length}/{tasks.length} concluídas
          </p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> Nova tarefa
        </button>
      </div>

      {/* Filtros */}
      <div className="card py-3 flex flex-wrap gap-3 items-center">
        <Filter size={14} className="text-tonha-brown/40" />
        <select className="select w-auto text-xs py-1.5" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="todas">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluida">Concluída</option>
        </select>
        <select className="select w-auto text-xs py-1.5" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="todas">Todas as categorias</option>
          {CATEGORIAS_TAREFA.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="select w-auto text-xs py-1.5" value={filterResp} onChange={e => setFilterResp(e.target.value)}>
          <option value="todas">Todas as responsáveis</option>
          {SOCIAS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-tonha-brown/50 ml-auto">{filtered.length} tarefa{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-tonha-brown/50">
          <p>Nenhuma tarefa encontrada.</p>
          <button onClick={openNew} className="mt-3 text-tonha-terra text-sm hover:underline">Criar uma agora</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => {
            const dias = task.prazo ? daysUntil(task.prazo) : null
            return (
              <div
                key={task.id}
                className={`card cursor-pointer hover:shadow-md transition-shadow ${task.status === 'concluida' ? 'opacity-60' : ''}`}
                onClick={() => openEdit(task)}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={e => { e.stopPropagation(); handleToggle(task) }}
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
                    </div>
                    {task.observacoes && (
                      <p className="text-xs text-tonha-brown/50 mt-1 truncate">{task.observacoes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(task.id) }}
                      className="text-tonha-brown/30 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? 'Editar tarefa' : 'Nova tarefa'}
          onClose={() => { setShowModal(false); setEditing(null) }}
        >
          <TaskForm initial={editing || {}} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null) }} />
        </Modal>
      )}
    </div>
  )
}
