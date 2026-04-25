import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Tarefas from './pages/Tarefas'
import Financeiro from './pages/Financeiro'
import Ingressos from './pages/Ingressos'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-tonha-cream">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tarefas" element={<Tarefas />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/ingressos" element={<Ingressos />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
