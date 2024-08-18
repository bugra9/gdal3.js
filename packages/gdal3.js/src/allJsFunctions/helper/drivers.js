/* eslint-disable object-property-newline */
import convert from 'xml-js';
import { GDALFunctions } from '../../allCFunctions';

export const drivers = { raster: {}, vector: {} };

function xmlToJs(data) {
    if (data) {
        const tempJs = convert.xml2js(data);
        if (tempJs.elements && tempJs.elements.length > 0) {
            if (tempJs.elements.length !== 1) console.warn('invalid xml!');
            if (tempJs.elements[0] && tempJs.elements[0].elements) {
                return tempJs.elements[0].elements.map((o) => {
                    const temp = o.attributes;
                    if (o.elements && o.elements.length > 0) {
                        temp.options = o.elements.map((o2) => o2.elements[0].text);
                    }
                    return temp;
                });
            }
        }
    }
    return null;
}

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

    const openOptionsList = xmlToJs(GDALFunctions.GDALGetMetadataItem(driverPtr, 'DMD_OPENOPTIONLIST', null));
    const creationOptionList = xmlToJs(GDALFunctions.GDALGetMetadataItem(driverPtr, 'DMD_CREATIONOPTIONLIST', null));
    const layerCreationOptionList = xmlToJs(GDALFunctions.GDALGetMetadataItem(driverPtr, 'DS_LAYER_CREATIONOPTIONLIST', null));
    const helpUrl = GDALFunctions.GDALGetMetadataItem(driverPtr, 'DMD_HELPTOPIC', null);

    // eslint-disable-next-line object-curly-newline
    return {
        extension, extensions, shortName, longName,
        isReadable, isWritable, isRaster, isVector,
        openOptionsList, creationOptionList, layerCreationOptionList, helpUrl,
    };
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
