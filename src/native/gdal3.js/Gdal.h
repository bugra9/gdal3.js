#ifndef _GDAL3JS_GDAL_H
#define _GDAL3JS_GDAL_H

#include <memory>
#include <stdlib.h>

class Dataset;
class Driver;
class SubdatasetInfo;
class GCP;

class Gdal {
public:
    friend class Dataset;
    friend class Driver;
    friend class SubdatasetInfo;
    friend class GCP;
    // static CPLErrorHandler setErrorHandler(CPLErrorHandler);
    static void setCurrentErrorHandlerCatchDebug(int bCatchDebug);
    // static void pushErrorHandler(CPLErrorHandler);
    static void error(int eErrClass, int err_no, std::string fmt);
    static std::string goa2GetAuthorizationURL(std::string pszScope);
    static std::string goa2GetRefreshToken(std::string pszAuthToken, std::string pszScope);
    static std::string goa2GetAccessToken(std::string pszRefreshToken, std::string pszScope);
    static void popErrorHandler();
    static void errorReset();
    static std::string escapeString(std::string pszString, int nLength, int nScheme);
    static int getLastErrorNo();
    static int getLastErrorType();
    static std::string getLastErrorMsg();
    static int getErrorCounter();
    static int vsiGetLastErrorNo();
    static std::string vsiGetLastErrorMsg();
    static void vsiErrorReset();
    static void pushFinderLocation(std::string);
    static void popFinderLocation();
    static void finderClean();
    static std::string findFile(std::string pszClass, std::string pszBasename);
    static std::vector<std::string> readDir(std::string pszDirname);
    static std::vector<std::string> readDirRecursive(std::string pszPath);
    static void setConfigOption(std::string, std::string);
    static void setThreadLocalConfigOption(std::string pszKey, std::string pszValue);
    static std::string getConfigOption(std::string, std::string);
    static std::string getGlobalConfigOption(std::string, std::string);
    static std::string getThreadLocalConfigOption(std::string, std::string);
    static std::vector<std::string> getConfigOptions();
    static void setPathSpecificOption(std::string pszPathPrefix, std::string pszKey, std::string pszValue);
    static std::string getPathSpecificOption(std::string pszPath, std::string pszKey, std::string pszDefault);
    static void clearPathSpecificOptions(std::string pszPathPrefix);
    static std::string binaryToHex(int nBytes, std::vector<unsigned char> pabyData);
    static std::vector<unsigned char> hexToBinary(std::string pszHex);
    static int fileFromMemBuffer(std::string pszFilename, std::vector<unsigned char> pabyData);
    static int unlink(std::string pszFilename);
    static bool unlinkBatch(std::vector<std::string> papszFiles);
    static int mkdir(std::string pszDirname, long nMode);
    static int rmdir(std::string pszDirname);
    static int mkdirRecursive(std::string pszPathname, long mode);
    static int rmdirRecursive(std::string pszDirname);
    static int rename(std::string oldpath, std::string newpath);
    static int copyFile(std::string pszNewPath, std::string pszOldPath);
    static std::string getActualURL(std::string pszFilename);
    static std::string getSignedURL(std::string /*pszFilename*/, std::vector<std::string> /* papszOptions */);
    static std::vector<std::string> getFileSystemsPrefixes();
    static std::string getFileSystemOptions(std::string pszFilename);
    static std::vector<std::string> parseCommandLine(std::string pszCommandLine);
    static int getNumCPUs();
    static uint64_t getUsablePhysicalRAM();
    static int gcpsToGeoTransform(std::vector<std::shared_ptr<GCP>> pasGCPs, std::vector<double> padfGeoTransform, int bApproxOK);
    static std::shared_ptr<SubdatasetInfo> getSubdatasetInfo(std::string pszFileName);

