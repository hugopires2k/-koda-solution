const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('./db');
const { authMiddleware, requireRole, SECRET } = require('./middleware');

const router = express.Router();

// ── AUTH ─────────────────────────────────────────────
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1 AND password=$2 AND role=$3', [email, password, role]);
    if (!rows.length) return res.status(401).json({ error: 'Credenciais inválidas' });
    const user = rows[0];
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role, cursoId: user.cursoId }, SECRET, { expiresIn: '8h' });
    const { password: _, ...userSafe } = user;
    res.json({ token, user: userSafe });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── CURSOS ───────────────────────────────────────────
router.get('/cursos', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM cursos');
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/cursos', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { nome, cargaHorariaTotal } = req.body;
    if (!nome || !cargaHorariaTotal) return res.status(400).json({ error: 'Dados incompletos' });
    const id = uuidv4();
    await pool.query('INSERT INTO cursos (id, nome, "cargaHorariaTotal") VALUES ($1,$2,$3)', [id, nome, Number(cargaHorariaTotal)]);
    res.status(201).json({ id, nome, cargaHorariaTotal: Number(cargaHorariaTotal) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/cursos/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM cursos WHERE id=$1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Curso não encontrado' });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── REGRAS ───────────────────────────────────────────
router.get('/regras', authMiddleware, async (req, res) => {
  try {
    const { cursoId } = req.query;
    const { rows } = cursoId
      ? await pool.query('SELECT * FROM regras WHERE "cursoId"=$1', [cursoId])
      : await pool.query('SELECT * FROM regras');
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/regras', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { cursoId, categoria, limiteHoras } = req.body;
    if (!cursoId || !categoria || !limiteHoras) return res.status(400).json({ error: 'Dados incompletos' });
    const id = uuidv4();
    await pool.query('INSERT INTO regras (id, "cursoId", categoria, "limiteHoras") VALUES ($1,$2,$3,$4)', [id, cursoId, categoria, Number(limiteHoras)]);
    res.status(201).json({ id, cursoId, categoria, limiteHoras: Number(limiteHoras) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/regras/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM regras WHERE id=$1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Regra não encontrada' });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── COORDENADORES ────────────────────────────────────
router.get('/coordenadores', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, name, email, role, \"cursoId\" FROM users WHERE role='coordenador'");
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/coordenadores', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, cursoId } = req.body;
    if (!name || !email || !password || !cursoId) return res.status(400).json({ error: 'Dados incompletos' });
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length) return res.status(400).json({ error: 'E-mail já cadastrado' });
    const id = uuidv4();
    await pool.query('INSERT INTO users (id, name, email, password, role, "cursoId") VALUES ($1,$2,$3,$4,$5,$6)', [id, name, email, password, 'coordenador', cursoId]);
    res.status(201).json({ id, name, email, role: 'coordenador', cursoId });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/coordenadores/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE id=$1 AND role='coordenador'", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Coordenador não encontrado' });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── ALUNOS ───────────────────────────────────────────
router.get('/alunos', authMiddleware, requireRole('coordenador', 'admin'), async (req, res) => {
  try {
    const { rows } = req.user.role === 'coordenador'
      ? await pool.query("SELECT id, name, email, role, \"cursoId\", matricula FROM users WHERE role='aluno' AND \"cursoId\"=$1", [req.user.cursoId])
      : await pool.query("SELECT id, name, email, role, \"cursoId\", matricula FROM users WHERE role='aluno'");
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/alunos', authMiddleware, requireRole('coordenador', 'admin'), async (req, res) => {
  try {
    const { name, email, matricula } = req.body;
    if (!name || !email || !matricula) return res.status(400).json({ error: 'Dados incompletos' });
    const exists = await pool.query('SELECT id FROM users WHERE email=$1 OR matricula=$2', [email, matricula]);
    if (exists.rows.length) return res.status(400).json({ error: 'E-mail ou matrícula já cadastrados' });
    const cursoId = req.user.role === 'coordenador' ? req.user.cursoId : req.body.cursoId;
    const id = uuidv4();
    await pool.query('INSERT INTO users (id, name, email, password, role, "cursoId", matricula) VALUES ($1,$2,$3,$4,$5,$6,$7)', [id, name, email, matricula, 'aluno', cursoId, matricula]);
    res.status(201).json({ id, name, email, role: 'aluno', cursoId, matricula });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/alunos/:id', authMiddleware, requireRole('coordenador', 'admin'), async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE id=$1 AND role='aluno'", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── CERTIFICADOS ─────────────────────────────────────
router.get('/certificados', authMiddleware, async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'aluno') {
      ({ rows } = await pool.query('SELECT * FROM certificados WHERE "alunoId"=$1', [req.user.id]));
    } else if (req.user.role === 'coordenador') {
      ({ rows } = await pool.query(`SELECT c.*, u.name as "alunoNome", u.email as "alunoEmail" FROM certificados c JOIN users u ON c."alunoId"=u.id WHERE u."cursoId"=$1`, [req.user.cursoId]));
      return res.json(rows);
    } else {
      ({ rows } = await pool.query('SELECT * FROM certificados'));
    }
    const enriched = await Promise.all(rows.map(async c => {
      const { rows: u } = await pool.query('SELECT name, email FROM users WHERE id=$1', [c.alunoId]);
      return { ...c, alunoNome: u[0]?.name, alunoEmail: u[0]?.email };
    }));
    res.json(enriched);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/certificados', authMiddleware, requireRole('aluno'), async (req, res) => {
  try {
    const { titulo, categoria, horas } = req.body;
    if (!titulo || !categoria || !horas) return res.status(400).json({ error: 'Dados incompletos' });
    const id = uuidv4();
    const datEnvio = new Date().toISOString().split('T')[0];
    await pool.query('INSERT INTO certificados (id, "alunoId", titulo, categoria, horas, status, "datEnvio", observacao) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [id, req.user.id, titulo, categoria, Number(horas), 'pendente', datEnvio, '']);
    res.status(201).json({ id, alunoId: req.user.id, titulo, categoria, horas: Number(horas), status: 'pendente', datEnvio, observacao: '' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.patch('/certificados/:id', authMiddleware, requireRole('coordenador'), async (req, res) => {
  try {
    const { status, observacao } = req.body;
    if (!['aprovado', 'reprovado'].includes(status)) return res.status(400).json({ error: 'Status inválido' });
    const result = await pool.query('UPDATE certificados SET status=$1, observacao=$2 WHERE id=$3', [status, observacao || '', req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Certificado não encontrado' });
    const { rows } = await pool.query('SELECT * FROM certificados WHERE id=$1', [req.params.id]);
    res.json(rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── DASHBOARD ────────────────────────────────────────
router.get('/dashboard/aluno', authMiddleware, requireRole('aluno'), async (req, res) => {
  try {
    const { rows: [aluno] } = await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id]);
    const { rows: [curso] } = await pool.query('SELECT * FROM cursos WHERE id=$1', [aluno?.cursoId]);
    const { rows: regras } = await pool.query('SELECT * FROM regras WHERE "cursoId"=$1', [aluno?.cursoId]);
    const { rows: certs } = await pool.query("SELECT * FROM certificados WHERE \"alunoId\"=$1 AND status='aprovado'", [req.user.id]);
    const totalHoras = certs.reduce((s, c) => s + c.horas, 0);
    const porCategoria = regras.map(r => {
      const horasCategoria = certs.filter(c => c.categoria === r.categoria).reduce((s, c) => s + c.horas, 0);
      return { categoria: r.categoria, horas: horasCategoria, limite: r.limiteHoras };
    });
    res.json({ totalHoras, cargaTotal: curso?.cargaHorariaTotal || 0, porCategoria, curso: curso?.nome });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;