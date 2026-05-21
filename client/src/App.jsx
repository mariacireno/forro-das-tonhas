import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Tarefas from './pages/Tarefas'
import Financeiro from './pages/Financeiro'
import Ingressos from './pages/Ingressos'
import VendaPublica from './pages/VendaPublica'
import Login from './pages/Login'

export default function App() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('adminPwd'))

  const handleLogin = (pwd) => {
    sessionStorage.setItem('adminPwd', pwd)
    setAuthed(true)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Página pública — sem layout admin */}
        <Route path="/venda" element={<VendaPublica />} />

        {/* Painel admin */}
        <Route path="/*" element={
          !authed
            ? <Login onLogin={handleLogin} />
            : (
              <div className="flex min-h-screen bg-tonha-cream">
                <div className="hidden md:block">
                  <Sidebar />
                </div>
                <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tarefas" element={<Tarefas />} />
                    <Route path="/financeiro" element={<Financeiro />} />
                    <Route path="/ingressos" element={<Ingressos />} />
                  </Routes>
                </main>
                <BottomNav />
              </div>
            )
        } />
      </Routes>
    </BrowserRouter>
  )
}
