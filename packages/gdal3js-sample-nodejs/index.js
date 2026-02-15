const initGdalJs = require('gdal3.js/node.js');

start();
async function start() {
    const { Gdal, toArray } = await initGdalJs();
    Gdal.allRegister();
    const drivers = toArray(Gdal.getDrivers());
    drivers.forEach((d) => console.log(d.getShortName()));
}
