import gdal from '@cpp.js/package-gdal/cppjs.config.js';

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
        config: import.meta.url,
        base: "../../",
        output: 'dist',
    },
    targetSpecs: [
        {
            specs: {
                env: {
                    DXF_FEATURE_LIMIT_PER_BLOCK: '-1',
                    GDAL_ENABLE_DEPRECATED_DRIVER_GTM: 'YES',
                    // CPL_DEBUG: 'ON',
                    CPL_LOG_ERRORS: 'ON',
                },
            }
        }
    ],
};
