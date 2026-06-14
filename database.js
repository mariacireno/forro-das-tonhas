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
try { db.exec("ALTER TABLE ticket_vendas ADD COLUMN check_in INTEGER DEFAULT 0") } catch (_) {}
try { db.exec("ALTER TABLE ticket_vendas ADD COLUMN check_in_at TEXT") } catch (_) {}
try { db.exec("ALTER TABLE ticket_vendas ADD COLUMN quantidade_lote_promo INTEGER DEFAULT 0") } catch (_) {}
try { db.exec("ALTER TABLE ticket_vendas ADD COLUMN quantidade_lote2 INTEGER DEFAULT 0") } catch (_) {}
try { db.exec("ALTER TABLE ticket_vendas ADD COLUMN quantidade_mesa INTEGER DEFAULT 0") } catch (_) {}
try { db.exec("ALTER TABLE ticket_vendas ADD COLUMN cpf TEXT") } catch (_) {}
try { db.exec("ALTER TABLE ticket_vendas ADD COLUMN telefone TEXT") } catch (_) {}

// Bar: cardápio e vendas
db.exec(`
  CREATE TABLE IF NOT EXISTS cardapio (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT DEFAULT 'bebida',
    preco REAL NOT NULL,
    custo REAL NOT NULL DEFAULT 0,
    ativo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vendas_bar (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    nome_item TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario REAL NOT NULL,
    custo_unitario REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

// Check-in por ingresso individual
db.exec(`
  CREATE TABLE IF NOT EXISTS ticket_checkins (
    id TEXT PRIMARY KEY,
    venda_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    nome TEXT NOT NULL,
    seq INTEGER NOT NULL DEFAULT 1,
    check_in INTEGER DEFAULT 0,
    check_in_at TEXT
  )
`)
// Migração: popula checkins para vendas confirmadas que ainda não têm entradas
;(() => {
  const { randomUUID } = require('crypto')
  const semCheckins = db.prepare(`
    SELECT v.* FROM ticket_vendas v
    WHERE v.status = 'pago'
    AND NOT EXISTS (SELECT 1 FROM ticket_checkins c WHERE c.venda_id = v.id)
  `).all()
  const ins = db.prepare('INSERT INTO ticket_checkins (id, venda_id, tipo, nome, seq) VALUES (?, ?, ?, ?, ?)')
  for (const v of semCheckins) {
    let seq = 1
    for (let i = 0; i < (v.quantidade_lote_promo || 0); i++) ins.run(randomUUID(), v.id, 'Lote Promo', v.nome, seq++)
    for (let i = 0; i < (v.quantidade_lote2 || 0); i++)      ins.run(randomUUID(), v.id, '2º Lote',    v.nome, seq++)
    for (let i = 0; i < (v.quantidade_mesa || 0) * 4; i++)   ins.run(randomUUID(), v.id, 'Mesa',       v.nome, seq++)
    for (let i = 0; i < (v.quantidade_inteira || 0); i++)    ins.run(randomUUID(), v.id, 'Inteira',    v.nome, seq++)
    for (let i = 0; i < (v.quantidade_meia || 0); i++)       ins.run(randomUUID(), v.id, 'Meia',       v.nome, seq++)
  }
})()

// Seeds de config padrão
const seedConfig = db.prepare('INSERT OR IGNORE INTO config (chave, valor) VALUES (?, ?)')
;[
  ['pix_chave', ''],
  ['pix_nome', 'Forro das Tonhas'],
  ['pix_cidade', 'Sao Paulo'],
  ['valor_inteira', ''],
  ['valor_meia', ''],
  ['valor_lote_promo', ''],
  ['valor_lote2', ''],
  ['valor_mesa', ''],
  ['limite_por_compra', '4'],
  ['estoque_lote_promo', '0'],
  ['estoque_lote2', '0'],
  ['estoque_mesa', '0'],
  ['vendas_ativas', '0'],
  ['limite_cortesia', '60'],
  ['bar_gerar_receita', '0'],
].forEach(([k, v]) => seedConfig.run(k, v))

module.exports = db;
