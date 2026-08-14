-- Migration: Criar tabela repertorio_items
-- Execute no SQL Editor do Supabase Dashboard

CREATE TABLE public.repertorio_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cifra_id UUID REFERENCES public.cifras(id) ON DELETE CASCADE NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  custom_tom TEXT,
  custom_content TEXT,
  section_repeats JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_repertorio_items_user_id ON public.repertorio_items(user_id);

ALTER TABLE public.repertorio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own repertorio" ON public.repertorio_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own repertorio" ON public.repertorio_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own repertorio" ON public.repertorio_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own repertorio" ON public.repertorio_items
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_repertorio_items_updated_at
  BEFORE UPDATE ON public.repertorio_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
