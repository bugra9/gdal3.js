/* eslint-disable no-continue */
import { GDALFunctions } from '../../allCFunctions';
import { getGdalError } from '../helper/error';
import { INPUTPATH, OUTPUTPATH } from '../helper/const';
import { mount } from '../helper/filesystem';
import { clearOptions, getOptions } from '../helper/options';

/**
    * Opens files selected with HTML input element.
    *
    * @module f/open
    * @async
    * @param {FileList|File|Array<string>|string} files Returned by the files property of the HTML input element.
    * @param {Array<string>} openOptions Open options passed to candidate drivers.
    * @return {Promise<TypeDefs.DatasetList>} "Promise" returns dataset list and error list.
    * @example
    * // Opening file from file input.
    * // HTML
    * <input class="input-file" type="file" name="file" id="file" onChange="onFileChange" />
    * // JS
    * function onFileChange({ target }) {
    *   const result = await Gdal.open(target.file);
    * }
    * @example
    * // Opening files from file input. (multiple)
    * // HTML
    * <input class="input-file" type="file" name="files[]" id="file" onChange="onFileChange" multiple />
    * // JS
    * function onFileChange({ target }) {
    *   const result = await Gdal.open(target.files);
    * }
    * @example
    * // Opening a file from the network.
    * const fileData = await fetch('test/polygon.geojson');
    * const file = new File([await fileData.blob()], "polygon.geojson");
    * const result = await Gdal.open(file);
    * @example
    * // Opening a file from filesystem on Node.js.
    * const result = await Gdal.open('test/polygon.geojson');
    * @example
    * // Opening a file from filesystem on Node.js with open options.
    * const result = await Gdal.open('test/points.csv', ['X_POSSIBLE_NAMES=lng', 'Y_POSSIBLE_NAMES=lat']);
    * @example
    * // Opening files from filesystem on Node.js.
    * const result = await Gdal.open(['test/polygon.geojson', 'test/line.geojson']);
    * @example
    * // Opening files from virtual gdal3.js path.
    * // * Opened files are saved in the /input/... virtual path.
    * // * Converted files are saved in the /output/... virtual path.
    * const result = await Gdal.open('/output/polygon.geojson');
    * const result2 = await Gdal.open('/input/polygon.geojson');
    *
*/
export default function open(fileOrFiles, openOptions = []) {
    let files = fileOrFiles;
    const optStr = getOptions(openOptions);
    if (!(Array.isArray(files) || (typeof FileList === 'function' && files instanceof FileList))) {
        files = [files];
    }

    return new Promise((resolve, reject) => {
        const internalFiles = [];
        const externalFiles = [];
        [...files].forEach((file) => {
            if ((typeof file === 'string' || file instanceof String) && (
                file.substr(0, INPUTPATH.length + 1) === `${INPUTPATH}/` || file.substr(0, OUTPUTPATH.length + 1) === `${OUTPUTPATH}/`
            )) {
                internalFiles.push({ name: file.substr(OUTPUTPATH.length + 1), internal: true });
            } else {
                externalFiles.push(file);
            }
        });
        mount(externalFiles).then((mountedExternalFiles) => {
            const mountedFiles = [...mountedExternalFiles, ...internalFiles];
            const errors = [];
            GDALFunctions.CPLErrorReset();
            const inputResults = {};
            for (let i = 0; i < mountedFiles.length; i += 1) {
                const path = mountedFiles[i].name;
                const name = path.split('.', 1)[0];

                if (!inputResults[name]) inputResults[name] = {};
                if (inputResults[name].pointer) continue;
                inputResults[name].path = path;

                let fileFullPath = `${INPUTPATH}/${path}`;
                if (mountedFiles[i].internal) fileFullPath = `${OUTPUTPATH}/${path}`;

                const datasetPtr = GDALFunctions.GDALOpenEx(fileFullPath, null, null, optStr.ptr, null);
                if (GDALFunctions.CPLGetLastErrorNo() !== 0 || datasetPtr === 0) {
                    const error = getGdalError();
                    errors.push(error);
                    delete inputResults[name];
                    continue;
                }
                inputResults[name].pointer = datasetPtr;
                const bandCount = GDALFunctions.GDALGetRasterCount(datasetPtr);
                const layerCount = GDALFunctions.GDALDatasetGetLayerCount(datasetPtr);
                if (bandCount > 0 && layerCount === 0) {
                    inputResults[name].type = 'raster';
                } else {
                    inputResults[name].type = 'vector';
                }
            }

            clearOptions(optStr);

            const datasets = Object.values(inputResults);

            // unmount();

            if (datasets.length > 0 || errors.length === 0) {
                resolve({ datasets, errors });
            } else {
                reject(errors);
            }
        });
    });
}
