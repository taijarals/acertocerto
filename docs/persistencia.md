# Persistência de Dados - Acerto Certo

1. **Schema Supabase**: Todos os dados persistidos vivem no schema **`acertocerto`** do Supabase.
2. **Armazenamento de Questões e Respostas**:
   - As questões cadastradas ou importadas são salvas na tabela `acertocerto.questoes` (e opcionalmente sincronizadas via API Express local em ambiente de desenvolvimento sem Supabase).
   - As respostas dos usuários são registradas em `acertocerto.respostas_usuario` contendo `user_id`, `questao_id`, `resposta_usuario`, `acertou`, `tempo_segundos` e `created_at`.
3. **Fallback local**: Em ambiente sem Supabase configurado (`isSupabaseConfigured() === false`), o app utiliza armazenamento local (`localStorage` / arquivo JSON local) para fins de demonstração.
