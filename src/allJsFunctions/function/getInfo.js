/* eslint-disable no-underscore-dangle */
import { GDALFunctions } from '../../allCFunctions';

/*
    @param  {object} Dataset
    @return {Promise -> Object} "Promise" returns an object containing file information.
*/
export default function getInfo(dataset) {
    return new Promise((resolve) => {
        const bandCount = GDALFunctions.GDALGetRasterCount(dataset.pointer);
        if (bandCount > 0) { // Raster
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
            resolve({
                type: 'raster',
                bandCount,
                width: maxX,
                height: maxY,
                projectionWkt: wktStr,
                coordinateTransform: geoTransform,
                corners: geoCorners,
                driverName,
                dsName,
            });
        } else { // Vector
            const layerCount = GDALFunctions.GDALDatasetGetLayerCount(dataset.pointer);
            const layerCount2 = GDALFunctions.OGR_DS_GetLayerCount(dataset.pointer);
            const dsName = GDALFunctions.OGR_DS_GetName(dataset.pointer);
            const layerPtr = GDALFunctions.OGR_DS_GetLayer(dataset.pointer, 0);
            const layerName = GDALFunctions.OGR_L_GetName(layerPtr);
            const driverPtr = GDALFunctions.GDALGetDatasetDriver(dataset.pointer);
            const driverName = GDALFunctions.GDALGetDriverLongName(driverPtr);
            resolve({
                type: 'vector',
                layerCount,
                layerCount2,
                dsName,
                layerName,
                driverName,
            });
        }
    });
}
