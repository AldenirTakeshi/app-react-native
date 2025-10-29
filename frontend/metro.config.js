const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações para resolver problemas de compatibilidade
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Desabilitar turbo modules temporariamente
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
