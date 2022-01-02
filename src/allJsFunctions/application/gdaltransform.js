/* eslint-disable function-paren-newline */
/* eslint-disable no-underscore-dangle */
import { GDALFunctions } from '../../allCFunctions';
import { getOptions, clearOptions } from '../helper/options';

/**
    * The gdaltransform utility reprojects a list of coordinates into any supported projection.
    *
    * {@link https://gdal.org/programs/gdaltransform.html}
    *
    * @module a/gdaltransform
    * @async
    * @param {Array<Array<number>>} coords Coordinates to be converted. Example: [[27.143757, 38.4247972, 0]]
    * @param {Array} options Options ({@link https://gdal.org/programs/gdaltransform.html#description}) (-gcp is not supported.)
    * @return {Promise<Array<Array<number>>>} "Promise" returns converted coordinates.
    * @example
    * const coords = [
    *     [27.143757, 38.4247972],
    * ];
    * const options = [
    *     '-s_srs', 'EPSG:4326',
    *     '-t_srs', 'EPSG:3857',
    *     '-output_xy',
    * ];
    * const newCoords = await Gdal.gdaltransform(coords, options);
    * console.log(newCoords); // [ [ 3021629.2074563554, 4639610.441991095 ] ]
*/
export default function gdaltransform(coords, options) {
    return new Promise((resolve) => {
        const xCoords = new Float64Array(coords.map((c) => c[0]));
        const yCoords = new Float64Array(coords.map((c) => c[1]));
        const zCoords = new Float64Array(coords.map((c) => c[2] || 0));
        const xCoordOffset = GDALFunctions.Module._malloc(xCoords.length * xCoords.BYTES_PER_ELEMENT);
        const yCoordOffset = GDALFunctions.Module._malloc(yCoords.length * yCoords.BYTES_PER_ELEMENT);
        const zCoordOffset = GDALFunctions.Module._malloc(zCoords.length * zCoords.BYTES_PER_ELEMENT);
        GDALFunctions.Module.HEAPF64.set(xCoords, xCoordOffset / xCoords.BYTES_PER_ELEMENT);
        GDALFunctions.Module.HEAPF64.set(yCoords, yCoordOffset / yCoords.BYTES_PER_ELEMENT);
        GDALFunctions.Module.HEAPF64.set(zCoords, zCoordOffset / zCoords.BYTES_PER_ELEMENT);

        let bInverse = false;
        let bOutputXY = false;

        const options2 = [];
        for (let i = 0; i < options.length; i += 1) {
            switch (options[i]) {
                case '-s_srs':
                    i += 1;
                    options2.push(`SRC_SRS=${options[i]}`);
                    break;
                case '-t_srs':
                    i += 1;
                    options2.push(`DST_SRS=${options[i]}`);
                    break;
                case '-ct':
                    i += 1;
                    options2.push(`COORDINATE_OPERATION=${options[i]}`);
                    break;
                case '-order':
                    i += 1;
                    options2.push(`MAX_GCP_ORDER=${options[i]}`);
                    break;
                case '-tps':
                    options2.push('METHOD=GCP_TPS');
                    break;
                case '-rpc':
                    options2.push('METHOD=RPC');
                    break;
                case '-geoloc':
                    options2.push('METHOD=GEOLOC_ARRAY');
                    break;
                case '-i':
                    bInverse = true;
                    break;
                case '-to':
                    i += 1;
                    options2.push(`${options[i]}`);
                    break;
                case '-output_xy':
                    bOutputXY = true;
                    break;
                default:
            }
        }

        const optStr = getOptions(options2);

        const hTransformArg = GDALFunctions.GDALCreateGenImgProjTransformer2(null, null, optStr.ptr);
        GDALFunctions.GDALGenImgProjTransform(
            hTransformArg, bInverse, coords.length, xCoordOffset, yCoordOffset, zCoordOffset, null,
        );

        const convertedCoords = [
            Array.from(GDALFunctions.Module.HEAPF64.subarray(
                xCoordOffset / xCoords.BYTES_PER_ELEMENT,
                (xCoordOffset / xCoords.BYTES_PER_ELEMENT) + xCoords.length,
            )),
            Array.from(GDALFunctions.Module.HEAPF64.subarray(
                yCoordOffset / yCoords.BYTES_PER_ELEMENT,
                (yCoordOffset / yCoords.BYTES_PER_ELEMENT) + yCoords.length,
            )),
            Array.from(GDALFunctions.Module.HEAPF64.subarray(
                zCoordOffset / zCoords.BYTES_PER_ELEMENT,
                (zCoordOffset / zCoords.BYTES_PER_ELEMENT) + zCoords.length,
            )),
        ];

        const result = [];
        for (let i = 0; i < convertedCoords[0].length; i += 1) {
            if (bOutputXY) result.push([convertedCoords[0][i], convertedCoords[1][i]]);
            else result.push([convertedCoords[0][i], convertedCoords[1][i], convertedCoords[2][i]]);
        }
        GDALFunctions.Module._free(xCoordOffset);
        GDALFunctions.Module._free(yCoordOffset);
        GDALFunctions.Module._free(zCoordOffset);
        clearOptions(optStr);
        GDALFunctions.GDALDestroyGenImgProjTransformer(hTransformArg);

        resolve(result);
    });
}
