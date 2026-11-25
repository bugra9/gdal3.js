import isNode from 'detect-node';
import { GDALFunctions } from '../../allCFunctions';
import { INPUTPATH, OUTPUTPATH } from './const';

let lastInputMountedPath;

export function unmount() {
    if (isNode || typeof importScripts === 'function') {
        GDALFunctions.Module.FS.unmount(INPUTPATH);
    }
}

/**
 * On Node.js with config.dest, /output is a NODEFS mount of that folder, and Emscripten keeps a node for every file it
 * has seen there.
 * When a file is deleted outside gdal3.js, its node stays, and GDAL can't create a file with that name again.
 * Forget the nodes whose files are gone, so GDAL looks at the folder again.
 */
export function forgetDeletedOutputFiles() {
    if (!isNode) return;
    const { FS, NODEFS } = GDALFunctions.Module;
    const output = FS.lookupPath(OUTPUTPATH).node;
    if (output.mount.type !== NODEFS) return;
    FS.nameTable.forEach((firstNode) => {
        let node = firstNode;
        while (node) {
            const next = node.name_next;
            if (node.mount === output.mount && node !== output) {
                try {
                    node.node_ops.getattr(node);
                } catch (e) {
                    FS.hashRemoveNode(node);
                }
            }
            node = next;
        }
    });
}

export function mountDest(path) {
    if (isNode) {
        GDALFunctions.Module.FS.mount(GDALFunctions.Module.NODEFS, { root: path }, OUTPUTPATH);
    }
}

export function mount(files) {
    return new Promise((resolve) => {
        if (files.length === 0) {
            resolve([]);
        } else if (isNode) {
            const output = [];
            files.forEach((file) => {
                const temp = file.split('/');
                const name = temp.pop();
                const path = temp.join('/') || '.';

                if (lastInputMountedPath !== path) {
                    if (lastInputMountedPath) unmount();

                    lastInputMountedPath = path;
                    GDALFunctions.Module.FS.mount(GDALFunctions.Module.NODEFS, { root: path }, INPUTPATH);
                }
                output.push({ name });
            });

            resolve(output);
        } else if (typeof importScripts === 'function') {
            if (lastInputMountedPath) unmount();
            GDALFunctions.Module.FS.mount(GDALFunctions.Module.WORKERFS, { files }, INPUTPATH);
            lastInputMountedPath = true;
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
