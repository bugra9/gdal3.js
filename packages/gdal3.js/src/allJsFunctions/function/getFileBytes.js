import { GDALFunctions } from '../../allCFunctions';

/**
    * Get bytes of the file.
    *
    * @module f/getFileBytes
    * @async
    * @param {string|TypeDefs.FilePath} filePath The path of the file to be downloaded.
    * @return {Promise<Uint8Array>} "Promise" returns an array of byte of the file.
    * @example
    * // Download file from "/output" path on the browser.
    * const files = await Gdal.getOutputFiles();
    * const filePath = files[0].path;
    * const fileBytes = Gdal.getFileBytes(filePath);
    * const fileName = filePath.split('/').pop();
    * saveAs(fileBytes, filename);
    *
    * function saveAs(fileBytes, fileName) {
    *    const blob = new Blob([fileBytes]);
    *    const link = document.createElement('a');
    *    link.href = URL.createObjectURL(blob);
    *    link.download = fileName;
    *    link.click();
    * }
*/

export default function getFileBytes(filePath) {
    return new Promise((resolve) => {
        let path;
        if (!filePath) {
            resolve(new Uint8Array());
            return;
        }

        if (filePath.local) {
            path = filePath.local;
        } else {
            path = filePath;
        }

        const bytes = GDALFunctions.Module.FS.readFile(path, { encoding: 'binary' });
        resolve(bytes);
    });
}
