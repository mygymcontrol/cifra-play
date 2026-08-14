-- Cifra Play - Schema SQL para Supabase
-- Execute no SQL Editor do Supabase Dashboard

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- Cifras table
CREATE TABLE public.cifras (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  content TEXT NOT NULL,
  tom TEXT,
  capo INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  category TEXT
);

-- Setlists table
CREATE TABLE public.setlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Setlist_cifras (junction table)
CREATE TABLE public.setlist_cifras (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setlist_id UUID REFERENCES public.setlists(id) ON DELETE CASCADE NOT NULL,
  cifra_id UUID REFERENCES public.cifras(id) ON DELETE CASCADE NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  custom_tom TEXT
);

-- Repertorio table (synced across devices)
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

-- Indexes
CREATE INDEX idx_cifras_user_id ON public.cifras(user_id);
CREATE INDEX idx_cifras_is_public ON public.cifras(is_public);
CREATE INDEX idx_cifras_title ON public.cifras(title);
CREATE INDEX idx_setlists_user_id ON public.setlists(user_id);
CREATE INDEX idx_setlist_cifras_setlist_id ON public.setlist_cifras(setlist_id);

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cifras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setlist_cifras ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Cifras policies
CREATE POLICY "Public cifras are viewable by everyone" ON public.cifras
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own cifras" ON public.cifras
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cifras" ON public.cifras
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cifras" ON public.cifras
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cifras" ON public.cifras
  FOR DELETE USING (auth.uid() = user_id);

-- Setlists policies
CREATE POLICY "Users can view own setlists" ON public.setlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own setlists" ON public.setlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own setlists" ON public.setlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own setlists" ON public.setlists
  FOR DELETE USING (auth.uid() = user_id);

-- Setlist_cifras policies
CREATE POLICY "Users can manage own setlist cifras" ON public.setlist_cifras
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.setlists
      WHERE id = setlist_cifras.setlist_id
      AND user_id = auth.uid()
    )
  );

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_cifras_updated_at
  BEFORE UPDATE ON public.cifras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_setlists_updated_at
  BEFORE UPDATE ON public.setlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
