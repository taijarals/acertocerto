# Modelo de Dados - AcertoCerto (Schema: acertocerto)

## Tabelas PostgreSQL (Schema: `acertocerto`)

### 1. Tabela `acertocerto.questoes`
Reflete rigorosamente o schema JSON oficial de lote de questões do AcertoCerto:
- `id` (VARCHAR, PK)
- `disciplina` (VARCHAR, NULLABLE)
- `assunto` (VARCHAR)
- `ano` (VARCHAR, NULLABLE)
- `banca` (VARCHAR, NULLABLE)
- `prova` (VARCHAR, NULLABLE)
- `metadados` (VARCHAR, NULLABLE)
- `texto_associado` (TEXT, NULLABLE)
- `enunciado` (TEXT, NULLABLE)
- `tipo` (VARCHAR) - Valor padrão: 'multipla_escolha'
- `alternativas` (JSONB) - Array com exatamente 5 alternativas [{letra, texto}]
- `alternativa_certa` (VARCHAR) - Enum: 'A', 'B', 'C', 'D', 'E'
- `comentario_ia` (TEXT, NULLABLE)
- `pagina` (INTEGER)
- `explicacao` (JSONB, NULLABLE) - Contém status, resumo e alternativas com justificativa detalhada por letra.
- `created_at` (TIMESTAMP)

### 2. Tabela `acertocerto.respostas_usuario`
Registra cada resposta dada pelo usuário em qualquer questão respondida no app (essencial para o painel de Desempenho e relatórios estatísticos):
- `id` (UUID, PK)
- `user_id` (UUID, FK reference auth.users)
- `questao_id` (VARCHAR, FK reference acertocerto.questoes)
- `resposta_usuario` (VARCHAR)
- `acertou` (BOOLEAN)
- `created_at` (TIMESTAMP)

### 3. Tabela `acertocerto.favoritos`
Caderno de questões favoritas por usuário:
- `user_id` (UUID, FK reference auth.users)
- `questao_id` (VARCHAR, FK reference acertocerto.questoes)
- `created_at` (TIMESTAMP)
- PK (`user_id`, `questao_id`)

### 4. Tabela `acertocerto.simulados`
Tabela de controle para simulados estruturados (provas simuladas configuradas):
- `id` (UUID, PK)
- `titulo` (VARCHAR)
- `descricao` (TEXT, NULLABLE)
- `tempo_limite_minutos` (INTEGER)
- `quantidade_questoes` (INTEGER)
- `configuracao` (JSONB, NULLABLE)
- `created_at` (TIMESTAMP)

### 5. Tabela `acertocerto.tentativas_simulado`
Histórico de execuções de simulados por usuário:
- `id` (UUID, PK)
- `user_id` (UUID)
- `simulado_id` (UUID, FK reference acertocerto.simulados)
- `status` (VARCHAR) - 'em_andamento', 'concluido', 'abandonado'
- `acertos` (INTEGER)
- `total_questoes` (INTEGER)
- `tempo_gasto_segundos` (INTEGER)
- `respostas` (JSONB)
- `started_at` (TIMESTAMP)
- `finished_at` (TIMESTAMP)

### 6. Tabela `acertocerto.desafios`
Tabela de controle para desafios diários e relâmpagos:
- `id` (UUID, PK)
- `titulo` (VARCHAR)
- `descricao` (TEXT, NULLABLE)
- `tipo` (VARCHAR) - 'diario', 'relampago', 'personalizado'
- `questoes_ids` (JSONB)
- `created_at` (TIMESTAMP)

### 7. Tabela `acertocerto.tentativas_desafio`
Histórico de conclusão de desafios pelos usuários:
- `id` (UUID, PK)
- `user_id` (UUID)
- `desafio_id` (UUID, FK reference acertocerto.desafios)
- `acertos` (INTEGER)
- `total_questoes` (INTEGER)
- `tempo_gasto_segundos` (INTEGER)
- `concluido` (BOOLEAN)
- `created_at` (TIMESTAMP)

### 8. Tabela `acertocerto.configuracoes_usuario`
Configurações, metas e alvos de estudo do usuário:
- `user_id` (UUID, PK)
- `meta_questoes` (INTEGER)
- `meta_desafios` (INTEGER)
- `meta_simulados` (INTEGER)
- `meta_aproveitamento` (NUMERIC)
- `meta_aprov_materia` (NUMERIC)
- `materias_alvo` (JSONB) - Array de strings com as disciplinas focadas
- `assuntos_alvo` (JSONB) - Array de strings com os assuntos focados
- `anos_alvo` (JSONB) - Array de strings com os anos-alvo focados
- `updated_at` (TIMESTAMP)
