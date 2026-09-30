-- =====================================================================
-- AcertoCerto - Script SQL de Configuração do Supabase (Schema: acertocerto)
-- Cole este script no SQL Editor do seu projeto Supabase para criar
-- a estrutura completa de banco de dados (Questões, Respostas, Favoritos, Simulados e Desafios).
-- =====================================================================

-- 1. Criar o schema dedicado
CREATE SCHEMA IF NOT EXISTS acertocerto;

-- 2. Conceder permissões para os papéis padrão do Supabase no schema
GRANT USAGE ON SCHEMA acertocerto TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA acertocerto TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA acertocerto GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 3. Tabela de Questões
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

-- 4. Tabela de Respostas dos Usuários (Preenchida a cada resposta de questão no app)
CREATE TABLE IF NOT EXISTS acertocerto.respostas_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    questao_id VARCHAR REFERENCES acertocerto.questoes(id) ON DELETE CASCADE,
    resposta_usuario VARCHAR(1),
    acertou BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Favoritos
CREATE TABLE IF NOT EXISTS acertocerto.favoritos (
    user_id UUID,
    questao_id VARCHAR REFERENCES acertocerto.questoes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, questao_id)
);

-- 6. Tabela de Controle de Simulados (Simulados estruturados)
CREATE TABLE IF NOT EXISTS acertocerto.simulados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR NOT NULL,
    descricao TEXT,
    tempo_limite_minutos INTEGER DEFAULT 60,
    quantidade_questoes INTEGER DEFAULT 10,
    configuracao JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabela de Tentativas de Simulados (Histórico de simulados do usuário)
CREATE TABLE IF NOT EXISTS acertocerto.tentativas_simulado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    simulado_id UUID REFERENCES acertocerto.simulados(id) ON DELETE CASCADE,
    status VARCHAR DEFAULT 'concluido', -- 'em_andamento', 'concluido', 'abandonado'
    acertos INTEGER DEFAULT 0,
    total_questoes INTEGER DEFAULT 0,
    tempo_gasto_segundos INTEGER DEFAULT 0,
    respostas JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabela de Controle de Desafios
CREATE TABLE IF NOT EXISTS acertocerto.desafios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR NOT NULL,
    descricao TEXT,
    tipo VARCHAR DEFAULT 'diario', -- 'diario', 'relampago', 'personalizado'
    questoes_ids JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Tabela de Tentativas de Desafios
CREATE TABLE IF NOT EXISTS acertocerto.tentativas_desafio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    desafio_id UUID REFERENCES acertocerto.desafios(id) ON DELETE CASCADE,
    acertos INTEGER DEFAULT 0,
    total_questoes INTEGER DEFAULT 0,
    tempo_gasto_segundos INTEGER DEFAULT 0,
    concluido BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tabela de Configurações e Metas do Usuário
CREATE TABLE IF NOT EXISTS acertocerto.configuracoes_usuario (
    user_id UUID PRIMARY KEY,
    meta_questoes INTEGER DEFAULT 20,
    meta_desafios INTEGER DEFAULT 2,
    meta_simulados INTEGER DEFAULT 1,
    meta_aproveitamento NUMERIC DEFAULT 70,
    meta_aprov_materia NUMERIC DEFAULT 65,
    materias_alvo JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Habilitar RLS (Row Level Security) nas tabelas
ALTER TABLE acertocerto.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE acertocerto.respostas_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE acertocerto.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE acertocerto.simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE acertocerto.tentativas_simulado ENABLE ROW LEVEL SECURITY;
ALTER TABLE acertocerto.desafios ENABLE ROW LEVEL SECURITY;
ALTER TABLE acertocerto.tentativas_desafio ENABLE ROW LEVEL SECURITY;
ALTER TABLE acertocerto.configuracoes_usuario ENABLE ROW LEVEL SECURITY;

-- 12. Políticas de Acesso
CREATE POLICY "Permitir leitura de questões para todos" ON acertocerto.questoes FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de questões" ON acertocerto.questoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir gestão de respostas do próprio usuário" ON acertocerto.respostas_usuario FOR ALL USING (true);
CREATE POLICY "Permitir gestão de favoritos do próprio usuário" ON acertocerto.favoritos FOR ALL USING (true);
CREATE POLICY "Permitir gestão de simulados" ON acertocerto.simulados FOR ALL USING (true);
CREATE POLICY "Permitir gestão de tentativas de simulado" ON acertocerto.tentativas_simulado FOR ALL USING (true);
CREATE POLICY "Permitir gestão de desafios" ON acertocerto.desafios FOR ALL USING (true);
CREATE POLICY "Permitir gestão de tentativas de desafio" ON acertocerto.tentativas_desafio FOR ALL USING (true);
CREATE POLICY "Permitir gestão de configurações do usuário" ON acertocerto.configuracoes_usuario FOR ALL USING (true);
