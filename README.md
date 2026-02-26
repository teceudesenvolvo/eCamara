Projeto: Camara AI
Descrição: Plataforma de governança legislativa 4.0 que automatiza a criação de leis, gere o fluxo de tramitação e promove a participação cidadã direta, integrando IA generativa e assinaturas digitais de ponta a ponta.

🏗️ Arquitetura Técnica
Base Legada: Inspirado no projeto eCamara (PHP/Laravel).

Backend (API): Firebase (Cloud Functions em Node.js) + Laravel 11 (Headless para regras complexas e auditoria SQL).

Frontend Web: React-Dom (Vite) para administração e redação técnica.

Frontend Mobile: React Native (Expo) para vereadores e cidadãos.

Banco de Dados: Híbrido (Firestore para Real-time/NoSQL e PostgreSQL para registros jurídicos).

IA: Google Gemini 1.5 Pro / GPT-4o integrado via LangChain para análise vetorial (RAG) da Lei Orgânica e Regimentos.

🚀 Funcionalidades Chave
Copilot Legislativo: Escrita assistida de Projetos de Lei e Requerimentos seguindo a LC 95/98 e normas técnicas.

Assinatura Ponta a Ponta: Integração com ICP-Brasil (Certificado em Nuvem) para vereadores e Gov.br (Prata/Ouro) para cidadãos.

IA para o Cidadão ("Entenda a Lei"): Chatbot RAG que traduz o "juridiquês" e explica impactos locais de cada projeto.

Participação Popular: Feed estilo social para votação consultiva e proposição de ideias legislativas.

Workflow de Sanção/Veto: Ponte digital direta entre o Legislativo e o Executivo (Prefeitura).

🛠️ Stack de Desenvolvimento
Linguagens: TypeScript (Frontend/Functions), PHP (Core Legislativo).

Estilização: Tailwind CSS (Web) e NativeWind (Mobile).

Segurança: Autenticação via Firebase Auth + Custom Provider Gov.br.

Infra: Google Cloud Platform / Firebase.