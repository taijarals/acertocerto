-- =====================================================================
-- AcertoCerto - Script SQL de Configuração do Supabase (Schema: acertocerto)
-- Cole este script no SQL Editor do seu projeto Supabase para criar
-- a estrutura de banco de dados compatível com o Schema JSON oficial.
-- =====================================================================

-- 1. Criar o schema dedicado
CREATE SCHEMA IF NOT EXISTS acertocerto;

-- 2. Conceder permissões para os papéis padrão do Supabase no schema
GRANT USAGE ON SCHEMA acertocerto TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA acertocerto TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA acertocerto GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 3. Criar a tabela de questões
CREATE TABLE IF NOT EXISTS acertocerto.questoes (
    id VARCHAR PRIMARY KEY,
    disciplina VARCHAR,
    assunto VARCHAR NOT NULL,
    ano VARCHAR,
    banca VARCHAR,
    prova VARCHAR,
    metadados VARCHAR,
    texto_associado TEXT,
    enunciado TEXT,
    tipo VARCHAR DEFAULT 'multipla_escolha',
    alternativas JSONB NOT NULL,
    alternativa_certa VARCHAR(1) NOT NULL,
    comentario_ia TEXT,
    pagina INTEGER DEFAULT 1,
    explicacao JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Criar a tabela de respostas dos usuários
CREATE TABLE IF NOT EXISTS acertocerto.respostas_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    questao_id VARCHAR REFERENCES acertocerto.questoes(id) ON DELETE CASCADE,
    resposta_usuario VARCHAR(1),
    acertou BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Criar a tabela de favoritos
CREATE TABLE IF NOT EXISTS acertocerto.favoritos (
    user_id UUID,
    questao_id VARCHAR REFERENCES acertocerto.questoes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, questao_id)
);

-- 6. Habilitar RLS (Row Level Security) opcionalmente nas tabelas de usuário
ALTER TABLE acertocerto.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE acertocerto.respostas_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE acertocerto.favoritos ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de acesso de leitura pública para questões (qualquer usuário autenticado ou anônimo pode ler as questões)
CREATE POLICY "Permitir leitura de questões para todos" ON acertocerto.questoes
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de questões" ON acertocerto.questoes
    FOR INSERT WITH CHECK (true);
