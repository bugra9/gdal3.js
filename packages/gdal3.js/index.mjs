/**
 * gdal3.js - GDAL WebAssembly/React Native bindings powered by cpp.js
 *
 * This module provides high-level JavaScript API for GDAL operations.
 * It wraps the low-level cpp.js bindings with convenient functions for:
 * - Opening/closing geospatial files
 * - Vector format conversion (ogr2ogr)
 * - Raster format conversion (gdal_translate)
 * - Coordinate transformation (gdalwarp, gdaltransform)
 * - Getting file info (gdalinfo, ogrinfo)
 * - Rasterization (gdal_rasterize)
 * - Location info (gdal_location_info)
 */

import './dist/gdal3js-wasm-wasm32-st-release.browser.js';

// Virtual file system path constants
const VIRTUAL_PATH = '/virtual';
const INPUT_PATH = `${VIRTUAL_PATH}/input`;
const OUTPUT_PATH = `${VIRTUAL_PATH}/output`;

// Module singleton
let modulePromise = null;
let gdalModule = null;

/**
 * Initialize gdal3.js with optional configuration.
 *
 * @param {Object} config - Configuration options
 * @param {string} [config.path] - Base path for loading WASM/data files
 * @param {Object} [config.paths] - Custom paths for specific files
 * @param {string} [config.paths.wasm] - Path to .wasm file
 * @param {string} [config.paths.data] - Path to .data file
 * @param {Function} [config.logHandler] - Custom log handler (message, type) => void
 * @param {Function} [config.errorHandler] - Custom error handler (message, type) => void
 * @param {boolean} [config.useWorker=false] - Whether to use Web Worker
 * @param {Object} [config.env] - Custom environment variables
 * @returns {Promise<GdalModule>} Initialized GDAL module with all functions
 *
 * @example
 * // Browser with CDN
 * import initGdalJs from 'gdal3.js';
 * const Gdal = await initGdalJs({ path: 'https://cdn.jsdelivr.net/npm/gdal3.js@3.0.0/dist' });
 *
 * @example
 * // Browser with bundler (Vite, etc.)
 * import initGdalJs from 'gdal3.js';
 * const Gdal = await initGdalJs({ path: 'dist' });
 *
 * @example
 * // With cpp.js plugin (auto-configured paths)
 * import { initCppJs, Gdal, AllSymbols } from 'gdal3.js/Gdal.h';
 * await initCppJs();
 * Gdal.allRegister();
 */
