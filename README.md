# 🎓 Koda Solution — Sistema de Gestão de Horas Complementares

## Estrutura do Projeto

```
koda-solution/
├── backend/        → API REST com Node.js + Express
│   ├── server.js   → Ponto de entrada
│   ├── routes.js   → Todas as rotas da API
│   ├── db.js       → Banco de dados em memória (dados de exemplo)
│   └── middleware.js → Autenticação JWT
│
└── frontend/
    └── index.html  → Aplicação completa (SPA)
```

---

## Como Rodar

### 1. Backend
```bash
cd backend
npm install
node server.js
```
API disponível em: `http://localhost:3001`

### 2. Frontend
Abra o arquivo `frontend/index.html` no navegador.
> Ou use Live Server no VS Code para melhor experiência.

---

## Credenciais de Acesso

| Perfil        | E-mail                  | Senha  |
|---------------|-------------------------|--------|
| Administrador | admin@koda.com          | 123456 |
| Coordenador   | joao@koda.com           | 123456 |
| Coordenador   | maria@koda.com          | 123456 |
| Aluno         | ana.souza@aluno.br      | 123456 |
| Aluno         | pedro.lima@aluno.br     | 123456 |

---

## Funcionalidades por Perfil

### Administrador
- Cadastrar e remover cursos
- Definir regras por categoria (limite de horas)
- Cadastrar e remover coordenadores

### Coordenador
- Ver e analisar certificados pendentes dos seus alunos
- Aprovar ou reprovar com observação
- Cadastrar e remover alunos do seu curso

### Aluno
- Painel com progresso de horas por categoria
- Enviar certificados para análise
- Acompanhar status de cada envio

---

## Stack

- **Backend:** Node.js, Express, JWT, UUID
- **Frontend:** HTML5, CSS3, JavaScript puro (sem frameworks)
- **Auth:** JWT Bearer Token
- **Dados:** In-memory (sem banco de dados externo)

---

Koda Solution · Projeto Integrador · 2026
