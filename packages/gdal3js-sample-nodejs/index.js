const initGdalJs = require('gdal3.js/node/st/js');

start();
async function start() {
    const { Gdal, toArray, getFileList } = await initGdalJs();
    Gdal.allRegister();
    const drivers = toArray(Gdal.getDrivers());
    drivers.forEach((d) => console.log(d.getShortName()));
    console.log(getFileList('/memfs'));
}
