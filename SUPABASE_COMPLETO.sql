-- ============================================
-- ANJO DA GUARDA - SUPABASE COMPLETO
-- Execute este SQL no SQL Editor do Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- DEVICES TABLE
-- ============================================
CREATE TABLE public.devices (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('phone', 'pc', 'tablet')),
  is_third_party boolean DEFAULT false,
  third_party_email text,
  records_password text,
  recording_time_limit integer DEFAULT 1 CHECK (recording_time_limit >= 1 AND recording_time_limit <= 60),
  status text DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  last_seen timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices"
  ON public.devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
  ON public.devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
  ON public.devices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON public.devices FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RECORDINGS TABLE
-- ============================================
CREATE TABLE public.recordings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id uuid REFERENCES public.devices ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('video', 'audio', 'location', 'panic')),
  file_path text,
  location_data jsonb,
  duration integer,
  size bigint,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_downloaded boolean DEFAULT false
);

ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recordings"
  ON public.recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings"
  ON public.recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings"
  ON public.recordings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
  ON public.recordings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE public.subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  plan_type text DEFAULT 'free_trial' CHECK (plan_type IN ('free_trial', 'monthly')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger para criar trial gratuito de 3 dias automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_type, status, started_at, expires_at)
  VALUES (
    new.id, 
    'free_trial', 
    'active', 
    now(), 
    now() + interval '3 days'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_subscription();

-- ============================================
-- STORAGE BUCKET FOR RECORDINGS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recordings' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'recordings' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own recordings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'recordings' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own recordings"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'recordings' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- VERIFICAÇÕES E DIAGNÓSTICOS
-- ============================================

-- Verificar se o bucket 'recordings' existe
SELECT id, name, public, created_at FROM storage.buckets WHERE id = 'recordings';

-- Verificar as políticas RLS para o bucket 'recordings'
SELECT 
  policyname as "Nome da Política",
  permissive as "Permissiva",
  roles as "Roles",
  cmd as "Comando",
  qual as "Condição"
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%recordings%';

-- Verificar se há arquivos no bucket
SELECT 
  name as "Nome do Arquivo",
  bucket_id as "Bucket",
  metadata->>'size' as "Tamanho (bytes)",
  created_at as "Criado em"
FROM storage.objects 
WHERE bucket_id = 'recordings' 
ORDER BY created_at DESC;

-- Verificar estrutura da tabela recordings
SELECT 
  column_name as "Coluna",
  data_type as "Tipo",
  is_nullable as "Pode ser NULL",
  column_default as "Valor Padrão"
FROM information_schema.columns 
WHERE table_name = 'recordings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar registros na tabela recordings
SELECT 
  id,
  type,
  file_path,
  duration,
  size,
  created_at
FROM recordings 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar estrutura da tabela devices
SELECT 
  column_name as "Coluna",
  data_type as "Tipo",
  is_nullable as "Pode ser NULL",
  column_default as "Valor Padrão"
FROM information_schema.columns 
WHERE table_name = 'devices' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar políticas RLS da tabela devices
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'devices';

-- ============================================
-- IMPORTANTE: CONFIGURAÇÃO DE AUTENTICAÇÃO
-- ============================================
-- Vá em Authentication > URL Configuration e configure:
-- Site URL: URL do seu app (preview ou domínio)
-- Redirect URLs: Adicione as URLs onde o app pode redirecionar após login
