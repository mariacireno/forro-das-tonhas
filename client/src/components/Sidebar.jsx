import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Wallet, Ticket } from 'lucide-react'

const links = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tarefas',    icon: CheckSquare,     label: 'Tarefas' },
  { to: '/financeiro', icon: Wallet,          label: 'Financeiro' },
  { to: '/ingressos',  icon: Ticket,          label: 'Ingressos' },
]

export default function Sidebar() {
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
        <p className="text-xs text-tonha-brown/60 mt-2">13 de junho · 16h–22h</p>
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
