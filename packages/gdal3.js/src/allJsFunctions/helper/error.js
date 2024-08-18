import { GDALFunctions } from '../../allCFunctions';

export function getGdalError() {
    const message = GDALFunctions.CPLGetLastErrorMsg();
    const no = GDALFunctions.CPLGetLastErrorNo();
    GDALFunctions.CPLErrorReset();
    return { no, message };
}

export function getSystemError(message) {
    return { no: -1, message };
}
