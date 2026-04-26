import { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { api } from '../api'

export default function Checklist({ taskId }) {
  const [items, setItems] = useState([])
  const [novoTexto, setNovoTexto] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => api.getChecklist(taskId).then(setItems).finally(() => setLoading(false))
  useEffect(() => { load() }, [taskId])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!novoTexto.trim()) return
    await api.createChecklistItem(taskId, { texto: novoTexto.trim() })
    setNovoTexto('')
    load()
  }

  const handleToggle = async (item) => {
    await api.updateChecklistItem(taskId, item.id, { concluido: !item.concluido })
    load()
  }

  const handleDelete = async (itemId) => {
    await api.deleteChecklistItem(taskId, itemId)
    load()
  }

  const concluidos = items.filter(i => i.concluido).length

  if (loading) return <div className="text-xs text-tonha-brown/40 py-2">Carregando checklist...</div>

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-tonha-brown/60">{concluidos}/{items.length} concluídos</span>
          </div>
          {/* Barra de progresso */}
          <div className="w-full bg-tonha-sand rounded-full h-1.5">
            <div
              className="bg-tonha-sage h-1.5 rounded-full transition-all"
              style={{ width: items.length ? `${(concluidos / items.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.id} className="flex items-center gap-2 group">
            <button onClick={() => handleToggle(item)} className="flex-shrink-0 text-tonha-brown/40 hover:text-tonha-sage transition-colors">
              {item.concluido
                ? <CheckCircle2 size={16} className="text-tonha-sage" />
                : <Circle size={16} />
              }
            </button>
            <span className={`flex-1 text-sm ${item.concluido ? 'line-through text-tonha-brown/40' : 'text-tonha-brown'}`}>
              {item.texto}
            </span>
            <button
              onClick={() => handleDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 text-tonha-brown/30 hover:text-red-400 transition-all"
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2 pt-1">
        <input
          className="input text-sm py-1.5 flex-1"
          value={novoTexto}
          onChange={e => setNovoTexto(e.target.value)}
          placeholder="Adicionar item..."
        />
        <button type="submit" className="btn-secondary px-3 py-1.5 flex items-center gap-1">
          <Plus size={14} />
        </button>
      </form>
    </div>
  )
}
