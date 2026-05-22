const express = require('express');
const cors = require('cors');
const path = require('path');
const { runSeed } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
app.use((req, res, next) => {
  if (!ADMIN_PASSWORD) return next()
  if (!req.originalUrl.startsWith('/api/')) return next()
  // Rotas públicas (página de venda)
  if (req.method === 'GET' && req.originalUrl.startsWith('/api/config')) return next()
  if (req.method === 'POST' && req.originalUrl === '/api/tickets/venda') return next()
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Não autorizado' })
  }
  next()
})

app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/tasks/:taskId/checklist', require('./routes/checklist'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/orcamentos', require('./routes/orcamentos'));
app.use('/api/config', require('./routes/config'));
app.use('/api/admin', require('./routes/admin'));

// Serve o frontend em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Forró das Tonhas rodando na porta ${PORT}`);
  try {
    runSeed();
  } catch (err) {
    console.error('Seed falhou (não crítico):', err.message);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Erro não capturado:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Promise rejeitada:', reason);
});
