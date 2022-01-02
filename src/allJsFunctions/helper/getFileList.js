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
