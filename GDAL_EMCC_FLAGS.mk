GDAL_EMCC_FLAGS :=

ifeq ($(type), debug)
GDAL_EMCC_FLAGS += -g4 --source-map-base http://localhost:8080/dist/ -fsanitize=address
else
GDAL_EMCC_FLAGS += -O3
endif

GDAL_EMCC_FLAGS += -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s FORCE_FILESYSTEM=1
GDAL_EMCC_FLAGS += -lworkerfs.js
GDAL_EMCC_FLAGS += -lnodefs.js
GDAL_EMCC_FLAGS += -s TOTAL_MEMORY=512MB -s ALLOW_MEMORY_GROWTH=1 -s DISABLE_EXCEPTION_CATCHING=0
GDAL_EMCC_FLAGS += -s WASM=1 -s MODULARIZE=1 -s 'EXPORT_NAME="CModule"'
GDAL_EMCC_FLAGS += -s RESERVED_FUNCTION_POINTERS=200
GDAL_EMCC_FLAGS += -s EXPORTED_FUNCTIONS="[\
  '_CSLCount',\
  '_GDALSetCacheMax',\
  '_GDALAllRegister',\
  '_GDALOpen',\
  '_GDALOpenEx',\
  '_GDALClose',\
  '_GDALGetDriverByName',\
  '_GDALCreate',\
  '_GDALCreateCopy',\
  '_GDALGetRasterXSize',\
  '_GDALGetRasterYSize',\
  '_GDALGetRasterCount',\
  '_GDALGetRasterDataType',\
  '_GDALGetRasterBand',\
  '_GDALGetRasterStatistics',\
  '_GDALGetRasterMinimum',\
  '_GDALGetRasterMaximum',\
  '_GDALGetRasterNoDataValue',\
  '_GDALGetProjectionRef',\
  '_GDALSetProjection',\
  '_GDALGetGeoTransform',\
  '_GDALSetGeoTransform',\
  '_OSRNewSpatialReference',\
  '_OSRDestroySpatialReference',\
  '_OSRImportFromEPSG',\
  '_OCTNewCoordinateTransformation',\
  '_OCTDestroyCoordinateTransformation',\
  '_OCTTransform',\
  '_GDALCreateGenImgProjTransformer',\
  '_GDALDestroyGenImgProjTransformer',\
  '_GDALGenImgProjTransform',\
  '_GDALDestroyGenImgProjTransformer',\
  '_GDALSuggestedWarpOutput',\
  '_GDALTranslate',\
  '_GDALTranslateOptionsNew',\
  '_GDALTranslateOptionsFree',\
  '_GDALWarpAppOptionsNew',\
  '_GDALWarpAppOptionsSetProgress',\
  '_GDALWarpAppOptionsFree',\
  '_GDALWarp',\
  '_GDALBuildVRTOptionsNew',\
  '_GDALBuildVRTOptionsFree',\
  '_GDALBuildVRT',\
  '_GDALReprojectImage',\
  '_CPLError',\
  '_CPLSetErrorHandler',\
  '_CPLQuietErrorHandler',\
  '_CPLErrorReset',\
  '_CPLGetLastErrorMsg',\
  '_CPLGetLastErrorNo',\
  '_CPLGetLastErrorType',\
  '_GDALRasterize',\
  '_GDALRasterizeOptionsNew',\
  '_GDALRasterizeOptionsFree',\
  '_GDALDEMProcessing',\
  '_GDALDEMProcessingOptionsNew',\
  '_GDALDEMProcessingOptionsFree',\
  '_GDALVectorTranslate',\
  '_GDALVectorTranslateOptionsNew',\
  '_GDALVectorTranslateOptionsFree',\
  '_GDALDatasetGetLayerCount',\
  '_GDALGetDatasetDriver',\
  '_GDALGetFileList',\
  '_GDALGetDriverLongName',\
  '_GDALGetDriverShortName',\
  '_GDALDatasetGetLayer',\
  '_OGR_L_GetName',\
  '_OGR_DS_GetName',\
  '_OGR_DS_GetLayerCount',\
  '_OGR_DS_GetLayer',\
  '_OGR_DS_GetDriver',\
  '_OGR_Dr_GetName',\
  '_GDALGetDriverCount',\
  '_GDALGetDriver',\
  '_GDALGetMetadataItem',\
  '_OGRGetDriverCount',\
  '_OGRGetDriver',\
  '_GDALGetDescription',\
  '_OGR_L_GetFeatureCount',\
  '_GDALGenImgProjTransform',\
  '_GDALCreateGenImgProjTransformer2',\
  '_GDALDestroyGenImgProjTransformer',\
  '_OSRSetFromUserInput',\
  '_OSRExportToWkt',\
  '_CPLSetConfigOption',\
  '_CPLSetThreadLocalConfigOption',\
  '_GDALGetSpatialRef',\
  '_CPLAtof',\
  '_OSRSetAxisMappingStrategy',\
  '_GDALInvGeoTransform'\
]"

GDAL_EMCC_FLAGS += -s EXPORTED_RUNTIME_METHODS="[\
  'setValue',\
  'getValue',\
  'ccall',\
  'cwrap',\
  'stringToUTF8',\
  'lengthBytesUTF8',\
  'FS',\
  'ENV',\
  'WORKERFS',\
  'NODEFS',\
  'MEMFS',\
  'addFunction'\
]"
