import getFileList from '../helper/getFileList';

/*
    Get paths of created files.

    @return {Promise -> Array} "Promise" returns path and size of created files.
*/
export default function getOutputFiles() {
    return new Promise((resolve) => {
        const files = getFileList();
        resolve(files);
    });
}
