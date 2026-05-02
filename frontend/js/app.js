const API = 'https://koda-solution-production.up.railway.app/api';
let token = null, currentUser = null;

// ── HELPERS ─────────────────────────────────────────
function toast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${msg}`;
  document.getElementById('toasts').appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...opts
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

function openModal(title, body, actions) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = body;
  document.getElementById('modalActions').innerHTML = actions;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modalOverlay'))
    document.getElementById('modalOverlay').classList.remove('open');
}

function roleLabel(r) {
  return { admin: 'Administrador', coordenador: 'Coordenador', aluno: 'Aluno' }[r] || r;
}

function badgeStatus(s) {
  const map = { pendente: ['badge-pending','⏳ Pendente'], aprovado: ['badge-approved','✅ Aprovado'], reprovado: ['badge-rejected','❌ Reprovado'] };
  const [cls, label] = map[s] || ['badge-pending', s];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ── AUTH ─────────────────────────────────────────────
async function login() {
  const role = document.getElementById('loginRole').value;
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) });
    token = data.token;
    currentUser = data.user;
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    setupSidebar();
    navigateTo(getDefaultPage());
    toast(`Bem-vindo, ${currentUser.name}!`, 'success');
  } catch (e) {
    toast(e.message, 'error');
  }
}

document.getElementById('loginRole').addEventListener('change', function() {
  const hints = {
    admin: { email: 'admin@koda.com', password: '123456' },
    coordenador: { email: 'joao@koda.com', password: '123456' },
    aluno: { email: 'ana.souza@aluno.br', password: '123456' }
  };
  const h = hints[this.value];
  document.getElementById('loginEmail').value = h.email;
  document.getElementById('loginPassword').value = h.password;
});

function logout() {
  token = null; currentUser = null;
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
}

function getDefaultPage() {
  return { admin: 'cursos', coordenador: 'certificados', aluno: 'meusdados' }[currentUser.role];
}

// ── SIDEBAR ──────────────────────────────────────────
function setupSidebar() {
  document.getElementById('sidebarAvatar').textContent = currentUser.name[0].toUpperCase();
  document.getElementById('sidebarName').textContent = currentUser.name;
  document.getElementById('sidebarRole').textContent = roleLabel(currentUser.role);

  const menus = {
    admin: [
      { id: 'cursos', icon: '📚', label: 'Cadastro de Cursos' },
      { id: 'regras', icon: '📋', label: 'Regras do Curso' },
      { id: 'coordenadores', icon: '👨‍🏫', label: 'Coordenadores' },
      { id: 'alunos', icon: '👤', label: 'Cadastro de Aluno' },
    ],
    coordenador: [
      { id: 'certificados', icon: '📄', label: 'Certificados Pendentes' },
      { id: 'alunos', icon: '👤', label: 'Cadastro de Aluno' },
      { id: 'cursos', icon: '📚', label: 'Cadastro de Cursos' },
    ],
    aluno: [
      { id: 'meusdados', icon: '📊', label: 'Meu Painel' },
      { id: 'enviar', icon: '📤', label: 'Enviar Certificado' },
      { id: 'meuscerts', icon: '📄', label: 'Meus Certificados' },
    ]
  };

  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = (menus[currentUser.role] || []).map(m =>
    `<button class="nav-item" id="nav-${m.id}" onclick="navigateTo('${m.id}')">
      <span class="nav-icon">${m.icon}</span> ${m.label}
    </button>`
  ).join('');
}

function setActiveNav(id) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('nav-' + id);
  if (el) el.classList.add('active');
}

function navigateTo(page) {
  setActiveNav(page);
  const pages = {
    cursos: pageCursos,
    regras: pageRegras,
    coordenadores: pageCoordenadores,
    certificados: pageCertificados,
    alunos: pageAlunos,
    meusdados: pageMeusDados,
    enviar: pageEnviar,
    meuscerts: pageMeusCerts,
  };
  if (pages[page]) pages[page]();
}

// ── PAGE: CURSOS ──────────────────────────────────────
async function pageCursos() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Cadastro de Cursos</h1>
      <p class="page-sub">Gerencie os cursos da instituição</p>
    </div>
    ${currentUser.role === 'admin' ? `
    <div class="card">
      <div class="card-title">Novo Curso</div>
      <div class="form-row">
        <div class="form-group">
          <label>Nome do Curso</label>
          <input class="form-control" id="cursoNome" placeholder="Ex: Engenharia de Produção"/>
        </div>
        <div class="form-group">
          <label>Carga Horária Total (horas)</label>
          <input class="form-control" id="cursoHoras" type="number" placeholder="200"/>
        </div>
      </div>
      <button class="btn btn-primary" onclick="addCurso()">+ Adicionar Curso</button>
    </div>` : ''}
    <div class="section-title">Cursos Cadastrados</div>
    <div id="cursosList"></div>`;
  await loadCursos();
}

