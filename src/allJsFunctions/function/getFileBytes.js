import { GDALFunctions } from '../../allCFunctions';

/*
    @param  {string} The path of the file to be downloaded.
    @return {Promise -> Uint8Array} "Promise" returns an array of bytes of the file.
*/
export default function getFileBytes(path) {
    return new Promise((resolve) => {
        const bytes = GDALFunctions.Module.FS.readFile(path, { encoding: 'binary' });
        resolve(bytes);
    });
}
