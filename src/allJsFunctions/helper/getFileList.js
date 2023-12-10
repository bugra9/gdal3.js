/* eslint-disable no-bitwise */
import { GDALFunctions } from '../../allCFunctions';

import { OUTPUTPATH } from './const';

export default function getFileList(path = OUTPUTPATH.substr(1)) {
    const contents = path.split('/').reduce((accumulator, currentValue) => accumulator.contents[currentValue], GDALFunctions.Module.FS.root).contents;
    const fileList = [];
    Object.keys(contents).forEach((name) => {
        const obj = contents[name];
        if (obj.usedBytes) fileList.push({ path: `/${path}/${name}`, size: obj.usedBytes });
        else if (obj.contents) fileList.push(...getFileList(`${path}/${name}`));
    });
    return fileList;
}

export function getFileListFromDataset(datasetPtr) {
    const files = GDALFunctions.GDALGetFileList(datasetPtr);
    if (!files) return [];
    const arr = [];
    for (let i = 0; i < 100; i += 1) {
        const mem = GDALFunctions.Module.HEAP32[(files + (i * 4)) >> 2];
        if (mem === 0) break;
        const str = GDALFunctions.Module.UTF8ToString(mem);
        arr.push(str);
    }
    return arr;
}
