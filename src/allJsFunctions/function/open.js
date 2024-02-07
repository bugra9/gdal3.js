/* eslint-disable no-continue */
import { GDALFunctions } from '../../allCFunctions';
import { getGdalError } from '../helper/error';
import { INPUTPATH, OUTPUTPATH } from '../helper/const';
import { mount } from '../helper/filesystem';
import { clearOptions, getOptions } from '../helper/options';
import gdalinfo from '../application/gdalinfo';
import ogrinfo from '../application/ogrinfo';

/**
    * Opens files selected with HTML input element.
    *
    * @module f/open
    * @async
    * @param {FileList|File|Array<string>|string} files Returned by the files property of the HTML input element.
    * @param {Array<string>} openOptions Open options passed to candidate drivers.
    * @param {Array<string>} VFSHandlers List of Virtual File System handlers, see https://gdal.org/user/virtual_file_systems.html
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
    * // Opening a file using the virtual file system handler, ie. /vsicurl/ or /vsizip/.
    * // One common scenario is a .zip shapefile
    * const result = await Gdal.open(file, [], ['vsizip']);
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
export default function open(fileOrFiles, openOptions = [], VFSHandlers = []) {
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
                file.substring(0, INPUTPATH.length + 1) === `${INPUTPATH}/` || file.substring(0, OUTPUTPATH.length + 1) === `${OUTPUTPATH}/`
            )) {
                internalFiles.push({ name: file.substring(file.indexOf('/', 1) + 1), internal: true, prefix: file.substring(0, file.indexOf('/', 1)) });
            } else {
                externalFiles.push(file);
            }
        });
        mount(externalFiles).then((mountedExternalFiles) => {
            const mountedFiles = [...mountedExternalFiles, ...internalFiles];
            const errors = [];
            GDALFunctions.CPLErrorReset();
            const inputResults = {};
            const promises = [];
            for (let i = 0; i < mountedFiles.length; i += 1) {
                const path = mountedFiles[i].name;
                const name = path.split('.', 1)[0];

                if (!inputResults[name]) inputResults[name] = {};
                if (inputResults[name].pointer) continue;
                inputResults[name].path = path;
                const vfsHandlerStr = VFSHandlers && VFSHandlers.length ? `/${VFSHandlers.join('/')}/` : '';
                let fileFullPath = `${vfsHandlerStr}${INPUTPATH}/${path}`;
                if (mountedFiles[i].internal) fileFullPath = `${vfsHandlerStr}${mountedFiles[i].prefix}/${path}`;

                const datasetPtr = GDALFunctions.GDALOpenEx(fileFullPath, null, null, optStr.ptr, null);
                if (datasetPtr === 0) {
                    const error = getGdalError();
                    errors.push(error);
                    delete inputResults[name];
                    continue;
                }
                inputResults[name].pointer = datasetPtr;

                const setLegacyType = () => {
                    const bandCount = GDALFunctions.GDALGetRasterCount(datasetPtr);
                    const layerCount = GDALFunctions.GDALDatasetGetLayerCount(datasetPtr);

                    if (bandCount > 0 && layerCount === 0) {
                        inputResults[name].type = 'raster';
                    } else {
                        inputResults[name].type = 'vector';
                    }
                };

                const infoPromise = gdalinfo(inputResults[name]).then((info) => {
                    if (info && info.bands) {
                        const hasSize = info.size && info.size.length >= 2 && (info.size[0] > 0 || info.size[1] > 0);
                        inputResults[name].type = info.bands.length > 0 && hasSize ? 'raster' : 'vector';
                        if (inputResults[name].type === 'vector') {
                            return ogrinfo(inputResults[name]).then((vectorInfo) => {
                                inputResults[name].info = vectorInfo;
                            });
                        }
                        inputResults[name].info = info;
                    } else {
                        setLegacyType();
                    }
                    return true;
                }).catch(() => setLegacyType());
                promises.push(infoPromise);
            }

            clearOptions(optStr);

            Promise.allSettled(promises).then(() => {
                const datasets = Object.values(inputResults);

                // unmount();

                if (datasets.length > 0 || errors.length === 0) {
                    resolve({ datasets, errors });
                } else {
                    reject(errors);
                }
            });
        });
    });
}
