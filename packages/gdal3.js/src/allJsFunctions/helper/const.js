export const INPUTPATH = '/input';
export const OUTPUTPATH = '/output';

let realOutputPath = OUTPUTPATH;

export function getRealOutputPath() {
    return realOutputPath;
}

export function setRealOutputPath(path) {
    realOutputPath = path;
}
