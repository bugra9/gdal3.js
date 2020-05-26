const Gdal3 = require('../../dist/gdal3');

async function main() {
    const gdal3 = await Gdal3({ path: 'dist', dest: 'build' });

    const count = Object.keys(gdal3.drivers.raster).length + Object.keys(gdal3.drivers.vector).length;
    console.log("Number of drivers: " + count);
}

main();
