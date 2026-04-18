-- DROP TABLES para garantir que o novo esquema seja aplicado (Use com cautela se já houver dados)
DROP TABLE IF EXISTS public.rjm_auxiliares CASCADE;
DROP TABLE IF EXISTS public.rjm_comuns CASCADE;

-- Tabela de Comuns (Congregações)
CREATE TABLE IF NOT EXISTS public.rjm_comuns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comum TEXT NOT NULL UNIQUE,   -- Antigo 'nome'
    cidade TEXT NOT NULL,         -- Antigo 'municipio'
    cooperador_jovens TEXT,       -- Campo novo
    telefone TEXT,                -- Campo novo
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Auxiliares (Perfis de Usuário)
CREATE TABLE IF NOT EXISTS public.rjm_auxiliares (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    comum TEXT NOT NULL,
    cidade TEXT NOT NULL,         -- Antigo 'municipio'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dados Iniciais para Itapevi (Atualizados)
INSERT INTO public.rjm_comuns (comum, cidade) VALUES
('Amador Bueno', 'Itapevi'),
('Bela Vista', 'Itapevi'),
('Centro', 'Itapevi'),
('Cohab', 'Itapevi'),
('Vila Aurora', 'Itapevi'),
('Vila Santa Rita', 'Itapevi')
ON CONFLICT (comum) DO NOTHING;

-- Habilitar RLS (Segurança)
ALTER TABLE public.rjm_comuns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rjm_auxiliares ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso simples (leitura para todos autenticados)
CREATE POLICY "Leitura de comuns para todos" ON public.rjm_comuns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Leitura do próprio perfil" ON public.rjm_auxiliares FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Inserção do próprio perfil" ON public.rjm_auxiliares FOR INSERT WITH CHECK (auth.uid() = id);
