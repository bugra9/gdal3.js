const initGdalJs = require('gdal3.js/node');

async function main() {
    try {
        const Gdal = await initGdalJs();

        const result = await Gdal.open(['../../test/data/polygon-line-point.geojson', '../../test/data/simple-polygon-line-point.tif']);
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

main();
