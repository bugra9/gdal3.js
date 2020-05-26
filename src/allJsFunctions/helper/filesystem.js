import isNode from 'detect-node';
import { GDALFunctions } from '../../allCFunctions';
import { INPUTPATH, OUTPUTPATH } from './const';

export function mountDest(path) {
    if (isNode) {
        GDALFunctions.Module.FS.mount(GDALFunctions.Module.NODEFS, { root: path }, OUTPUTPATH);
    }
}

export function mount(files) {
    return new Promise((resolve) => {
        if (isNode) {
            const output = [];
            files.forEach((file) => {
                const temp = file.split('/');
                const name = temp.pop();
                const path = temp.join('/');
                GDALFunctions.Module.FS.mount(GDALFunctions.Module.NODEFS, { root: path }, INPUTPATH);
                output.push({ name });
            });

            resolve(output);
        } else if (typeof importScripts === 'function') {
            GDALFunctions.Module.FS.mount(GDALFunctions.Module.WORKERFS, { files }, INPUTPATH);
            resolve(files);
        } else {
            const promises = [];
            files.forEach((file) => {
                promises.push(file.arrayBuffer());
            });
            Promise.all(promises).then((buffers) => {
                buffers.forEach((buffer, i) => {
                    const ss = new Uint8Array(buffer);
                    GDALFunctions.Module.FS.writeFile(`${INPUTPATH}/${files[i].name}`, ss);
                });
                resolve(files);
            });
        }
    });
}

export function unmount() {
    if (isNode || typeof importScripts === 'function') {
        GDALFunctions.Module.FS.unmount(INPUTPATH);
    }
}
