import { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Wallet, Ticket, Beer, ChevronDown, Plus, Calendar } from 'lucide-react'
import { api } from '../api'

const links = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tarefas',    icon: CheckSquare,     label: 'Tarefas' },
  { to: '/financeiro', icon: Wallet,          label: 'Financeiro' },
  { to: '/ingressos',  icon: Ticket,          label: 'Ingressos' },
  { to: '/bar',        icon: Beer,            label: 'Bar' },
]

function formatEventoDate(data) {
  if (!data) return ''
  const [year, month, day] = data.split('-')
  return `${day}/${month}/${year}`
}

export default function Sidebar({ eventoId, onEventoChange }) {
  const [eventos, setEventos] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    api.getEventos().then(setEventos).catch(() => {})
  }, [])

  // Fecha dropdown ao clicar fora
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
    <aside className="w-56 min-h-screen bg-white border-r border-tonha-sand flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-tonha-sand">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪗</span>
          <div>
            <p className="font-bold text-tonha-brown leading-tight text-sm">Forró das</p>
            <p className="font-bold text-tonha-terra leading-tight">Tonhas</p>
          </div>
        </div>
      </div>

      {/* Seletor de evento */}
      <div className="px-3 py-3 border-b border-tonha-sand" ref={dropdownRef}>
        <p className="text-xs text-tonha-brown/50 mb-1.5 uppercase tracking-wide px-1">Evento</p>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(v => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-tonha-sand/60 hover:bg-tonha-sand text-left transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Calendar size={14} className="text-tonha-terra shrink-0" />
              <div className="min-w-0">
                {eventoAtual ? (
                  <>
                    <p className="text-xs font-semibold text-tonha-brown truncate leading-tight">{eventoAtual.nome}</p>
                    <p className="text-xs text-tonha-brown/50 leading-tight">{formatEventoDate(eventoAtual.data)}</p>
                  </>
                ) : (
                  <p className="text-xs text-tonha-brown/50">Selecione um evento</p>
                )}
              </div>
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
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-tonha-sand/60 transition-colors ${evt.id === eventoId ? 'bg-tonha-terra/10' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-tonha-brown truncate">{evt.nome}</p>
                    <p className="text-xs text-tonha-brown/50">{formatEventoDate(evt.data)}</p>
                  </div>
                  {evt.id === eventoId && <div className="w-1.5 h-1.5 rounded-full bg-tonha-terra shrink-0" />}
                </button>
              ))}
              <div className="border-t border-tonha-sand">
                <button
                  onClick={handleCreateEvento}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-tonha-sand/60 transition-colors text-tonha-terra"
                >
                  <Plus size={13} />
                  <span className="text-xs font-medium">Novo evento</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-tonha-terra/15 text-tonha-terra'
                  : 'text-tonha-brown/70 hover:bg-tonha-sand hover:text-tonha-brown'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sócias */}
      <div className="px-4 py-4 border-t border-tonha-sand">
        <p className="text-xs text-tonha-brown/50 mb-2 uppercase tracking-wide">Organizadoras</p>
        {[
          { name: 'Renata',   pct: '33%', color: 'bg-tonha-terra' },
          { name: 'Maria',    pct: '33%', color: 'bg-tonha-sky' },
          { name: 'Catarina', pct: '33%', color: 'bg-tonha-sage' },
        ].map(({ name, pct, color }) => (
          <div key={name} className="flex items-center gap-2 py-1">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-tonha-brown/80">{name}</span>
            <span className="text-xs text-tonha-brown/40 ml-auto">{pct}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
