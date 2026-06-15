import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Wallet, Ticket, Beer } from 'lucide-react'

const links = [
  { to: '/',           icon: LayoutDashboard, label: 'Início' },
  { to: '/tarefas',    icon: CheckSquare,     label: 'Tarefas' },
  { to: '/financeiro', icon: Wallet,          label: 'Financeiro' },
  { to: '/ingressos',  icon: Ticket,          label: 'Ingressos' },
  { to: '/bar',        icon: Beer,            label: 'Bar' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-tonha-sand flex md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
              isActive ? 'text-tonha-terra' : 'text-tonha-brown/50'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
