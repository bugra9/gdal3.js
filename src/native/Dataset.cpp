#include <gdal3.js/Dataset.h>
#include <gdal3.js/Gdal.h>
#include <gdal3.js/Driver.h>
#include <gdal3.js/GCP.h>

#include "cpl_string.h"
#include "gdal.h"
#include "gdal_utils.h"

Dataset::~Dataset() {
    CPLFree(this->ptr);
}
int Dataset::buildOverviews(std::string resampling, std::vector<int> overviewlist, std::vector<std::string> options) {
    std::vector<const char *>options2;
    for (auto &a : options) {
        options2.push_back(a.c_str());
    }
    options2.push_back(0);

    return (int) GDALBuildOverviewsEx((GDALDatasetH) this->ptr, resampling.c_str(), overviewlist.size(), overviewlist.data(), 0, 0, NULL, NULL, options.size() == 0 ? NULL : options2.data());
}
std::vector<std::shared_ptr<GCP>> Dataset::getGCPs() {
    int *arg2 = (int *) 0 ;
    GDAL_GCP **arg3 = (GDAL_GCP **) 0 ;

    int *nGCPs = arg2;
    GDAL_GCP const **pGCPs = (GDAL_GCP const **)arg3;

    *nGCPs = GDALGetGCPCount((GDALDatasetH) this->ptr);
    *pGCPs = GDALGetGCPs((GDALDatasetH) this->ptr);

    std::vector<std::shared_ptr<GCP>> gcps;
    for (int i=0; i<*arg2; i++ ) {
        gcps.push_back(std::make_shared<GCP>(
            (*arg3)[i].dfGCPX, (*arg3)[i].dfGCPY, (*arg3)[i].dfGCPZ,
            (*arg3)[i].dfGCPPixel, (*arg3)[i].dfGCPLine,
            std::string((*arg3)[i].pszInfo), std::string((*arg3)[i].pszId)
        ));
    }
    return gcps;
}
std::vector<double> Dataset::getGeoTransform() {
    double argout[6];
    if ( GDALGetGeoTransform( (GDALDatasetH) this->ptr, argout ) != CE_None ) {
      argout[0] = 0.0;
      argout[1] = 1.0;
      argout[2] = 0.0;
      argout[3] = 0.0;
      argout[4] = 0.0;
      argout[5] = 1.0;
    }
    return std::vector<double>(argout, argout + sizeof argout / sizeof argout[0]);
}

int Dataset::getRasterXSize() {
    return GDALGetRasterXSize(this->ptr);
}
int Dataset::getRasterYSize() {
    return GDALGetRasterYSize(this->ptr);
}
int Dataset::getRasterCount() {
    return GDALGetRasterCount(this->ptr);
}
int Dataset::close() {
    return GDALClose(this->ptr);
}
std::shared_ptr<Driver> Dataset::getDriver() {
    auto result = GDALGetDatasetDriver(this->ptr);
    if (result == 0) return NULL;
    return Driver::Create(result);
}

