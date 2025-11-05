const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando diagnóstico do app...\n');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function runCommand(cmd, silent = false) {
  try {
    const output = execSync(cmd, { encoding: 'utf-8' });
    return { success: true, output };
  } catch (error) {
    if (!silent) {
      console.error(`${colors.red}❌ Erro ao executar: ${cmd}${colors.reset}`);
    }
    return { success: false, output: error.message };
  }
}

function checkItem(name, command, successMsg, failMsg) {
  console.log(`Verificando ${name}...`);
  const result = runCommand(command, true);

  if (result.success) {
    console.log(
      `${colors.green}✓ ${successMsg || name + ' OK'}${colors.reset}`,
    );
    return true;
  } else {
    console.log(`${colors.red}✗ ${failMsg || name + ' FALHOU'}${colors.reset}`);
    return false;
  }
}

console.log(`${colors.blue}=== Verificações do Sistema ===${colors.reset}\n`);

// 1. Verificar Node.js
const nodeVersion = runCommand('node --version', true);
if (nodeVersion.success) {
  console.log(
    `${colors.green}✓ Node.js: ${nodeVersion.output.trim()}${colors.reset}`,
  );
} else {
  console.log(`${colors.red}✗ Node.js não encontrado${colors.reset}`);
}

// 2. Verificar npm
const npmVersion = runCommand('npm --version', true);
if (npmVersion.success) {
  console.log(
    `${colors.green}✓ npm: ${npmVersion.output.trim()}${colors.reset}`,
  );
}

// 3. Verificar Expo CLI
const expoVersion = runCommand('npx expo --version', true);
if (expoVersion.success) {
  console.log(
    `${colors.green}✓ Expo CLI: ${expoVersion.output.trim()}${colors.reset}`,
  );
}

// 4. Verificar ADB
const adbCheck = runCommand('adb version', true);
if (adbCheck.success) {
  console.log(`${colors.green}✓ ADB instalado${colors.reset}`);

  // Verificar dispositivos conectados
  const devices = runCommand('adb devices', true);
  if (devices.success) {
    const lines = devices.output
      .split('\n')
      .filter((l) => l.includes('device') && !l.includes('List'));
    if (lines.length > 0) {
      console.log(
        `${colors.green}✓ ${lines.length} dispositivo(s) conectado(s)${colors.reset}`,
      );
      lines.forEach((line) => console.log(`  - ${line.trim()}`));
    } else {
      console.log(
        `${colors.yellow}⚠ Nenhum dispositivo Android conectado${colors.reset}`,
      );
    }
  }
} else {
  console.log(
    `${colors.yellow}⚠ ADB não encontrado (necessário para Android)${colors.reset}`,
  );
}

console.log(`\n${colors.blue}=== Verificações do Projeto ===${colors.reset}\n`);

// 5. Verificar node_modules
if (fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
  console.log(`${colors.green}✓ node_modules existe${colors.reset}`);

  // Contar pacotes
  try {
    const packageJson = require('../package.json');
    const depCount = Object.keys(packageJson.dependencies || {}).length;
    const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
    console.log(`  - ${depCount} dependências`);
    console.log(`  - ${devDepCount} devDependencies`);
  } catch (e) {
    console.log(`${colors.yellow}  ⚠ Erro ao ler package.json${colors.reset}`);
  }
} else {
  console.log(
    `${colors.red}✗ node_modules NÃO existe - execute 'npm install'${colors.reset}`,
  );
}

// 6. Verificar arquivos importantes
const importantFiles = [
  'app.config.js',
  'package.json',
  'app/(tabs)/index.tsx',
  'components/ErrorBoundary.tsx',
  'components/MapViewSafe.tsx',
  'services/api.ts',
  'utils/apiConfig.ts',
];

console.log('\nVerificando arquivos importantes:');
importantFiles.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`${colors.green}✓ ${file} (${size} KB)${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ ${file} NÃO ENCONTRADO${colors.reset}`);
  }
});

