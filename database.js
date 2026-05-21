const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = process.env.DB_PATH || __dirname;
fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'forro.db'));

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

  CREATE TABLE IF NOT EXISTS orcamentos (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    categoria TEXT DEFAULT 'outros',
    valor REAL NOT NULL,
    descricao TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ticket_vendas (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    tipo TEXT DEFAULT 'inteira',
    quantidade INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS checklist_items (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    texto TEXT NOT NULL,
    concluido INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS config (
    chave TEXT PRIMARY KEY,
    valor TEXT
  );
`);

// Migração: adiciona pago_por em transactions para rastrear quem pagou cada despesa
try { db.exec("ALTER TABLE transactions ADD COLUMN pago_por TEXT") } catch (_) {}

// Migração: adiciona colunas novas em ticket_vendas caso não existam
try { db.exec("ALTER TABLE ticket_vendas ADD COLUMN valor_unitario REAL DEFAULT 0") } catch (_) {}
try { db.exec("ALTER TABLE ticket_vendas ADD COLUMN valor_total REAL DEFAULT 0") } catch (_) {}
try { db.exec("ALTER TABLE ticket_vendas ADD COLUMN status TEXT DEFAULT 'pendente'") } catch (_) {}
try { db.exec("ALTER TABLE ticket_vendas ADD COLUMN quantidade_inteira INTEGER DEFAULT 0") } catch (_) {}
try { db.exec("ALTER TABLE ticket_vendas ADD COLUMN quantidade_meia INTEGER DEFAULT 0") } catch (_) {}

// Seeds de config padrão
const seedConfig = db.prepare('INSERT OR IGNORE INTO config (chave, valor) VALUES (?, ?)')
;[
  ['pix_chave', ''],
  ['pix_nome', 'Forro das Tonhas'],
  ['pix_cidade', 'Sao Paulo'],
  ['valor_inteira', ''],
  ['valor_meia', ''],
  ['limite_por_compra', '4'],
].forEach(([k, v]) => seedConfig.run(k, v))

module.exports = db;
