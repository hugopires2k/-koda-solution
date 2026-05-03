const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway.internal') 
    ? false 
    : { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      "cursoId" TEXT,
      matricula TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS cursos (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      "cargaHorariaTotal" INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS regras (
      id TEXT PRIMARY KEY,
      "cursoId" TEXT NOT NULL,
      categoria TEXT NOT NULL,
      "limiteHoras" INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS certificados (
      id TEXT PRIMARY KEY,
      "alunoId" TEXT NOT NULL,
      titulo TEXT NOT NULL,
      categoria TEXT NOT NULL,
      horas INTEGER NOT NULL,
      status TEXT DEFAULT 'pendente',
      "datEnvio" TEXT NOT NULL,
      observacao TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS reset_tokens (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT FALSE
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*) as count FROM users');
  if (parseInt(rows[0].count) === 0) {
    const { v4: uuidv4 } = require('uuid');

    await pool.query(`INSERT INTO cursos (id, nome, "cargaHorariaTotal") VALUES ($1,$2,$3),($4,$5,$6),($7,$8,$9)`,
      ['1','Engenharia de Software',200,'2','Ciência da Computação',180,'3','Sistemas de Informação',160]);

    await pool.query(`INSERT INTO regras (id, "cursoId", categoria, "limiteHoras") VALUES ($1,$2,$3,$4),($5,$6,$7,$8),($9,$10,$11,$12),($13,$14,$15,$16),($17,$18,$19,$20)`,
      ['1','1','Pesquisa',60,'2','1','Extensão',80,'3','1','Monitoria',40,'4','2','Pesquisa',60,'5','2','Extensão',60]);

    await pool.query(`INSERT INTO users (id, name, email, password, role, "cursoId", matricula) VALUES ($1,$2,$3,$4,$5,$6,$7),($8,$9,$10,$11,$12,$13,$14),($15,$16,$17,$18,$19,$20,$21),($22,$23,$24,$25,$26,$27,$28),($29,$30,$31,$32,$33,$34,$35),($36,$37,$38,$39,$40,$41,$42),($43,$44,$45,$46,$47,$48,$49)`,
      ['1','Admin Koda','admin@koda.com','123456','admin',null,null,
       '2','Prof. João Silva','joao@koda.com','123456','coordenador','1',null,
       '3','Prof. Maria Santos','maria@koda.com','123456','coordenador','2',null,
       '4','Ana Carolina Souza','ana.souza@aluno.br','123456','aluno','1','2023001234',
       '5','Pedro Henrique Lima','pedro.lima@aluno.br','123456','aluno','1','2023001235',
       '6','Mariana Costa','mariana.costa@aluno.br','123456','aluno','2','2023001236',
       '7','Lucas Ferreira','lucas.ferreira@aluno.br','123456','aluno','2','2023001237']);

    await pool.query(`INSERT INTO certificados (id, "alunoId", titulo, categoria, horas, status, "datEnvio", observacao) VALUES ($1,$2,$3,$4,$5,$6,$7,$8),($9,$10,$11,$12,$13,$14,$15,$16),($17,$18,$19,$20,$21,$22,$23,$24),($25,$26,$27,$28,$29,$30,$31,$32),($33,$34,$35,$36,$37,$38,$39,$40),($41,$42,$43,$44,$45,$46,$47,$48)`,
      ['1','4','Participação em Projeto de Pesquisa - IA','Pesquisa',40,'pendente','2026-04-24','',
       '2','5','Monitoria de Programação Orientada a Objetos','Monitoria',30,'pendente','2026-04-25','',
       '3','6','Workshop de Desenvolvimento Web','Extensão',20,'pendente','2026-04-26','',
       '4','7','Extensão Universitária - Projeto Social','Extensão',60,'pendente','2026-04-27','',
       '5','4','Hackathon Nacional de IA','Extensão',16,'aprovado','2026-03-10','',
       '6','4','Artigo Científico em Revista','Pesquisa',20,'reprovado','2026-02-15','Certificado ilegível, por favor reenvie.']);

    console.log('✅ Banco de dados PostgreSQL criado e populado!');
  }
}

module.exports = { pool, initDB };
