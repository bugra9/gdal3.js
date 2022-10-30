/* eslint-disable camelcase */
import { GDALFunctions } from '../../allCFunctions';
import { getGdalError } from '../helper/error';
import { drivers } from '../helper/drivers';
import { getOptions, clearOptions } from '../helper/options';
import { OUTPUTPATH, getRealOutputPath } from '../helper/const';

/**
    * gdal_translate function can be used to convert raster data between different formats,
    * potentially performing some operations like subsettings, resampling,
    * and rescaling pixels in the process.
    *
    * {@link https://gdal.org/programs/gdal_translate.html}
    *
    * @module a/gdal_translate
    * @async
    * @param {TypeDefs.Dataset} dataset Dataset to be converted.
    * @param {Array} options Options ({@link https://gdal.org/programs/gdal_translate.html#description})
    * @return {Promise<TypeDefs.FilePath>} "Promise" returns paths of created files.
    * @example
    * const Gdal = await initGdalJs();
    * const dataset = (await Gdal.open('data.tif')).datasets[0];
    * const options = [
    *   '-of', 'PNG'
    * ];
    * const filePath = await Gdal.gdal_translate(dataset, options);
    *
*/
export default function gdal_translate(dataset, options = []) {
    return new Promise((resolve, reject) => {
        const optStr = getOptions(options);
        const config = optStr.config;
        Object.entries(config).forEach(([key, value]) => {
            GDALFunctions.CPLSetConfigOption(key, value);
        });
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
            resolve({
                local: filePath,
                real: `${getRealOutputPath()}/${outputName}.${ext}`,
            });
        }
    });
}
