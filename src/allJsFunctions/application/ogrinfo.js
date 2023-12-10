/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { GDALFunctions } from '../../allCFunctions';
import { getGdalError } from '../helper/error';
import { getOptions, clearOptions } from '../helper/options';

/**
    * The ogrinfo program lists various information about an OGR-supported data source to stdout (the terminal).
    * By executing SQL statements it is also possible to edit data.
    *
    * {@link https://gdal.org/programs/ogrinfo.html}
    *
    * @module a/ogrinfo
    * @async
    * @param {TypeDefs.Dataset} dataset Dataset
    * @param {Array} [options] Options ({@link https://gdal.org/programs/ogrinfo.html#description})
    * @return {Promise<Object>} "Promise" returns information about the OGR-supported data source
    * @example
    * const Gdal = await initGdalJs();
    * const dataset = (await Gdal.open('data.geojson')).datasets[0];
    * const info = await Gdal.ogrinfo(dataset);
    *
*/
export default function ogrinfo(dataset, options = []) {
    return new Promise((resolve, reject) => {
        const optStr = getOptions(['-json', ...options]);
        const config = optStr.config;
        Object.entries(config).forEach(([key, value]) => {
            GDALFunctions.CPLSetConfigOption(key, value);
        });
        const gdalInfoOptionsPtr = GDALFunctions.GDALVectorInfoOptionsNew(optStr.ptr, null);

        const gdalInfo = GDALFunctions.GDALVectorInfo(dataset.pointer, gdalInfoOptionsPtr);
        GDALFunctions.GDALVectorInfoOptionsFree(gdalInfoOptionsPtr);
        clearOptions(optStr);

        if (GDALFunctions.CPLGetLastErrorNo() >= 3) {
            const error = getGdalError();
            reject(error);
        } else {
            resolve(JSON.parse(gdalInfo));
        }
    });
}
