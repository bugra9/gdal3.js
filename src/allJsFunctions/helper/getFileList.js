import { GDALFunctions } from '../../allCFunctions';

import { OUTPUTPATH } from './const';

export default function getFileList() {
    const contents = GDALFunctions.Module.FS.root.contents.output.contents;
    return Object.keys(contents).map((fn) => ({ path: `${OUTPUTPATH}/${fn}`, size: contents[fn].usedBytes }));
}
