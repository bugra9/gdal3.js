/* eslint-disable camelcase */
import { GDALFunctions } from '../../allCFunctions';
import { getGdalError } from '../helper/error';
import { drivers } from '../helper/drivers';
import getFileList from '../helper/getFileList';
import { getOptions, clearOptions } from '../helper/options';
import { OUTPUTPATH } from '../helper/const';

/*
    gdal_translate function can be used to convert raster data between different formats,
    potentially performing some operations like subsettings, resampling,
    and rescaling pixels in the process.

    @param  {object} Dataset to be converted.
    @param  {Array} Options (https://gdal.org/programs/gdal_translate.html)
    @return {Promise -> Array} "Promise" returns paths of created files.
*/
export default function gdal_translate(dataset, options = []) {
    return new Promise((resolve, reject) => {
        const optStr = getOptions(options);
        const translateOptionsPtr = GDALFunctions.GDALTranslateOptionsNew(optStr.ptr, null);

        const driverIndex = options.indexOf('-of') + 1;
        let ext = 'unknown';
        if (driverIndex !== 0) {
            const driverName = options[driverIndex];
            const driver = drivers.raster[driverName];
            if (driver) ext = driver.extension;
        }

        const outputName = dataset.path.split('.', 1)[0];
        const filePath = `${OUTPUTPATH}/${outputName}.${ext}`;
        const datasetPtr = GDALFunctions.GDALTranslate(filePath, dataset.pointer, translateOptionsPtr, null);
        GDALFunctions.GDALTranslateOptionsFree(translateOptionsPtr);
        clearOptions(optStr);
        GDALFunctions.GDALClose(datasetPtr);

        if (GDALFunctions.CPLGetLastErrorNo() !== 0) {
            const error = getGdalError();
            reject(error);
        } else {
            resolve(getFileList());
        }
        GDALFunctions.GDALClose(datasetPtr);
    });
}