std::string Dataset::getProjectionRef() {
    return Gdal::charPtrToString(GDALGetProjectionRef(this->ptr));
}
int Dataset::setProjection(std::string prj) {
    return GDALSetProjection(this->ptr, prj.c_str());
}
int Dataset::setGeoTransform(std::vector<double> argin) {
    return GDALSetGeoTransform(this->ptr, argin.data());
}
int Dataset::getGCPCount() {
    return GDALGetGCPCount(this->ptr);
}
std::string Dataset::getGCPProjection() {
    return Gdal::charPtrToString(GDALGetGCPProjection(this->ptr));
}
int Dataset::setGCPs(std::vector<std::shared_ptr<GCP>> nGCPs, std::string pszGCPProjection) {
    int arg2 = nGCPs.size();
    GDAL_GCP *arg3 = (GDAL_GCP *) 0;

    if (arg2 == 0) arg3 = NULL;
    else {
        arg3 = (GDAL_GCP*) malloc(sizeof(GDAL_GCP) * arg2);
        for (int i=0; i<arg2; i++) {
            arg3[i] = *(GDAL_GCP*) nGCPs[i]->ptr;
        }
    }

    return GDALSetGCPs(this->ptr, nGCPs.size(), (GDAL_GCP const *) arg3, pszGCPProjection.c_str());
}
int Dataset::flushCache() {
    return (int) GDALFlushCache(this->ptr);
}
int Dataset::addBand(int datatype, std::vector<std::string> options) {
    std::vector<const char *>options2;
    for (auto &a : options) {
        options2.push_back(a.c_str());
    }
    options2.push_back(0);

    return GDALAddBand(this->ptr, (GDALDataType) datatype, options.size() == 0 ? NULL : options2.data());
}
int Dataset::createMaskBand(int nFlags) {
    return GDALCreateDatasetMaskBand( this->ptr, nFlags );
}
std::vector<std::string> Dataset::getFileList() {
    return Gdal::charPtrPtrToStringVector(GDALGetFileList(this->ptr));
}
int Dataset::deleteLayer(int index) {
    return GDALDatasetDeleteLayer(this->ptr, index);
}
int Dataset::getLayerCount() {
    return GDALDatasetGetLayerCount(this->ptr);
}
bool Dataset::isLayerPrivate(int index) {
    return GDALDatasetIsLayerPrivate(this->ptr, index);
}
void Dataset::resetReading() {
    GDALDatasetResetReading(this->ptr);
}
bool Dataset::testCapability(std::string cap) {
    return (GDALDatasetTestCapability(this->ptr, cap.c_str()) > 0);
}
int Dataset::abortSQL() {
    return GDALDatasetAbortSQL(this->ptr);
}
int Dataset::startTransaction(int force) {
    return GDALDatasetStartTransaction(this->ptr, force);
}
int Dataset::commitTransaction() {
    return GDALDatasetCommitTransaction(this->ptr);
}
int Dataset::rollbackTransaction() {
    return GDALDatasetRollbackTransaction(this->ptr);
}
void Dataset::clearStatistics() {
    GDALDatasetClearStatistics(this->ptr);
}
std::vector<std::string> Dataset::getFieldDomainNames(std::vector<std::string> options) {
    std::vector<const char *>options2;
    for (auto &a : options) {
        options2.push_back(a.c_str());
    }
    options2.push_back(0);

    return Gdal::charPtrPtrToStringVector(GDALDatasetGetFieldDomainNames(this->ptr, options.size() == 0 ? NULL : options2.data()));
}
bool Dataset::deleteFieldDomain(std::string name) {
    return GDALDatasetDeleteFieldDomain(this->ptr, name.c_str(), NULL);
}
std::vector<std::string> Dataset::getRelationshipNames(std::vector<std::string> options) {
    std::vector<const char *>options2;
    for (auto &a : options) {
        options2.push_back(a.c_str());
    }
    options2.push_back(0);

    return Gdal::charPtrPtrToStringVector(GDALDatasetGetRelationshipNames(this->ptr, options.size() == 0 ? NULL : options2.data()));
}
bool Dataset::deleteRelationship(std::string name) {
    return GDALDatasetDeleteRelationship(this->ptr, name.c_str(), NULL);
}

