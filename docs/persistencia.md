# Persistência de Dados - AcertoCerto

## Estratégia de Armazenamento e Supabase
- O aplicativo conecta-se ao banco de dados **Supabase** utilizando o schema dedicado **`acertocerto`** (conforme Regra 6), garantindo que todos os dados relacionais de questões, respostas, simulados, desafios e favoritos fiquem isolados do schema `public`.
- As consultas de carregamento de questões recuperam registros no schema `acertocerto`.
- A importação de JSON valida e persiste os lotes de questões refletindo integralmente o schema JSON oficial do AcertoCerto.
- O script DDL completo para criação do schema e das tabelas está disponível em `/docs/supabase_setup.sql`.
- A autenticação de usuários utiliza o `auth.users` nativo do Supabase com tela dedicada de login e cadastro.
- **Persistência de Rodadas e Desafios**: Ao resolver questões, o app persiste cada resposta individual na tabela `respostas_usuario`. Ao concluir uma rodada de **Desafio** ou **Simulado**, o sistema registra automaticamente a tentativa e os metadados correspondentes nas tabelas `desafios` e `tentativas_desafio` (para desafios) ou `simulados` e `tentativas_simulado` (para simulados).
- Em ambiente offline ou fallback, utiliza-se cache local para resiliência.

## Tabelas no Schema `acertocerto`
1. `acertocerto.questoes`: Armazena o banco de questões estruturado conforme o JSON Schema oficial.
2. `acertocerto.respostas_usuario`: Registra rigorosamente cada resposta dada em qualquer questão respondida no app (alimentando o painel de **Desempenho**).
3. `acertocerto.favoritos`: Caderno de questões favoritas por usuário.
4. `acertocerto.simulados`: Tabela de controle para simulados estruturados (provas simuladas).
5. `acertocerto.tentativas_simulado`: Histórico de execuções e pontuações de simulados por usuário.
6. `acertocerto.desafios`: Tabela de controle para desafios diários e relâmpagos.
7. `acertocerto.tentativas_desafio`: Histórico de conclusão de desafios pelos usuários.
