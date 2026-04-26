const db = require('./database');
const { v4: uuidv4 } = require('uuid');

const atividades = [
  // Estrutura
  { titulo: 'Toldo', categoria: 'estrutura', observacoes: 'Prioridade — época de chuva' },
  { titulo: 'Telha', categoria: 'estrutura', observacoes: 'Parte da estrutura, separado do toldo' },
  { titulo: 'Mesas e cadeiras', categoria: 'estrutura', observacoes: 'Definir quantidade conforme capacidade' },
  { titulo: 'Iluminação', categoria: 'estrutura', observacoes: 'Pista de dança e área de bar' },
  { titulo: 'Internet', categoria: 'estrutura', observacoes: 'Necessário para maquinetas e operação' },
  { titulo: 'Copos', categoria: 'estrutura', observacoes: 'Fazer / mandar fazer' },

  // Bebidas
  { titulo: 'Brahma', categoria: 'bebidas', observacoes: null },
  { titulo: 'Heineken', categoria: 'bebidas', observacoes: null },
  { titulo: 'Senses (3 sabores)', categoria: 'bebidas', observacoes: null },
  { titulo: 'Batida', categoria: 'bebidas', observacoes: null },
  { titulo: 'Cana (cachaça)', categoria: 'bebidas', observacoes: null },

  // Comidas
  { titulo: 'Batata', categoria: 'comidas', observacoes: null },
  { titulo: 'Coxinha', categoria: 'comidas', observacoes: null },
  { titulo: 'Amendoim', categoria: 'comidas', observacoes: null },
  { titulo: 'Milho cozido', categoria: 'comidas', observacoes: null },
  { titulo: 'Pipoca', categoria: 'comidas', observacoes: null },
  { titulo: 'Caldinho de feijão', categoria: 'comidas', observacoes: null },
  { titulo: 'Caldinho de batata', categoria: 'comidas', observacoes: null },
  { titulo: 'Cachorro-quente', categoria: 'comidas', observacoes: null },
  { titulo: 'Espetinho', categoria: 'comidas', observacoes: null },

  // Equipe
  { titulo: '2 no bar', categoria: 'equipe', observacoes: null },
  { titulo: '2 na comida', categoria: 'equipe', observacoes: null },
  { titulo: '1 caixa', categoria: 'equipe', observacoes: null },
  { titulo: '1 volante', categoria: 'equipe', observacoes: null },
  { titulo: '1 segurança', categoria: 'equipe', observacoes: 'Já tem — confirmar presença e horário' },
  { titulo: '1 limpeza', categoria: 'equipe', observacoes: null },

  // Pagamento
  { titulo: '2 maquinetas', categoria: 'pagamento', observacoes: 'Crédito/débito' },
  { titulo: 'Pix', categoria: 'pagamento', observacoes: 'Chave definida e divulgada' },
  { titulo: 'Dinheiro', categoria: 'pagamento', observacoes: 'Troco disponível no caixa' },

  // Música
  { titulo: 'DJ Camila Paz', categoria: 'musica', observacoes: 'Opção em aberto — fechar contratação' },
  { titulo: 'Som e equipamentos', categoria: 'musica', observacoes: 'Verificar se a DJ traz ou precisa locar' },

  // Comunicação e identidade
  { titulo: 'Pensar no nome da casa', categoria: 'comunicacao', observacoes: null },
  { titulo: 'Arte — Rafinha (permuta)', categoria: 'comunicacao', observacoes: 'Alinhar identidade visual, divulgação e o que entra como permuta' },
  { titulo: 'Decoração', categoria: 'comunicacao', observacoes: 'Bandeirolas, pisca-pisca, centro de mesa' },

  // Ingressos e controle
  { titulo: 'Definir valor do ingresso', categoria: 'ingressos', observacoes: 'Meia-entrada, lote antecipado, etc.' },
  { titulo: 'Sistema de venda de ingressos', categoria: 'ingressos', observacoes: 'Online e/ou portaria' },
  { titulo: 'Controle de entrada', categoria: 'ingressos', observacoes: 'Pessoal de portaria' },
];

function runSeed() {
  const count = db.prepare('SELECT COUNT(*) as total FROM tasks').get().total;
  if (count > 0) {
    console.log(`Seed ignorado — banco já tem ${count} atividade(s).`);
    return;
  }

  const insert = db.prepare(`
    INSERT INTO tasks (id, titulo, categoria, responsavel, prazo, status, urgente, observacoes)
    VALUES (?, ?, ?, NULL, NULL, 'pendente', 0, ?)
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(uuidv4(), item.titulo, item.categoria, item.observacoes);
    }
  });

  insertMany(atividades);
  console.log(`Seed concluído — ${atividades.length} atividades inseridas.`);
}

module.exports = { runSeed };
