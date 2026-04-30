🎓 Koda Solution — Gestão de Horas Complementares
Plataforma web para envio e aprovação de horas complementares acadêmicas, com três perfis de acesso: Administrador, Coordenador e Aluno.

🌐 Acesse o Sistema
O queLink🖥️ Frontend (interface do usuário)magenta-sunburst-e78903.netlify.app⚙️ Backend (API)koda-solution-production.up.railway.app

O frontend está hospedado na Netlify e o backend com o banco de dados está hospedado na Railway. Ambos funcionam 24 horas por dia na nuvem, sem precisar de nenhum computador ligado.


🔐 Credenciais de Acesso
PerfilE-mailSenhaAdministradoradmin@koda.com123456Coordenadorjoao@koda.com123456Alunoana.souza@aluno.br123456

💡 Como Funciona

O aluno envia certificados de atividades complementares pelo sistema
O coordenador analisa e aprova ou reprova cada certificado
O administrador gerencia os cursos, coordenadores e regras de horas


🛠️ Tecnologias Usadas
CamadaTecnologiaFrontendHTML5, CSS3, JavaScriptBackendNode.js + ExpressBanco de dadosSQLiteAutenticaçãoJWTHospedagem frontendNetlifyHospedagem backendRailway

💻 Como Rodar Localmente
Caso queira rodar o projeto no seu próprio computador:
Backend
bashcd backend
npm install
node server.js
Crie o arquivo .env na pasta backend/:
envJWT_SECRET=koda-solution-secret-2026
PORT=3001
Frontend
bashcd frontend
live-server
Acesse em: http://127.0.0.1:8080

Desenvolvido por Hugo Pires / Isack Otavio / Israel Soares / Pedro Lucas / Rafael Barbosa / Zaion Kauan · Koda Solution · 2026
