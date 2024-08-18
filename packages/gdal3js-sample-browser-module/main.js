import '/packages/gdal3.js/dist/gdal3js-wasm-wasm32-st-release.browser.js';

document.write("Loading...");
initCppJs({ path: '/packages/gdal3.js/dist' }).then(({ Gdal, toArray }) => {
    Gdal.allRegister();
    const drivers = toArray(Gdal.getDrivers());
    document.write("Number of drivers: " + drivers.length);
    console.log(drivers.map((d) => d.getLongName()));
});
