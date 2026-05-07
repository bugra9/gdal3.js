import isNode from 'detect-node';
import { GDALFunctions } from '../../allCFunctions';
import { INPUTPATH, OUTPUTPATH } from '../helper/const';

const unlinkDir = (FS, dir) => {
    FS.readdir(dir)
        .filter((name) => name !== '.' && name !== '..')
        .forEach((name) => FS.unlink(`${dir}/${name}`));
};

/**
    * Remove all files from the virtual filesystem (/input and /output).
    * On Node.js, only cleans /output if it is not backed by NODEFS (i.e. config.dest was not set).
    * In a Web Worker, only /output is cleaned: /input is mounted as WORKERFS which holds only
    * references to File objects without copying data into memory, and is released via unmount().
    *
    * @module f/clearFS
    * @async
    * @return {Promise<void>}
    * @example
    * await Gdal.clearFS();
*/
export default function clearFS() {
    return new Promise((resolve) => {
        const { FS } = GDALFunctions.Module;

        if (isNode) {
            const outputMount = FS.lookupPath(OUTPUTPATH).node.mount.type;
            if (outputMount !== GDALFunctions.Module.NODEFS) {
                unlinkDir(FS, OUTPUTPATH);
            }
        } else {
            const isWorker = typeof importScripts === 'function';
            const paths = isWorker ? [OUTPUTPATH] : [INPUTPATH, OUTPUTPATH];
            paths.forEach((dir) => unlinkDir(FS, dir));
        }

        resolve();
    });
}
