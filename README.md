# 🛡️ Anjo da Guarda - App de Segurança

Um aplicativo de segurança completo com gravação de vídeo, áudio e localização em tempo real, desenvolvido como PWA (Progressive Web App).

## 🚀 Funcionalidades Principais

- **📹 Gravação de Vídeo** - Câmera em tempo real com preview
- **🎤 Gravação de Áudio** - Microfone com cancelamento de eco  
- **📍 Localização GPS** - Coordenadas + endereço + mapa interativo
- **🚨 Modo Pânico** - Ativação simultânea de todos os recursos
- **📱 PWA Completo** - Instalação nativa no celular
- **🔐 Pasta Protegida** - "Meus Registros" com senha por dispositivo
- **⏱️ Controle de Tempo** - Gravações de 1-60 minutos não canceláveis
- **🔔 Notificações Visuais** - Sino animado com histórico

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Auth + Database + Storage)
- **Estado**: React Query + Zustand
- **PWA**: Service Workers + Manifest
- **HTTPS**: Certificados SSL com mkcert

## 📦 Instalação Rápida

```bash
# Clone e instale
git clone https://github.com/seu-usuario/anjo-da-guarda.git
cd anjo-da-guarda
npm install

# Configure Supabase (veja guia completo)
# Execute database_schema.sql no Supabase SQL Editor

# Execute
npm run dev
```

## 🔧 Configuração

### **Variáveis de Ambiente:**
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### **Supabase Setup:**
1. Execute `database_schema.sql` no SQL Editor
2. Configure URLs de autenticação
3. Ative Storage para arquivos

## 📱 Como Usar

### **Botão Pânico:**
- **Clique**: Ativa vídeo COM áudio + localização
- **Tempo**: Configurável de 1-60 minutos
- **Não cancelável**: Até completar o tempo definido

### **Recursos Individuais:**
- **Câmera**: Vídeo sem áudio
- **Áudio**: Apenas microfone  
- **Localização**: GPS + mapa + endereço

### **Meus Registros:**
- **Acesso**: Senha do dispositivo
- **Reprodução**: Vídeo/áudio em tempo real
- **Download**: Arquivos para o dispositivo
- **Proteção**: Confirmação dupla para deletar

## 🌐 Deploy

```bash
# Build
npm run build

# Deploy Vercel
vercel --prod

# Ou upload dist/ para Netlify/GitHub Pages
```

## 📋 Scripts

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linting do código
npm run generate-icons # Gerar ícones PWA
```

## 📚 Documentação Completa

**Para configuração detalhada, troubleshooting e desenvolvimento avançado, consulte:**

👉 **[GUIA_COMPLETO_ANJO_DA_GUARDA.md](./GUIA_COMPLETO_ANJO_DA_GUARDA.md)**

O guia completo contém:
- ✅ Configuração passo a passo do Supabase
- ✅ Todas as correções e melhorias implementadas
- ✅ Troubleshooting completo
- ✅ Estrutura detalhada do projeto
- ✅ Comandos úteis e próximos passos

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
- **Documentação**: [Guia Completo](./GUIA_COMPLETO_ANJO_DA_GUARDA.md)
- **Email**: seu-email@exemplo.com

---

**🛡️ Mantenha-se seguro com o Anjo da Guarda!**