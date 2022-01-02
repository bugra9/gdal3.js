import isNode from 'detect-node';
// eslint-disable-next-line import/extensions
import CModule from '../build/package/gdal3WebAssembly.js';

import { initCFunctions, GDALFunctions } from './allCFunctions';
import allJsFunctions from './allJsFunctions';
import { setDrivers } from './allJsFunctions/helper/drivers';
import { mountDest } from './allJsFunctions/helper/filesystem';
import { INPUTPATH, OUTPUTPATH, setRealOutputPath } from './allJsFunctions/helper/const';
import workerInsideSupport, { workerOutsideSupport } from './workerSupport';

let gdalJsPromise;

/**
    * Asynchronously initializes gdal3.js
    * @async
    * @function initGdalJs
    * @param      {Object} config Configuration Object.
    * @param      {string} config.path Path of wasm and data files.
    * @param      {string} config.dest Destination path where the created files will be saved. (Node.js only)
    * @param      {boolean} config.useWorker=true Using [Web Workers]{@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers} on the browser. It doesn't work on Node.js.
    * @return     {Promise<Gdal>} "Promise" returns Gdal namespace.
*/
export default function initGdalJs(
    config = {},
) {
    if (gdalJsPromise) return gdalJsPromise;

    if (isNode || config.useWorker === false) {
        gdalJsPromise = new Promise((resolve, reject) => {
            const Module = GDALFunctions.Module;

            const originalOnAbortFunction = Module.onAbort;
            Module.onAbort = function onAbort(errorThatCausedAbort) {
                reject(new Error(errorThatCausedAbort));
                if (originalOnAbortFunction) {
                    originalOnAbortFunction(errorThatCausedAbort);
                }
            };

            Module.print = function p(text) {
                console.debug(`gdal stdout: ${text}`);
            };

            Module.printErr = function p(text) {
                console.error(`gdal stderr: ${text}`);
            };

            Module.preRun = [({ ENV }) => {
                ENV.PROJ_LIB = '/usr/share/proj';
                ENV.GDAL_DATA = '/usr/share/gdal';
                ENV.DXF_FEATURE_LIMIT_PER_BLOCK = '-1';
                ENV.GDAL_NUM_THREADS = '0';
                ENV.GDAL_ENABLE_DEPRECATED_DRIVER_GTM = 'YES';
                // ENV.CPL_DEBUG = 'ON';
                ENV.CPL_LOG_ERRORS = 'ON';
            }];

            Module.onRuntimeInitialized = function onRuntimeInitialized() {
                initCFunctions();

                Module.FS.mkdir(INPUTPATH);
                Module.FS.mkdir(OUTPUTPATH);

                if (config.dest) {
                    setRealOutputPath(config.dest);
                    mountDest(config.dest);
                }

                setDrivers();
            };

            Module.locateFile = function locateFile(path) {
                let prefix = '';
                if (config.path) {
                    prefix = config.path;
                    if (prefix.slice(-1) !== '/') prefix += '/';
                } else if (isNode) {
                    prefix = 'node_modules/gdal3.js/dist/package/';
                }
                return prefix + path;
            };

            if (isNode) {
                Module.getPreloadedPackage = function getPreloadedPackage(packageName) {
                    // eslint-disable-next-line global-require
                    return require('fs').readFileSync(`./${packageName}`, { flag: 'r' }).buffer;
                };
            }

            CModule(GDALFunctions.Module).then(() => {
                resolve(allJsFunctions);
            });
        });
    } else {
        const workerJsName = config.workerJsName || 'gdal3.js';
        gdalJsPromise = new Promise((resolve) => {
            workerOutsideSupport.variables.gdalWorkerWrapper = new workerOutsideSupport.WorkerWrapper(`${config.path || ''}/${workerJsName}`, (d) => {
                workerOutsideSupport.variables.drivers = d;
                resolve(workerOutsideSupport.gdalProxy);
            });
        });
    }
    return gdalJsPromise;
}

if (isNode) {
    global.location = { pathname: './' };
}

if (typeof window !== 'undefined') {
    window.initGdalJs = initGdalJs;
}

if (typeof importScripts === 'function') {
    workerInsideSupport(initGdalJs);
}
