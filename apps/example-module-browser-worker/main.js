import '../../dist/package/gdal3.js';

document.write("Loading...");
initGdalJs({ path: '../../dist/package' }).then((Gdal) => {
    const count = Object.keys(Gdal.drivers.raster).length + Object.keys(Gdal.drivers.vector).length;
    document.write("Number of drivers: " + count);
    console.log(Gdal.drivers);
});
