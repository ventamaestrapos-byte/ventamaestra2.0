const fs = require('fs');
const { createCanvas } = require('canvas');

function crearIcono(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fondo naranja
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(0, 0, size, size);
  
  // Hexágono
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#ff8c00';
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.015;
  ctx.stroke();
  
  // Rectángulo blanco (ticket)
  const rectW = size * 0.22;
  const rectH = size * 0.27;
  const rectX = cx - rectW / 2;
  const rectY = cy - rectH / 2;
  
  ctx.fillStyle = 'white';
  ctx.fillRect(rectX, rectY, rectW, rectH);
  
  // Líneas del ticket
  ctx.fillStyle = '#ff8c00';
  const lineH = size * 0.023;
  const lineW = rectW * 0.7;
  const lineX = rectX + (rectW - lineW) / 2;
  const startY = rectY + size * 0.04;
  
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(lineX, startY + i * size * 0.03, lineW, lineH);
  }
  
  // Texto VM
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.12}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VM', cx, cy + size * 0.25);
  
  return canvas;
}

// Crear iconos
console.log('Creando icon-512.png...');
const canvas512 = crearIcono(512);
const buffer512 = canvas512.toBuffer('image/png');
fs.writeFileSync('icon-512.png', buffer512);

console.log('Creando icon-192.png...');
const canvas192 = crearIcono(192);
const buffer192 = canvas192.toBuffer('image/png');
fs.writeFileSync('icon-192.png', buffer192);

console.log('✅ Iconos PNG creados exitosamente');
console.log('   - icon-512.png');
console.log('   - icon-192.png');
