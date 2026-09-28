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
- `id` (UUID, PK)
- `user_id` (UUID, FK reference auth.users)
- `questao_id` (VARCHAR, FK reference acertocerto.questoes)
- `resposta_usuario` (VARCHAR)
- `acertou` (BOOLEAN)
- `created_at` (TIMESTAMP)

### 3. Tabela `acertocerto.favoritos`
- `user_id` (UUID, FK reference auth.users)
- `questao_id` (VARCHAR, FK reference acertocerto.questoes)
- `created_at` (TIMESTAMP)
- PK (`user_id`, `questao_id`)
