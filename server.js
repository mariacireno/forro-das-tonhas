const express = require('express');
const cors = require('cors');
const path = require('path');
const { runSeed } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/tasks/:taskId/checklist', require('./routes/checklist'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/orcamentos', require('./routes/orcamentos'));
app.use('/api/config', require('./routes/config'));

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