// 7. Verificar configuração da API
console.log(`\n${colors.blue}=== Configuração da API ===${colors.reset}\n`);
try {
  const apiConfig = fs.readFileSync(
    path.join(__dirname, '..', 'utils', 'apiConfig.ts'),
    'utf-8',
  );

  // Extrair IP configurado (linha 27 aproximadamente)
  const ipMatch = apiConfig.match(/return\s+['"]http:\/\/([0-9.]+):(\d+)['"]/);
  if (ipMatch) {
    console.log(
      `${colors.green}✓ API configurada: http://${ipMatch[1]}:${ipMatch[2]}${colors.reset}`,
    );
  } else {
    console.log(
      `${colors.yellow}⚠ URL da API em desenvolvimento não encontrada${colors.reset}`,
    );
  }

  // Verificar URL de produção
  const prodMatch = apiConfig.match(
    /https:\/\/[a-zA-Z0-9.-]+\.(railway|vercel|herokuapp)\.app/,
  );
  if (prodMatch) {
    console.log(
      `${colors.green}✓ API de produção: ${prodMatch[0]}${colors.reset}`,
    );
  }
} catch (e) {
  console.log(`${colors.red}✗ Erro ao ler apiConfig.ts${colors.reset}`);
}

// 8. Verificar Google Maps API Key
console.log(
  `\n${colors.blue}=== Google Maps Configuration ===${colors.reset}\n`,
);
try {
  const appConfig = fs.readFileSync(
    path.join(__dirname, '..', 'app.config.js'),
    'utf-8',
  );
  const apiKeyMatch = appConfig.match(
    /GOOGLE_MAPS_API_KEY\s*=.*?['"](.+?)['"]/,
  );

  if (apiKeyMatch && apiKeyMatch[1] && apiKeyMatch[1].length > 20) {
    const maskedKey =
      apiKeyMatch[1].substring(0, 10) +
      '...' +
      apiKeyMatch[1].substring(apiKeyMatch[1].length - 4);
    console.log(
      `${colors.green}✓ Google Maps API Key configurada: ${maskedKey}${colors.reset}`,
    );
  } else {
    console.log(
      `${colors.yellow}⚠ Google Maps API Key pode estar inválida ou não configurada${colors.reset}`,
    );
  }
} catch (e) {
  console.log(
    `${colors.red}✗ Erro ao verificar Google Maps API Key${colors.reset}`,
  );
}

// 9. Verificar se há builds antigas
console.log(`\n${colors.blue}=== Verificações de Cache ===${colors.reset}\n`);

const cacheDirs = ['android/app/build', '.expo', 'node_modules/.cache'];

cacheDirs.forEach((dir) => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    const stats = fs.statSync(dirPath);
    if (stats.isDirectory()) {
      try {
        const files = fs.readdirSync(dirPath);
        console.log(
          `${colors.yellow}⚠ ${dir} existe (${files.length} items) - considere limpar${colors.reset}`,
        );
      } catch (e) {
        console.log(`${colors.yellow}⚠ ${dir} existe${colors.reset}`);
      }
    }
  } else {
    console.log(`${colors.green}✓ ${dir} limpo${colors.reset}`);
  }
});

// Resumo final
console.log(`\n${colors.blue}=== Resumo e Recomendações ===${colors.reset}\n`);

console.log('📝 Próximos passos sugeridos:\n');
console.log('1. Para desenvolvimento local:');
console.log(`   ${colors.green}npm run android${colors.reset}`);
console.log('\n2. Para ver logs em tempo real:');
console.log(`   ${colors.green}npm start${colors.reset}`);
console.log(
  `   ${colors.green}adb logcat | Select-String "ReactNative"${colors.reset} (em outro terminal)`,
);
console.log('\n3. Se houver problemas:');
console.log(
  `   ${colors.yellow}npm start -- --clear${colors.reset} (limpar cache)`,
);
console.log(
  `   ${colors.yellow}npm run android -- --clean${colors.reset} (rebuild limpo)`,
);
console.log('\n4. Para ver detalhes do crash:');
console.log('   Veja o arquivo DEBUG_CRASH.md para guia completo');

console.log(`\n${colors.blue}Diagnóstico concluído!${colors.reset}\n`);
