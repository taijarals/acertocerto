# Modelo de Dados - Acerto Certo

O banco de dados PostgreSQL no Supabase utiliza o schema dedicado **`acertocerto`**.

## Tabelas Principais

1. **`questoes`**
   - Armazena o acervo oficial de questões.
   - Campos: `id`, `disciplina`, `assunto`, `banca`, `ano`, `prova`, `enunciado`, `alternativas` (JSONB), `alternativa_certa`, `comentario_ia`, `valida` (boolean), `pendencias` (text[]), `created_at`.

2. **`respostas_usuario`**
   - Registra cada resposta enviada pelo usuário.
   - Campos: `id`, `user_id`, `questao_id`, `resposta_usuario`, `acertou`, `tempo_segundos`, `created_at`.

3. **`marcacoes_revisao`**
   - Armazena questões marcadas pelo usuário para revisão posterior (com motivo e observação).
   - Campos: `user_id`, `questao_id`, `motivo` ('duvida', 'memorizar', 'suspeita_erro' ou null), `observacao` (máx. 500 chars), `created_at`, `updated_at`.

4. **`simulados`** & **`tentativas_simulado`**
   - Armazena configurações de simulados e histórico de tentativas e pontuações dos usuários.

## Funções RPC (Remote Procedure Calls)

- `sortear_questoes(p_disciplinas, p_assuntos, p_bancas, p_anos, p_limite)`: Sorteia questões filtradas do acervo.
- `resumo_acervo()`: Retorna estatísticas gerais e por disciplina do acervo.
- `opcoes_filtro(...)`: Retorna opções disponíveis de filtros com base nos critérios selecionados.
- `desempenho_por_materia()`: Retorna métricas consolidadas por disciplina para o usuário logado (respostas, acertos, aproveitamento, tendência, status, ritmo médio, última prática).
- `habitos_estudo()`: Retorna hábitos de estudo do usuário (distribuição por período do dia, melhor período, taxa de recuperação de erros e consistência nas últimas 6 semanas).
- `admin_visao_geral()`: Retorna visão geral de KPIs administrativos e série de 30 dias de respostas.
- `admin_alunos()`: Retorna listagem e métricas de todos os alunos cadastrados para o painel admin.
- `admin_aluno_detalhe(p_user_id)`: Retorna detalhes de desempenho de um aluno específico (por disciplina, série de 30 dias e últimas respostas).
- `admin_questoes_criticas(p_min_respostas, p_limite)`: Retorna questões com alta taxa de erro ou suspeitas de erro.