    // static int computeMedianCutPCT(RasterBand hRed, RasterBand hGreen, RasterBand hBlue/*, int (*pfnIncludePixel)(int, int, void *) */, int nColors, ColorTable hColorTable, GDALProgressFunc pfnProgress/*, void *pProgressArg*/);
    // static int ditherRGB2PCT(RasterBand hRed, RasterBand hGreen, RasterBand hBlue, RasterBand hTarget, ColorTable hColorTable, GDALProgressFunc pfnProgress/*, void *pProgressArg*/);
    // static int reprojectImage(Dataset hSrcDS, std::string pszSrcWKT, Dataset hDstDS, std::string pszDstWKT, GDALResampleAlg eResampleAlg, double dfWarpMemoryLimit, double dfMaxError, GDALProgressFunc pfnProgress/*, void *pProgressArg*/, std::vector<GDALWarpOptions> psOptions);
    // static int computeProximity(RasterBand hSrcBand, RasterBand hProximityBand, std::vector<std::string> papszOptions, GDALProgressFunc pfnProgress/*, void *pProgressArg*/);
    // static int polygonize(RasterBand hSrcBand, RasterBand hMaskBand, Layer hOutLayer, int iPixValField, std::string papszOptions, GDALProgressFunc pfnProgress/*, void *pProgressArg*/);
    // static int fPolygonize(RasterBand hSrcBand, RasterBand hMaskBand, Layer hOutLayer, int iPixValField, std::string papszOptions, GDALProgressFunc pfnProgress/*, void *pProgressArg*/);
    // static int fillNodata(RasterBand hTargetBand, RasterBand hMaskBand, double dfMaxSearchDist, int bDeprecatedOption, int nSmoothingIterations, std::string papszOptions, GDALProgressFunc pfnProgress/*, void *pProgressArg*/);
    // static int sieveFilter(RasterBand hSrcBand, RasterBand hMaskBand, RasterBand hDstBand, int nSizeThreshold, int nConnectedness, std::string papszOptions, GDALProgressFunc pfnProgress/*, void *pProgressArg*/);
    // static int regenerateOverviews(RasterBand hSrcBand, int nOverviewCount, RasterBand *pahOverviewBands, std::string pszResampling, GDALProgressFunc pfnProgress, void *pProgressData);
    // static int gridCreate(GDALGridAlgorithm, const void *, int, std::vector<double>, std::vector<double>, std::vector<double>, double, double, double, double, int, int, int, void *, GDALProgressFunc, void *);
    // static int contourGenerate(RasterBand hBand, double dfContourInterval, double dfContourBase, int nFixedLevelCount, std::vector<double> padfFixedLevels, int bUseNoData, double dfNoDataValue, void *hLayer, int iIDField, int iElevField, GDALProgressFunc pfnProgress/*, void *pProgressArg*/);
    // static int contourGenerateEx(RasterBand hBand, void *hLayer, std::vector<std::string> options, GDALProgressFunc pfnProgress/*, void *pProgressArg*/);
    // static Dataset viewshedGenerate(RasterBand hBand, std::string pszDriverName, std::string pszTargetRasterName, std::vector<std::string> papszCreationOptions, double dfObserverX, double dfObserverY, double dfObserverHeight, double dfTargetHeight, double dfVisibleVal, double dfInvisibleVal, double dfOutOfRangeVal, double dfNoDataVal, double dfCurvCoeff, GDALViewshedMode eMode, double dfMaxDistance, GDALProgressFunc pfnProgress/*, void *pProgressArg*/, GDALViewshedOutputType heightMode, std::vector<std::string> papszExtraOptions);
    // static Dataset autoCreateWarpedVRT(Dataset hSrcDS, std::string pszSrcWKT, std::string pszDstWKT, GDALResampleAlg eResampleAlg, double dfMaxError, const GDALWarpOptions *psOptions);
    // static Dataset createPansharpenedVRT(std::string pszXML, RasterBand hPanchroBand, int nInputSpectralBands, std::vector<RasterBand> pahInputSpectralBands);
    // static SuggestedWarpOutputRes suggestedWarpOutput(Dataset hSrcDS, GDALTransformerFunc pfnTransformer);

    static std::vector<double> applyGeoTransform(std::vector<double>, double, double);
    static std::vector<double> invGeoTransform(std::vector<double> padfGeoTransformIn);

    static std::string versionInfo(std::string pszRequest);
    static void allRegister();
    static void registerPlugins();
    static int registerPlugin(std::string name);
    static void destroyDriverManager();
    static int getCacheMax();
    static int getCacheUsed();
    static void setCacheMax(int nBytes);
    static int getDataTypeSize(int);
    static int dataTypeIsComplex(int);
    static std::string getDataTypeName(int);
    static int getDataTypeByName(std::string);
    static int dataTypeUnion(int, int);
    static std::string getColorInterpretationName(int);
    static std::string getPaletteInterpretationName(int);
    static std::string decToDMS(double, std::string, int);
    static double packedDMSToDec(double);
    static double decToPackedDMS(double);
    static int getDriverCount();
    static std::shared_ptr<Driver> getDriverByName(std::string);
    static std::shared_ptr<Driver> getDriver(int);
    static std::shared_ptr<Dataset> open(std::string pszFilename);
    static std::shared_ptr<Dataset> open(std::string pszFilename, int eAccess);
    static std::shared_ptr<Dataset> openEx(std::string pszFilename);
    static std::shared_ptr<Dataset> openEx(std::string pszFilename, unsigned int nOpenFlags);
    static std::shared_ptr<Dataset> openEx(std::string pszFilename, unsigned int nOpenFlags, std::vector<std::string> papszOpenOptions);
    static std::shared_ptr<Dataset> openEx(std::string pszFilename, unsigned int nOpenFlags, std::vector<std::string> papszAllowedDrivers, std::vector<std::string> papszOpenOptions, std::vector<std::string> papszSiblingFiles);
    static std::shared_ptr<Dataset> openShared(std::string, int);
    static std::shared_ptr<Driver> identifyDriver(std::string pszFilename, std::vector<std::string> papszFileList);
    static std::shared_ptr<Driver> identifyDriverEx(std::string pszFilename, unsigned int nIdentifyFlags, std::vector<std::string> papszAllowedDrivers, std::vector<std::string>papszFileList);

    static std::shared_ptr<Dataset> warp(std::string pszDest, std::shared_ptr<Dataset> hDstDS, std::vector<std::shared_ptr<Dataset>> pahSrcDS, std::vector<std::string> psOptions);
    static std::shared_ptr<Dataset> buildVRT(std::string pszDest, std::vector<std::shared_ptr<Dataset>> pahSrcDS, std::vector<std::string> papszSrcDSNames, std::vector<std::string> psOptions);
    static std::shared_ptr<Dataset> multiDimTranslate(std::string pszDest, std::shared_ptr<Dataset> hDstDataset, std::vector<std::shared_ptr<Dataset>> pahSrcDS, std::vector<std::string> psOptions);

    static void setProjDataPath(std::string path);
    static std::vector<std::shared_ptr<Driver>> getDrivers();

private:
    static std::string charPtrToString(const char *);
    static std::vector<std::string> charPtrPtrToStringVector(char **);
    static std::vector<double> doublePtrToDoubleVector(double* doublearray);
};

#endif
