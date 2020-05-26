/* eslint-disable no-underscore-dangle */
import { GDALFunctions } from '../../allCFunctions';

export function getOptions(options) {
    const ptrsArray = options.map((str) => GDALFunctions.Module._malloc(GDALFunctions.Module.lengthBytesUTF8(str) + 1));
    ptrsArray.push(0);
    const strPtrs = Uint32Array.from(ptrsArray);
    options.forEach((str, i) => {
        GDALFunctions.Module.stringToUTF8(str, strPtrs[i], GDALFunctions.Module.lengthBytesUTF8(str) + 1);
    });
    const ptrOffset = GDALFunctions.Module._malloc(strPtrs.length * strPtrs.BYTES_PER_ELEMENT);
    GDALFunctions.Module.HEAPU32.set(strPtrs, ptrOffset / strPtrs.BYTES_PER_ELEMENT);
    return { ptr: ptrOffset, ptrArray: ptrsArray };
}

export function clearOptions(i) {
    GDALFunctions.Module._free(i.ptr);
    i.ptrArray.forEach((ptr) => { GDALFunctions.Module._free(ptr); });
}
