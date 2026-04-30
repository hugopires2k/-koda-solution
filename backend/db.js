const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'koda.db'));

db.pragma('journal_mode = WAL');

// ── CRIAÇÃO DAS TABELAS ──────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    cursoId TEXT,
    matricula TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS cursos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cargaHorariaTotal INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS regras (
    id TEXT PRIMARY KEY,
    cursoId TEXT NOT NULL,
    categoria TEXT NOT NULL,
    limiteHoras INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS certificados (
    id TEXT PRIMARY KEY,
    alunoId TEXT NOT NULL,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    horas INTEGER NOT NULL,
    status TEXT DEFAULT 'pendente',
    datEnvio TEXT NOT NULL,
    observacao TEXT DEFAULT ''
  );
`);

const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();

if (totalUsers.count === 0) {
  const { v4: uuidv4 } = require('uuid');

  const insertCurso = db.prepare('INSERT INTO cursos (id, nome, cargaHorariaTotal) VALUES (?, ?, ?)');
  insertCurso.run('1', 'Engenharia de Software', 200);
  insertCurso.run('2', 'Ciência da Computação', 180);
  insertCurso.run('3', 'Sistemas de Informação', 160);

  const insertRegra = db.prepare('INSERT INTO regras (id, cursoId, categoria, limiteHoras) VALUES (?, ?, ?, ?)');
  insertRegra.run('1', '1', 'Pesquisa', 60);
  insertRegra.run('2', '1', 'Extensão', 80);
  insertRegra.run('3', '1', 'Monitoria', 40);
  insertRegra.run('4', '2', 'Pesquisa', 60);
  insertRegra.run('5', '2', 'Extensão', 60);

  const insertUser = db.prepare('INSERT INTO users (id, name, email, password, role, cursoId, matricula) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertUser.run('1', 'Admin Koda', 'admin@koda.com', '123456', 'admin', null, null);
  insertUser.run('2', 'Prof. João Silva', 'joao@koda.com', '123456', 'coordenador', '1', null);
  insertUser.run('3', 'Prof. Maria Santos', 'maria@koda.com', '123456', 'coordenador', '2', null);
  insertUser.run('4', 'Ana Carolina Souza', 'ana.souza@aluno.br', '123456', 'aluno', '1', '2023001234');
  insertUser.run('5', 'Pedro Henrique Lima', 'pedro.lima@aluno.br', '123456', 'aluno', '1', '2023001235');
  insertUser.run('6', 'Mariana Costa', 'mariana.costa@aluno.br', '123456', 'aluno', '2', '2023001236');
  insertUser.run('7', 'Lucas Ferreira', 'lucas.ferreira@aluno.br', '123456', 'aluno', '2', '2023001237');

  const insertCert = db.prepare('INSERT INTO certificados (id, alunoId, titulo, categoria, horas, status, datEnvio, observacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertCert.run('1', '4', 'Participação em Projeto de Pesquisa - IA', 'Pesquisa', 40, 'pendente', '2026-04-24', '');
  insertCert.run('2', '5', 'Monitoria de Programação Orientada a Objetos', 'Monitoria', 30, 'pendente', '2026-04-25', '');
  insertCert.run('3', '6', 'Workshop de Desenvolvimento Web', 'Extensão', 20, 'pendente', '2026-04-26', '');
  insertCert.run('4', '7', 'Extensão Universitária - Projeto Social', 'Extensão', 60, 'pendente', '2026-04-27', '');
  insertCert.run('5', '4', 'Hackathon Nacional de IA', 'Extensão', 16, 'aprovado', '2026-03-10', '');
  insertCert.run('6', '4', 'Artigo Científico em Revista', 'Pesquisa', 20, 'reprovado', '2026-02-15', 'Certificado ilegível, por favor reenvie.');

  console.log('✅ Banco de dados criado e populado com dados iniciais!');
}

module.exports = db;