import getDirName from 'cpp.js/src/utils/getDirName.js';
import gdal from 'cppjs-package-gdal/cppjs.config.js';

export default {
    general: {
        name: 'gdal3js',
    },
    export: {
        type: 'cmake',
        entry: 'gdalcpp.h',
    },
    dependencies: [
        gdal,
    ],
    paths: {
        project: getDirName(import.meta.url),
        output: 'dist',
    },
    platform: {
        'Android-arm64-v8a': {
            env: {
                DXF_FEATURE_LIMIT_PER_BLOCK: '-1',
                GDAL_ENABLE_DEPRECATED_DRIVER_GTM: 'YES',
                // CPL_DEBUG: 'ON',
                CPL_LOG_ERRORS: 'ON',
            },
        },
        'iOS-iphoneos': {
            env: {
                DXF_FEATURE_LIMIT_PER_BLOCK: '-1',
                GDAL_ENABLE_DEPRECATED_DRIVER_GTM: 'YES',
                // CPL_DEBUG: 'ON',
                CPL_LOG_ERRORS: 'ON',
            },
        },
        'Emscripten-x86_64': {
            env: {
                DXF_FEATURE_LIMIT_PER_BLOCK: '-1',
                GDAL_NUM_THREADS: '0',
                GDAL_ENABLE_DEPRECATED_DRIVER_GTM: 'YES',
                // CPL_DEBUG: 'ON',
                CPL_LOG_ERRORS: 'ON',
            },
        },
    },
};
