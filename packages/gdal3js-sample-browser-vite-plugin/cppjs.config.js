import gdal3js from 'gdal3.js/cppjs.config.mjs';

export default {
    dependencies: [
        gdal3js,
    ],
    paths: {
        config: import.meta.url,
        base: '../..',
    },
};
