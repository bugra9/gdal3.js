const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const CppjsMetroPlugin = require('@cpp.js/plugin-metro');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    ...CppjsMetroPlugin(defaultConfig),
    resetCache: true,
    watchFolders: [ require('path').resolve('../../') ],
};

module.exports = mergeConfig(defaultConfig, config);
