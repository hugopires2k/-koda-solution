require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => res.json({ message: 'Koda Solution API - Horas Complementares v1.0' }));

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Koda Solution Backend rodando em http://localhost:${PORT}`);
    console.log(`\n📋 Credenciais de acesso:`);
    console.log(`   Admin:       admin@koda.com    / 123456`);
    console.log(`   Coordenador: joao@koda.com     / 123456`);
    console.log(`   Aluno:       ana.souza@aluno.br / 123456\n`);
  });
}).catch(err => {
  console.error('❌ Erro ao conectar ao banco:', err);
  process.exit(1);
});