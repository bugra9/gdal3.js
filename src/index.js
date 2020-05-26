import isNode from 'detect-node';
// eslint-disable-next-line import/extensions
import CModule from '../dist/gdal3WebAssembly.js';

import { initCFunctions, GDALFunctions } from './allCFunctions';
import allJsFunctions from './allJsFunctions';
import { setDrivers } from './allJsFunctions/helper/drivers';
import { mountDest } from './allJsFunctions/helper/filesystem';
import { INPUTPATH, OUTPUTPATH } from './allJsFunctions/helper/const';
import workerSupport from './workerSupport';

export default function Gdal3(config = {}) {
    return new Promise((resolve, reject) => {
        const Module = GDALFunctions.Module;

        const originalOnAbortFunction = Module.onAbort;
        Module.onAbort = function onAbort(errorThatCausedAbort) {
            reject(new Error(errorThatCausedAbort));
            if (originalOnAbortFunction) {
                originalOnAbortFunction(errorThatCausedAbort);
            }
        };

        Module.print = function p(text) {
            console.error(`stdout: ${text}`);
        };

        Module.printErr = function p(text) {
            console.error(`stdout: ${text}`);
        };

        Module.preRun = [({ ENV }) => {
            ENV.PROJ_LIB = '/usr/share/proj';
            ENV.GDAL_DATA = '/usr/share/gdal';
            ENV.DXF_FEATURE_LIMIT_PER_BLOCK = '-1';
        }];

        Module.onRuntimeInitialized = function onRuntimeInitialized() {
            initCFunctions();

            Module.FS.mkdir(INPUTPATH);
            Module.FS.mkdir(OUTPUTPATH);

            if (config.dest) {
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
                prefix = 'node_modules/gdal3.js/dist/';
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
}

if (isNode) {
    global.location = { pathname: './' };
}

if (typeof window !== 'undefined') {
    window.Gdal3 = Gdal3;
}

if (typeof importScripts === 'function') {
    workerSupport(Gdal3);
}
