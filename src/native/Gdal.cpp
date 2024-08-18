#include <gdal3.js/Gdal.h>
#include <gdal3.js/Dataset.h>
#include <gdal3.js/Driver.h>
#include <gdal3.js/GCP.h>
#include <gdal3.js/SubdatasetInfo.h>

#include "cpl_multiproc.h"
#include "cpl_http.h"
#include "cpl_vsi_error.h"

#include "gdal_utils.h"

// CPLErrorHandler Gdal::setErrorHandler(CPLErrorHandler) {}
void Gdal::setCurrentErrorHandlerCatchDebug(int bCatchDebug) {
    CPLSetCurrentErrorHandlerCatchDebug(bCatchDebug);
}
// void Gdal::pushErrorHandler(CPLErrorHandler) {}
void Gdal::error(int eErrClass, int err_no, std::string fmt) {
    CPLError((CPLErr) eErrClass, err_no, "%s", fmt.c_str());
}
std::string Gdal::goa2GetAuthorizationURL(std::string pszScope) {
    return charPtrToString(GOA2GetAuthorizationURL(pszScope.c_str()));
}
std::string Gdal::goa2GetRefreshToken(std::string pszAuthToken, std::string pszScope) {
    return charPtrToString(GOA2GetRefreshToken(pszAuthToken.c_str(), pszScope.c_str()));
}
std::string Gdal::goa2GetAccessToken(std::string pszRefreshToken, std::string pszScope) {
    return charPtrToString(GOA2GetAccessToken(pszRefreshToken.c_str(), pszScope.c_str()));
}
void Gdal::popErrorHandler() {
    CPLPopErrorHandler();
}
void Gdal::errorReset() {
    CPLErrorReset();
}
std::string Gdal::escapeString(std::string pszString, int nLength, int nScheme) {
    return charPtrToString((const char *) CPLEscapeString(pszString.c_str(), nLength, nScheme));
}
int Gdal::getLastErrorNo() {
    return (int) CPLGetLastErrorNo();
}
int Gdal::getLastErrorType() {
    return (int) CPLGetLastErrorType();
}
std::string Gdal::getLastErrorMsg() {
    return charPtrToString(CPLGetLastErrorMsg());
}
int Gdal::getErrorCounter() {
    return CPLGetErrorCounter();
}
int Gdal::vsiGetLastErrorNo() {
    return VSIGetLastErrorNo();
}
std::string Gdal::vsiGetLastErrorMsg() {
    return charPtrToString(VSIGetLastErrorMsg());
}
void Gdal::vsiErrorReset() {
    CPLErrorReset();
}
void Gdal::pushFinderLocation(std::string l) {
    CPLPushFinderLocation(l.c_str());
}
void Gdal::popFinderLocation() {
    CPLPopFinderLocation();
}
void Gdal::finderClean() {
    CPLFinderClean();
}
std::string Gdal::findFile(std::string pszClass, std::string pszBasename) {
    return charPtrToString(CPLFindFile(pszClass.c_str(), pszBasename.c_str()));
}
std::vector<std::string> Gdal::readDir(std::string pszDirname) {
    return charPtrPtrToStringVector(VSIReadDir(pszDirname.c_str()));
}
std::vector<std::string> Gdal::readDirRecursive(std::string pszPath) {
    return charPtrPtrToStringVector(VSIReadDirRecursive(pszPath.c_str()));
}
void Gdal::setConfigOption(std::string key, std::string value) {
    setenv("GDAL_DATA", value.c_str(), true);
    // CPLSetConfigOption(key.c_str(), value.c_str());
}
void Gdal::setThreadLocalConfigOption(std::string pszKey, std::string pszValue) {
    CPLSetThreadLocalConfigOption(pszKey.c_str(), pszValue.c_str());
}
std::string Gdal::getConfigOption(std::string key, std::string def) {
    return charPtrToString(CPLGetConfigOption(key.c_str(), def.c_str()));
}
std::string Gdal::getGlobalConfigOption(std::string key, std::string def) {
    return charPtrToString(CPLGetGlobalConfigOption(key.c_str(), def.c_str()));
}
std::string Gdal::getThreadLocalConfigOption(std::string key, std::string def) {
    return charPtrToString(CPLGetThreadLocalConfigOption(key.c_str(), def.c_str()));
}
std::vector<std::string> Gdal::getConfigOptions() {
    return charPtrPtrToStringVector(CPLGetConfigOptions());
}
void Gdal::setPathSpecificOption(std::string pszPathPrefix, std::string pszKey, std::string pszValue) {
    VSISetPathSpecificOption(pszPathPrefix.c_str(), pszKey.c_str(), pszValue.c_str());
}
std::string Gdal::getPathSpecificOption(std::string pszPath, std::string pszKey, std::string pszDefault) {
    return charPtrToString(VSIGetPathSpecificOption(pszPath.c_str(), pszKey.c_str(), pszDefault.c_str()));
}
void Gdal::clearPathSpecificOptions(std::string pszPathPrefix) {
    VSIClearPathSpecificOptions(pszPathPrefix.c_str());
}
std::string Gdal::binaryToHex(int nBytes, std::vector<unsigned char> pabyData) {
    return charPtrToString(CPLBinaryToHex(nBytes, pabyData.data()));
}
std::vector<unsigned char> Gdal::hexToBinary(std::string pszHex) {
    std::vector<unsigned char> output;
    int *arg2 = (int *) 0 ;
    int nBytes1;
    arg2 = &nBytes1;

    unsigned char *result = CPLHexToBinary(pszHex.c_str(), arg2);
    output.assign(result, result + nBytes1);

    return output;
}
int Gdal::fileFromMemBuffer(std::string pszFilename, std::vector<unsigned char> pabyData) {
    int nBytes = pabyData.size();
    GByte* pabyDataDup = (GByte*)VSIMalloc(nBytes);
    if (pabyDataDup == NULL)
            return -1;
    memcpy(pabyDataDup, pabyData.data(), nBytes);
    VSILFILE *fp = VSIFileFromMemBuffer(pszFilename.c_str(), (GByte*) pabyDataDup, nBytes, TRUE);

    if (fp == NULL) {
        VSIFree(pabyDataDup);
        return -1;
    } else {
        VSIFCloseL(fp);
        return 0;
    }
}
int Gdal::unlink(std::string pszFilename) {
    return VSIUnlink(pszFilename.c_str());
}
bool Gdal::unlinkBatch(std::vector<std::string> papszFiles) {
    std::vector<const char *>papszFiles2;
    for (auto &a : papszFiles) {
        papszFiles2.push_back(a.c_str());
    }
    papszFiles2.push_back(0);

    auto files = papszFiles2.data();

    int* success = VSIUnlinkBatch(papszFiles2.data());
    if( !success ) return false;
    int bRet = true;
    for(int i = 0; files && files[i]; i++) {
        if (!success[i]) {
            bRet = false;
            break;
        }
    }
    VSIFree(success);
    return bRet;
}
int Gdal::mkdir(std::string pszDirname, long nMode) {
    return VSIMkdir(pszDirname.c_str(), nMode);
}
int Gdal::rmdir(std::string pszDirname) {
    return VSIRmdir(pszDirname.c_str());
}
int Gdal::mkdirRecursive(std::string pszPathname, long mode) {
    return VSIMkdirRecursive(pszPathname.c_str(), mode);
}
int Gdal::rmdirRecursive(std::string pszDirname) {
    return VSIRmdirRecursive(pszDirname.c_str());
}
int Gdal::rename(std::string oldpath, std::string newpath) {
    return VSIRename(oldpath.c_str(), newpath.c_str());
}
int Gdal::copyFile(std::string pszNewPath, std::string pszOldPath) {
    return VSICopyFile(pszNewPath.c_str(), pszOldPath.c_str(), NULL, static_cast<vsi_l_offset>(-1), NULL, NULL, NULL);
}
std::string Gdal::getActualURL(std::string pszFilename) {
    return charPtrToString(VSIGetActualURL(pszFilename.c_str()));
}
std::string Gdal::getSignedURL(std::string pszFilename, std::vector<std::string> papszOptions) {
    std::vector<const char *>papszOptions2;
    for (auto &a : papszOptions) {
        papszOptions2.push_back(a.c_str());
    }
    papszOptions2.push_back(0);

    return charPtrToString(VSIGetSignedURL(pszFilename.c_str(), papszOptions.size() == 0 ? NULL : papszOptions2.data()));
}
std::vector<std::string> Gdal::getFileSystemsPrefixes() {
    return charPtrPtrToStringVector(VSIGetFileSystemsPrefixes());
}
std::string Gdal::getFileSystemOptions(std::string pszFilename) {
    return charPtrToString(VSIGetFileSystemOptions(pszFilename.c_str()));
}
std::vector<std::string> Gdal::parseCommandLine(std::string pszCommandLine) {
    return charPtrPtrToStringVector(CSLParseCommandLine(pszCommandLine.c_str()));
}
int Gdal::getNumCPUs() {
    return CPLGetNumCPUs();
}
uint64_t Gdal::getUsablePhysicalRAM() {
    return CPLGetUsablePhysicalRAM();
}
int Gdal::gcpsToGeoTransform(std::vector<std::shared_ptr<GCP>> pasGCPs, std::vector<double> padfGeoTransform, int bApproxOK = 1) {
    std::vector<void *>pasGCPs2;
    for (auto &a : pasGCPs) {
        pasGCPs2.push_back(a->ptr);
    }

    return GDALGCPsToGeoTransform(pasGCPs2.size(), (GDAL_GCP const *) pasGCPs2.data(), padfGeoTransform.data(), bApproxOK); // CHECK: (GDAL_GCP const *)
}
std::shared_ptr<SubdatasetInfo> Gdal::getSubdatasetInfo(std::string pszFileName) {
    auto result = GDALGetSubdatasetInfo(pszFileName.c_str());
    if (result == 0) return NULL;
    return SubdatasetInfo::Create(result);
}
std::vector<double> Gdal::applyGeoTransform(std::vector<double> arg1, double arg2, double arg3) {
    double *arg4 = (double *) 0;
    double *arg5 = (double *) 0;

    double temp4 = (double)0; arg4 = &temp4;
    double temp5 = (double)0; arg5 = &temp5;

    GDALApplyGeoTransform(arg1.data(), arg2, arg3, arg4, arg5);

    std::vector<double> vect{(double)temp4, (double)temp5};
    return vect;
}
std::vector<double> Gdal::invGeoTransform(std::vector<double> padfGeoTransformIn) {
    double* arg2 = new double[padfGeoTransformIn.size()];

    int result = (int)GDALInvGeoTransform(padfGeoTransformIn.data(), arg2);
    if (result != 1) {
        return std::vector<double>();
    }

    return doublePtrToDoubleVector(arg2);
}
std::string Gdal::versionInfo(std::string pszRequest) {
    return charPtrToString(GDALVersionInfo(pszRequest.c_str()));
}
void Gdal::allRegister() {
    GDALAllRegister();
}
void Gdal::registerPlugins() {
    GDALRegisterPlugins();
}
int Gdal::registerPlugin(std::string name) {
    return (int) GDALRegisterPlugin(name.c_str());
}
void Gdal::destroyDriverManager() {
    GDALDestroyDriverManager();
}
int Gdal::getCacheMax() {
    return GDALGetCacheMax();
}
int Gdal::getCacheUsed() {
    return GDALGetCacheUsed();
}
void Gdal::setCacheMax(int nBytes) {
    GDALSetCacheMax(nBytes);
}
int Gdal::getDataTypeSize(int eDataType) {
    return GDALGetDataTypeSize((GDALDataType) eDataType);
}
int Gdal::dataTypeIsComplex(int eDataType) {
    return GDALDataTypeIsComplex((GDALDataType) eDataType);
}
std::string Gdal::getDataTypeName(int eDataType) {
    return charPtrToString(GDALGetDataTypeName((GDALDataType) eDataType));
}
int Gdal::getDataTypeByName(std::string name) {
    return GDALGetDataTypeByName(name.c_str());
}
int Gdal::dataTypeUnion(int a, int b) {
    return GDALDataTypeUnion((GDALDataType) a, (GDALDataType) b);
}
std::string Gdal::getColorInterpretationName(int eColorInterp) {
    return charPtrToString(GDALGetColorInterpretationName((GDALColorInterp) eColorInterp));
}
std::string Gdal::getPaletteInterpretationName(int ePaletteInterp) {
    return charPtrToString(GDALGetPaletteInterpretationName((GDALPaletteInterp) ePaletteInterp));
}
std::string Gdal::decToDMS(double a, std::string b, int c) {
    return charPtrToString(GDALDecToDMS(a, b.c_str(), c));
}
double Gdal::packedDMSToDec(double a) {
    return GDALPackedDMSToDec(a);
}
double Gdal::decToPackedDMS(double a) {
    return GDALDecToPackedDMS(a);
}
int Gdal::getDriverCount() {
    return GDALGetDriverCount();
}
std::shared_ptr<Driver> Gdal::getDriverByName(std::string name) {
    auto result = GDALGetDriverByName(name.c_str());
    if (result == 0) return NULL;
    return Driver::Create(result);
}
std::shared_ptr<Driver> Gdal::getDriver(int i) {
    auto result = GDALGetDriver(i);
    if (result == 0) return NULL;
    return Driver::Create(result);
}
std::shared_ptr<Dataset> Gdal::open(std::string pszFilename) {
    return Gdal::open(pszFilename, 0);
}
std::shared_ptr<Dataset> Gdal::open(std::string pszFilename, int eAccess) {
    auto result = GDALOpen(pszFilename.c_str(), (GDALAccess) eAccess);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Dataset> Gdal::openEx(std::string pszFilename) {
    return Gdal::openEx(pszFilename, 0, std::vector<std::string>(), std::vector<std::string>(), std::vector<std::string>());
}
std::shared_ptr<Dataset> Gdal::openEx(std::string pszFilename, unsigned int nOpenFlags) {
    return Gdal::openEx(pszFilename, nOpenFlags, std::vector<std::string>(), std::vector<std::string>(), std::vector<std::string>());
}
std::shared_ptr<Dataset> Gdal::openEx(std::string pszFilename, unsigned int nOpenFlags, std::vector<std::string> papszOpenOptions) {
    return Gdal::openEx(pszFilename, nOpenFlags, std::vector<std::string>(), papszOpenOptions, std::vector<std::string>());
}
std::shared_ptr<Dataset> Gdal::openEx(std::string pszFilename, unsigned int nOpenFlags, std::vector<std::string> papszAllowedDrivers, std::vector<std::string> papszOpenOptions, std::vector<std::string> papszSiblingFiles) {
    std::vector<const char *>papszAllowedDrivers2;
    for (auto &a : papszAllowedDrivers) {
        papszAllowedDrivers2.push_back(a.c_str());
    }
    papszAllowedDrivers2.push_back(0);

    std::vector<const char *>papszOpenOptions2;
    for (auto &a : papszOpenOptions) {
        papszOpenOptions2.push_back(a.c_str());
    }
    papszOpenOptions2.push_back(0);

    std::vector<const char *>papszSiblingFiles2;
    for (auto &a : papszSiblingFiles) {
        papszSiblingFiles2.push_back(a.c_str());
    }
    papszSiblingFiles2.push_back(0);

    auto result = GDALOpenEx(
        pszFilename.c_str(),
        nOpenFlags,
        papszAllowedDrivers.size() == 0 ? NULL : papszAllowedDrivers2.data(),
        papszOpenOptions.size() == 0 ? NULL : papszOpenOptions2.data(),
        papszSiblingFiles.size() == 0 ? NULL : papszSiblingFiles2.data()
    );
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Dataset> Gdal::openShared(std::string pszFilename, int eAccess) {
    auto result = GDALOpenShared(pszFilename.c_str(), (GDALAccess) eAccess);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Driver> Gdal::identifyDriver(std::string pszFilename, std::vector<std::string> papszFileList) {
    std::vector<const char *>papszFileList2;
    for (auto &a : papszFileList) {
        papszFileList2.push_back(a.c_str());
    }
    papszFileList2.push_back(0);

    auto result = GDALIdentifyDriver(pszFilename.c_str(), papszFileList.size() == 0 ? NULL : papszFileList2.data());
    if (result == 0) return NULL;
    return Driver::Create(result);
}
std::shared_ptr<Driver> Gdal::identifyDriverEx(std::string pszFilename, unsigned int nIdentifyFlags, std::vector<std::string> papszAllowedDrivers, std::vector<std::string>papszFileList) {
    std::vector<const char *>papszAllowedDrivers2;
    for (auto &a : papszAllowedDrivers) {
        papszAllowedDrivers2.push_back(a.c_str());
    }
    papszAllowedDrivers2.push_back(0);

    std::vector<const char *>papszFileList2;
    for (auto &a : papszFileList) {
        papszFileList2.push_back(a.c_str());
    }
    papszFileList2.push_back(0);

    auto result = GDALIdentifyDriverEx(
        pszFilename.c_str(),
        nIdentifyFlags,
        papszAllowedDrivers.size() == 0 ? NULL : papszAllowedDrivers2.data(),
        papszFileList.size() == 0 ? NULL : papszFileList2.data()
    );
    if (result == 0) return NULL;
    return Driver::Create(result);
}

std::shared_ptr<Dataset> Gdal::warp(std::string pszDest, std::shared_ptr<Dataset> hDstDS, std::vector<std::shared_ptr<Dataset>> pahSrcDS, std::vector<std::string> psOptions) {
    std::vector<void *>pahSrcDS2;
    for (auto &a : pahSrcDS) {
        pahSrcDS2.push_back(a->ptr);
    }

    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALWarpAppOptions* options = GDALWarpAppOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    int usageError;
    auto result = GDALWarp(pszDest.c_str(), hDstDS->ptr, pahSrcDS2.size(), pahSrcDS2.data(), options, &usageError);
    GDALWarpAppOptionsFree(options);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Dataset> Gdal::buildVRT(std::string pszDest, std::vector<std::shared_ptr<Dataset>> pahSrcDS, std::vector<std::string> papszSrcDSNames, std::vector<std::string> psOptions) {
    std::vector<void *>pahSrcDS2;
    for (auto &a : pahSrcDS) {
        pahSrcDS2.push_back(a->ptr);
    }

    std::vector<const char *>papszSrcDSNames2;
    for (auto &a : papszSrcDSNames) {
        papszSrcDSNames2.push_back(a.c_str());
    }
    papszSrcDSNames2.push_back(0);

    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALBuildVRTOptions* options = GDALBuildVRTOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    int usageError;
    auto result = GDALBuildVRT(pszDest.c_str(), pahSrcDS2.size(), pahSrcDS2.data(), papszSrcDSNames.size() == 0 ? NULL : papszSrcDSNames2.data(), options, &usageError);
    GDALBuildVRTOptionsFree(options);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Dataset> Gdal::multiDimTranslate(std::string pszDest, std::shared_ptr<Dataset> hDstDataset, std::vector<std::shared_ptr<Dataset>> pahSrcDS, std::vector<std::string> psOptions) {
    std::vector<void *>pahSrcDS2;
    for (auto &a : pahSrcDS) {
        pahSrcDS2.push_back(a->ptr);
    }

    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALMultiDimTranslateOptions* options = GDALMultiDimTranslateOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    int usageError;
    auto result = GDALMultiDimTranslate(pszDest.c_str(), hDstDataset->ptr, pahSrcDS2.size(), pahSrcDS2.data(), options, &usageError);
    GDALMultiDimTranslateOptionsFree(options);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}

void Gdal::setProjDataPath(std::string path) {
    setenv("PROJ_LIB", path.c_str(), true);
    /* std::vector<const char *> paths;
    paths.push_back(path.c_str());

    proj_context_set_search_paths(NULL, paths.size(), paths.data()); */
}

std::vector<std::shared_ptr<Driver>> Gdal::getDrivers() {
    int driverCount = Gdal::getDriverCount();
    std::vector<std::shared_ptr<Driver>> output;
    for (int i = 0; i < driverCount; i += 1) {
        output.push_back(Gdal::getDriver(i));
    }
    return output;
}


// =================================================== GDAL - PRIVATE ============
std::string Gdal::charPtrToString(const char * result) {
    std::string output = "";
    if (result) {
      output = std::string(result);
      // CPLFree((void *) result);
    }
    return output;
}

std::vector<std::string> Gdal::charPtrPtrToStringVector(char ** stringarray) {
    std::vector<std::string> output;
    if ( stringarray != NULL ) {
      while(*stringarray != NULL) {
        output.emplace_back(*stringarray);
        stringarray++;
      }
    }
    CSLDestroy(stringarray);
    return output;
}

std::vector<double> Gdal::doublePtrToDoubleVector(double* doublearray) {
    std::vector<double> output;
    if ( doublearray != NULL ) {
      while(*doublearray != NULL) {
        output.push_back(*doublearray);
        doublearray++;
      }
    }
    delete[] doublearray;
    return output;
}
