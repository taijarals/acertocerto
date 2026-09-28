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
1. **Painel Home (Início)**: Dashboard principal com visão geral do ciclo de estudos e cartões de acesso rápido por disciplina para iniciar simulados direcionados de 5 questões instantaneamente.
2. **Top Bar & Sidebar Navegacionais**: Permitem alternar entre Início, Simulado Ativo, Importador JSON, Estatísticas e Matérias.
3. **Motor de Simulado (Canvas Central)**:
   - Apresentação de questões com metadados estruturados (Banca, Ano, Órgão, Disciplina, Assunto, ID).
   - Seleção interativa de alternativas (A a E) com validação visual imediata.
   - Gabarito Comentado com explicações didáticas e suporte a IA pedagógica (Gemini API).
4. **Gerenciador e Importador de Questões JSON**:
   - Validador de schema universal para importação de pacotes em `.json`.
   - Tabela de visualização e filtros avançados.
5. **Radar e Matriz de Navegação (Coluna Lateral Direita)**:
   - Cronômetro progressivo de rodada.
   - Matriz de navegação rápida do bloco de 5 questões com indicadores visuais de acerto/erro.
6. **Camada de IA (Server-side)**:
   - Rota Express em `server.ts` integrada ao `@google/genai` (`gemini-3.8-flash`) para gerar explicações pedagógicas avançadas e novas questões personalizadas.
