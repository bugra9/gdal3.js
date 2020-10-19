/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { GDALFunctions } from '../../allCFunctions';
import { getGdalError } from '../helper/error';
import getFileList from '../helper/getFileList';
import { getOptions, clearOptions } from '../helper/options';
import { OUTPUTPATH } from '../helper/const';
import { drivers } from '../helper/drivers';

/*
    ogr2ogr function can be used to convert simple features data between file formats.
    It can also perform various operations during the process,
    such as spatial or attribute selection, reducing the set of attributes,
    setting the output coordinate system or even reprojecting the features during translation.

    @param  {object} Dataset to be converted.
    @param  {Array} Options (https://gdal.org/programs/ogr2ogr.html)
    @return {Promise -> Array} "Promise" returns paths of created files.
*/
export default function ogr2ogr(dataset, options = []) {
    return new Promise((resolve, reject) => {
        const optStr = getOptions(options);
        const translateOptionsPtr = GDALFunctions.GDALVectorTranslateOptionsNew(optStr.ptr, null);

        const datasetList = GDALFunctions.Module._malloc(4);
        GDALFunctions.Module.setValue(datasetList, dataset.pointer, '*');

        const driverIndex = options.indexOf('-f') + 1;
        let ext = 'unknown';
        if (driverIndex !== 0) {
            const driverName = options[driverIndex];
            const driver = drivers.vector[driverName];
            if (driver) {
                if (driverName === 'MapInfo File' && options.indexOf('FORMAT=MIF') !== -1) ext = 'mif';
                else ext = driver.extension;
            }
        }

        const outputName = dataset.path.split('.', 1)[0];
        const filePath = `${OUTPUTPATH}/${outputName}.${ext}`;
        const datasetPtr = GDALFunctions.GDALVectorTranslate(filePath, null, 1, datasetList, translateOptionsPtr, null);
        GDALFunctions.GDALVectorTranslateOptionsFree(translateOptionsPtr);
        clearOptions(optStr);

        if (GDALFunctions.CPLGetLastErrorNo() !== 0) {
            const error = getGdalError();
            reject(error);
        } else {
            resolve(getFileList());
        }

        GDALFunctions.GDALClose(datasetPtr);
    });
}
