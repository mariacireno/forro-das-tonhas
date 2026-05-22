const BASE = '/api'

async function req(path, options = {}) {
  const pwd = sessionStorage.getItem('adminPwd') || ''
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-admin-password': pwd },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Erro na requisição')
  }
  return res.json()
}

export const api = {
  // Tasks
  getTasks: () => req('/tasks'),
  createTask: (data) => req('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => req(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id) => req(`/tasks/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: () => req('/transactions'),
  createTransaction: (data) => req('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  deleteTransaction: (id) => req(`/transactions/${id}`, { method: 'DELETE' }),
  getFinancialSummary: () => req('/transactions/summary'),

  // Tickets
  getTickets: () => req('/tickets'),
  createTicket: (data) => req('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  deleteTicket: (id) => req(`/tickets/${id}`, { method: 'DELETE' }),
  getTicketSummary: () => req('/tickets/summary'),

  // Orçamentos
  getOrcamentos: () => req('/orcamentos'),
  createOrcamento: (data) => req('/orcamentos', { method: 'POST', body: JSON.stringify(data) }),
  updateOrcamento: (id, data) => req(`/orcamentos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrcamento: (id) => req(`/orcamentos/${id}`, { method: 'DELETE' }),
  getOrcamentoSummary: () => req('/orcamentos/summary'),

  // Checklist
  getChecklist: (taskId) => req(`/tasks/${taskId}/checklist`),
  createChecklistItem: (taskId, data) => req(`/tasks/${taskId}/checklist`, { method: 'POST', body: JSON.stringify(data) }),
  updateChecklistItem: (taskId, itemId, data) => req(`/tasks/${taskId}/checklist/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteChecklistItem: (taskId, itemId) => req(`/tasks/${taskId}/checklist/${itemId}`, { method: 'DELETE' }),

  // Config
  getConfig: () => req('/config'),
  updateConfig: (chave, valor) => req('/config', { method: 'PUT', body: JSON.stringify({ chave, valor }) }),

  // Vendas online
  getVendas: () => req('/tickets/vendas'),
  createVenda: (data) => req('/tickets/venda', { method: 'POST', body: JSON.stringify(data) }),
  confirmarVenda: (id) => req(`/tickets/vendas/${id}/confirmar`, { method: 'PATCH' }),
  deleteVenda: (id) => req(`/tickets/vendas/${id}`, { method: 'DELETE' }),
  checkInVenda: (id) => req(`/tickets/vendas/${id}/checkin`, { method: 'PATCH' }),
  getCheckins: () => req('/tickets/checkins'),
  toggleCheckin: (id) => req(`/tickets/checkins/${id}/toggle`, { method: 'PATCH' }),

  // Transactions
  updateTransaction: (id, data) => req(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}
