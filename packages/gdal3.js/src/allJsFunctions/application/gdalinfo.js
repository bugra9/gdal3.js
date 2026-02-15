/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { GDALFunctions } from '../../allCFunctions';
import { getGdalError } from '../helper/error';
import { getOptions, clearOptions } from '../helper/options';

/**
    * gdalinfo program lists various information about a GDAL supported raster dataset.
    *
    * {@link https://gdal.org/programs/gdalinfo.html}
    *
    * @module a/gdalinfo
    * @async
    * @param {TypeDefs.Dataset} dataset Dataset
    * @param {Array} [options] Options ({@link https://gdal.org/programs/gdalinfo.html#description})
    * @return {Promise<Object>} "Promise" returns various information about the raster dataset
    * @example
    * const Gdal = await initGdalJs();
    * const dataset = (await Gdal.open('data.tif')).datasets[0];
    * const info = await Gdal.gdalinfo(dataset);
    *
*/
export default function gdalinfo(dataset, options = []) {
    return new Promise((resolve, reject) => {
        const optStr = getOptions(['-json', ...options]);
        const config = optStr.config;
        Object.entries(config).forEach(([key, value]) => {
            GDALFunctions.CPLSetConfigOption(key, value);
        });
        const gdalInfoOptionsPtr = GDALFunctions.GDALInfoOptionsNew(optStr.ptr, null);

        const gdalInfo = GDALFunctions.GDALInfo(dataset.pointer, gdalInfoOptionsPtr);
        GDALFunctions.GDALInfoOptionsFree(gdalInfoOptionsPtr);
        clearOptions(optStr);

        if (GDALFunctions.CPLGetLastErrorNo() >= 3) {
            const error = getGdalError();
            reject(error);
        } else {
            resolve(JSON.parse(gdalInfo));
        }
    });
}
