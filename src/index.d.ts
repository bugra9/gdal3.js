interface FileInfo {
    path: string;
    size: number;
}

interface FilePath {
    local: string;
    real: string;
}

interface Dataset {
    pointer: number;
    path: string;
    type: string;
}

interface DatasetList {
    datasets: Array<Dataset>;
    errors: Array<string>;
}

interface Layer {
    name: string;
    featureCount: number;
}

interface DatasetInfo {
    type: string;
    dsName: string;
    driverName: string;
    bandCount?: number;
    width?: number;
    height?: number;
    projectionWkt?: string;
    coordinateTransform?: Array<number>;
    corners?: Array<Array<number>>;
    layerCount?: number;
    featureCount?: number;
    layers?: Array<Layer>;
}

interface LocationInfo{
    pixel: number;
    line: number;
}

interface Drivers {
    raster: Object;
    vector: Object;
}

interface Gdal {
    ogr2ogr(dataset: Dataset, options: Array<string>): Promise<FilePath>;
    gdal_translate(dataset: Dataset, options: Array<string>): Promise<FilePath>;
    gdal_rasterize(dataset: Dataset, options: Array<string>): Promise<FilePath>;
    gdalwarp(dataset: Dataset, options: Array<string>): Promise<FilePath>;
    gdaltransform(coords: Array<Array<number>>, options: Array<string>): Promise<Array<Array<number>>>;
    open(fileOrFiles: FileList|File|Array<string>|string): Promise<DatasetList>;
    close(dataset: Dataset): Promise<void>;
    getInfo(dataset: Dataset): Promise<DatasetInfo>;
    getOutputFiles(): Promise<Array<FileInfo>>;
    getFileBytes(filePath: string|FilePath): Promise<Uint8Array>;
    drivers: Drivers;
    gdal_location_info: Promise<LocationInfo>;
}

interface GdalFilePaths {
    wasm: string;
    data: string;
    js?: string;
}

interface Config {
    path?: string;
    paths?: GdalFilePaths
    dest?: string;
    useWorker?: boolean;
}

declare module 'gdal3.js' {
    export default function initGdalJs(config?: Config): Promise<Gdal>;
}
