import '../../dist/gdal3-worker.js';

document.write("Loading...");
Gdal3({ path: '../../dist' }).then((gdal3) => {
    const count = Object.keys(gdal3.drivers.raster).length + Object.keys(gdal3.drivers.vector).length;
    document.write("Number of drivers: " + count);
    console.log(gdal3.drivers);
});