async function loadCursos() {
  try {
    const cursos = await api('/cursos');
    const list = document.getElementById('cursosList');
    if (!cursos.length) { list.innerHTML = `<div class="empty"><div class="empty-icon">📚</div><p>Nenhum curso cadastrado ainda.</p></div>`; return; }
    list.innerHTML = cursos.map(c => `
      <div class="list-item">
        <div class="item-icon blue">📚</div>
        <div class="item-info">
          <div class="item-title">${c.nome}</div>
          <div class="item-sub">${c.cargaHorariaTotal}h complementares</div>
        </div>
        ${currentUser.role === 'admin' ? `<div class="item-actions"><button class="btn btn-danger btn-sm" onclick="deleteCurso('${c.id}')">🗑</button></div>` : ''}
      </div>`).join('');
  } catch(e) { toast(e.message, 'error'); }
}

async function addCurso() {
  const nome = document.getElementById('cursoNome').value.trim();
  const cargaHorariaTotal = document.getElementById('cursoHoras').value;
  if (!nome || !cargaHorariaTotal) return toast('Preencha todos os campos', 'error');
  try {
    await api('/cursos', { method: 'POST', body: JSON.stringify({ nome, cargaHorariaTotal }) });
    document.getElementById('cursoNome').value = '';
    document.getElementById('cursoHoras').value = '';
    toast('Curso adicionado!', 'success');
    await loadCursos();
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteCurso(id) {
  if (!confirm('Remover este curso?')) return;
  try { await api('/cursos/' + id, { method: 'DELETE' }); toast('Curso removido', 'success'); await loadCursos(); }
  catch(e) { toast(e.message, 'error'); }
}

// ── PAGE: REGRAS ──────────────────────────────────────
async function pageRegras() {
  const main = document.getElementById('mainContent');
  const cursos = await api('/cursos');
  const opts = cursos.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Cadastro de Regras do Curso</h1>
      <p class="page-sub">Defina limites de horas por categoria para cada curso</p>
    </div>
    <div class="card">
      <div class="card-title">Nova Regra</div>
      <div class="form-group"><label>Curso</label><select class="form-control" id="regraCurso">${opts}</select></div>
      <div class="form-row">
        <div class="form-group"><label>Categoria</label><input class="form-control" id="regraCategoria" placeholder="Ex: Pesquisa, Extensão, Monitoria"/></div>
        <div class="form-group"><label>Carga Horária Limite (horas)</label><input class="form-control" id="regraHoras" type="number" placeholder="60"/></div>
      </div>
      <button class="btn btn-primary" onclick="addRegra()">+ Adicionar Regra</button>
    </div>
    <div class="section-title">Regras Cadastradas</div>
    <div id="regrasList"></div>`;
  await loadRegras(cursos);
}

async function loadRegras(cursos) {
  const regras = await api('/regras');
  const list = document.getElementById('regrasList');
  if (!regras.length) { list.innerHTML = `<div class="empty"><div class="empty-icon">📋</div><p>Nenhuma regra cadastrada.</p></div>`; return; }
  list.innerHTML = regras.map(r => {
    const curso = (cursos || []).find(c => c.id === r.cursoId);
    return `<div class="list-item">
      <div class="item-icon green">📋</div>
      <div class="item-info">
        <div class="item-title">${r.categoria}</div>
        <div class="item-sub">${curso?.nome || '—'} · Limite: ${r.limiteHoras}h</div>
      </div>
      <div class="item-actions"><button class="btn btn-danger btn-sm" onclick="deleteRegra('${r.id}')">🗑</button></div>
    </div>`;
  }).join('');
}

async function addRegra() {
  const cursoId = document.getElementById('regraCurso').value;
  const categoria = document.getElementById('regraCategoria').value.trim();
  const limiteHoras = document.getElementById('regraHoras').value;
  if (!cursoId || !categoria || !limiteHoras) return toast('Preencha todos os campos', 'error');
  try {
    await api('/regras', { method: 'POST', body: JSON.stringify({ cursoId, categoria, limiteHoras }) });
    document.getElementById('regraCategoria').value = '';
    document.getElementById('regraHoras').value = '';
    toast('Regra adicionada!', 'success');
    const cursos = await api('/cursos');
    await loadRegras(cursos);
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteRegra(id) {
  if (!confirm('Remover esta regra?')) return;
  try { await api('/regras/' + id, { method: 'DELETE' }); toast('Regra removida', 'success'); const c = await api('/cursos'); await loadRegras(c); }
  catch(e) { toast(e.message, 'error'); }
}

// ── PAGE: COORDENADORES ───────────────────────────────
async function pageCoordenadores() {
  const main = document.getElementById('mainContent');
  const cursos = await api('/cursos');
  const opts = cursos.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Cadastro de Coordenadores</h1>
      <p class="page-sub">Gerencie os coordenadores de curso</p>
    </div>
    <div class="card">
      <div class="card-title">Novo Coordenador</div>
      <div class="form-row">
        <div class="form-group"><label>Nome Completo</label><input class="form-control" id="coordNome" placeholder="Ex: Prof. Carlos Oliveira"/></div>
        <div class="form-group"><label>Curso</label><select class="form-control" id="coordCurso">${opts}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>E-mail</label><input class="form-control" id="coordEmail" type="email" placeholder="coordenador@universidade.br"/></div>
        <div class="form-group"><label>Senha</label><input class="form-control" id="coordSenha" type="password" placeholder="••••••••"/></div>
      </div>
      <button class="btn btn-primary" onclick="addCoordenador()">👨‍🏫 Cadastrar Coordenador</button>
    </div>
    <div class="section-title">Coordenadores Cadastrados</div>
    <div id="coordsList"></div>`;
  await loadCoordenadores(cursos);
}

async function loadCoordenadores(cursos) {
  const coords = await api('/coordenadores');
  const list = document.getElementById('coordsList');
  if (!coords.length) { list.innerHTML = `<div class="empty"><div class="empty-icon">👨‍🏫</div><p>Nenhum coordenador cadastrado.</p></div>`; return; }
  list.innerHTML = coords.map(c => {
    const curso = (cursos || []).find(x => x.id === c.cursoId);
    return `<div class="list-item">
      <div class="item-icon blue" style="background:var(--blue-100); color:var(--blue-700); font-size:18px">👨‍🏫</div>
      <div class="item-info">
        <div class="item-title">${c.name}</div>
        <div class="item-sub">${curso?.nome || '—'} · ${c.email}</div>
      </div>
      <div class="item-actions"><button class="btn btn-danger btn-sm" onclick="deleteCoord('${c.id}')">🗑</button></div>
    </div>`;
  }).join('');
}

async function addCoordenador() {
  const name = document.getElementById('coordNome').value.trim();
  const cursoId = document.getElementById('coordCurso').value;
  const email = document.getElementById('coordEmail').value.trim();
  const password = document.getElementById('coordSenha').value;
  if (!name || !cursoId || !email || !password) return toast('Preencha todos os campos', 'error');
  try {
    await api('/coordenadores', { method: 'POST', body: JSON.stringify({ name, cursoId, email, password }) });
    ['coordNome','coordEmail','coordSenha'].forEach(id => document.getElementById(id).value = '');
    toast('Coordenador cadastrado!', 'success');
    const cursos = await api('/cursos');
    await loadCoordenadores(cursos);
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteCoord(id) {
  if (!confirm('Remover este coordenador?')) return;
  try { await api('/coordenadores/' + id, { method: 'DELETE' }); toast('Removido', 'success'); const c = await api('/cursos'); await loadCoordenadores(c); }
  catch(e) { toast(e.message, 'error'); }
}

// ── PAGE: CERTIFICADOS (Coordenador) ──────────────────
async function pageCertificados() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Certificados Pendentes</h1>
      <p class="page-sub">Analise e aprove as atividades complementares dos alunos</p>
    </div>
    <div id="certsList"></div>`;
  await loadCertificados();
}

async function loadCertificados() {
  const certs = await api('/certificados');
  const list = document.getElementById('certsList');
  const pending = certs.filter(c => c.status === 'pendente');
  const rest = certs.filter(c => c.status !== 'pendente');
  if (!certs.length) { list.innerHTML = `<div class="empty"><div class="empty-icon">🎉</div><p>Nenhum certificado encontrado.</p></div>`; return; }
  let html = '';
  if (pending.length) {
    html += `<div class="section-title">⏳ Aguardando Análise (${pending.length})</div>`;
    html += pending.map(c => `
      <div class="list-item">
        <div class="item-icon yellow">📄</div>
        <div class="item-info">
          <div class="item-title">${c.titulo}</div>
          <div class="item-sub">👤 ${c.alunoNome} &nbsp;·&nbsp; 📅 ${c.datEnvio} &nbsp;·&nbsp; ⏱ ${c.horas}h &nbsp;·&nbsp; ${c.categoria}</div>
        </div>
        <div class="item-actions">
          ${badgeStatus(c.status)}
          <button class="btn btn-ghost btn-sm" onclick="verCert('${c.id}','${c.titulo}','${c.alunoNome}','${c.datEnvio}','${c.horas}','${c.categoria}','${c.status}','${c.observacao}')">👁 Ver</button>
          <button class="btn btn-success btn-sm" onclick="avaliarCert('${c.id}','aprovado')">✅ Aprovar</button>
          <button class="btn btn-danger btn-sm" onclick="promptReprovar('${c.id}')">❌ Reprovar</button>
        </div>
      </div>`).join('');
  }
  if (rest.length) {
    html += `<div class="section-title" style="margin-top:24px">📁 Histórico</div>`;
    html += rest.map(c => `
      <div class="list-item">
        <div class="item-icon ${c.status === 'aprovado' ? 'green' : 'red'}">📄</div>
        <div class="item-info">
          <div class="item-title">${c.titulo}</div>
          <div class="item-sub">👤 ${c.alunoNome} &nbsp;·&nbsp; ⏱ ${c.horas}h &nbsp;·&nbsp; ${c.categoria}${c.observacao ? ` &nbsp;·&nbsp; 💬 ${c.observacao}` : ''}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-ghost btn-sm" onclick="verCert('${c.id}','${c.titulo}','${c.alunoNome}','${c.datEnvio}','${c.horas}','${c.categoria}','${c.status}','${c.observacao}')">👁 Ver</button>
          ${badgeStatus(c.status)}
        </div>
      </div>`).join('');
  }
  list.innerHTML = html;
}

async function avaliarCert(id, status, observacao = '') {
  try {
    await api('/certificados/' + id, { method: 'PATCH', body: JSON.stringify({ status, observacao }) });
    toast(status === 'aprovado' ? 'Certificado aprovado!' : 'Certificado reprovado.', status === 'aprovado' ? 'success' : 'error');
    await loadCertificados();
  } catch(e) { toast(e.message, 'error'); }
}

function verCert(id, titulo, alunoNome, datEnvio, horas, categoria, status, observacao) {
  const statusLabel = { pendente: '⏳ Pendente', aprovado: '✅ Aprovado', reprovado: '❌ Reprovado' }[status] || status;
  openModal('Detalhes do Certificado', `
    <div style="display:flex; flex-direction:column; gap:14px">
      <div><strong>Título</strong><p style="margin-top:4px; color:var(--gray-700)">${titulo}</p></div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
        <div><strong>Aluno</strong><p style="margin-top:4px; color:var(--gray-700)">${alunoNome}</p></div>
        <div><strong>Data de Envio</strong><p style="margin-top:4px; color:var(--gray-700)">${datEnvio}</p></div>
        <div><strong>Categoria</strong><p style="margin-top:4px; color:var(--gray-700)">${categoria}</p></div>
        <div><strong>Carga Horária</strong><p style="margin-top:4px; color:var(--gray-700)">${horas}h</p></div>
      </div>
      <div><strong>Status</strong><p style="margin-top:4px">${statusLabel}</p></div>
      ${observacao ? `<div><strong>Observação</strong><p style="margin-top:4px; color:var(--red)">${observacao}</p></div>` : ''}
      <div style="background:var(--gray-100); border-radius:var(--radius-sm); padding:12px; font-size:13px; color:var(--gray-500)">
        📎 Upload de arquivo será disponibilizado em breve.
      </div>
    </div>
  `, `<button class="btn btn-ghost" onclick="closeModal()">Fechar</button>`);
}

function promptReprovar(id) {
  openModal('Reprovar Certificado',
    `<div class="form-group"><label>Motivo da reprovação</label><textarea class="form-control" id="motivoObs" rows="3" style="resize:vertical" placeholder="Explique o motivo..."></textarea></div>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-danger" onclick="avaliarCert('${id}','reprovado',document.getElementById('motivoObs').value); closeModal()">Confirmar Reprovação</button>`
  );
}

// ── PAGE: ALUNOS ──────────────────────────────────────
async function pageAlunos() {
  const main = document.getElementById('mainContent');
  const cursos = await api('/cursos');
  const cursoAtual = cursos.find(c => c.id === currentUser.cursoId);
  const optsAdmin = cursos.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Cadastro de Aluno</h1>
      <p class="page-sub">${currentUser.role === 'admin' ? 'Gerencie alunos de todos os cursos' : `Alunos vinculados ao curso: <strong>${cursoAtual?.nome || '—'}</strong>`}</p>
    </div>
    <div class="card">
      <div class="card-title">Novo Aluno</div>
      <div class="form-row">
        <div class="form-group"><label>Nome Completo</label><input class="form-control" id="alunoNome" placeholder="Ex: João da Silva"/></div>
        <div class="form-group"><label>Matrícula</label><input class="form-control" id="alunoMatricula" placeholder="2024001234"/></div>
      </div>
      <div class="form-group"><label>E-mail</label><input class="form-control" id="alunoEmail" type="email" placeholder="aluno@universidade.br"/></div>
      ${currentUser.role === 'admin' ? `
      <div class="form-group"><label>Curso</label><select class="form-control" id="alunoCurso">${optsAdmin}</select></div>
      ` : `
      <div style="background:var(--blue-50); border:1.5px solid var(--blue-100); border-radius:var(--radius-sm); padding:12px 16px; margin-bottom:18px; font-size:13px; color:var(--blue-700);">
        O aluno será vinculado ao curso: <strong>${cursoAtual?.nome || '—'}</strong>
      </div>`}
      <button class="btn btn-primary" onclick="addAluno()">👤 Cadastrar Aluno</button>
    </div>
    <div class="section-title">Alunos Cadastrados</div>
    <div id="alunosList"></div>`;
  await loadAlunos(cursos);
}

async function loadAlunos(cursos) {
  const alunos = await api('/alunos');
  const list = document.getElementById('alunosList');
  if (!alunos.length) { list.innerHTML = `<div class="empty"><div class="empty-icon">👤</div><p>Nenhum aluno cadastrado ainda.</p></div>`; return; }
  list.innerHTML = alunos.map(a => {
    const curso = (cursos || []).find(c => c.id === a.cursoId);
    return `<div class="list-item">
      <div class="item-icon blue" style="color:var(--blue-600); font-size:18px">👤</div>
      <div class="item-info">
        <div class="item-title">${a.name}</div>
        <div class="item-sub">Matrícula: ${a.matricula} &nbsp;·&nbsp; ${a.email} &nbsp;·&nbsp; ${curso?.nome || '—'}</div>
      </div>
      <div class="item-actions"><button class="btn btn-danger btn-sm" onclick="deleteAluno('${a.id}')">🗑</button></div>
    </div>`;
  }).join('');
}

async function addAluno() {
  const name = document.getElementById('alunoNome').value.trim();
  const matricula = document.getElementById('alunoMatricula').value.trim();
  const email = document.getElementById('alunoEmail').value.trim();
  if (!name || !matricula || !email) return toast('Preencha todos os campos', 'error');
  const cursoId = currentUser.role === 'admin'
    ? document.getElementById('alunoCurso').value
    : currentUser.cursoId;
  try {
    await api('/alunos', { method: 'POST', body: JSON.stringify({ name, matricula, email, cursoId }) });
    ['alunoNome','alunoMatricula','alunoEmail'].forEach(id => document.getElementById(id).value = '');
    toast('Aluno cadastrado!', 'success');
    const cursos = await api('/cursos');
    await loadAlunos(cursos);
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteAluno(id) {
  if (!confirm('Remover este aluno?')) return;
  try { await api('/alunos/' + id, { method: 'DELETE' }); toast('Aluno removido', 'success'); const c = await api('/cursos'); await loadAlunos(c); }
  catch(e) { toast(e.message, 'error'); }
}

// ── PAGE: MEU PAINEL (Aluno) ──────────────────────────
async function pageMeusDados() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `<div class="page-header"><h1 class="page-title">Meu Painel</h1><p class="page-sub">Acompanhe seu progresso de horas complementares</p></div><div id="dashContent"><p style="color:var(--gray-400); padding:24px">Carregando...</p></div>`;
  try {
    const d = await api('/dashboard/aluno');
    const pct = Math.min(100, Math.round((d.totalHoras / d.cargaTotal) * 100));
    let progressHtml = d.porCategoria.map(c => {
      const p = Math.min(100, Math.round((c.horas / c.limite) * 100));
      return `<div class="progress-wrap">
        <div class="progress-label"><span>${c.categoria}</span><span>${c.horas}h / ${c.limite}h limite</span></div>
        <div class="progress-track"><div class="progress-fill ${p >= 100 ? 'over' : ''}" style="width:${p}%"></div></div>
      </div>`;
    }).join('');
    document.getElementById('dashContent').innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Horas Aprovadas</div>
          <div class="stat-value">${d.totalHoras}h</div>
          <div class="stat-desc">de ${d.cargaTotal}h exigidas</div>
        </div>
        <div class="stat-card" style="border-left-color:var(--green)">
          <div class="stat-label">Progresso</div>
          <div class="stat-value">${pct}%</div>
          <div class="stat-desc">concluído</div>
        </div>
        <div class="stat-card" style="border-left-color:var(--yellow)">
          <div class="stat-label">Horas Restantes</div>
          <div class="stat-value">${Math.max(0, d.cargaTotal - d.totalHoras)}h</div>
          <div class="stat-desc">para completar</div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">📊 Progresso Geral</div>
        <div class="progress-wrap" style="margin-bottom:24px">
          <div class="progress-label"><span>Total de Horas</span><span>${d.totalHoras}h / ${d.cargaTotal}h</span></div>
          <div class="progress-track" style="height:14px"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="divider"></div>
        <div class="card-title" style="margin-top:4px">Por Categoria</div>
        ${progressHtml || '<p style="color:var(--gray-400);font-size:13px">Nenhuma categoria configurada para seu curso.</p>'}
      </div>`;
  } catch(e) { toast(e.message, 'error'); }
}

// ── PAGE: ENVIAR CERTIFICADO ──────────────────────────
async function pageEnviar() {
  const main = document.getElementById('mainContent');
  const regras = await api('/regras?cursoId=' + currentUser.cursoId);
  const categorias = regras.map(r => `<option value="${r.categoria}">${r.categoria}</option>`).join('');
  main.innerHTML = `
    <div class="page-header"><h1 class="page-title">Enviar Certificado</h1><p class="page-sub">Submeta atividades complementares para aprovação</p></div>
    <div class="card">
      <div class="card-title">Nova Submissão</div>
      <div class="form-group"><label>Título da Atividade</label><input class="form-control" id="certTitulo" placeholder="Ex: Participação em Hackathon"/></div>
      <div class="form-row">
        <div class="form-group"><label>Categoria</label><select class="form-control" id="certCategoria">${categorias || '<option>Sem categorias</option>'}</select></div>
        <div class="form-group"><label>Carga Horária (horas)</label><input class="form-control" id="certHoras" type="number" min="1" placeholder="20"/></div>
      </div>
      <div class="form-group">
        <label>Arquivo Comprobatório</label>
        <input class="form-control" type="file" accept=".pdf,.jpg,.png" style="padding:8px"/>
        <p style="font-size:12px; color:var(--gray-400); margin-top:6px">📎 Formatos aceitos: PDF, JPG, PNG (funcionalidade simulada)</p>
      </div>
      <button class="btn btn-primary" onclick="enviarCert()">📤 Enviar Certificado</button>
    </div>`;
}

async function enviarCert() {
  const titulo = document.getElementById('certTitulo').value.trim();
  const categoria = document.getElementById('certCategoria').value;
  const horas = document.getElementById('certHoras').value;
  if (!titulo || !categoria || !horas) return toast('Preencha todos os campos', 'error');
  try {
    await api('/certificados', { method: 'POST', body: JSON.stringify({ titulo, categoria, horas }) });
    toast('Certificado enviado para análise!', 'success');
    navigateTo('meuscerts');
  } catch(e) { toast(e.message, 'error'); }
}

// ── PAGE: MEUS CERTIFICADOS ───────────────────────────
async function pageMeusCerts() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-header"><h1 class="page-title">Meus Certificados</h1><p class="page-sub">Acompanhe o status de cada envio</p></div>
    <div id="meusCertsList"></div>`;
  const certs = await api('/certificados');
  const list = document.getElementById('meusCertsList');
  if (!certs.length) { list.innerHTML = `<div class="empty"><div class="empty-icon">📄</div><p>Você ainda não enviou nenhum certificado.</p></div>`; return; }
  list.innerHTML = certs.map(c => {
    const iconColor = { aprovado: 'green', reprovado: 'red', pendente: 'yellow' }[c.status];
    return `<div class="list-item">
      <div class="item-icon ${iconColor}">📄</div>
      <div class="item-info">
        <div class="item-title">${c.titulo}</div>
        <div class="item-sub">📅 ${c.datEnvio} &nbsp;·&nbsp; ⏱ ${c.horas}h &nbsp;·&nbsp; ${c.categoria}${c.observacao ? `<br>💬 <em>${c.observacao}</em>` : ''}</div>
      </div>
      <div class="item-actions">${badgeStatus(c.status)}</div>
    </div>`;
  }).join('');
}