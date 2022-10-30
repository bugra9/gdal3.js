/* eslint-disable camelcase */
import { GDALFunctions } from '../../allCFunctions';
import { getGdalError } from '../helper/error';
import { drivers } from '../helper/drivers';
import { getOptions, clearOptions } from '../helper/options';
import { OUTPUTPATH, getRealOutputPath } from '../helper/const';

/**
    * gdal_rasterize function burns vector geometries (points, lines, and polygons)
    * into the raster band(s) of a raster image. Vectors are read from OGR supported vector formats.
    *
    * {@link https://gdal.org/programs/gdal_rasterize.html}
    *
    * @module a/gdal_rasterize
    * @async
    * @param {TypeDefs.Dataset} dataset Dataset to be converted.
    * @param {Array} options Options ({@link https://gdal.org/programs/gdal_rasterize.html#description})
    * @return {Promise<TypeDefs.FilePath>} "Promise" returns paths of created files.
    * @example
    * const Gdal = await initGdalJs();
    * const dataset = (await Gdal.open('data.geojson')).datasets[0];
    * const options = [
    *   '-of', 'GTiff',
    *   '-co', 'alpha=yes'
    * ];
    * const filePath = await Gdal.gdal_rasterize(dataset, options);
    *
*/
export default function gdal_rasterize(dataset, options = []) {
    return new Promise((resolve, reject) => {
        const optStr = getOptions(options);
        const config = optStr.config;
        Object.entries(config).forEach(([key, value]) => {
            GDALFunctions.CPLSetConfigOption(key, value);
        });
        const optionsPtr = GDALFunctions.GDALRasterizeOptionsNew(optStr.ptr, null);

        const driverIndex = options.indexOf('-of') + 1;
        let ext = 'tif';
        if (driverIndex !== 0) {
            const driverName = options[driverIndex];
            const driver = drivers.raster[driverName];
            if (driver) ext = driver.extension;
        }

        const outputName = dataset.path.split('.', 1)[0];
        const filePath = `${OUTPUTPATH}/${outputName}.${ext}`;
        const datasetPtr = GDALFunctions.GDALRasterize(filePath, null, dataset.pointer, optionsPtr, null);
        GDALFunctions.GDALRasterizeOptionsFree(optionsPtr);
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
