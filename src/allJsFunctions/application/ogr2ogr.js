/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { GDALFunctions } from '../../allCFunctions';
import { getGdalError } from '../helper/error';
import { getOptions, clearOptions } from '../helper/options';
import { OUTPUTPATH, getRealOutputPath } from '../helper/const';
import { drivers } from '../helper/drivers';

/**
    * ogr2ogr function can be used to convert simple features data between file formats.
    * It can also perform various operations during the process,
    * such as spatial or attribute selection, reducing the set of attributes,
    * setting the output coordinate system or even reprojecting the features during translation.
    *
    * {@link https://gdal.org/programs/ogr2ogr.html}
    *
    * @module a/ogr2ogr
    * @async
    * @param {TypeDefs.Dataset} dataset Dataset to be converted.
    * @param {Array} options Options ({@link https://gdal.org/programs/ogr2ogr.html#description})
    * @return {Promise<TypeDefs.FilePath>} "Promise" returns paths of created files.
    * @example
    * const Gdal = await initGdalJs();
    * const dataset = (await Gdal.open('data.mbtiles')).datasets[0];
    * const options = [
    *   '-f', 'GeoJSON',
    *   '-t_srs', 'EPSG:4326'
    * ];
    * const filePath = await Gdal.ogr2ogr(dataset, options);
    *
*/
export default function ogr2ogr(dataset, options = []) {
    return new Promise((resolve, reject) => {
        const optStr = getOptions(options);
        const config = optStr.config;
        Object.entries(config).forEach(([key, value]) => {
            GDALFunctions.CPLSetConfigOption(key, value);
        });
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
