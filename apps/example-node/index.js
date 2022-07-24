const initGdalJs = require('gdal3.js/node');

async function main() {
    const Gdal = await initGdalJs();

    const count = Object.keys(Gdal.drivers.raster).length + Object.keys(Gdal.drivers.vector).length;
    console.log("Number of drivers: " + count);

    const drivers = {
        raster: {
            readWrite: [],
            readOnly: [],
            writeOnly: [],
        },
        vector: {
            readWrite: [],
            readOnly: [],
            writeOnly: [],
        },
    }

    Object.values(Gdal.drivers.raster).forEach(driver => {
        if (driver.isReadable && driver.isWritable) {
            drivers.raster.readWrite.push(driver.shortName);    
        } else if(driver.isReadable) {
            drivers.raster.readOnly.push(driver.shortName); 
        } else if(driver.isWritable) {
            drivers.raster.writeOnly.push(driver.shortName); 
        }
    });

    Object.values(Gdal.drivers.vector).forEach(driver => {
        if (driver.isReadable && driver.isWritable) {
            drivers.vector.readWrite.push(driver.shortName);    
        } else if(driver.isReadable) {
            drivers.vector.readOnly.push(driver.shortName); 
        } else if(driver.isWritable) {
            drivers.vector.writeOnly.push(driver.shortName); 
        }
    });

    console.log(`\nraster read & write drivers: ${drivers.raster.readWrite.sort().join(', ')}`);
    console.log(`\nraster read only drivers: ${drivers.raster.readOnly.sort().join(', ')}`);
    console.log(`\nraster write only drivers: ${drivers.raster.writeOnly.sort().join(', ')}`);
    console.log(`\nvector read & write drivers: ${drivers.vector.readWrite.sort().join(', ')}`);
    console.log(`\nvector read only drivers: ${drivers.vector.readOnly.sort().join(', ')}`);
    console.log(`\nvector write only drivers: ${drivers.vector.writeOnly.sort().join(', ')}`);

    const coords = [
        [27.143757, 38.4247972],
    ];
    const options = [
        '-s_srs', 'EPSG:4326',
        '-t_srs', 'EPSG:3857',
        '-output_xy',
    ];
    const newCoords = await Gdal.gdaltransform(coords, options);
    console.log('coordinates (EPSG:4326): ', coords);
    console.log('coordinates (EPSG:3857): ', newCoords); // [ [ 3021629.2074563554, 4639610.441991095, 0 ] ]
}

main();
