export const GDALFunctions = {
    Module: {},
};

export function initCFunctions() {
    if (GDALFunctions.GDALOpen) return;
    const Module = GDALFunctions.Module;

    Module.ccall('GDALAllRegister', null, [], []);

    GDALFunctions.GDALOpen = Module.cwrap('GDALOpen', 'number', ['string']);
    GDALFunctions.GDALOpenEx = Module.cwrap('GDALOpenEx', 'number', [
        'string', // char * the destination dataset path or NULL.
        'number', // unsigned int a combination of GDAL_OF_ flags that may be combined through logical or operator.
        'number', // char ** null-terminated array of strings with the driver short names that must be considered.
        'number', // char ** null-terminated array of strings with the dataset open options.
        'number', // char ** null-terminated array of strings that are filenames auxiliary to the main filename.
    ]);
    GDALFunctions.GDALClose = Module.cwrap('GDALClose', null, ['number']);
    GDALFunctions.CPLErrorReset = Module.cwrap('CPLErrorReset', null, []);
    GDALFunctions.CPLSetErrorHandler = Module.cwrap('CPLSetErrorHandler', 'number', ['number']);
    GDALFunctions.CPLQuietErrorHandler = Module.cwrap('CPLQuietErrorHandler', null, ['number', 'number', 'string']);
    // const cplQuietFnPtr = Module.addFunction(GDALFunctions.CPLQuietErrorHandler, 'viii');
    GDALFunctions.CPLGetLastErrorNo = Module.cwrap('CPLGetLastErrorNo', 'number', []);
    GDALFunctions.CPLGetLastErrorMsg = Module.cwrap('CPLGetLastErrorMsg', 'string', []);
    GDALFunctions.CPLGetLastErrorType = Module.cwrap('CPLGetLastErrorType', 'number', []);
    GDALFunctions.CPLSetConfigOption = Module.cwrap('CPLSetConfigOption', null, ['string', 'string']);
    GDALFunctions.CPLSetThreadLocalConfigOption = Module.cwrap('CPLSetThreadLocalConfigOption', null, ['string', 'string']);
    GDALFunctions.GDALGetRasterCount = Module.cwrap('GDALGetRasterCount', 'number', ['number']);
    GDALFunctions.GDALGetRasterXSize = Module.cwrap('GDALGetRasterXSize', 'number', ['number']);
    GDALFunctions.GDALGetRasterYSize = Module.cwrap('GDALGetRasterYSize', 'number', ['number']);
    GDALFunctions.GDALGetProjectionRef = Module.cwrap('GDALGetProjectionRef', 'string', ['number']);
    GDALFunctions.GDALGetGeoTransform = Module.cwrap('GDALGetGeoTransform', 'number', ['number', 'number']);
    GDALFunctions.GDALInvGeoTransform = Module.cwrap('GDALInvGeoTransform', 'number', ['number', 'number']);
    GDALFunctions.GDALVectorTranslate = Module.cwrap('GDALVectorTranslate', 'number', [
        'string', // char * the destination dataset path or NULL.
        'number', // GDALDatasetH the destination dataset or NULL.
        'number', // int the number of input datasets (only 1 supported currently)
        'number', // GDALDatasetH the list of input datasets.
        'number', // GDALVectorTranslateOptions * options object to use
        'number', // int * pbUsageError
    ]);
    GDALFunctions.GDALVectorTranslateOptionsNew = Module.cwrap('GDALVectorTranslateOptionsNew', 'number', ['number', 'number']);
    GDALFunctions.GDALVectorTranslateOptionsFree = Module.cwrap('GDALVectorTranslateOptionsFree', 'number', ['number']);
    GDALFunctions.GDALDatasetGetLayerCount = Module.cwrap('GDALDatasetGetLayerCount', 'number', ['number']);
    GDALFunctions.GDALDatasetGetLayer = Module.cwrap('GDALDatasetGetLayer', 'number', ['number', 'number']);
    GDALFunctions.OGR_DS_GetLayerCount = Module.cwrap('OGR_DS_GetLayerCount', 'number', ['number']);
    GDALFunctions.OGR_DS_GetName = Module.cwrap('OGR_DS_GetName', 'string', ['number']);
    GDALFunctions.OGR_DS_GetLayer = Module.cwrap('OGR_DS_GetLayer', 'number', ['number', 'number']);
    GDALFunctions.OGR_L_GetName = Module.cwrap('OGR_L_GetName', 'string', ['number']);

    GDALFunctions.OGR_DS_GetDriver = Module.cwrap('OGR_DS_GetDriver', 'number', ['number']);
    GDALFunctions.OGR_Dr_GetName = Module.cwrap('OGR_Dr_GetName', 'string', ['number']);
    GDALFunctions.GDALGetDatasetDriver = Module.cwrap('GDALGetDatasetDriver', 'number', ['number']);
    GDALFunctions.GDALGetDriverLongName = Module.cwrap('GDALGetDriverLongName', 'string', ['number']);
    GDALFunctions.GDALGetDriverShortName = Module.cwrap('GDALGetDriverShortName', 'string', ['number']);

    GDALFunctions.GDALTranslate = Module.cwrap('GDALTranslate', 'number', [
        'string', // char * output filename
        'number', // GDALDatasetH dataset to translate
        'number', // GDALTranslateOptions * options object to use
        'number', // int * pbUsageError
    ]);
    GDALFunctions.GDALTranslateOptionsNew = Module.cwrap('GDALTranslateOptionsNew', 'number', ['number', 'number']);
    GDALFunctions.GDALTranslateOptionsFree = Module.cwrap('GDALTranslateOptionsFree', 'number', ['number']);

    GDALFunctions.GDALRasterize = Module.cwrap('GDALRasterize', 'number', ['string', 'number', 'number', 'number', 'number']);
    GDALFunctions.GDALRasterizeOptionsNew = Module.cwrap('GDALRasterizeOptionsNew', 'number', ['number', 'number']);
    GDALFunctions.GDALRasterizeOptionsFree = Module.cwrap('GDALRasterizeOptionsFree', 'number', ['number']);

    GDALFunctions.GDALWarp = Module.cwrap('GDALWarp', 'number', [
        'string', // Destination dataset path or NULL
        'number', // GDALDatasetH destination dataset or NULL
        'number', // Number of input datasets
        'number', // GDALDatasetH * list of source datasets
        'number', // GDALWarpAppOptions *
        'number', // int * to store errors in if they occur
    ]);
    GDALFunctions.GDALWarpAppOptionsNew = Module.cwrap('GDALWarpAppOptionsNew', 'number', [
        'number', // char ** null-terminated array of option strings as to gdalwarp executable
        'number', // pointer to struct that should usually be null
    ]);
    GDALFunctions.GDALWarpAppOptionsSetProgress = Module.cwrap('GDALWarpAppOptionsSetProgress', 'number', [
        'number', // GDALWarpAppOptions *
        'number', // GDALProgressFunc
        'number', // void * progress function data
    ]);
    GDALFunctions.GDALWarpAppOptionsFree = Module.cwrap('GDALWarpAppOptionsFree', 'number', [
        'number', // GDALWarpAppOptions *
    ]);

    GDALFunctions.OSRNewSpatialReference = Module.cwrap('OSRNewSpatialReference', 'number', ['string']);
    GDALFunctions.OSRDestroySpatialReference = Module.cwrap('OSRDestroySpatialReference', 'number', [
        'number', // SpatialReferenceH
    ]);
    GDALFunctions.OCTNewCoordinateTransformation = Module.cwrap(
        'OCTNewCoordinateTransformation',
        'number',
        ['number', 'number'],
    );
    GDALFunctions.OCTDestroyCoordinateTransformation = Module.cwrap('OCTDestroyCoordinateTransformation', 'number', [
        'number', // CoordinateTransformationH
    ]);
    GDALFunctions.OCTTransform = Module.cwrap(
        'OCTTransform',
        'number',
        ['number', 'number', 'number', 'number', 'number'],
    );

    GDALFunctions.GDALGetDriverCount = Module.cwrap('GDALGetDriverCount', 'number', []);
    GDALFunctions.OGRGetDriverCount = Module.cwrap('OGRGetDriverCount', 'number', []);
    GDALFunctions.GDALGetDriver = Module.cwrap('GDALGetDriver', 'number', ['number']);
    GDALFunctions.OGRGetDriver = Module.cwrap('OGRGetDriver', 'number', ['number']);
    GDALFunctions.GDALGetMetadataItem = Module.cwrap('GDALGetMetadataItem', 'string', ['number', 'string', 'string']);
    GDALFunctions.GDALGetDescription = Module.cwrap('GDALGetDescription', 'string', ['number']);
    GDALFunctions.OGR_L_GetFeatureCount = Module.cwrap('OGR_L_GetFeatureCount', 'number', ['number', 'number']);

    GDALFunctions.GDALGenImgProjTransform = Module.cwrap('GDALGenImgProjTransform', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
    GDALFunctions.GDALCreateGenImgProjTransformer2 = Module.cwrap('GDALCreateGenImgProjTransformer2', 'number', ['number', 'number', 'number']);
    GDALFunctions.GDALDestroyGenImgProjTransformer = Module.cwrap('GDALDestroyGenImgProjTransformer', null, ['number']);

    GDALFunctions.OSRSetFromUserInput = Module.cwrap('OSRSetFromUserInput', 'number', ['number', 'string']);
    GDALFunctions.OSRExportToWkt = Module.cwrap('OSRExportToWkt', 'number',['number','number']);
    GDALFunctions.GDALGetSpatialRef = Module.cwrap('GDALGetSpatialRef','number',['number'])
    GDALFunctions.CPLAtof = Module.cwrap('CPLAtof','number',['string'])
    GDALFunctions.OSRSetAxisMappingStrategy = Module.cwrap('OSRSetAxisMappingStrategy',null,['number','number'])
    // GDALFunctions.CPLSetErrorHandler(cplQuietFnPtr);
}
