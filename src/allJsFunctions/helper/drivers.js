import { GDALFunctions } from '../../allCFunctions';

export const drivers = { raster: {}, vector: {} };

function getDriverData(driverPtr) {
    const extensions = GDALFunctions.GDALGetMetadataItem(driverPtr, 'DMD_EXTENSIONS', null);
    let extension = GDALFunctions.GDALGetMetadataItem(driverPtr, 'DMD_EXTENSION', null);
    if (extension === '' && extensions !== '') {
        extension = extensions.split(' ')[0];
    }
    if (extension !== '') {
        extension = extension.replace('.', '').replace('/', '');
    }
    const shortName = GDALFunctions.GDALGetDescription(driverPtr);
    if (shortName === 'GeoJSON') extension = 'geojson';
    const longName = GDALFunctions.GDALGetMetadataItem(driverPtr, 'DMD_LONGNAME', null);
    const isReadable = GDALFunctions.GDALGetMetadataItem(driverPtr, 'DCAP_OPEN', null) === 'YES';
    const isWritable = GDALFunctions.GDALGetMetadataItem(driverPtr, 'DCAP_CREATE', null) === 'YES'
                    || GDALFunctions.GDALGetMetadataItem(driverPtr, 'DCAP_CREATECOPY', null) === 'YES';
    const isRaster = GDALFunctions.GDALGetMetadataItem(driverPtr, 'DCAP_RASTER', null) === 'YES';
    const isVector = GDALFunctions.GDALGetMetadataItem(driverPtr, 'DCAP_VECTOR', null) === 'YES';

    // eslint-disable-next-line object-curly-newline
    return { extension, extensions, shortName, longName, isReadable, isWritable, isRaster, isVector };
}

export function setDrivers() {
    const driverCount = GDALFunctions.GDALGetDriverCount();
    for (let i = 0; i < driverCount; i += 1) {
        const driverPtr = GDALFunctions.GDALGetDriver(i);
        const info = getDriverData(driverPtr);
        if (info.isRaster) drivers.raster[info.shortName] = { index: i, ...info, type: 'raster' };
        if (info.isVector) drivers.vector[info.shortName] = { index: i, ...info, type: 'vector' };
    }
}
