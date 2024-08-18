import getFileList from '../helper/getFileList';

/**
    * Get paths of created files. Returns empty array on Node.js.
    *
    * @module f/getOutputFiles
    * @async
    * @return {Promise<Array<TypeDefs.FileInfo>>} "Promise" returns path and size of created files.
    * @example
    * const files = await Gdal.getOutputFiles();
    * files.forEach((fileInfo) => {
    *   console.log(`file path: ${fileInfo.path}, file size: ${fileInfo.size}`);
    * });
*/
export default function getOutputFiles() {
    return new Promise((resolve) => {
        const files = getFileList();
        resolve(files);
    });
}