std::string Dataset::info(std::vector<std::string> psOptions) {
    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALInfoOptions* options = GDALInfoOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    auto result = GDALInfo(this->ptr, options);
    GDALInfoOptionsFree(options);

    return Gdal::charPtrToString(result);
}
std::string Dataset::vectorInfo(std::vector<std::string> psOptions) {
    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALVectorInfoOptions* options = GDALVectorInfoOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    auto result = GDALVectorInfo(this->ptr, options);
    GDALVectorInfoOptionsFree(options);

    return Gdal::charPtrToString(result);
}
std::string Dataset::multiDimInfo(std::vector<std::string> psOptions) {
    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALMultiDimInfoOptions* options = GDALMultiDimInfoOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    auto result = GDALMultiDimInfo(this->ptr, options);
    GDALMultiDimInfoOptionsFree(options);

    return Gdal::charPtrToString(result);
}
std::shared_ptr<Dataset> Dataset::translate(std::string pszDestFilename, std::vector<std::string> psOptions) {
    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALTranslateOptions* options = GDALTranslateOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    int usageError;
    auto result = GDALTranslate(pszDestFilename.c_str(), this->ptr, options, &usageError);
    GDALTranslateOptionsFree(options);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Dataset> Dataset::vectorTranslate(std::string pszDest, std::vector<std::string> psOptions) {
    std::vector<void *>pahSrcDS;
    pahSrcDS.push_back(this->ptr);

    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALVectorTranslateOptions* options = GDALVectorTranslateOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    int usageError;
    auto result = GDALVectorTranslate(pszDest.c_str(), 0, pahSrcDS.size(), pahSrcDS.data(), options, &usageError);
    GDALVectorTranslateOptionsFree(options);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Dataset> Dataset::vectorTranslate2(std::shared_ptr<Dataset> hDstDS, std::vector<std::string> psOptions) {
    std::vector<void *>pahSrcDS;
    pahSrcDS.push_back(this->ptr);

    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALVectorTranslateOptions* options = GDALVectorTranslateOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    int usageError;
    auto result = GDALVectorTranslate(0, hDstDS->ptr, pahSrcDS.size(), pahSrcDS.data(), options, &usageError);
    GDALVectorTranslateOptionsFree(options);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Dataset> Dataset::demProcessing(std::string pszDestFilename, std::string pszProcessing, std::string pszColorFilename, std::vector<std::string> psOptions) {
    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALDEMProcessingOptions* options = GDALDEMProcessingOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    int usageError;
    auto result = GDALDEMProcessing(pszDestFilename.c_str(), this->ptr, pszProcessing.c_str(), pszColorFilename.c_str(), options, &usageError);
    GDALDEMProcessingOptionsFree(options);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Dataset> Dataset::nearblack(std::string pszDest, std::shared_ptr<Dataset> hDstDS, std::vector<std::string> psOptions) {
    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALNearblackOptions* options = GDALNearblackOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    int usageError;
    auto result = GDALNearblack(pszDest.c_str(), hDstDS->ptr, this->ptr, options, &usageError);
    GDALNearblackOptionsFree(options);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Dataset> Dataset::grid(std::string pszDest, std::vector<std::string> psOptions) {
    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALGridOptions* options = GDALGridOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    int usageError;
    auto result = GDALGrid(pszDest.c_str(), this->ptr, options, &usageError);
    GDALGridOptionsFree(options);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Dataset> Dataset::rasterize(std::string pszDest, std::vector<std::string> psOptions) {
    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALRasterizeOptions* options = GDALRasterizeOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    int usageError;
    auto result = GDALRasterize(pszDest.c_str(), 0, this->ptr, options, &usageError);
    GDALRasterizeOptionsFree(options);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}

std::shared_ptr<Dataset> Dataset::rasterize(std::shared_ptr<Dataset> hDstDS, std::vector<std::string> psOptions) {
    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALRasterizeOptions* options = GDALRasterizeOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    int usageError;
    auto result = GDALRasterize(0, hDstDS->ptr, this->ptr, options, &usageError);
    GDALRasterizeOptionsFree(options);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}

std::shared_ptr<Dataset> Dataset::footprint(std::string pszDest, std::shared_ptr<Dataset> hDstDS, std::vector<std::string> psOptions) {
    std::vector<const char *>psOptions2;
    for (auto &a : psOptions) {
        psOptions2.push_back(a.c_str());
    }
    psOptions2.push_back(0);

    GDALFootprintOptions* options = GDALFootprintOptionsNew(psOptions.size() == 0 ? NULL : ((char**) psOptions2.data()), NULL);
    int usageError;
    auto result = GDALFootprint(pszDest.c_str(), hDstDS->ptr, this->ptr, options, &usageError);
    GDALFootprintOptionsFree(options);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}

// =================================================== DATASET - PRIVATE ========
Dataset::Dataset(void* dataset) {
    this->ptr = dataset;
}

struct Dataset::MakeSharedEnabler : public Dataset {
    template <typename... Args> MakeSharedEnabler(Args &&... args):Dataset(std::forward<Args>(args)...) {}
};

std::shared_ptr<Dataset> Dataset::Create(void* dataset) {
    return std::make_shared<MakeSharedEnabler>(dataset);
}
