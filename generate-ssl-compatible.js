import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔐 Gerando certificados SSL compatíveis...');

try {
  // Verificar se OpenSSL está disponível
  try {
    execSync('openssl version', { stdio: 'ignore' });
  } catch (error) {
    console.log('❌ OpenSSL não encontrado. Usando certificados autoassinados do Vite...');
    process.exit(0);
  }

  // Gerar chave privada
  console.log('📝 Gerando chave privada...');
  execSync('openssl genrsa -out localhost-key.pem 2048', { stdio: 'inherit' });

  // Criar arquivo de configuração
  const configContent = `
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = BR
ST = SP
L = São Paulo
O = Anjo da Guarda
OU = Development
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = 192.168.18.94
IP.1 = 127.0.0.1
IP.2 = 192.168.18.94
`;

  fs.writeFileSync('localhost.conf', configContent);

  // Gerar certificado
  console.log('📜 Gerando certificado...');
  execSync('openssl req -new -x509 -key localhost-key.pem -out localhost.pem -days 365 -config localhost.conf -extensions v3_req', { stdio: 'inherit' });

  // Limpar arquivo de configuração
  fs.unlinkSync('localhost.conf');

  console.log('✅ Certificados SSL compatíveis gerados com sucesso!');
  console.log('📁 Arquivos criados:');
  console.log('   - localhost-key.pem (chave privada)');
  console.log('   - localhost.pem (certificado)');
  console.log('');
  console.log('🚀 Agora reinicie o servidor com: npm run dev');

} catch (error) {
  console.error('❌ Erro ao gerar certificados:', error.message);
  console.log('💡 Usando certificados autoassinados do Vite...');
}
