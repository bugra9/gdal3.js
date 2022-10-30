document.write("Loading...");
initGdalJs({ path: 'https://cdn.jsdelivr.net/npm/gdal3.js@2.4.0/dist/package', useWorker: false }).then((Gdal) => {
    const count = Object.keys(Gdal.drivers.raster).length + Object.keys(Gdal.drivers.vector).length;
    document.write("Number of drivers: " + count);
    console.log(Gdal.drivers);
});
