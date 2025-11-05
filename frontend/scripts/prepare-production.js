#!/usr/bin/env node

/**
 * Script para preparar o app para build de produção
 * Execute: node scripts/prepare-production.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparando app para build de produção...\n');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let hasErrors = false;
let hasWarnings = false;

// 1. Verificar app.config.js
console.log(`${colors.blue}=== Verificando Configuração ===${colors.reset}\n`);

try {
  const appConfig = require('../app.config.js');
  const expo = appConfig.expo || appConfig;
  
  console.log(`${colors.green}✓ Versão: ${expo.version}${colors.reset}`);
  
  if (expo.android && expo.android.versionCode) {
    console.log(`${colors.green}✓ Version Code: ${expo.android.versionCode}${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Version Code não configurado!${colors.reset}`);
    hasErrors = true;
  }
  
  if (expo.android && expo.android.package) {
    console.log(`${colors.green}✓ Package ID: ${expo.android.package}${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Package ID não configurado${colors.reset}`);
    hasWarnings = true;
  }
  
  console.log('');
} catch (error) {
  console.log(`${colors.red}✗ Erro ao ler app.config.js: ${error.message}${colors.reset}\n`);
  hasErrors = true;
}

// 2. Verificar dependências
console.log(`${colors.blue}=== Verificando Dependências ===${colors.reset}\n`);

try {
  const packageJson = require('../package.json');
  const requiredDeps = [
    'expo',
    'react',
    'react-native',
    'expo-router',
  ];
  
  let allDepsPresent = true;
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`${colors.green}✓ ${dep}: ${packageJson.dependencies[dep]}${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${dep} não encontrado!${colors.reset}`);
      allDepsPresent = false;
      hasErrors = true;
    }
  });
  
  console.log('');
} catch (error) {
  console.log(`${colors.red}✗ Erro ao ler package.json: ${error.message}${colors.reset}\n`);
  hasErrors = true;
}

// 3. Verificar assets
console.log(`${colors.blue}=== Verificando Assets ===${colors.reset}\n`);

const requiredAssets = [
  'assets/images/icon.png',
  'assets/images/splash-icon.png',
  'assets/images/android-icon-foreground.png',
  'assets/images/android-icon-background.png',
];

requiredAssets.forEach(asset => {
  const assetPath = path.join(__dirname, '..', asset);
  if (fs.existsSync(assetPath)) {
    console.log(`${colors.green}✓ ${asset}${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ ${asset} não encontrado${colors.reset}`);
    hasWarnings = true;
  }
});

console.log('');

// 4. Verificar Google Maps API Key
console.log(`${colors.blue}=== Verificando Google Maps ===${colors.reset}\n`);

try {
  const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, 'utf-8');
    if (manifest.includes('com.google.android.geo.API_KEY')) {
      console.log(`${colors.green}✓ Google Maps API Key configurada no AndroidManifest${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ Google Maps API Key não encontrada no AndroidManifest${colors.reset}`);
      hasWarnings = true;
    }
  } else {
    console.log(`${colors.yellow}⚠ AndroidManifest.xml não encontrado${colors.reset}`);
  }
  
  const appConfig = require('../app.config.js');
  const expo = appConfig.expo || appConfig;
  
  if (expo.android && expo.android.config && expo.android.config.googleMaps) {
    console.log(`${colors.green}✓ Google Maps configurado no app.config${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Google Maps não configurado no app.config${colors.reset}`);
    hasWarnings = true;
  }
  
  console.log('');
} catch (error) {
  console.log(`${colors.yellow}⚠ Não foi possível verificar Google Maps${colors.reset}\n`);
}

// 5. Verificar console.logs
console.log(`${colors.blue}=== Verificando console.logs ===${colors.reset}\n`);

try {
  const result = execSync('git grep "console\\.log" -- "*.ts" "*.tsx" "*.js" "*.jsx" | wc -l', { 
    encoding: 'utf-8',
    cwd: path.join(__dirname, '..'),
  }).trim();
  
  const count = parseInt(result);
  if (count > 0) {
    console.log(`${colors.yellow}⚠ Encontrados ${count} console.log(s) no código${colors.reset}`);
    console.log(`${colors.yellow}  Considere remover ou substituir por console.warn/error${colors.reset}`);
    hasWarnings = true;
  } else {
    console.log(`${colors.green}✓ Nenhum console.log encontrado${colors.reset}`);
  }
  
  console.log('');
} catch (error) {
  console.log(`${colors.yellow}⚠ Não foi possível verificar console.logs${colors.reset}\n`);
}

// 6. Executar expo-doctor
console.log(`${colors.blue}=== Executando expo-doctor ===${colors.reset}\n`);

try {
  execSync('npx expo-doctor', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  console.log('');
} catch (error) {
  console.log(`${colors.yellow}⚠ expo-doctor encontrou problemas. Revise acima.${colors.reset}\n`);
  hasWarnings = true;
}

// Resumo Final
console.log(`${colors.blue}=== Resumo ===${colors.reset}\n`);

if (hasErrors) {
  console.log(`${colors.red}❌ Encontrados erros críticos! Corrija antes do build.${colors.reset}\n`);
  process.exit(1);
} else if (hasWarnings) {
  console.log(`${colors.yellow}⚠️  Encontrados avisos. Revise antes do build.${colors.reset}\n`);
  console.log(`${colors.blue}Próximos passos:${colors.reset}`);
  console.log(`  1. Revise os avisos acima`);
  console.log(`  2. Execute: ${colors.green}npx eas build --platform android --profile production${colors.reset}`);
  console.log('');
  process.exit(0);
} else {
  console.log(`${colors.green}✅ Tudo pronto para build de produção!${colors.reset}\n`);
  console.log(`${colors.blue}Próximos passos:${colors.reset}`);
  console.log(`  1. ${colors.green}npx eas login${colors.reset} (se ainda não fez)`);
  console.log(`  2. ${colors.green}npx eas build --platform android --profile production${colors.reset}`);
  console.log(`  3. Aguarde o build completar (~15-30min)`);
  console.log(`  4. Baixe o APK/AAB e distribua!`);
  console.log('');
  process.exit(0);
}


