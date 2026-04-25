import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Wallet, Ticket, AlertTriangle, CloudRain, Calendar, ArrowRight } from 'lucide-react'
import { api } from '../api'
import StatCard from '../components/StatCard'
import { formatBRL, formatDate, daysUntil, STATUS_COLORS, STATUS_LABELS } from '../utils/format'

const EVENT_DATE = '2026-06-13'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [summary, setSummary] = useState(null)
  const [ticketSummary, setTicketSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getTasks(),
      api.getFinancialSummary(),
      api.getTicketSummary(),
    ]).then(([t, s, ts]) => {
      setTasks(t)
      setSummary(s)
      setTicketSummary(ts)
      setLoading(false)
    })
  }, [])

  const diasRestantes = daysUntil(EVENT_DATE)
  const concluidas = tasks.filter(t => t.status === 'concluida').length
  const urgentes = tasks.filter(t => t.urgente && t.status !== 'concluida')
  const proximas = tasks
    .filter(t => t.prazo && t.status !== 'concluida')
    .sort((a, b) => a.prazo.localeCompare(b.prazo))
    .slice(0, 4)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-tonha-brown/50">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header do evento */}
      <div className="card bg-gradient-to-r from-tonha-terra/20 to-tonha-amber/20 border-tonha-terra/20">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-tonha-brown">Forró das Tonhas 🪗</h1>
            <p className="text-tonha-brown/70 mt-1">13 de junho de 2026 · 16h às 22h</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white rounded-xl px-4 py-2 text-center shadow-sm border border-tonha-sand">
              <p className="text-2xl font-bold text-tonha-terra">{diasRestantes}</p>
              <p className="text-xs text-tonha-brown/60">dias restantes</p>
            </div>
            <div className="bg-tonha-sky/20 rounded-xl px-4 py-2 text-center border border-tonha-sky/30">
              <div className="flex items-center gap-1 justify-center">
                <CloudRain size={14} className="text-tonha-darksky" />
                <p className="text-xs font-medium text-tonha-darksky">Toldo obrigatório</p>
              </div>
              <p className="text-xs text-tonha-brown/50 mt-0.5">época de chuva</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tarefas concluídas"
          value={`${concluidas}/${tasks.length}`}
          sub={`${tasks.length - concluidas} pendentes`}
          color="bg-tonha-sage/40"
          icon={<CheckSquare size={20} className="text-green-700" />}
        />
        <StatCard
          label="Receitas"
          value={formatBRL(summary?.receitas)}
          sub="acumulado"
          color="bg-tonha-amber/40"
          icon={<Wallet size={20} className="text-amber-700" />}
        />
        <StatCard
          label="Custos"
          value={formatBRL(summary?.custos)}
          sub="acumulado"
          color="bg-tonha-terra/20"
          icon={<Wallet size={20} className="text-tonha-darkterra" />}
        />
        <StatCard
          label="Ingressos vendidos"
          value={ticketSummary?.qty ?? 0}
          sub={formatBRL(ticketSummary?.receita)}
          color="bg-tonha-sky/30"
          icon={<Ticket size={20} className="text-tonha-darksky" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgentes */}
        {urgentes.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-tonha-terra" />
              <h2 className="font-semibold text-tonha-brown">Tarefas urgentes</h2>
            </div>
            <ul className="space-y-2">
              {urgentes.map(t => (
                <li key={t.id} className="flex items-start gap-3 p-3 bg-tonha-terra/5 rounded-xl border border-tonha-terra/15">
                  <span className="w-2 h-2 rounded-full bg-tonha-terra mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-tonha-brown truncate">{t.titulo}</p>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      {t.responsavel && (
                        <span className="text-xs text-tonha-brown/50">{t.responsavel}</span>
                      )}
                      {t.prazo && (
                        <span className="text-xs text-tonha-terra">{formatDate(t.prazo)}</span>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span>
                </li>
              ))}
            </ul>
            <Link to="/tarefas" className="flex items-center gap-1 text-xs text-tonha-terra mt-3 hover:underline">
              Ver todas as tarefas <ArrowRight size={12} />
            </Link>
          </div>
        )}

        {/* Próximas por prazo */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-tonha-darksky" />
            <h2 className="font-semibold text-tonha-brown">Próximos prazos</h2>
          </div>
          {proximas.length === 0 ? (
            <p className="text-sm text-tonha-brown/50">Nenhuma tarefa com prazo definido.</p>
          ) : (
            <ul className="space-y-2">
              {proximas.map(t => {
                const dias = daysUntil(t.prazo)
                return (
                  <li key={t.id} className="flex items-center gap-3 py-2 border-b border-tonha-sand last:border-0">
                    <div className={`text-center w-10 flex-shrink-0 rounded-lg px-1 py-0.5 ${dias <= 3 ? 'bg-tonha-terra/20 text-tonha-darkterra' : 'bg-tonha-sky/20 text-tonha-darksky'}`}>
                      <p className="text-sm font-bold leading-none">{dias}</p>
                      <p className="text-[9px] leading-tight">dias</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-tonha-brown truncate">{t.titulo}</p>
                      <p className="text-xs text-tonha-brown/50">{formatDate(t.prazo)}</p>
                    </div>
                    <span className={`badge ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Divisão de lucro */}
        {summary && summary.lucro > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} className="text-amber-600" />
              <h2 className="font-semibold text-tonha-brown">Divisão do lucro</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-tonha-amber/20 rounded-xl">
                <span className="text-sm font-medium text-tonha-brown">Reinvestimento</span>
                <span className="font-bold text-tonha-brown">{formatBRL(summary.reinvestimento)}</span>
              </div>
              {Object.entries(summary.socias).map(([nome, val]) => (
                <div key={nome} className="flex justify-between items-center py-2 border-b border-tonha-sand last:border-0">
                  <span className="text-sm text-tonha-brown">{nome}</span>
                  <span className="font-semibold text-tonha-brown">{formatBRL(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
