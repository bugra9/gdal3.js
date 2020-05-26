/* eslint-disable no-underscore-dangle */
import { GDALFunctions } from '../../allCFunctions';

export default function gdaltransform(srcSRS, destSRS, coords = []) {
    return new Promise((resolve) => {
        const srcSRSPtr = GDALFunctions.OSRNewSpatialReference(srcSRS);
        const destSRSPtr = GDALFunctions.OSRNewSpatialReference(destSRS);
        const coordTransform = GDALFunctions.OCTNewCoordinateTransformation(srcSRSPtr, destSRSPtr);

        const xCoords = new Float64Array(coords.map((c) => c[0]));
        const yCoords = new Float64Array(coords.map((c) => c[1]));
        const xCoordOffset = GDALFunctions.Module._malloc(xCoords.length * xCoords.BYTES_PER_ELEMENT);
        const yCoordOffset = GDALFunctions.Module._malloc(yCoords.length * yCoords.BYTES_PER_ELEMENT);
        GDALFunctions.Module.HEAPF64.set(xCoords, xCoordOffset / xCoords.BYTES_PER_ELEMENT);
        GDALFunctions.Module.HEAPF64.set(yCoords, yCoordOffset / yCoords.BYTES_PER_ELEMENT);

        // const res = GDALFunctions.OCTTransform(coordTransform, xCoords.length, xCoordOffset, yCoordOffset, null);
        const lngLatCoords = [
            GDALFunctions.Module.HEAPF64.subarray(
                xCoordOffset / xCoords.BYTES_PER_ELEMENT,
                (xCoordOffset / xCoords.BYTES_PER_ELEMENT) + xCoords.length,
            ),
            GDALFunctions.Module.HEAPF64.subarray(
                yCoordOffset / yCoords.BYTES_PER_ELEMENT,
                (yCoordOffset / yCoords.BYTES_PER_ELEMENT) + yCoords.length,
            ),
        ];
        const result = [Array.from(lngLatCoords[0]), Array.from(lngLatCoords[1])];
        GDALFunctions.Module._free(xCoordOffset);
        GDALFunctions.Module._free(yCoordOffset);
        GDALFunctions.OCTDestroyCoordinateTransformation(coordTransform);
        GDALFunctions.OSRDestroySpatialReference(srcSRSPtr);
        GDALFunctions.OSRDestroySpatialReference(destSRSPtr);

        const coords2 = [];
        if (result && result.length > 0 && result[0].length > 0) {
            for (let i = 0; i < result[0].length; i += 1) {
                coords2.push([result[0][i], result[1][i]]);
            }
        }

        resolve(coords2);
    });
}
