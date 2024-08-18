import initGdalJs from 'gdal3.js/node.js';

start();
async function start() {
    const { Gdal, toArray, toVector, VectorString } = await initGdalJs();
    console.log(toArray, Gdal);
    Gdal.allRegister();
    const drivers = toArray(Gdal.getDrivers());
    drivers.forEach((d) => console.log(d.getShortName()));
    const firstDataset = Gdal.openEx('../../test/data/polygon-line-point.geojson');
    const info = JSON.parse(firstDataset.vectorInfo(toVector(VectorString, ['-json'])));
    console.log(info);
    const abc = firstDataset.vectorTranslate('./a.mbtiles', toVector(VectorString, ['-f', 'MBTiles']));
    const info2 = JSON.parse(abc.vectorInfo(toVector(VectorString, ['-json'])));
    abc.close();
    console.log(info2);
}
