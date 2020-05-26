/* eslint-disable no-continue */
import { GDALFunctions } from '../../allCFunctions';
import { getGdalError, getSystemError } from '../helper/error';
import { INPUTPATH } from '../helper/const';
import { mount, unmount } from '../helper/filesystem';

/*
    Opens files selected with HTML <input> element.

    @param {FileList} Returned by the files property of the HTML <input> element.
    @return {Promise -> { datasets, errors }} "Promise" returns dataset list and error list.
*/
export default function open(fileOrFiles) {
    let files = fileOrFiles;
    if (!(Array.isArray(files) || files instanceof FileList)) {
        files = [files];
    }

    return new Promise((resolve, reject) => {
        mount(files).then((mountedFiles) => {
            const errors = [];
            GDALFunctions.CPLErrorReset();
            const inputResults = {};
            for (let i = 0; i < mountedFiles.length; i += 1) {
                const path = mountedFiles[i].name;
                const name = path.split('.', 1)[0];

                if (!inputResults[name]) inputResults[name] = {};
                if (inputResults[name].pointer) continue;
                inputResults[name].path = path;

                const datasetPtr = GDALFunctions.GDALOpenEx(`${INPUTPATH}/${path}`);
                if (GDALFunctions.CPLGetLastErrorNo() !== 0) {
                    const error = getGdalError();
                    errors.push(error);
                    delete inputResults[name];
                    continue;
                }
                if (datasetPtr === 0) {
                    const error = getSystemError('unknown dataset');
                    errors.push(error);
                    delete inputResults[name];
                    continue;
                }
                inputResults[name].pointer = datasetPtr;
                const bandCount = GDALFunctions.GDALGetRasterCount(datasetPtr);
                if (bandCount > 0) inputResults[name].type = 'raster';
                else inputResults[name].type = 'vector';
            }

            const datasets = Object.values(inputResults);

            unmount();

            if (datasets.length > 0 || errors.length === 0) {
                resolve({ datasets, errors });
            } else {
                reject(errors);
            }
        });
    });
}
