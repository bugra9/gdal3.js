const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const CppjsMetroPlugin = require('cppjs-plugin-react-native/metro-plugin.cjs');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    ...CppjsMetroPlugin(defaultConfig),
};

module.exports = mergeConfig(defaultConfig, config);
