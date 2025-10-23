# 🛡️ Anjo da Guarda - App de Segurança

Um aplicativo de segurança completo com gravação de vídeo, áudio e localização em tempo real.

## 🚀 Funcionalidades

### ✅ **Recursos Principais:**
- **📹 Gravação de Vídeo** - Câmera em tempo real com preview
- **🎤 Gravação de Áudio** - Microfone com cancelamento de eco
- **📍 Localização GPS** - Coordenadas + endereço + mapa interativo
- **🚨 Modo Pânico** - Ativação simultânea de todos os recursos
- **📱 PWA Completo** - Instalação nativa no celular
- **💾 Download Manual** - Controle total sobre arquivos

### 🔐 **Segurança:**
- **HTTPS Completo** - Certificados SSL válidos
- **Permissões Seguras** - Controle total de acesso
- **Gravação Discreta** - Ativação silenciosa em emergências

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Auth + Database + Storage)
- **Estado**: React Query + Zustand
- **PWA**: Service Workers + Manifest
- **HTTPS**: Certificados SSL com mkcert

## 📦 Instalação

### **Pré-requisitos:**
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### **Passo a Passo:**

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/anjo-da-guarda.git
cd anjo-da-guarda
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure o Supabase:**
   - Crie um projeto no [Supabase](https://supabase.com)
   - Execute o script SQL em `database_schema.sql`
   - Configure as variáveis de ambiente

4. **Configure HTTPS (Opcional):**
```bash
# Instalar mkcert
npm install -g mkcert

# Criar certificados
mkcert create-ca
mkcert create-cert --domains localhost,192.168.18.94,127.0.0.1

# Instalar certificado root
certutil -addstore -user Root ca.crt
```

5. **Execute o projeto:**
```bash
npm run dev
```

## 🔧 Configuração

### **Variáveis de Ambiente:**
Crie um arquivo `.env.local`:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### **Supabase Setup:**
1. Execute o script `database_schema.sql` no SQL Editor
2. Configure as políticas RLS
3. Ative o Storage para arquivos

## 📱 Como Usar

### **Botão Pânico:**
- **Clique**: Ativa vídeo COM áudio + localização
- **Preview**: Câmera em tempo real
- **Mapa**: Localização com endereço da rua
- **Download**: Arquivo único com tudo

### **Botões Individuais:**
- **Câmera**: Vídeo sem áudio
- **Áudio**: Apenas microfone
- **Localização**: GPS + mapa + endereço

### **Download:**
- **Manual**: Clique em "Baixar" quando quiser
- **Formato**: WebM (compatível com todos os players)
- **Tamanho**: Mostrado na notificação

## 🌐 Deploy

### **Vercel (Recomendado):**
```bash
npm install -g vercel
vercel --prod
```

### **Netlify:**
```bash
npm run build
# Upload da pasta dist/
```

### **GitHub Pages:**
```bash
npm run build
# Configure GitHub Actions
```

## 🔒 Segurança

- **HTTPS Obrigatório** para funcionalidades de mídia
- **Permissões Explícitas** do usuário
- **Certificados Válidos** para desenvolvimento
- **Dados Locais** - arquivos ficam no dispositivo

## 📋 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linting do código
npm run type-check   # Verificação de tipos
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/anjo-da-guarda/issues)
- **Documentação**: [Wiki do projeto](https://github.com/seu-usuario/anjo-da-guarda/wiki)
- **Email**: seu-email@exemplo.com

## 🎯 Roadmap

- [ ] **Notificações Push** - Alertas em tempo real
- [ ] **Backup na Nuvem** - Sincronização automática
- [ ] **Modo Stealth** - Interface oculta
- [ ] **Integração com Polícia** - Envio automático
- [ ] **IA para Análise** - Detecção de situações de risco

---

**🛡️ Mantenha-se seguro com o Anjo da Guarda!**