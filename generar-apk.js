const { spawn } = require('child_process');
const readline = require('readline');

console.log('🚀 Iniciando generación de APK...\n');

const bubblewrap = spawn('npx', ['@bubblewrap/cli', 'init', '--manifest', 'http://localhost:8080/manifest.json'], {
  shell: true,
  cwd: __dirname
});

const rl = readline.createInterface({
  input: bubblewrap.stdout,
  output: process.stdout,
  terminal: false
});

let questionCount = 0;

bubblewrap.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  // Responder automáticamente a las preguntas
  if (output.includes('Do you want') && output.includes('JDK')) {
    setTimeout(() => bubblewrap.stdin.write('Yes\n'), 500);
  } else if (output.includes('Do you want') && output.includes('Android SDK')) {
    setTimeout(() => bubblewrap.stdin.write('Yes\n'), 500);
  } else if (output.includes('Do you agree')) {
    setTimeout(() => bubblewrap.stdin.write('Yes\n'), 500);
  } else if (output.includes('Domain:')) {
    setTimeout(() => bubblewrap.stdin.write('192.168.1.101:8080\n'), 500);
  } else if (output.includes('URL path:')) {
    setTimeout(() => bubblewrap.stdin.write('/\n'), 500);
  } else if (output.includes('Application name:')) {
    setTimeout(() => bubblewrap.stdin.write('VentaMaestra 2.0\n'), 500);
  } else if (output.includes('Short name:')) {
    setTimeout(() => bubblewrap.stdin.write('VentaMaestra\n'), 500);
  } else if (output.includes('Application ID:')) {
    setTimeout(() => bubblewrap.stdin.write('com.ventamaestra.twa\n'), 500);
  } else if (output.includes('version code')) {
    setTimeout(() => bubblewrap.stdin.write('1\n'), 500);
  } else if (output.includes('Display mode:')) {
    setTimeout(() => bubblewrap.stdin.write('standalone\n'), 500);
  } else if (output.includes('Orientation:')) {
    setTimeout(() => bubblewrap.stdin.write('any\n'), 500);
  } else if (output.includes('Status bar color:')) {
    setTimeout(() => bubblewrap.stdin.write('#FF6600\n'), 500);
  } else if (output.includes('Splash screen color:')) {
    setTimeout(() => bubblewrap.stdin.write('#FF8C00\n'), 500);
  } else if (output.includes('Icon URL:') && !output.includes('Maskable')) {
    setTimeout(() => bubblewrap.stdin.write('http://localhost:8080/icon-512.png\n'), 500);
  } else if (output.includes('Maskable icon URL:')) {
    setTimeout(() => bubblewrap.stdin.write('http://localhost:8080/icon-512.png\n'), 500);
  } else if (output.includes('Monochrome icon URL:')) {
    setTimeout(() => bubblewrap.stdin.write('\n'), 500);
  } else if (output.includes('Play Billing')) {
    setTimeout(() => bubblewrap.stdin.write('No\n'), 500);
  } else if (output.includes('geolocation permission')) {
    setTimeout(() => bubblewrap.stdin.write('No\n'), 500);
  } else if (output.includes('Key store location:')) {
    setTimeout(() => bubblewrap.stdin.write('android.keystore\n'), 500);
  } else if (output.includes('Key name:')) {
    setTimeout(() => bubblewrap.stdin.write('ventamaestra\n'), 500);
  }
});

bubblewrap.stderr.on('data', (data) => {
  console.error(data.toString());
});

bubblewrap.on('close', (code) => {
  console.log(`\n\n${'='.repeat(50)}`);
  if (code === 0) {
    console.log('✅ Proyecto inicializado correctamente');
    console.log('\n🔨 Ahora compilando APK...\n');
    
    // Compilar la APK
    const build = spawn('npx', ['@bubblewrap/cli', 'build'], {
      shell: true,
      cwd: __dirname
    });
    
    build.stdout.on('data', (data) => process.stdout.write(data.toString()));
    build.stderr.on('data', (data) => process.stderr.write(data.toString()));
    
    build.on('close', (buildCode) => {
      if (buildCode === 0) {
        console.log('\n\n' + '='.repeat(50));
        console.log('🎉 ¡APK GENERADA EXITOSAMENTE!');
        console.log('='.repeat(50));
        console.log('\n📱 Busca el archivo: app-release-signed.apk');
        console.log('📂 Ubicación: app-release-signed.apk o ./app/build/outputs/');
        console.log('\n📲 Para instalar:');
        console.log('   1. Copia el APK a tu celular');
        console.log('   2. Abre el archivo en tu celular');
        console.log('   3. Acepta instalar desde fuentes desconocidas');
        console.log('   4. ¡Listo!\n');
      } else {
        console.error('❌ Error al compilar APK');
      }
    });
  } else {
    console.error('❌ Error al inicializar proyecto');
  }
});
