#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔐 Gerando certificados SSL para desenvolvimento...');

try {
  // Verificar se openssl está disponível
  execSync('openssl version', { stdio: 'ignore' });
  
  // Gerar chave privada
  console.log('📝 Gerando chave privada...');
  execSync('openssl genrsa -out localhost-key.pem 2048', { stdio: 'inherit' });
  
  // Gerar certificado
  console.log('📜 Gerando certificado...');
  execSync('openssl req -new -x509 -key localhost-key.pem -out localhost.pem -days 365 -subj "/C=BR/ST=SP/L=SaoPaulo/O=AnjoDaGuarda/OU=Dev/CN=localhost"', { stdio: 'inherit' });
  
  console.log('✅ Certificados SSL gerados com sucesso!');
  console.log('📁 Arquivos criados:');
  console.log('   - localhost-key.pem (chave privada)');
  console.log('   - localhost.pem (certificado)');
  console.log('');
  console.log('🚀 Agora você pode usar HTTPS com certificados válidos!');
  
} catch (error) {
  console.error('❌ Erro ao gerar certificados:', error.message);
  console.log('');
  console.log('💡 Alternativas:');
  console.log('   1. Instale OpenSSL: https://slproweb.com/products/Win32OpenSSL.html');
  console.log('   2. Use o certificado padrão do Vite (pode dar aviso de segurança)');
  console.log('   3. Use um serviço como ngrok para HTTPS público');
}
