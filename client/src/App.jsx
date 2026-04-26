import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Tarefas from './pages/Tarefas'
import Financeiro from './pages/Financeiro'
import Ingressos from './pages/Ingressos'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-tonha-cream">
        {/* Sidebar só aparece em telas médias pra cima */}
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

        {/* Bottom nav só aparece no mobile */}
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
