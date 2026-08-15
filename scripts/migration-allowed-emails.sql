-- Migration: Criar tabela allowed_emails e inserir membros autorizados
-- Execute no SQL Editor do Supabase Dashboard

CREATE TABLE public.allowed_emails (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT
);

ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem gerenciar (ou via SQL direto)
CREATE POLICY "Anyone can check if email is allowed" ON public.allowed_emails
  FOR SELECT USING (true);

-- Inserir membros autorizados
INSERT INTO public.allowed_emails (email, name) VALUES
  ('covalsqui.arrabal@gmail.com', 'Covalsqui Arrabal'),
  ('luiseduardomartins@outlook.com.br', 'Eduardo Martins'),
  ('ericamariaa704@gmail.com', 'Érica Alencar'),
  ('francielimorais07@gmail.com', 'Francieli Morais'),
  ('josevitormoreno06@gmail.com', 'José Vitor Moreno'),
  ('leticiasantos.arch@gmail.com', 'Letícia de Souza Santos'),
  ('lmonsani60@gmail.com', 'Lucas Monsani'),
  ('mahgarcia@hotmail.com', 'Maiara Garcia'),
  ('maiconosorio01@gmail.com', 'Maicon Osório'),
  ('lunamateus999@gmail.com', 'Mateus Luna'),
  ('matheus_st.pauli@hotmail.com', 'Matheus Almeida'),
  ('mvitoriapfagundes@icloud.com', 'Mavi Vitória'),
  ('mii.muniz00@gmail.com', 'Michele Santos'),
  ('moisesmartins000@gmail.com', 'Moisés Martins'),
  ('nickynunes0812@outlook.com', 'Nicole Nunes'),
  ('santosranielly485@gmail.com', 'Ranielly Santos'),
  ('rlibraiz@hotmail.com', 'Ricardo Libraiz'),
  ('tatiane.arrabal@gmail.com', 'Tatiane Freitas Arrabal');
