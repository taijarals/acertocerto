# Persistência de Dados - AcertoCerto

## Estratégia de Armazenamento e Supabase
- O aplicativo conecta-se ao banco de dados **Supabase** utilizando o schema dedicado **`acertocerto`** (conforme Regra 6), garantindo que todos os dados relacionais de questões, respostas, simulados, desafios e favoritos fiquem isolados.
- As consultas de carregamento de questões recuperam registros em blocos paginados no schema `acertocerto` para garantir precisão absoluta nos indicadores globais de acervo, disciplinas e questões validadas.
- A importação de JSON valida e persiste os lotes de questões refletindo integralmente o schema JSON oficial do AcertoCerto.
- O script DDL completo para criação do schema e das tabelas está disponível em `/docs/supabase_setup.sql`.
- A autenticação de usuários utiliza o `auth.users` nativo do Supabase com tela dedicada de login e cadastro.
- **Persistência de Rodadas e Desafios**: Ao resolver questões, o app persiste cada resposta individual na tabela `respostas_usuario`. Ao concluir uma rodada de **Desafio** ou **Simulado**, o sistema registra automaticamente a tentativa e os metadados correspondentes nas tabelas `desafios` e `tentativas_desafio` (para desafios) ou `simulados` e `tentativas_simulado` (para simulados).
- Em ambiente offline ou fallback, utiliza-se cache local para resiliência.
- **Métricas Derivadas e Estatísticas (Índice Geral, Projeção, Ofensivas e Gráficos)**: **Não precisam ser armazenadas separadamente em tabelas estáticas no banco de dados.** Elas são calculadas dinamicamente em tempo real no carregamento da aplicação (ou sempre que o histórico de respostas é sincronizado) a partir dos eventos brutos e imutáveis da tabela `respostas_usuario`. Isso garante a integridade como *Single Source of Truth*, evita redundância e elimina o risco de dessincronização (*sync drift*).

## Configurações e Metas Pessoais (`localStorage`)
As preferências de metas pessoais e matérias-alvo do usuário são armazenadas localmente no navegador (`localStorage`) utilizando as seguintes chaves:
- `acertocerto_meta_questoes`: Número mínimo de questões por dia.
- `acertocerto_meta_desafios`: Número mínimo de desafios por dia.
- `acertocerto_meta_simulados`: Número mínimo de simulados por semana.
- `acertocerto_meta_aproveitamento`: Percentual mínimo de aproveitamento geral desejado.
- `acertocerto_meta_aprov_materia`: Percentual mínimo de aproveitamento por matéria.
- `acertocerto_materias_alvo`: Lista em JSON das disciplinas-alvo selecionadas pelo usuário.
- `acertocerto_assuntos_alvo`: Lista em JSON dos assuntos-alvo selecionados pelo usuário.
- `acertocerto_anos_alvo`: Lista em JSON dos anos-alvo selecionados pelo usuário.

## Tabelas no Schema `acertocerto`
1. `acertocerto.questoes`: Armazena o banco de questões estruturado conforme o JSON Schema oficial.
2. `acertocerto.respostas_usuario`: Registra rigorosamente cada resposta dada em qualquer questão respondida no app (alimentando o painel de **Desempenho**).
3. `acertocerto.favoritos`: Caderno de questões favoritas por usuário.
4. `acertocerto.simulados`: Tabela de controle para simulados estruturados (provas simuladas).
5. `acertocerto.tentativas_simulado`: Histórico de execuções e pontuações de simulados por usuário.
6. `acertocerto.desafios`: Tabela de controle para desafios diários e relâmpagos.
7. `acertocerto.tentativas_desafio`: Histórico de conclusão de desafios pelos usuários.
8. `acertocerto.configuracoes_usuario`: Armazena as metas pessoais e preferências de estudo do usuário para sincronização entre diferentes aparelhos e navegadores.