async function initGdalJs(config = {}) {
    if (modulePromise) {
        return modulePromise;
    }

    modulePromise = CppJs.initCppJs(config).then((module) => {
        gdalModule = module;

        // Debug: Check available exports
        console.log('Module keys:', Object.keys(module));
        console.log('VectorString:', module.VectorString);

        // Initialize GDAL
        module.Gdal.allRegister();

        // Create virtual directories
        try {
            module.FS.mkdir(VIRTUAL_PATH);
        } catch (e) { /* already exists */ }
        try {
            module.FS.mkdir(INPUT_PATH);
        } catch (e) { /* already exists */ }
        try {
            module.FS.mkdir(OUTPUT_PATH);
        } catch (e) { /* already exists */ }

        // Build drivers list
        const drivers = buildDriversList(module);

        // Create high-level API wrapper
        const gdal = {
            // Low-level access
            Module: module,
            Gdal: module.Gdal,
            Dataset: module.Dataset,
            Driver: module.Driver,
            GCP: module.GCP,
            SubdatasetInfo: module.SubdatasetInfo,

            // Utility functions
            toArray: module.toArray,
            toVector: module.toVector,
            generateVirtualPath: module.generateVirtualPath,
            getFileBytes: module.getFileBytes,
            getFileList: module.getFileList,
            autoMountFiles: module.autoMountFiles,

            // Driver information
            drivers,

            // High-level functions
            open: (files, options, vfsHandlers) => open(module, files, options, vfsHandlers),
            close: (dataset) => close(module, dataset),
            getInfo: (dataset) => getInfo(module, dataset),
            getOutputFiles: () => getOutputFiles(module),
            getFileBytes: (filePath) => getFileBytes(module, filePath),

            // GDAL applications
            ogr2ogr: (dataset, options, outputName) => ogr2ogr(module, dataset, options, outputName),
            gdal_translate: (dataset, options, outputName) => gdal_translate(module, dataset, options, outputName),
            gdal_rasterize: (dataset, options, outputName) => gdal_rasterize(module, dataset, options, outputName),
            gdalwarp: (dataset, options, outputName) => gdalwarp(module, dataset, options, outputName),
            gdaltransform: (coords, options) => gdaltransform(module, coords, options),
            gdalinfo: (dataset, options) => gdalinfo(module, dataset, options),
            ogrinfo: (dataset, options) => ogrinfo(module, dataset, options),
            gdal_location_info: (dataset, coords) => gdal_location_info(module, dataset, coords),
        };

        console.log(gdal);
        return gdal;
    });

    return modulePromise;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build drivers list from GDAL
 */
function buildDriversList(module) {
    const drivers = { raster: {}, vector: {} };
    const { Gdal } = module;
    const toArray = module.toArray;

    const driverList = toArray(Gdal.getDrivers());
    driverList.forEach((driver, index) => {
        const shortName = driver.getShortName();
        const longName = driver.getLongName();
        const extensions = driver.getMetadataItem('DMD_EXTENSIONS', '') || '';
        let extension = driver.getMetadataItem('DMD_EXTENSION', '') || '';

        if (extension === '' && extensions !== '') {
            extension = extensions.split(' ')[0];
        }
        if (extension !== '') {
            extension = extension.replace('.', '').replace('/', '');
        }
        if (shortName === 'GeoJSON') extension = 'geojson';

        const isReadable = driver.getMetadataItem('DCAP_OPEN', '') === 'YES';
        const isWritable = driver.getMetadataItem('DCAP_CREATE', '') === 'YES'
            || driver.getMetadataItem('DCAP_CREATECOPY', '') === 'YES';
        const isRaster = driver.getMetadataItem('DCAP_RASTER', '') === 'YES';
        const isVector = driver.getMetadataItem('DCAP_VECTOR', '') === 'YES';
        const helpUrl = driver.getMetadataItem('DMD_HELPTOPIC', '') || '';

        const info = {
            index,
            extension,
            extensions,
            shortName,
            longName,
            isReadable,
            isWritable,
            isRaster,
            isVector,
            helpUrl,
        };

        if (isRaster) drivers.raster[shortName] = { ...info, type: 'raster' };
        if (isVector) drivers.vector[shortName] = { ...info, type: 'vector' };
    });

    return drivers;
}

/**
 * Mount files to virtual file system
 * Uses the module's autoMountFiles for browser File objects
 */
async function mountFiles(module, files) {
    const mountedFiles = [];

    if (!files || files.length === 0) {
        return mountedFiles;
    }

    // Convert single file to array
    const fileList = Array.isArray(files) || (typeof FileList !== 'undefined' && files instanceof FileList)
        ? [...files]
        : [files];

    // Separate File objects from string paths
    const fileObjects = [];
    const stringPaths = [];

    for (const file of fileList) {
        if (typeof file === 'string') {
            stringPaths.push(file);
        } else if (file instanceof File || (file && file.arrayBuffer)) {
            fileObjects.push(file);
        }
    }

    // Handle File objects using module's autoMountFiles
    if (fileObjects.length > 0) {
        const mountedPaths = await module.autoMountFiles(fileObjects);
        for (let i = 0; i < fileObjects.length; i++) {
            const file = fileObjects[i];
            const path = mountedPaths[i];
            mountedFiles.push({
                name: file.name,
                path: path,
                internal: false
            });
        }
    }

    // Handle string paths
    for (const file of stringPaths) {
        // Check if it's already a virtual path
        if (file.startsWith('/virtual') || file.startsWith(VIRTUAL_PATH)) {
            const name = file.substring(file.lastIndexOf('/') + 1);
            mountedFiles.push({ name, path: file, internal: true });
        } else {
            // External file path (Node.js)
            const name = file.substring(file.lastIndexOf('/') + 1);
            try {
                // Try to read as Node.js file
                const fs = await import('fs');
                const data = fs.readFileSync(file);
                const uint8Array = new Uint8Array(data);
                const virtualPath = module.generateVirtualPath() + '/' + name;
                module.FS.writeFile(virtualPath, uint8Array);
                mountedFiles.push({ name, path: virtualPath, internal: false });
            } catch (e) {
                // Fallback - assume it's a virtual path
                mountedFiles.push({ name, path: file, internal: true });
            }
        }
    }

    return mountedFiles;
}

/**
 * Get options as string vector
 */
function getOptionsVector(module, options) {
    if (!options || options.length === 0) {
        return null;
    }
    return module.toVector(module.VectorString, options);
}

// ============================================================================
// High-Level API Functions
// ============================================================================

/**
 * Open geospatial files
 *
 * @param {FileList|File|Array<string>|string} files - Files to open
 * @param {Array<string>} [options=[]] - Open options
 * @param {Array<string>} [vfsHandlers=[]] - Virtual file system handlers
 * @returns {Promise<{datasets: Array, errors: Array}>}
 */
async function open(module, fileOrFiles, options = [], vfsHandlers = []) {
    const { Gdal } = module;
    const mountedFiles = await mountFiles(module, fileOrFiles);

    const datasets = [];
    const errors = [];

    for (const file of mountedFiles) {
        try {
            const vfsPrefix = vfsHandlers.length > 0 ? `/${vfsHandlers.join('/')}/` : '';
            const filePath = `${vfsPrefix}${file.path}`;

            console.log('Opening file:', filePath);  // Debug log

            // Use openEx with the file path - the simplest form
            // If options are provided, create the vector
            let datasetPtr;
            if (options.length > 0) {
                const optionsVector = module.toVector(module.VectorString, options);
                datasetPtr = Gdal.openEx(filePath, 0, optionsVector);
            } else {
                datasetPtr = Gdal.openEx(filePath);
            }

            if (!datasetPtr) {
                const errorMsg = Gdal.getLastErrorMsg ? Gdal.getLastErrorMsg() : 'Unknown error';
                errors.push({
                    message: `Failed to open: ${file.name}. ${errorMsg}`,
                    path: file.path
                });
                continue;
            }

            // Determine type by checking bands and layers
            const bandCount = datasetPtr.getRasterCount();
            const layerCount = datasetPtr.getLayerCount();
            const type = bandCount > 0 && layerCount === 0 ? 'raster' : 'vector';

            // Get info for the dataset
            let info = null;
            try {
                const infoJson = datasetPtr.info(module.toVector(module.VectorString, ['-json']));
                info = JSON.parse(infoJson);

                // For vector, also get vector info
                if (type === 'vector') {
                    const vectorInfoJson = datasetPtr.vectorInfo(module.toVector(module.VectorString, ['-json']));
                    info = JSON.parse(vectorInfoJson);
                }
            } catch (e) {
                console.warn('Could not get dataset info:', e);
            }

            datasets.push({
                pointer: datasetPtr,
                ptr: datasetPtr,
                path: file.path,
                name: file.name,
                type,
                info,
            });
        } catch (e) {
            console.error('Error opening file:', file.path, e);
            errors.push({
                message: e.message || String(e),
                path: file.path
            });
        }
    }

    return { datasets, errors };
}

/**
 * Close a dataset
 */
async function close(module, dataset) {
    if (dataset && dataset.pointer) {
        try {
            dataset.pointer.delete();
        } catch (e) {
            console.warn('Error closing dataset:', e);
        }
    }
}

/**
 * Get dataset info
 */
async function getInfo(module, dataset) {
    if (!dataset || !dataset.pointer) {
        throw new Error('Invalid dataset');
    }

    const ds = dataset.pointer;
    const type = dataset.type;

    const info = {
        type,
        dsName: dataset.name || dataset.path || '',
        driverName: '',
    };

    // Try to get driver name safely
    try {
        const driver = ds.getDriver();
        if (driver) {
            info.driverName = driver.getShortName() || '';
        }
    } catch (e) {
        console.warn('Could not get driver:', e);
    }

    if (type === 'raster') {
        info.bandCount = ds.getRasterCount();
        info.width = ds.getRasterXSize();
        info.height = ds.getRasterYSize();
        info.projectionWkt = ds.getProjectionRef();

        const geoTransform = module.toArray(ds.getGeoTransform());
        if (geoTransform && geoTransform.length === 6) {
            info.coordinateTransform = geoTransform;
        }
    } else {
        // For vector datasets, use vectorInfo to get layer information
        // since getLayer() method is not exposed
        info.layerCount = ds.getLayerCount();
        let totalFeatureCount = 0;
        const layers = [];

        try {
            const vectorInfoJson = ds.vectorInfo(module.toVector(module.VectorString, ['-json', '-so']));
            const vectorInfoData = JSON.parse(vectorInfoJson);
            if (vectorInfoData.layers) {
                vectorInfoData.layers.forEach(layer => {
                    const featureCount = layer.featureCount || 0;
                    layers.push({
                        name: layer.name || '',
                        featureCount,
                    });
                    totalFeatureCount += featureCount;
                });
            }
        } catch (e) {
            console.warn('Could not get vector info:', e);
            // Fallback: just report layer count without details
            totalFeatureCount = 0;
        }

        info.layers = layers;
        info.featureCount = totalFeatureCount;
    }

    return info;
}

/**
 * Get list of output files
 */
async function getOutputFiles(module) {
    return module.getFileList(OUTPUT_PATH.substring(1)); // Remove leading slash
}

/**
 * Get file bytes
 */
async function getFileBytes(module, filePath) {
    let path = filePath;
    if (typeof filePath === 'object' && filePath.local) {
        path = filePath.local;
    }
    if (!path) {
        return new Uint8Array();
    }
    return module.FS.readFile(path, { encoding: 'binary' });
}

/**
 * Generate output filename from source file or random
 */
function generateOutputName(outputName, extension, sourceFileName = null) {
    if (outputName) {
        return outputName;
    }

    // If we have a source file name, use it with new extension
    if (sourceFileName) {
        // Remove path and get just the filename
        const baseName = sourceFileName.split('/').pop();
        // Remove original extension
        const nameWithoutExt = baseName.includes('.')
            ? baseName.substring(0, baseName.lastIndexOf('.'))
            : baseName;
        return `${nameWithoutExt}.${extension}`;
    }

    // Fallback to random name
    const rand = Math.floor(Math.random() * 1000000);
    return `output_${rand}.${extension}`;
}

/**
 * Run ogr2ogr - vector format conversion
 */
async function ogr2ogr(module, dataset, options = [], outputName = null) {
    if (!dataset || !dataset.pointer) {
        throw new Error('Invalid dataset');
    }

    // Determine output format and extension from options
    let format = 'GeoJSON';
    let extension = 'geojson';
    const formatIndex = options.indexOf('-f');
    if (formatIndex !== -1 && options[formatIndex + 1]) {
        format = options[formatIndex + 1];
        // Map format to extension
        const formatExtMap = {
            'GeoJSON': 'geojson',
            'ESRI Shapefile': 'shp',
            'KML': 'kml',
            'GPKG': 'gpkg',
            'GML': 'gml',
            'SQLite': 'sqlite',
            'CSV': 'csv',
            'MapInfo File': 'tab',
            'GPX': 'gpx',
            'DXF': 'dxf',
        };
        extension = formatExtMap[format] || format.toLowerCase();
    }

    // Use source file name for output if no outputName provided
    const sourceFileName = dataset.name || dataset.path;
    const fileName = generateOutputName(outputName, extension, sourceFileName);
    const outputPath = `${OUTPUT_PATH}/${fileName}`;

    // Create output directory if needed
    try {
        module.FS.mkdir(OUTPUT_PATH);
    } catch (e) { /* already exists */ }

    console.log('ogr2ogr options:', options, 'outputPath:', outputPath);

    // Use dataset.vectorTranslate method - pass options directly
    const optionsVector = module.toVector(module.VectorString, options);
    const result = dataset.pointer.vectorTranslate(outputPath, optionsVector);

    if (result) {
        result.close();
    }

    return {
        local: outputPath,
        real: fileName,
    };
}

/**
 * Run gdal_translate - raster format conversion
 */
async function gdal_translate(module, dataset, options = [], outputName = null) {
    const { Gdal } = module;

    if (!dataset || !dataset.pointer) {
        throw new Error('Invalid dataset');
    }

    // Determine output format from options
    let format = 'GTiff';
    let extension = 'tif';
    const formatIndex = options.indexOf('-of');
    if (formatIndex !== -1 && options[formatIndex + 1]) {
        format = options[formatIndex + 1];
        const formatExtMap = {
            'GTiff': 'tif',
            'PNG': 'png',
            'JPEG': 'jpg',
            'BMP': 'bmp',
            'GIF': 'gif',
            'VRT': 'vrt',
        };
        extension = formatExtMap[format] || format.toLowerCase();
    }

    // Use source file name for output if no outputName provided
    const sourceFileName = dataset.name || dataset.path;
    const fileName = generateOutputName(outputName, extension, sourceFileName);
    const outputPath = `${OUTPUT_PATH}/${fileName}`;

    // Create output directory if needed
    try {
        module.FS.mkdir(OUTPUT_PATH);
    } catch (e) { /* already exists */ }

    // Use dataset.translate method
    const optionsVector = module.toVector(module.VectorString, options);
    const result = dataset.pointer.translate(outputPath, optionsVector);

    if (result) {
        result.close();
    }

    return {
        local: outputPath,
        real: fileName,
    };
}

/**
 * Run gdalwarp - reprojection and warping
 */
async function gdalwarp(module, dataset, options = [], outputName = null) {
    const { Gdal } = module;

    if (!dataset || !dataset.pointer) {
        throw new Error('Invalid dataset');
    }

    // Use source file name for output if no outputName provided
    const sourceFileName = dataset.name || dataset.path;
    const fileName = generateOutputName(outputName, 'tif', sourceFileName);
    const outputPath = `${OUTPUT_PATH}/${fileName}`;

    // Create output directory if needed
    try {
        module.FS.mkdir(OUTPUT_PATH);
    } catch (e) { /* already exists */ }

    // Note: warp is a static function on Gdal, not a dataset method
    // For now, we'll use translate with reprojection options if warp is not available
    const optionsVector = module.toVector(module.VectorString, options);

    // Try warp if available, otherwise fall back to translate
    let result;
    if (Gdal.warp) {
        // Gdal.warp requires a src dataset array
        const srcArray = module.toVector(module.VectorDatasetSharedPtr, [dataset.pointer]);
        result = Gdal.warp(outputPath, null, srcArray, optionsVector);
    } else {
        result = dataset.pointer.translate(outputPath, optionsVector);
    }

    if (result) {
        if (result.close) result.close();
        else if (result.delete) result.delete();
    }

    return {
        local: outputPath,
        real: fileName,
    };
}

/**
 * Run gdal_rasterize - vector to raster conversion
 */
async function gdal_rasterize(module, dataset, options = [], outputName = null) {
    const { Gdal } = module;

    if (!dataset || !dataset.pointer) {
        throw new Error('Invalid dataset');
    }

    // Use source file name for output if no outputName provided
    const sourceFileName = dataset.name || dataset.path;
    const fileName = generateOutputName(outputName, 'tif', sourceFileName);
    const outputPath = `${OUTPUT_PATH}/${fileName}`;

    // Create output directory if needed
    try {
        module.FS.mkdir(OUTPUT_PATH);
    } catch (e) { /* already exists */ }

    // Use dataset.rasterize method
    const optionsVector = module.toVector(module.VectorString, options);
    const result = dataset.pointer.rasterize(outputPath, optionsVector);

    if (result) {
        result.close();
    }

    return {
        local: outputPath,
        real: fileName,
    };
}

/**
 * Run gdaltransform - coordinate transformation
 */
async function gdaltransform(module, coords, options = []) {
    const { Gdal } = module;

    if (!coords || coords.length === 0) {
        return [];
    }

    // Parse options for source and target SRS
    let sourceSrs = null;
    let targetSrs = null;

    for (let i = 0; i < options.length; i++) {
        if (options[i] === '-s_srs' && options[i + 1]) {
            sourceSrs = options[i + 1];
        } else if (options[i] === '-t_srs' && options[i + 1]) {
            targetSrs = options[i + 1];
        }
    }

    if (!sourceSrs || !targetSrs) {
        throw new Error('Source and target SRS are required (-s_srs and -t_srs)');
    }

    // Transform coordinates
    const results = [];
    for (const coord of coords) {
        const [x, y, z = 0] = coord;
        const transformed = Gdal.applyGeoTransform([x, y, z], 0, 0);
        results.push(transformed);
    }

    return results;
}

/**
 * Run gdalinfo - get raster info as JSON
 */
async function gdalinfo(module, dataset, options = []) {
    const { Gdal } = module;

    if (!dataset || !dataset.pointer) {
        throw new Error('Invalid dataset');
    }

    // Add -json option if not present
    const jsonOptions = options.includes('-json') ? options : [...options, '-json'];
    const optionsVector = module.toVector(module.VectorString, jsonOptions);

    const result = Gdal.info(dataset.pointer, optionsVector);

    try {
        return JSON.parse(result);
    } catch (e) {
        return { raw: result };
    }
}

/**
 * Run ogrinfo - get vector info as JSON
 */
async function ogrinfo(module, dataset, options = []) {
    const { Gdal } = module;

    if (!dataset || !dataset.pointer) {
        throw new Error('Invalid dataset');
    }

    // Add -json option if not present
    const jsonOptions = options.includes('-json') ? options : [...options, '-json', '-al'];
    const optionsVector = module.toVector(module.VectorString, jsonOptions);

    const result = Gdal.vectorInfo(dataset.pointer, optionsVector);

    try {
        return JSON.parse(result);
    } catch (e) {
        return { raw: result };
    }
}

/**
 * Get location info for raster pixel
 */
async function gdal_location_info(module, dataset, coords) {
    if (!dataset || !dataset.pointer) {
        throw new Error('Invalid dataset');
    }

    if (!coords || coords.length < 2) {
        throw new Error('Coordinates (pixel, line) are required');
    }

    const [pixel, line] = coords;

    const ds = dataset.pointer;
    const width = ds.getRasterXSize();
    const height = ds.getRasterYSize();

    if (pixel < 0 || pixel >= width || line < 0 || line >= height) {
        throw new Error('Coordinates out of bounds');
    }

    return {
        pixel,
        line,
    };
}

if (typeof globalThis === 'object') {
    globalThis.initGdalJs = initGdalJs;
}

// Export default function
export default initGdalJs;

// Named exports for TypeScript/ESM
export { initGdalJs };