# 📱 GUIA COMPLETO - PERMISSÕES E HTTPS

## 🔐 **SERVIDOR HTTPS CONFIGURADO!**

O servidor agora está rodando com HTTPS na porta 8080:
- **Local HTTPS**: `https://localhost:8080`
- **Rede HTTPS**: `https://192.168.18.94:8080`

## 📱 **COMO LIBERAR PERMISSÕES NO CELULAR:**

### **MÉTODO 1: Direto no Site (MAIS FÁCIL)**
1. **Acesse:** `https://192.168.18.94:8080`
2. **Aceite o certificado** (pode aparecer aviso de segurança - clique "Avançado" → "Prosseguir")
3. **Clique no ícone de cadeado** na barra de endereço
4. **Permita** câmera, microfone e localização
5. **Recarregue** a página

### **MÉTODO 2: Configurações do Chrome (Android)**
1. **Abra o Chrome**
2. **Menu** (3 pontos) → **Configurações**
3. **Configurações do site** → **Câmera**
4. **Permitir** para todos os sites
5. **Configurações do site** → **Microfone**
6. **Permitir** para todos os sites
7. **Configurações do site** → **Localização**
8. **Permitir** para todos os sites

### **MÉTODO 3: Configurações do Safari (iOS)**
1. **Configurações** → **Safari**
2. **Configurações de Sites** → **Câmera**
3. **Permitir** para todos os sites
4. **Configurações de Sites** → **Microfone**
5. **Permitir** para todos os sites
6. **Configurações de Sites** → **Localização**
7. **Permitir** para todos os sites

## 🔧 **URLs CORRETAS PARA TESTAR:**

### **No Computador:**
- `https://localhost:8080`

### **No Celular (mesma rede Wi-Fi):**
- `https://192.168.18.94:8080`

## ⚠️ **IMPORTANTE:**

1. **Certificado SSL**: Pode aparecer aviso de segurança - é normal em desenvolvimento
2. **Mesma Rede**: Celular e computador devem estar na mesma rede Wi-Fi
3. **Permissões**: Libere todas as permissões solicitadas
4. **HTTPS**: Agora funciona com HTTPS, que é obrigatório para câmera/microfone

## 🎯 **TESTE PASSO A PASSO:**

1. **Acesse** `https://192.168.18.94:8080` no celular
2. **Aceite** o certificado SSL
3. **Permita** todas as permissões quando solicitado
4. **Clique** em qualquer botão (câmera, áudio, localização ou pânico)
5. **Veja** a gravação funcionando em tempo real!

## 🚨 **SE AINDA NÃO FUNCIONAR:**

1. **Limpe o cache** do navegador
2. **Reinicie** o navegador
3. **Verifique** se está na mesma rede Wi-Fi
4. **Tente** outro navegador (Firefox, Edge)

---

**Agora com HTTPS, todas as funcionalidades de mídia devem funcionar perfeitamente!** 🚀
