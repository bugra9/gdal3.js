#include <gdal3.js/SubdatasetInfo.h>
#include <gdal3.js/Gdal.h>

#include "cpl_string.h"
#include "gdal.h"

SubdatasetInfo::SubdatasetInfo(std::string pszFileName) {
    SubdatasetInfo((void*) GDALGetSubdatasetInfo(CPLStrdup(pszFileName.c_str())));
}
SubdatasetInfo::~SubdatasetInfo() {
    CPLFree(this->ptr);
}
std::string SubdatasetInfo::getPathComponent() {
    return Gdal::charPtrToString(GDALSubdatasetInfoGetPathComponent((GDALSubdatasetInfoH) this->ptr));
}
std::string SubdatasetInfo::getSubdatasetComponent() {
    return Gdal::charPtrToString(GDALSubdatasetInfoGetSubdatasetComponent((GDALSubdatasetInfoH) this->ptr));
}
std::string SubdatasetInfo::modifyPathComponent(std::string pszNewFileName) {
    return Gdal::charPtrToString(GDALSubdatasetInfoModifyPathComponent((GDALSubdatasetInfoH) this->ptr, pszNewFileName.c_str()));
}
// =================================================== SUBDATASETINFO - PRIVATE ========
SubdatasetInfo::SubdatasetInfo(void* subdatasetInfo) {
    this->ptr = subdatasetInfo;
}

struct SubdatasetInfo::MakeSharedEnabler : public SubdatasetInfo {
    template <typename... Args> MakeSharedEnabler(Args &&... args):SubdatasetInfo(std::forward<Args>(args)...) {}
};

std::shared_ptr<SubdatasetInfo> SubdatasetInfo::Create(void* subdatasetInfo) {
    return std::make_shared<MakeSharedEnabler>(subdatasetInfo);
}
