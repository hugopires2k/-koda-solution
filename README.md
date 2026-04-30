# 🎓 Koda Solution — Sistema de Gestão de Horas Complementares

> Plataforma web completa para gerenciamento de horas complementares acadêmicas. Alunos enviam certificados, coordenadores aprovam e administradores configuram as regras — tudo online, sem burocracia.

---

## 🌐 Acesse Agora

| | |
|---|---|
| 🖥️ **Sistema (Frontend)** | [magenta-sunburst-e78903.netlify.app](https://magenta-sunburst-e78903.netlify.app) |

| ⚙️ **API (Backend)** | [koda-solution-production.up.railway.app](https://koda-solution-production.up.railway.app) |

O sistema está **100% na nuvem** e funciona 24 horas por dia em qualquer dispositivo com acesso à internet. O frontend (a tela que o usuário vê) está hospedado na **Netlify** e o backend (o servidor e o banco de dados) está hospedado na **Railway**.

---

## 🔐 Credenciais de Acesso

Use os dados abaixo para testar cada perfil do sistema:

| Perfil | E-mail | Senha |
|--------|--------|-------|
| 🛠️ Administrador | admin@koda.com | 123456 |
| 👨‍🏫 Coordenador | joao@koda.com | 123456 |
| 👨‍🎓 Aluno | ana.souza@aluno.br | 123456 |

---

## 👥 O que cada perfil pode fazer

**🛠️ Administrador**
- Cadastrar e remover cursos
- Definir limites de horas por categoria
- Cadastrar e remover coordenadores

**👨‍🏫 Coordenador**
- Ver certificados enviados pelos alunos do seu curso
- Aprovar ou reprovar com observação
- Cadastrar e remover alunos

**👨‍🎓 Aluno**
- Ver painel com progresso de horas por categoria
- Enviar certificados para análise
- Acompanhar o status de cada envio

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5, CSS3, JavaScript puro |

| Backend | Node.js + Express |

| Banco de dados | SQLite (better-sqlite3) |

| Autenticação | JWT (JSON Web Token) |

| Hospedagem frontend | Netlify |

| Hospedagem backend + banco | Railway |

---

## 💻 Como Rodar Localmente

Caso queira rodar o projeto no seu próprio computador:

**1. Clone o repositório**
```bash
git clone https://github.com/hugopires2k/-koda-solution.git
cd koda-solution
```

**2. Configure e inicie o backend**
```bash
cd backend
npm install
node server.js
```

Crie o arquivo `.env` dentro da pasta `backend/`:
```env
JWT_SECRET=koda-solution-secret-2026
PORT=3001
```

**3. Inicie o frontend**

Abra um novo terminal e rode:
```bash
cd frontend
live-server
```

Acesse em: `http://127.0.0.1:8080`

> Na primeira execução o banco de dados é criado automaticamente com dados de exemplo.

---

Desenvolvido por **Hugo Pires** · Koda Solution · Projeto Integrador · 2026