# Arquitetura do AcertoCerto Pro

## Identidade Visual e Design System
- O sistema adota a identidade visual oficial **AcertoCerto**, inspirada no ícone da árvore/brotinho de crescimento com folhas verdes, raiz em formato de checkmark e sol amarelo.
- **Paleta de Cores**:
  - **Primária**: Azul Escuro (`#0A2540`) — robustez, autoridade e foco.
  - **Secundária**: Verde (`#00A86B`) — crescimento, acerto e aprovação.
  - **Terciária / Destaque**: Amarelo Ouro (`#FFC107`) — energia e conquistas.
- **Tipografia**: *Plus Jakarta Sans* para títulos e *Inter* para o corpo de texto, garantindo legibilidade e clareza em simulados e relatórios.

## Visão Geral
O **ConcursoQuest Pro** é uma aplicação web moderna desenvolvida em React 19, TypeScript e Tailwind CSS, estruturada como uma Single Page Application (SPA) de alta performance para estudos direcionados a concursos públicos (OAB, Tribunais, Bancas CESGRANRIO, FGV, CEBRASPE, etc.).

## Componentes Principais
1. **Painel Início (Visão Geral)**: Dashboard executivo com quadros de indicadores (KPIs de total de questões, disciplinas, aproveitamento geral), gráfico de evolução geral de desempenho e resumo detalhado por disciplina e assuntos.
2. **Painel Desafios (Ex-Home)**: Tela dedicada à escolha de disciplinas e disparo instantâneo de simulados direcionados de 5 questões.
3. **Top Bar & Sidebar Navegacionais**: Permitem alternar entre Início, Desafios, Simulado, Desempenho e Gestão de Questões (com sub-abas de Auditoria e Importação de JSON).
4. **Motor de Simulado & Tela de Configuração**:
   - Tela de configuração prévia com filtros interdependentes (Disciplina, Assunto, Banca e Ano) com feedback em tempo real da quantidade de questões disponíveis na base.
   - Seleção flexível de quantidade de questões (5, 10, 15 ou 20).
   - Apresentação de questões com metadados estruturados (Banca, Ano, Órgão, Disciplina, Assunto, ID).
   - Seleção interativa de alternativas (A a E) com validação visual imediata e barra de progresso dinâmica.
4. **Área de Gestão & Importação de JSON**:
   - Sub-aba de Auditoria de Questões: monitoramento de pendências, contadores de completude e exclusão/gestão de registros.
   - Sub-aba de Importação de JSON: validador de schema universal para importação em lote de arquivos `.json`.
5. **Radar e Matriz de Navegação (Coluna Lateral Direita)**:
   - Cronômetro progressivo de rodada.
   - Matriz de navegação rápida do bloco de 5 questões com indicadores visuais de acerto/erro.
6. **Camada de IA (Server-side)**:
   - Rota Express em `server.ts` integrada ao `@google/genai` (`gemini-3.8-flash`) para gerar explicações pedagógicas avançadas e novas questões personalizadas.
