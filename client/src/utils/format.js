export function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

export const CATEGORIAS_TAREFA = [
  { value: 'estrutura',    label: 'Estrutura' },
  { value: 'bar',         label: 'Bar & Alimentação' },
  { value: 'musica',      label: 'Música' },
  { value: 'seguranca',   label: 'Segurança' },
  { value: 'ingressos',   label: 'Ingressos' },
  { value: 'divulgacao',  label: 'Divulgação' },
  { value: 'geral',       label: 'Geral' },
]

export const CATEGORIAS_CUSTO = [
  { value: 'estrutura',   label: 'Estrutura' },
  { value: 'bar',         label: 'Bar & Bebidas' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'musica',      label: 'Música / Banda' },
  { value: 'pessoal',     label: 'Pessoal / Equipe' },
  { value: 'seguranca',   label: 'Segurança' },
  { value: 'divulgacao',  label: 'Divulgação' },
  { value: 'outros',      label: 'Outros' },
]

export const STATUS_COLORS = {
  pendente:     'bg-tonha-sand text-tonha-brown',
  em_andamento: 'bg-tonha-sky/40 text-tonha-darksky',
  concluida:    'bg-tonha-sage/40 text-green-700',
}

export const STATUS_LABELS = {
  pendente:     'Pendente',
  em_andamento: 'Em andamento',
  concluida:    'Concluída',
}

export const SOCIAS = ['Renata', 'Maria', 'Catarina']
