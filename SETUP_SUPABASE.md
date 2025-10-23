# 🔐 Configuração do Supabase - Anjo da Guarda

## ⚠️ IMPORTANTE - Verificar Chave API

A chave fornecida (`sb_publishable_-0t8QZVhY5G_mdZXbu4jcw_Q1MjFIoW`) não parece ser uma chave anon típica do Supabase.

**Onde encontrar as chaves corretas:**
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings → API**
3. Copie a **anon/public key** (é um JWT longo)
4. Se precisar, copie também a **service_role key** (para operações admin)

Depois de obter a chave correta, atualize o arquivo `src/integrations/supabase/client.ts`

---

## 📋 Passo 1: Executar SQL no Supabase

1. Acesse seu projeto: https://supabase.com/dashboard/project/apjluzpllwtbdcxwscxg
2. Vá em **SQL Editor**
3. Copie TODO o conteúdo do arquivo `database_schema.sql`
4. Cole no editor e clique em **Run**

Isso criará:
- ✅ Tabela `profiles` (perfis dos usuários)
- ✅ Tabela `devices` (dispositivos registrados)
- ✅ Tabela `recordings` (gravações de vídeo/áudio/localização)
- ✅ Tabela `subscriptions` (planos e assinaturas)
- ✅ Bucket `recordings` no Storage
- ✅ Políticas RLS (segurança)
- ✅ Triggers automáticos (trial de 3 dias)

---

## 🔧 Passo 2: Configurar URLs de Autenticação

1. No Supabase, vá em **Authentication → URL Configuration**
2. Configure:

### Site URL
```
http://localhost:8080
```
(ou a URL do seu domínio em produção)

### Redirect URLs
Adicione TODAS estas URLs:
```
http://localhost:8080/**
http://localhost:8080/auth/callback
```

Se tiver domínio próprio, adicione também:
```
https://seudominio.com/**
https://seudominio.com/auth/callback
```

---

## 📧 Passo 3: Configurar Email (Opcional)

Para testar mais rápido, desabilite a confirmação de email:

1. Vá em **Authentication → Providers → Email**
2. Desative **"Confirm email"**
3. Salve

Assim você pode fazer login imediatamente após o cadastro!

---

## 🧪 Passo 4: Testar Integração

Depois de configurar tudo:

1. Cadastre um usuário no app
2. Verifique no Supabase:
   - **Authentication → Users** (deve aparecer o usuário)
   - **Table Editor → profiles** (deve ter um registro)
   - **Table Editor → subscriptions** (deve ter trial de 3 dias)

---

## 🚨 Problemas Comuns

### "requested path is invalid" ao fazer login
→ Verifique as URLs de redirect no **Authentication → URL Configuration**

### Dados não aparecem
→ Verifique se as políticas RLS estão ativas executando o SQL novamente

### Storage não funciona
→ Verifique se o bucket "recordings" foi criado em **Storage**

---

## 📱 Próximos Passos

Depois de configurar o Supabase, podemos implementar:

1. **Autenticação completa** (login/cadastro/logout)
2. **Gerenciamento de dispositivos** (adicionar/remover)
3. **Sistema de gravação** (vídeo/áudio/localização)
4. **Upload e download** de arquivos
5. **Painel de controle remoto** dos dispositivos
6. **Sistema de pagamentos** (Stripe)

---

## 💡 Dica

Para acessar o Supabase no código:
```typescript
import { supabase } from '@/integrations/supabase';

// Exemplo: buscar dispositivos
const { data, error } = await supabase
  .from('devices')
  .select('*');
```
