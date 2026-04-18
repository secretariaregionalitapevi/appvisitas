-- SQL script to update rjm_recitativos table
-- Execute this in the Supabase SQL Editor

ALTER TABLE public.rjm_recitativos 
ADD COLUMN IF NOT EXISTS total_recitativos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comparecimento INTEGER DEFAULT 0;

-- Comment out the following if you don't want to update existing records
-- UPDATE public.rjm_recitativos 
-- SET total_recitativos = COALESCE(meninas, 0) + COALESCE(meninos, 0) + COALESCE(mocas, 0) + COALESCE(mocos, 0)
-- WHERE total_recitativos = 0;
