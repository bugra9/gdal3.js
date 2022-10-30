/* eslint-disable no-underscore-dangle */
import { GDALFunctions } from '../../allCFunctions';
import { getGdalError } from '../helper/error';
import { getOptions, clearOptions } from '../helper/options';
import { OUTPUTPATH, getRealOutputPath } from '../helper/const';
import { drivers } from '../helper/drivers';

/**
    * gdalwarp function is an image mosaicing, reprojection and warping utility.
    * The function can reproject to any supported projection,
    * and can also apply GCPs stored with the image if the image is “raw” with control information.
    *
    * {@link https://gdal.org/programs/gdalwarp.html}
    *
    * @module a/gdalwarp
    * @async
    * @param {TypeDefs.Dataset} dataset Dataset to be converted.
    * @param {Array} options Options ({@link https://gdal.org/programs/gdalwarp.html#description})
    * @return {Promise<TypeDefs.FilePath>} "Promise" returns paths of created files.
    * @example
    * const Gdal = await initGdalJs();
    * const dataset = (await Gdal.open('data.tif')).datasets[0];
    * const options = [
    *   '-of', 'GTiff',
    *   '-t_srs', 'EPSG:4326'
    * ];
    * const filePath = await Gdal.gdalwarp(dataset, options);
    *
*/
export default function gdalwarp(dataset, options = []) {
    return new Promise((resolve, reject) => {
        const optStr = getOptions(options);
        const config = optStr.config;
        Object.entries(config).forEach(([key, value]) => {
            GDALFunctions.CPLSetConfigOption(key, value);
        });
        const translateOptionsPtr = GDALFunctions.GDALWarpAppOptionsNew(optStr.ptr, null);

        const datasetList = GDALFunctions.Module._malloc(4); // Uint32 pointer
        GDALFunctions.Module.setValue(datasetList, dataset.pointer, '*');

        const driverIndex = options.indexOf('-of') + 1;
        let ext = 'unknown';
        if (driverIndex !== 0) {
            const driverName = options[driverIndex];
            const driver = drivers.raster[driverName];
            if (driver) ext = driver.extension;
        }

        const outputName = dataset.path.split('.', 1)[0];
        const filePath = `${OUTPUTPATH}/${outputName}.${ext}`;
        const datasetPtr = GDALFunctions.GDALWarp(filePath, null, 1, datasetList, translateOptionsPtr, null);
        GDALFunctions.GDALWarpAppOptionsFree(translateOptionsPtr);
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
