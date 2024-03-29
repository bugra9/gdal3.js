/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { GDALFunctions } from '../../allCFunctions';

/**
 * The gdal location info utility converts a latitude and longitude into a pixel and line in the dataset
 *
 * {@link https://gdal.org/programs/gdallocationinfo.html}
 *
 * @module a/gdal_location_info
 * @async
 * @param {TypeDefs.Dataset} dataset Dataset to be converted.
 * @param {Array<Array<number>>} coords Coordinates to be converted.
 * Example: [45.5,-108.5] lat/lon -wgs84 ie. this always acts as if -wgs84 was passed to gdalLocationinfo
 * @return {Promise<Array<Array<number>>>} "Promise" returns converted coordinates.
 * @example
 * const coords = [45.5,-108.5];
 * const pixelCoords = await Gdal.gdal_location_info(dataset,coords);
 * console.log(pixelCoords); // { "pixel": 3256, "line": 8664 }
 */
export default function gdal_location_info(dataset, coords) {
    return new Promise((resolve, reject) => {
        const hSrcSRS = GDALFunctions.OSRNewSpatialReference(
            'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]', // WKT for wgs84
        );

        GDALFunctions.OSRSetAxisMappingStrategy(hSrcSRS, 0); // TRADITIONAL_GIS_ORDER
        const hTrgSRS = GDALFunctions.GDALGetSpatialRef(dataset.pointer);
        const hct = GDALFunctions.OCTNewCoordinateTransformation(
            hSrcSRS,
            hTrgSRS,
        );

        const doubleLat = GDALFunctions.CPLAtof(String(coords[0]));
        const doubleLon = GDALFunctions.CPLAtof(String(coords[1]));

        const latPointer = GDALFunctions.Module._malloc(8); // double
        GDALFunctions.Module.setValue(latPointer, doubleLat, 'double');

        const lonPointer = GDALFunctions.Module._malloc(8); // double
        GDALFunctions.Module.setValue(lonPointer, doubleLon, 'double');

        const success = GDALFunctions.OCTTransform(
            hct,
            1,
            lonPointer,
            latPointer,
            null,
        );
        if (!success) {
            reject(new Error('Failed to perform OCTTransform'));
        }
        const dfGeoX = GDALFunctions.Module.getValue(lonPointer, 'double');
        const dfGeoY = GDALFunctions.Module.getValue(latPointer, 'double');

        const geoTransformByteOffset = GDALFunctions.Module._malloc(
            6 * Float64Array.BYTES_PER_ELEMENT,
        );
        GDALFunctions.GDALGetGeoTransform(
            dataset.pointer,
            geoTransformByteOffset,
        );

        const inverseGeoTransformByteOffset = GDALFunctions.Module._malloc(
            6 * Float64Array.BYTES_PER_ELEMENT,
        );
        const successfulInverseTransform = GDALFunctions.GDALInvGeoTransform(
            geoTransformByteOffset,
            inverseGeoTransformByteOffset,
        );
        if (!successfulInverseTransform) {
            reject(new Error('Failed to invert transform'));
        }
        const inverseGeoTransform = GDALFunctions.Module.HEAPF64.subarray(
            inverseGeoTransformByteOffset / Float64Array.BYTES_PER_ELEMENT,
            (inverseGeoTransformByteOffset / Float64Array.BYTES_PER_ELEMENT) + 6,
        );
        const iPixel = Math.floor(
            inverseGeoTransform[0]
                + (inverseGeoTransform[1] * dfGeoX)
                + (inverseGeoTransform[2] * dfGeoY),
        );
        const iLine = Math.floor(
            inverseGeoTransform[3]
                + (inverseGeoTransform[4] * dfGeoX)
                + (inverseGeoTransform[5] * dfGeoY),
        );

        resolve({
            pixel: iPixel,
            line: iLine,
        });
    });
}
