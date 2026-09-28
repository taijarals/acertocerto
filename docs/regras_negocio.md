# Regras de Negócio - ConcursoQuest Pro

## 1. Ciclos, Rodadas e Home por Disciplinas
- O **Painel Home** exibe cartões interativos para cada disciplina (ex: Direito Administrativo, Direito Constitucional, Direito Tributário, Língua Portuguesa, Raciocínio Lógico).
- Ao clicar em uma disciplina no painel Home, o sistema filtra ou gera instantaneamente um simulado direcionado de **5 questões** daquela matéria.
- As rodadas padrão contêm **5 questões** para otimizar o tempo de estudo e retenção de memória (*micro-learning*).
- O usuário pode navegar livremente entre as questões do bloco atual através da matriz numérica na barra lateral direita.
- Cada questão respondida é imediatamente validada contra o gabarito oficial.

## 2. Conteúdo Gerado por IA
- **Regra 4**: Todo conteúdo gerado por Inteligência Artificial (questões geradas sob demanda ou comentários aprofundados) deve obrigatoriamente possuir o campo `source: 'ai_generated'` (ou `ia: true`) e ser claramente sinalizado na interface para o usuário, diferenciando-o de questões oficiais de bancas examinadoras.

## 3. Importação de JSON em Lote
- O sistema aceita a importação simultânea de **múltiplos arquivos `.json`** estruturados conforme o Schema Universal AcertoCerto.
- O leitor e validador processa todos os arquivos selecionados em lote, acumulando as questões na pré-visualização do acervo para auditoria e submissão unificada ao banco de dados.

## 4. Métricas e Desempenho
- O sistema calcula o índice de acerto em tempo real para cada rodada ativa, bem como o tempo médio por questão.
