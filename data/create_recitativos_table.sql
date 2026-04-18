-- Script SQL para criar a tabela rjm_recitativos
-- Execute este script no SQL Editor do seu projeto Supabase

CREATE TABLE IF NOT EXISTS public.rjm_recitativos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    data_reuniao TEXT NOT NULL,
    meninas INTEGER DEFAULT 0,
    meninos INTEGER DEFAULT 0,
    mocas INTEGER DEFAULT 0,
    mocos INTEGER DEFAULT 0,
    total_recitativos INTEGER DEFAULT 0,
    total_comparecimento INTEGER DEFAULT 0,
    municipio TEXT,
    comum TEXT,
    auxiliar_id TEXT,
    auxiliar_email TEXT,
    auxiliar_nome TEXT
);

-- Comentário opcional: Políticas de Segurança (RLS)
-- Como o backend usa a SERVICE_ROLE_KEY, ele ignora RLS.
-- Se desejar que os auxiliares vejam apenas seus próprios dados no futuro:
-- ALTER TABLE public.rjm_recitativos ENABLE ROW LEVEL SECURITY;
