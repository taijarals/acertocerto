# Persistência de Dados - AcertoCerto

## Estratégia de Armazenamento e Supabase
- O aplicativo conecta-se ao banco de dados **Supabase** utilizando o schema dedicado **`acertocerto`** (conforme Regra 6), garantindo que todos os dados relacionais de questões, rodadas, histórico de desempenho e favoritos fiquem isolados do schema `public`.
- As consultas de carregamento de questões recuperam até 10.000 registros por chamada (`.limit(10000)`).
- A importação de JSON valida e persiste os lotes de questões refletindo integralmente o schema JSON oficial do AcertoCerto (`id`, `disciplina`, `assunto`, `ano`, `banca`, `prova`, `metadados`, `texto_associado`, `enunciado`, `tipo`, `alternativas`, `alternativa_certa`, `comentario_ia`, `pagina`, `explicacao`).
- O script DDL completo para criação do schema e das tabelas está disponível em `/docs/supabase_setup.sql`.
- A autenticação de usuários utiliza o `auth.users` nativo do Supabase com tela dedicada de login e cadastro (`supabase.auth.signInWithPassword` e `supabase.auth.signUp`), além de suporte a modo convidado/demonstração.
- Em ambiente offline ou fallback, utiliza-se cache local para resiliência.

## Tabelas no Schema `acertocerto`
1. `acertocerto.questoes`: Armazena o banco de questões estruturado conforme o JSON Schema oficial.
2. `acertocerto.rodadas`: Registra as rodadas de simulados iniciadas e concluídas.
3. `acertocerto.respostas_usuario`: Histórico de respostas dadas pelos usuários por questão.
4. `acertocerto.favoritos`: Caderno de questões favoritas por usuário.
