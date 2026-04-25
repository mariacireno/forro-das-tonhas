const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'forro.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    categoria TEXT DEFAULT 'geral',
    responsavel TEXT,
    prazo TEXT,
    status TEXT DEFAULT 'pendente',
    urgente INTEGER DEFAULT 0,
    observacoes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    categoria TEXT DEFAULT 'outros',
    valor REAL NOT NULL,
    descricao TEXT,
    data TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    valor_unitario REAL NOT NULL,
    canal TEXT DEFAULT 'portaria',
    data TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
