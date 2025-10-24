const fs = require('fs');
const path = require('path');

// Função para criar ícone SVG
function createIconSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" 
          text-anchor="middle" dominant-baseline="middle" fill="white">🛡️</text>
  </svg>`;
}

// Função para criar ícone PNG usando Canvas (Node.js)
function createIconPNG(size) {
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fundo gradiente
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b82f6');
  gradient.addColorStop(1, '#1e40af');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Ícone de escudo
  ctx.fillStyle = 'white';
  ctx.font = `${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🛡️', size/2, size/2);
  
  // Borda
  ctx.strokeStyle = '#1e40af';
  ctx.lineWidth = size * 0.02;
  ctx.strokeRect(0, 0, size, size);
  
  return canvas.toBuffer('image/png');
}

// Tamanhos necessários para PWA
const sizes = [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512];

// Criar diretório de ícones se não existir
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Gerando ícones PWA...');

// Gerar ícones SVG
sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ SVG ${size}x${size} criado`);
});

// Gerar ícones PNG (se canvas estiver disponível)
try {
  require('canvas');
  
  sizes.forEach(size => {
    const pngBuffer = createIconPNG(size);
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    fs.writeFileSync(pngPath, pngBuffer);
    console.log(`✅ PNG ${size}x${size} criado`);
  });
} catch (error) {
  console.log('⚠️ Canvas não disponível - apenas SVGs criados');
  console.log('💡 Para PNGs, instale: npm install canvas');
}

// Criar favicon.ico
const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
  try {
    const faviconBuffer = createIconPNG(32);
    fs.writeFileSync(faviconPath, faviconBuffer);
    console.log('✅ favicon.ico criado');
  } catch (error) {
    console.log('⚠️ favicon.ico não criado - canvas necessário');
  }
}

console.log('🎉 Ícones PWA gerados com sucesso!');
console.log('📱 Agora você pode instalar o PWA no celular');
