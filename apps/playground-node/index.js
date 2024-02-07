const initGdalJs = require('gdal3.js/node');

async function main() {
    try {
        const Gdal = await initGdalJs();

        const data = await fetch('https://gdal3.js.org/test/data/simple-polygon-line-point.tif').then(response => response.arrayBuffer());
        Gdal.Module.FS.writeFile('/input/simple-polygon-line-point.tif', new Int8Array(data));
        const result = await Gdal.open('/input/simple-polygon-line-point.tif');
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

main();
