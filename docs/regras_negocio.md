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

## 5. Configurações & Metas Pessoais de Estudo
- O usuário pode acessar a tela de **Configurações** clicando no botão do menu lateral ou no avatar do perfil no topo.
- Na tela de configurações, é possível definir:
  - Metas de questões mínimas por dia.
  - Metas de desafios mínimos por dia.
  - Metas de simulados mínimos por semana.
  - Percentual mínimo de aproveitamento geral desejado.
  - Percentual mínimo de aproveitamento por matéria.
  - Seleção interativa de matérias-alvo (foco do concurso).
- As configurações são salvas com persistência local e confirmação imediata.
