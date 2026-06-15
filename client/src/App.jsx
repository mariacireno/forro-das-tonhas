import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import MobileEventBar from './components/MobileEventBar'
import Dashboard from './pages/Dashboard'
import Tarefas from './pages/Tarefas'
import Financeiro from './pages/Financeiro'
import Ingressos from './pages/Ingressos'
import Bar from './pages/Bar'
import VendaPublica from './pages/VendaPublica'
import Login from './pages/Login'
import { setEventoId } from './api'

export default function App() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('adminPwd'))
  const [eventoId, setEventoIdState] = useState(() => localStorage.getItem('eventoId') || '')

  const handleLogin = (pwd) => {
    sessionStorage.setItem('adminPwd', pwd)
    setAuthed(true)
  }

  const handleEventoChange = (id) => {
    setEventoId(id)
    setEventoIdState(id)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Página pública — sem layout admin */}
        <Route path="/venda/:eventoId" element={<VendaPublica />} />

        {/* Painel admin */}
        <Route path="/*" element={
          !authed
            ? <Login onLogin={handleLogin} />
            : (
              <div className="flex min-h-screen bg-tonha-cream">
                <div className="hidden md:block">
                  <Sidebar eventoId={eventoId} onEventoChange={handleEventoChange} />
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                <MobileEventBar eventoId={eventoId} onEventoChange={handleEventoChange} />
                <main key={eventoId} className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tarefas" element={<Tarefas />} />
                    <Route path="/financeiro" element={<Financeiro />} />
                    <Route path="/ingressos" element={<Ingressos />} />
                    <Route path="/bar" element={<Bar />} />
                  </Routes>
                </main>
                </div>
                <BottomNav />
              </div>
            )
        } />
      </Routes>
    </BrowserRouter>
  )
}
