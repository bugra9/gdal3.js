/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import { GDALFunctions } from '../../allCFunctions';

/**
    * Lists information about a raster/vector dataset.
    *
    * @module f/getInfo
    * @async
    * @param {TypeDefs.Dataset} dataset Dataset
    * @return {Promise<TypeDefs.DatasetInfo>} "Promise" returns an object containing file information.
    * @example
    * const dataset = (await Gdal.open("...")).datasets[0];
    * const datasetInfo = await Gdal.getInfo(dataset);
    * console.log(datasetInfo);
    * @example
    * // Raster output
    * {
    *   "type": "raster",
    *   "bandCount": 1,
    *   "width": 514,
    *   "height": 515,
    *   "projectionWkt": "PROJCS[\"unnamed\",GEOGCS[\"NAD27\",DATUM[\"North_American_Datum_1927\",SPHEROID[\"Clarke 1866\",6378206.4,294.978698213898,AUTHORITY[\"EPSG\",\"7008\"]],AUTHORITY[\"EPSG\",\"6267\"]],PRIMEM[\"Greenwich\",0],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4267\"]],PROJECTION[\"Cylindrical_Equal_Area\"],PARAMETER[\"standard_parallel_1\",33.75],PARAMETER[\"central_meridian\",-117.333333333333],PARAMETER[\"false_easting\",0],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1,AUTHORITY[\"EPSG\",\"9001\"]],AXIS[\"Easting\",EAST],AXIS[\"Northing\",NORTH]]",
    *   "coordinateTransform": {
    *     "0": -28493.166784412522,
    *     "1": 60.02213698319374,
    *     "2": 0,
    *     "3": 4255884.5438021915,
    *     "4": 0,
    *     "5": -60.02213698319374
    *   },
    *   "corners": [
    *     [
    *       -28493.166784412522,
    *       4255884.5438021915
    *     ],
    *     [
    *       2358.211624949061,
    *       4255884.5438021915
    *     ],
    *     [
    *       2358.211624949061,
    *       4224973.143255847
    *     ],
    *     [
    *       -28493.166784412522,
    *       4224973.143255847
    *     ]
    *   ],
    *   "driverName": "GeoTIFF",
    *   "dsName": "/input/cea.tif"
    * }
    * @example
    * // Vector output
    * {
    *   "type": "vector",
    *   "layerCount": 1,
    *   "featureCount": 2,
    *   "layers": [
    *     {
    *       "name": "polygon",
    *       "featureCount": 2
    *     }
    *   ],
    *   "dsName": "/input/polygon.geojson",
    *   "driverName": "GeoJSON"
    * }
*/
export default function getInfo(dataset) {
    return new Promise((resolve) => {
        const bandCount = GDALFunctions.GDALGetRasterCount(dataset.pointer);
        const layerCount = GDALFunctions.GDALDatasetGetLayerCount(dataset.pointer);
        if (bandCount > 0 && layerCount === 0) { // Raster
            const maxX = GDALFunctions.GDALGetRasterXSize(dataset.pointer);
            const maxY = GDALFunctions.GDALGetRasterYSize(dataset.pointer);
            const wktStr = GDALFunctions.GDALGetProjectionRef(dataset.pointer);
            const byteOffset = GDALFunctions.Module._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
            GDALFunctions.GDALGetGeoTransform(dataset.pointer, byteOffset);
            const geoTransform = GDALFunctions.Module.HEAPF64.subarray(
                byteOffset / Float64Array.BYTES_PER_ELEMENT,
                (byteOffset / Float64Array.BYTES_PER_ELEMENT) + 6,
            );
            const corners = [
                [0, 0],
                [maxX, 0],
                [maxX, maxY],
                [0, maxY],
            ];
            const geoCorners = corners.map((coords) => {
                const x = coords[0];
                const y = coords[1];
                return [
                    geoTransform[0] + (geoTransform[1] * x) + (geoTransform[2] * y),
                    geoTransform[3] + (geoTransform[4] * x) + (geoTransform[5] * y),
                ];
            });
            const driverPtr = GDALFunctions.GDALGetDatasetDriver(dataset.pointer);
            const driverName = GDALFunctions.GDALGetDriverLongName(driverPtr);
            const dsName = GDALFunctions.OGR_DS_GetName(dataset.pointer);
            resolve(JSON.parse(JSON.stringify({
                type: 'raster',
                bandCount,
                width: maxX,
                height: maxY,
                projectionWkt: wktStr,
                coordinateTransform: geoTransform,
                corners: geoCorners,
                driverName,
                dsName,
            })));
        } else { // Vector
            // const layerCount2 = GDALFunctions.OGR_DS_GetLayerCount(dataset.pointer);

            const layers = [];
            for (let i = 0; i < layerCount; i += 1) {
                const layerPtr = GDALFunctions.OGR_DS_GetLayer(dataset.pointer, i);
                const layerName = GDALFunctions.OGR_L_GetName(layerPtr);
                const featureCount = GDALFunctions.OGR_L_GetFeatureCount(layerPtr, 1);
                layers.push({
                    name: layerName,
                    featureCount,
                });
            }
            const featureCount = layers.reduce((acc, layer) => acc + layer.featureCount, 0);

            const dsName = GDALFunctions.OGR_DS_GetName(dataset.pointer);
            const driverPtr = GDALFunctions.GDALGetDatasetDriver(dataset.pointer);
            const driverName = GDALFunctions.GDALGetDriverLongName(driverPtr);
            resolve({
                type: 'vector',
                layerCount,
                featureCount,
                layers,
                dsName,
                driverName,
            });
        }
    });
}
