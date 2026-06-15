import { useState, useEffect, useRef } from 'react'
import { Calendar, ChevronDown, Plus } from 'lucide-react'
import { api } from '../api'

function formatEventoDate(data) {
  if (!data) return ''
  const [year, month, day] = data.split('-')
  return `${day}/${month}/${year}`
}

export default function MobileEventBar({ eventoId, onEventoChange }) {
  const [eventos, setEventos] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    api.getEventos().then(setEventos).catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const eventoAtual = eventos.find(e => e.id === eventoId)

  const handleCreateEvento = async () => {
    const nome = prompt('Nome do evento:')
    if (!nome) return
    const data = prompt('Data do evento (AAAA-MM-DD):')
    if (!data) return
    try {
      const novo = await api.createEvento({ nome, data })
      setEventos(prev => [...prev, novo].sort((a, b) => a.data.localeCompare(b.data)))
      onEventoChange(novo.id)
      setShowDropdown(false)
    } catch (err) {
      alert('Erro ao criar evento: ' + err.message)
    }
  }

  return (
    <div className="md:hidden sticky top-0 z-30 bg-white border-b border-tonha-sand px-3 py-2" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(v => !v)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-tonha-sand/60 hover:bg-tonha-sand text-left transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Calendar size={14} className="text-tonha-terra shrink-0" />
            {eventoAtual ? (
              <span className="text-sm font-semibold text-tonha-brown truncate">
                {eventoAtual.nome}
                <span className="font-normal text-tonha-brown/50 ml-1.5">{formatEventoDate(eventoAtual.data)}</span>
              </span>
            ) : (
              <span className="text-sm text-tonha-brown/50">Selecione um evento</span>
            )}
          </div>
          <ChevronDown size={14} className={`text-tonha-brown/50 shrink-0 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-tonha-sand rounded-xl shadow-lg z-50 overflow-hidden">
            {eventos.length === 0 && (
              <p className="text-xs text-tonha-brown/50 px-3 py-2">Nenhum evento encontrado</p>
            )}
            {eventos.map(evt => (
              <button
                key={evt.id}
                onClick={() => { onEventoChange(evt.id); setShowDropdown(false) }}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-tonha-sand/60 transition-colors ${evt.id === eventoId ? 'bg-tonha-terra/10' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tonha-brown truncate">{evt.nome}</p>
                  <p className="text-xs text-tonha-brown/50">{formatEventoDate(evt.data)}</p>
                </div>
                {evt.id === eventoId && <div className="w-1.5 h-1.5 rounded-full bg-tonha-terra shrink-0" />}
              </button>
            ))}
            <div className="border-t border-tonha-sand">
              <button
                onClick={handleCreateEvento}
                className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-tonha-sand/60 transition-colors text-tonha-terra"
              >
                <Plus size={13} />
                <span className="text-sm font-medium">Novo evento</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
