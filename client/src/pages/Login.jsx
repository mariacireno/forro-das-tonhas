import { useState } from 'react'

export default function Login({ onLogin }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!senha) return
    setCarregando(true)
    setErro('')
    try {
      const res = await fetch('/api/tasks', {
        headers: { 'x-admin-password': senha },
      })
      if (res.status === 401) {
        setErro('Senha incorreta')
      } else {
        onLogin(senha)
      }
    } catch {
      setErro('Erro de conexão')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-tonha-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🪗</span>
          <h1 className="text-2xl font-bold text-tonha-brown mt-3">Forró das Tonhas</h1>
          <p className="text-tonha-brown/50 text-sm mt-1">Painel de organização</p>
        </div>
        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Senha de acesso</label>
              <input
                className="input"
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                autoFocus
              />
            </div>
            {erro && (
              <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl py-2 px-3">{erro}</p>
            )}
            <button
              type="submit"
              disabled={carregando || !senha}
              className="btn-primary w-full disabled:opacity-50"
            >
              {carregando ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
