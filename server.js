const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/tasks/:taskId/checklist', require('./routes/checklist'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/tickets', require('./routes/tickets'));

// Serve o frontend em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Forró das Tonhas rodando na porta ${PORT}`);
});
