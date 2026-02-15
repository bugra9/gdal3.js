document.write("Loading...");
initCppJs({ path: 'https://cdn.jsdelivr.net/npm/gdal3.js@3.0.0-beta.2/dist' }).then(({ Gdal, toArray }) => {
    Gdal.allRegister();
    const drivers = toArray(Gdal.getDrivers());
    document.write("Number of drivers: " + drivers.length);
    console.log(drivers.map((d) => d.getLongName()));
});
