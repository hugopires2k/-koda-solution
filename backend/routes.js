const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { authMiddleware, requireRole, SECRET } = require('./middleware');

const router = express.Router();

// ── AUTH ─────────────────────────────────────────────
router.post('/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ? AND role = ?').get(email, password, role);
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role, cursoId: user.cursoId }, SECRET, { expiresIn: '8h' });
  const { password: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
});

// ── CURSOS ───────────────────────────────────────────
router.get('/cursos', authMiddleware, (req, res) => {
  const cursos = db.prepare('SELECT * FROM cursos').all();
  res.json(cursos);
});

router.post('/cursos', authMiddleware, requireRole('admin'), (req, res) => {
  const { nome, cargaHorariaTotal } = req.body;
  if (!nome || !cargaHorariaTotal) return res.status(400).json({ error: 'Dados incompletos' });
  const id = uuidv4();
  db.prepare('INSERT INTO cursos (id, nome, cargaHorariaTotal) VALUES (?, ?, ?)').run(id, nome, Number(cargaHorariaTotal));
  res.status(201).json({ id, nome, cargaHorariaTotal: Number(cargaHorariaTotal) });
});

router.delete('/cursos/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const result = db.prepare('DELETE FROM cursos WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Curso não encontrado' });
  res.json({ ok: true });
});

// ── REGRAS ───────────────────────────────────────────
router.get('/regras', authMiddleware, (req, res) => {
  const { cursoId } = req.query;
  const regras = cursoId
    ? db.prepare('SELECT * FROM regras WHERE cursoId = ?').all(cursoId)
    : db.prepare('SELECT * FROM regras').all();
  res.json(regras);
});

router.post('/regras', authMiddleware, requireRole('admin'), (req, res) => {
  const { cursoId, categoria, limiteHoras } = req.body;
  if (!cursoId || !categoria || !limiteHoras) return res.status(400).json({ error: 'Dados incompletos' });
  const id = uuidv4();
  db.prepare('INSERT INTO regras (id, cursoId, categoria, limiteHoras) VALUES (?, ?, ?, ?)').run(id, cursoId, categoria, Number(limiteHoras));
  res.status(201).json({ id, cursoId, categoria, limiteHoras: Number(limiteHoras) });
});

router.delete('/regras/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const result = db.prepare('DELETE FROM regras WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Regra não encontrada' });
  res.json({ ok: true });
});

// ── COORDENADORES ────────────────────────────────────
router.get('/coordenadores', authMiddleware, requireRole('admin'), (req, res) => {
  const coords = db.prepare("SELECT id, name, email, role, cursoId FROM users WHERE role = 'coordenador'").all();
  res.json(coords);
});

router.post('/coordenadores', authMiddleware, requireRole('admin'), (req, res) => {
  const { name, email, password, cursoId } = req.body;
  if (!name || !email || !password || !cursoId) return res.status(400).json({ error: 'Dados incompletos' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(400).json({ error: 'E-mail já cadastrado' });
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, name, email, password, role, cursoId) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, email, password, 'coordenador', cursoId);
  res.status(201).json({ id, name, email, role: 'coordenador', cursoId });
});

router.delete('/coordenadores/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const result = db.prepare("DELETE FROM users WHERE id = ? AND role = 'coordenador'").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Coordenador não encontrado' });
  res.json({ ok: true });
});

// ── ALUNOS ───────────────────────────────────────────
router.get('/alunos', authMiddleware, requireRole('coordenador', 'admin'), (req, res) => {
  let alunos;
  if (req.user.role === 'coordenador') {
    alunos = db.prepare("SELECT id, name, email, role, cursoId, matricula FROM users WHERE role = 'aluno' AND cursoId = ?").all(req.user.cursoId);
  } else {
    alunos = db.prepare("SELECT id, name, email, role, cursoId, matricula FROM users WHERE role = 'aluno'").all();
  }
  res.json(alunos);
});

