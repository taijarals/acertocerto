# Regras de Negócio - Acerto Certo

1. **Idioma**: Toda a interface (textos, botões, mensagens, notificações) está em português do Brasil.
2. **Autenticação e Permissões**:
   - Dados de desempenho (`desempenho_por_materia`, `habitos_estudo`) e respostas (`respostas_usuario`) são vinculados ao usuário autenticado (`user_id`).
   - Se o usuário não estiver autenticado com o Supabase configurado, é exibida a mensagem: `"Entre na sua conta para ver seu desempenho."`
3. **Métricas de Desempenho Real**:
   - **Seu Retrato por Matéria**: Exibe o status (`solido`, `em_evolucao`, `em_atencao`, `poucos_dados`), domínio, tendência nos últimos 7 dias, ritmo médio formatado (`X min Y seg`), e última prática calculada no fuso `America/Sao_Paulo`.
   - **Quando Você Rende Mais**: Distribuição por período do dia (Madrugada, Manhã, Tarde, Noite), identificação do melhor horário, taxa de recuperação de erros (com limiar mínimo de 5 questões refeitas), e consistência das últimas 6 semanas (com dias ativos e tooltips de período).
4. **Tempo por Questão**:
   - O tempo gasto em cada questão é medido através de `useRef` e armazenado em `tempo_segundos` (limitado a 3600s) na tabela `respostas_usuario`.
5. **Acervo e Planos B**:
   - Quando o Supabase está configurado, o sistema utiliza exclusivamente as funções RPC (`sortear_questoes`, etc.) do banco. O fallback de demonstração (`SAMPLE_RICH_QUESTIONS`) é utilizado exclusivamente quando o Supabase não está configurado.
6. **Otimização de Chamadas RPC**:
   - As chamadas a `opcoes_filtro` são executadas estritamente sob demanda (visibilidade das telas de Configurações ou Simulado Config), unificando anos/disciplinas e evitando laços por matéria (`fetchTargetCounts` em chamada única).
   - A função `resumo_acervo` é invocada exatamente uma vez no carregamento inicial (`hasLoadedResumoRef`).
