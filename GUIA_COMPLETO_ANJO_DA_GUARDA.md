# 🛡️ ANJO DA GUARDA - GUIA COMPLETO DE DESENVOLVIMENTO

## 📋 **ÍNDICE**
1. [Visão Geral](#-visão-geral)
2. [Configuração Inicial](#-configuração-inicial)
3. [Funcionalidades Implementadas](#-funcionalidades-implementadas)
4. [Correções e Melhorias](#-correções-e-melhorias)
5. [PWA e Deploy](#-pwa-e-deploy)
6. [Troubleshooting](#-troubleshooting)
7. [Estrutura do Projeto](#-estrutura-do-projeto)

---

## 🎯 **VISÃO GERAL**

### **O que é o Anjo da Guarda?**
Aplicativo de segurança completo com gravação de vídeo, áudio e localização em tempo real, desenvolvido como PWA (Progressive Web App) para funcionar nativamente em dispositivos móveis e desktop.

### **Tecnologias Utilizadas:**
- **Frontend**: React + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Auth + Database + Storage)
- **Estado**: React Query + Zustand
- **PWA**: Service Workers + Manifest
- **HTTPS**: Certificados SSL com mkcert

---

## 🚀 **CONFIGURAÇÃO INICIAL**

### **1. Pré-requisitos:**
```bash
# Node.js 18+
node --version

# npm ou yarn
npm --version
```

### **2. Instalação:**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/anjo-da-guarda.git
cd anjo-da-guarda

# Instale as dependências
npm install

# Configure HTTPS (opcional para desenvolvimento)
npm install -g mkcert
mkcert create-ca
mkcert create-cert --domains localhost,192.168.18.94,127.0.0.1
certutil -addstore -user Root ca.crt
```

### **3. Configuração do Supabase:**

#### **A. Criar Projeto:**
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Crie um novo projeto
3. Anote a URL e chave anon

#### **B. Executar SQL:**
Execute o arquivo `database_schema.sql` no SQL Editor do Supabase:

```sql
-- Tabelas principais
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE public.devices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('phone', 'pc', 'tablet')),
  is_third_party boolean default false,
  third_party_email text,
  records_password text,
  recording_time_limit integer default 1 check (recording_time_limit >= 1 and recording_time_limit <= 60),
  status text default 'offline' check (status in ('online', 'offline')),
  last_seen timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE public.recordings (
  id uuid default uuid_generate_v4() primary key,
  device_id uuid references public.devices on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('video', 'audio', 'location', 'panic')),
  file_path text,
  location_data jsonb,
  duration integer,
  size integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_downloaded boolean default false
);

CREATE TABLE public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  plan text not null check (plan in ('trial', 'basic', 'premium')),
  status text not null check (status in ('active', 'cancelled', 'expired')),
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bucket para gravações
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false);

-- Políticas RLS
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own devices" ON public.devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own devices" ON public.devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices" ON public.devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices" ON public.devices FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recordings" ON public.recordings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recordings" ON public.recordings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recordings" ON public.recordings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recordings" ON public.recordings FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Políticas para Storage
CREATE POLICY "Users can upload their own recordings" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own recordings" ON storage.objects
FOR SELECT USING (
  bucket_id = 'recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own recordings" ON storage.objects
FOR DELETE USING (
  bucket_id = 'recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own recordings" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  
  INSERT INTO public.subscriptions (user_id, plan, status, expires_at)
  VALUES (new.id, 'trial', 'active', now() + interval '3 days');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

#### **C. Configurar URLs de Autenticação:**
1. Vá em **Authentication → URL Configuration**
2. Configure:
   - **Site URL**: `http://localhost:8080`
   - **Redirect URLs**: `http://localhost:8080/**`

#### **D. Variáveis de Ambiente:**
Crie `.env.local`:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### **4. Executar o Projeto:**
```bash
npm run dev
```

---

## 🎯 **FUNCIONALIDADES IMPLEMENTADAS**

### **1. Sistema de Autenticação:**
- ✅ **Cadastro/Login** com Supabase Auth
- ✅ **Perfis de usuário** automáticos
- ✅ **Trial de 3 dias** automático
- ✅ **Logout** seguro

### **2. Gravação de Mídia:**
- ✅ **Botão Pânico**: Vídeo + Áudio + Localização simultâneos
- ✅ **Câmera Individual**: Vídeo sem áudio
- ✅ **Áudio Individual**: Apenas microfone
- ✅ **Localização**: GPS + Endereço + Mapa interativo
- ✅ **Preview em tempo real** durante gravação
- ✅ **Controle de duração** (1-60 minutos)
- ✅ **Gravações não canceláveis** até completar tempo

### **3. Sistema de Dispositivos:**
- ✅ **Adicionar dispositivos** próprios e de terceiros
- ✅ **Senha de registros** por dispositivo
- ✅ **Tempo de gravação** individual por dispositivo
- ✅ **Status online/offline**
- ✅ **Gerenciamento completo**

### **4. Armazenamento e Reprodução:**
- ✅ **Upload para Supabase Storage** (arquivos reais)
- ✅ **Pasta "Meus Registros"** protegida por senha
- ✅ **Reprodução de vídeo/áudio** em tempo real
- ✅ **Download de arquivos** para dispositivo
- ✅ **Confirmação dupla** para deletar registros

### **5. Sistema de Notificações:**
- ✅ **Sino animado** (verde/vermelho)
- ✅ **Histórico de notificações** com dropdown
- ✅ **Posicionamento inteligente** (mobile: para cima)
- ✅ **Substituição completa** dos toasts

### **6. Interface Responsiva:**
- ✅ **Design mobile-first**
- ✅ **Navegação intuitiva**
- ✅ **Componentes Shadcn/ui**
- ✅ **Tema escuro/claro**

---

## 🔧 **CORREÇÕES E MELHORIAS**

### **1. Problema das Gravações (50 bytes):**
**Problema**: Arquivos salvavam apenas metadados simulados
**Solução**: 
- Implementado upload real para Supabase Storage
- Corrigido cálculo de duração e tamanho
- Adicionado logs de debug para diagnóstico

### **2. Erro de Reprodução (StorageUnknownError):**
**Problema**: Arquivos não encontrados no Storage
**Solução**:
- Adicionado verificação de existência de arquivos
- Tratamento de gravações antigas sem arquivo
- Logs detalhados para diagnóstico

### **3. Sistema de Notificações:**
**Problema**: Toasts intrusivos
**Solução**:
- Implementado sino animado personalizado
- Histórico de notificações com dropdown
- Posicionamento inteligente para mobile

### **4. Controle de Tempo de Gravação:**
**Problema**: Gravações canceláveis
**Solução**:
- Slider de 1-60 minutos na tela principal
- Slider individual por dispositivo
- Gravações não canceláveis até completar tempo

### **5. Proteção de Arquivos:**
**Problema**: Arquivos essenciais deletáveis
**Solução**:
- Pasta "Meus Registros" protegida por senha
- Confirmação dupla para deletar
- Separação entre arquivos públicos e privados

---

## 📱 **PWA E DEPLOY**

### **1. Configuração PWA:**
- ✅ **Manifest.json** configurado
- ✅ **Service Worker** com cache offline
- ✅ **Ícones PWA** gerados automaticamente
- ✅ **Instalação nativa** em dispositivos

### **2. Instalação no Celular:**
**Android (Chrome)**:
1. Acesse `https://192.168.18.94:8080`
2. Aguarde prompt de instalação
3. Clique "Instalar"

**iOS (Safari)**:
1. Acesse o site
2. Toque no botão compartilhar
3. Selecione "Adicionar à Tela Inicial"

### **3. Deploy Produção:**
```bash
# Build para produção
npm run build

# Deploy na Vercel
npm install -g vercel
vercel --prod

# Ou upload da pasta dist/ para Netlify/GitHub Pages
```

---

## 🔍 **TROUBLESHOOTING**

### **1. Problemas de Gravação:**
**Sintoma**: Arquivos com 50 bytes
**Solução**: 
1. Execute `VERIFICAR_SUPABASE_CORRIGIDO.sql`
2. Verifique se bucket 'recordings' existe
3. Confirme políticas RLS ativas
4. Teste nova gravação com logs ativos

### **2. Erro de Reprodução:**
**Sintoma**: StorageUnknownError
**Solução**:
1. Verifique console para logs de upload/download
2. Confirme se arquivo existe no Supabase Storage
3. Teste botão de download
4. Verifique políticas RLS

### **3. Problemas de Autenticação:**
**Sintoma**: "requested path is invalid"
**Solução**:
1. Verifique URLs de redirect no Supabase
2. Confirme variáveis de ambiente
3. Teste em modo incógnito

### **4. PWA não Instala:**
**Sintoma**: Prompt não aparece
**Solução**:
1. Use HTTPS obrigatório
2. Verifique manifest.json
3. Confirme Service Worker ativo
4. Teste em dispositivo real

### **5. Problemas de Compilação:**
**Sintoma**: Erros de sintaxe
**Solução**:
1. Reinicie servidor: `npm run dev`
2. Limpe cache: `npm run build`
3. Verifique console para erros específicos
4. Confirme imports corretos

---

## 📁 **ESTRUTURA DO PROJETO**

```
anjo-da-guarda/
├── src/
│   ├── components/
│   │   ├── ui/                 # Componentes Shadcn/ui
│   │   ├── AuthForm.tsx        # Formulário de login/cadastro
│   │   ├── Navigation.tsx      # Navegação principal
│   │   ├── NotificationBell.tsx # Sistema de notificações
│   │   └── PWAInstallPrompt.tsx # Instalação PWA
│   ├── hooks/
│   │   ├── useAuth.ts          # Hook de autenticação
│   │   ├── useDevices.ts       # Hook de dispositivos
│   │   ├── useRecordings.ts    # Hook de gravações
│   │   └── usePWA.ts           # Hook PWA
│   ├── pages/
│   │   ├── Home.tsx            # Tela principal (gravações)
│   │   ├── Evidencias.tsx      # Evidências e arquivos
│   │   ├── MeusRegistros.tsx   # Pasta protegida
│   │   ├── Dispositivos.tsx    # Gerenciamento de dispositivos
│   │   └── Planos.tsx          # Planos e assinaturas
│   ├── integrations/
│   │   └── supabase/           # Configuração Supabase
│   └── lib/
│       └── utils.ts            # Utilitários
├── public/
│   ├── manifest.json           # Manifest PWA
│   ├── sw.js                   # Service Worker
│   └── icons/                  # Ícones PWA
├── database_schema.sql         # Schema do banco
└── README.md                   # Este arquivo
```

---

## 🎯 **COMANDOS ÚTEIS**

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build            # Build para produção
npm run preview          # Preview do build
npm run lint             # Linting do código

# PWA
npm run generate-icons   # Gerar ícones PWA
npm run pwa:audit        # Auditoria PWA com Lighthouse

# Supabase
# Execute os SQLs necessários no dashboard
```

---

## 🚀 **PRÓXIMOS PASSOS**

### **Melhorias Futuras:**
- [ ] **Notificações Push** em tempo real
- [ ] **Backup na Nuvem** automático
- [ ] **Modo Stealth** (interface oculta)
- [ ] **Integração com Polícia** (envio automático)
- [ ] **IA para Análise** (detecção de situações de risco)
- [ ] **Gravações Persistentes** (continuam entre telas)
- [ ] **Sincronização Multi-dispositivo**

### **Deploy Produção:**
- [ ] **Configurar HTTPS** em produção
- [ ] **Otimizar Service Worker** para produção
- [ ] **Configurar push notifications** com VAPID
- [ ] **Testar em dispositivos reais**
- [ ] **Configurar CI/CD** com GitHub Actions

---

## 📞 **SUPORTE**

### **Problemas Comuns:**
1. **Gravações não salvam**: Verifique Supabase Storage
2. **PWA não instala**: Use HTTPS obrigatório
3. **Erro de autenticação**: Verifique URLs de redirect
4. **Arquivos não reproduzem**: Confirme políticas RLS

### **Logs de Debug:**
- **Console do navegador**: F12 → Console
- **Network tab**: Para verificar requisições
- **Application tab**: Para verificar Service Worker

---

**🛡️ O Anjo da Guarda está pronto para proteger!**

Este guia contém todas as informações necessárias para entender, configurar, usar e manter o aplicativo. Para dúvidas específicas, consulte as seções relevantes ou verifique os logs de debug.