router.post('/alunos', authMiddleware, requireRole('coordenador', 'admin'), (req, res) => {
  const { name, email, matricula } = req.body;
  if (!name || !email || !matricula) return res.status(400).json({ error: 'Dados incompletos' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ? OR matricula = ?').get(email, matricula);
  if (exists) return res.status(400).json({ error: 'E-mail ou matrícula já cadastrados' });
  const cursoId = req.user.role === 'coordenador' ? req.user.cursoId : req.body.cursoId;
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, name, email, password, role, cursoId, matricula) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, name, email, matricula, 'aluno', cursoId, matricula);
  res.status(201).json({ id, name, email, role: 'aluno', cursoId, matricula });
});

router.delete('/alunos/:id', authMiddleware, requireRole('coordenador', 'admin'), (req, res) => {
  const result = db.prepare("DELETE FROM users WHERE id = ? AND role = 'aluno'").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
  res.json({ ok: true });
});

// ── CERTIFICADOS ─────────────────────────────────────
router.get('/certificados', authMiddleware, (req, res) => {
  let certs;
  if (req.user.role === 'aluno') {
    certs = db.prepare('SELECT * FROM certificados WHERE alunoId = ?').all(req.user.id);
  } else if (req.user.role === 'coordenador') {
    certs = db.prepare(`
      SELECT c.*, u.name as alunoNome, u.email as alunoEmail
      FROM certificados c
      JOIN users u ON c.alunoId = u.id
      WHERE u.cursoId = ?
    `).all(req.user.cursoId);
    return res.json(certs);
  } else {
    certs = db.prepare('SELECT * FROM certificados').all();
  }
  const enriched = certs.map(c => {
    const aluno = db.prepare('SELECT name, email FROM users WHERE id = ?').get(c.alunoId);
    return { ...c, alunoNome: aluno?.name, alunoEmail: aluno?.email };
  });
  res.json(enriched);
});

router.post('/certificados', authMiddleware, requireRole('aluno'), (req, res) => {
  const { titulo, categoria, horas } = req.body;
  if (!titulo || !categoria || !horas) return res.status(400).json({ error: 'Dados incompletos' });
  const id = uuidv4();
  const datEnvio = new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO certificados (id, alunoId, titulo, categoria, horas, status, datEnvio, observacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, req.user.id, titulo, categoria, Number(horas), 'pendente', datEnvio, '');
  res.status(201).json({ id, alunoId: req.user.id, titulo, categoria, horas: Number(horas), status: 'pendente', datEnvio, observacao: '' });
});

router.patch('/certificados/:id', authMiddleware, requireRole('coordenador'), (req, res) => {
  const { status, observacao } = req.body;
  if (!['aprovado', 'reprovado'].includes(status)) return res.status(400).json({ error: 'Status inválido' });
  const result = db.prepare('UPDATE certificados SET status = ?, observacao = ? WHERE id = ?').run(status, observacao || '', req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Certificado não encontrado' });
  const cert = db.prepare('SELECT * FROM certificados WHERE id = ?').get(req.params.id);
  res.json(cert);
});

// ── DASHBOARD ────────────────────────────────────────
router.get('/dashboard/aluno', authMiddleware, requireRole('aluno'), (req, res) => {
  const aluno = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const curso = db.prepare('SELECT * FROM cursos WHERE id = ?').get(aluno?.cursoId);
  const regras = db.prepare('SELECT * FROM regras WHERE cursoId = ?').all(aluno?.cursoId);
  const certs = db.prepare("SELECT * FROM certificados WHERE alunoId = ? AND status = 'aprovado'").all(req.user.id);
  const totalHoras = certs.reduce((s, c) => s + c.horas, 0);
  const porCategoria = regras.map(r => {
    const horasCategoria = certs.filter(c => c.categoria === r.categoria).reduce((s, c) => s + c.horas, 0);
    return { categoria: r.categoria, horas: horasCategoria, limite: r.limiteHoras };
  });
  res.json({ totalHoras, cargaTotal: curso?.cargaHorariaTotal || 0, porCategoria, curso: curso?.nome });
});

module.exports = router;