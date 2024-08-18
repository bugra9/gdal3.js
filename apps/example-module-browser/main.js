import '../../dist/gdal3js.browser.js';

document.write("Loading...");
initGdalJs({ path: '../../dist' }).then((Module) => {
    Module.Gdal.allRegister();
    const drivers = Module.toArray(Module.Gdal.getDrivers());
    document.write("Number of drivers: " + drivers.length);
    console.log(drivers.map((d) => d.getLongName()));
});
