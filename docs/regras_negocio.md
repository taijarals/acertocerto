# Regras de Negócio - ConcursoQuest Pro

## 1. Ciclos, Rodadas e Home por Disciplinas
- O **Painel Home** exibe cartões interativos para cada disciplina (ex: Direito Administrativo, Direito Constitucional, Direito Tributário, Língua Portuguesa, Raciocínio Lógico).
- Ao clicar em uma disciplina no painel Home, o sistema filtra ou gera instantaneamente um simulado direcionado de **5 questões** daquela matéria.
- As rodadas padrão contêm **5 questões** para otimizar o tempo de estudo e retenção de memória (*micro-learning*).
- O usuário pode navegar livremente entre as questões do bloco atual através da matriz numérica na barra lateral direita.
- Cada questão respondida é imediatamente validada contra o gabarito oficial.

## 2. Conteúdo Gerado por IA
- **Regra 4**: Todo conteúdo gerado por Inteligência Artificial (questões geradas sob demanda ou comentários aprofundados) deve obrigatoriamente possuir o campo `source: 'ai_generated'` (ou `ia: true`) e ser claramente sinalizado na interface para o usuário, diferenciando-o de questões oficiais de bancas examinadoras.

## 3. Área de Gestão Unificada (Auditoria & Importação de JSON)
- A área de gestão foi dividida em duas sub-abas internas: **Auditoria de Questões** (para monitorar pendências, preenchimento e gerenciar/excluir registros da base) e **Importação de JSON** (para importação em lote de arquivos `.json` estruturados).
- O antigo item de menu principal para importador JSON foi removido dos menus principais (barra de navegação superior, menu lateral e rodapé móvel), centralizando as operações de importação dentro da aba de **Gestão**.
- O sistema aceita a importação simultânea de **múltiplos arquivos `.json`** estruturados conforme o Schema Universal AcertoCerto.

## 4. Métricas e Desempenho
- O sistema calcula o índice de acerto em tempo real para cada rodada ativa, bem como o tempo médio por questão.
- Os gráficos de desempenho (Gráfico de Evolução Geral no Início e Evolução Diária na aba Desempenho) refletem o histórico real de respostas (`respostas_usuario`), tentativas de simulados (`tentativas_simulado`) e tentativas de desafios (`tentativas_desafio`) obtidos diretamente do Supabase.
- O gráfico de evolução semanal exibe as colunas: **Sem 1**, **Sem 2**, **Sem 3**, **Sem 4** (períodos de 7 dias retroativos) e **Hoje** (desempenho exclusivo das questões resolvidas no dia corrente).
- O widget **"Hoje"** no topo da aba Desempenho calcula em tempo real o total de questões resolvidas no dia, o tempo estimado de estudo, a comparação percentual/quantitativa em relação à média dos últimos 7 dias, a sequência atual de dias de estudo (*streak*) e o recorde histórico de dias consecutivos.
- A seção **"Seu Índice Geral"** calcula dinamicamente com base no histórico real do Supabase:
  - **Acerto**: Percentual geral de acertos nas respostas registradas.
  - **Consistência**: Percentual de dias ativos com resolução de questões nos últimos 7 dias.
  - **Evolução**: Taxa de progresso comparando o desempenho recente (Semana 4) com períodos anteriores.
  - **Índice Geral e Badge**: Média ponderada dos fatores (Acerto 40%, Consistência 30%, Evolução 30%) com status dinâmico (`INICIAL`, `EM EVOLUÇÃO`, `NO CAMINHO`, `EXCELENTE`).
- A seção **"Projeção de Desempenho"** utiliza análise algorítmica baseada em regras determinísticas (sem consumo de tokens de IA), avaliando o volume total de questões resolvidas e o índice geral para categorizar o nível de prontidão em faixas: *Análise Inicial*, *Fase de Base*, *Curva de Crescimento*, *Em Ritmo de Aprovação* e *Nível Avançado*.
- **Variável de Manutenção ("Ofensivas" e Decaimento)**:
  - **Bônus de Ofensiva**: Cada dia consecutivo estudando (*streak*) concede um bônus de estabilidade de até +10 pontos no índice geral.
  - **Decaimento por Inatividade**: Caso o aluno fique 2 dias ou mais sem resolver questões (sem defender o nível), o sistema aplica uma taxa de decaimento proporcional (-5 pontos por dia de inatividade), simulando a perda de ritmo.
- **Popup de Regras & Manutenção**: Ao clicar no cartão de Projeção de Desempenho, abre-se um modal explicativo detalhando a composição do índice, as regras de ofensivas/decaimento e as faixas de prontidão.

## 5. Configurações & Metas Pessoais de Estudo
- O usuário pode acessar a tela de **Configurações** clicando no botão do menu lateral ou no avatar do perfil no topo.
- Na tela de configurações, é possível definir:
  - Metas de questões mínimas por dia.
  - Metas de desafios mínimos por dia.
  - Metas de simulados mínimos por semana.
  - Percentual mínimo de aproveitamento geral desejado.
  - Percentual mínimo de aproveitamento por matéria.
  - **Seleção de Anos-Alvo (Foco por Ano)**: Posicionada antes da seleção de matérias-alvo. Permite escolher anos específicos de provas/questões com suporte a busca textual, restringindo dinamicamente as disciplinas e assuntos disponíveis.
  - Seleção interativa de matérias-alvo (foco do concurso), com filtro de busca textual.
  - **Seleção de Assuntos-Alvo (Foco Específico)**: Exibida condicionalmente **após** a seleção de matérias-alvo. Os assuntos disponíveis são filtrados automaticamente a partir do acervo de questões das matérias e anos selecionados, com suporte a busca textual por palavra-chave.
- As configurações são salvas com persistência local e confirmação imediata.

## 6. Sessão "Ofensivas" (Unificação de Prática, Simulados e Treino Focado)
- A sessão unificada **Ofensivas** agrupa em sub-abas internas: **Desafios**, **Simulados** e **Desafio Focado**.
- **Validação de Configuração Obrigatória**: Se o usuário não tiver definido ao menos um **Ano-Alvo** e uma **Matéria-Alvo** nas configurações, a sessão de Ofensivas exibe um aviso restritivo orientando o usuário a ir até as **Configurações** para definir seu foco de estudo, ocultando o conteúdo prático.
- **Desafio Focado**: Modalidade de treino direcionada baseada nos filtros exatos configurados (anos, disciplinas e assuntos-alvo), permitindo tanto rodadas gerais quanto foco por matéria específica.
