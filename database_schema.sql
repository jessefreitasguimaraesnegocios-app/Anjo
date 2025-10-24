-- ============================================
-- ANJO DA GUARDA - Database Schema (Básico)
-- Para configuração completa, use: SUPABASE_COMPLETO.sql
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- Profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Devices table
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

-- Recordings table
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

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  plan_type text DEFAULT 'free_trial' CHECK (plan_type IN ('free_trial', 'monthly')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- IMPORTANTE
-- ============================================
-- Para configuração completa com:
-- - Políticas RLS detalhadas
-- - Triggers automáticos
-- - Verificações e diagnósticos
-- - Storage policies completas
-- 
-- Execute: SUPABASE_COMPLETO.sql
-- 
-- ============================================
-- CONFIGURAÇÃO DE AUTENTICAÇÃO
-- ============================================
-- Vá em Authentication > URL Configuration e configure:
-- Site URL: URL do seu app (preview ou domínio)
-- Redirect URLs: Adicione as URLs onde o app pode redirecionar após login
