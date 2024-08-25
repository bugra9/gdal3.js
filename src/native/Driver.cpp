#include <gdal3.js/Driver.h>
#include <gdal3.js/Gdal.h>
#include <gdal3.js/Dataset.h>

#include "cpl_string.h"
#include "gdal.h"

Driver::~Driver() {
    CPLFree(this->ptr);
}
std::string Driver::getShortName() {
    return Gdal::charPtrToString(GDALGetDriverShortName(this->ptr));
}
std::string Driver::getLongName() {
    return Gdal::charPtrToString(GDALGetDriverLongName(this->ptr));
}

bool Driver::isReadable() {
    return this->getMetadataItem("DCAP_OPEN") == "YES";
}
bool Driver::isWritable() {
    return this->getMetadataItem("DCAP_CREATE") == "YES" || this->getMetadataItem("DCAP_CREATECOPY") == "YES";
}
bool Driver::isRaster() {
    return this->getMetadataItem("DCAP_RASTER") == "YES";
}
bool Driver::isVector() {
    return this->getMetadataItem("DCAP_VECTOR") == "YES";
}
std::string Driver::getOpenOptions() {
    return this->getMetadataItem("DMD_OPENOPTIONLIST");
}
std::string Driver::getCreationOptions() {
    return this->getMetadataItem("DMD_CREATIONOPTIONLIST");
}
std::string Driver::getLayerCreationOptions() {
    return this->getMetadataItem("DS_LAYER_CREATIONOPTIONLIST");
}
std::string Driver::getExtension() {
    return this->getMetadataItem("DMD_EXTENSION");
}
std::string Driver::getExtensions() {
    return this->getMetadataItem("DMD_EXTENSIONS");
}

std::string Driver::getHelpTopic() {
    return Gdal::charPtrToString(GDALGetDriverHelpTopic(this->ptr));
}
std::string Driver::getMetadataItem(std::string name) {
    return Gdal::charPtrToString(GDALGetMetadataItem(this->ptr, name.c_str(), NULL));
}
std::shared_ptr<Dataset> Driver::create(std::string utf8_path, int xsize, int ysize, int bands, int eType, std::vector<std::string> options = std::vector<std::string>()) {
    std::vector<const char *>options2;
    for (auto &a : options) {
        options2.push_back(a.c_str());
    }
    options2.push_back(0);

    auto result = GDALCreate(this->ptr, utf8_path.c_str(), xsize, ysize, bands, (GDALDataType) eType, options.size() == 0 ? NULL : options2.data());
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Dataset> Driver::createMultiDimensional(std::string utf8_path, std::vector<std::string> root_group_options, std::vector<std::string> options = std::vector<std::string>()) {
    std::vector<const char *>options2;
    for (auto &a : options) {
        options2.push_back(a.c_str());
    }
    options2.push_back(0);

    std::vector<const char *>root_group_options2;
    for (auto &a : root_group_options) {
        root_group_options2.push_back(a.c_str());
    }
    root_group_options2.push_back(0);

    auto result = GDALCreateMultiDimensional(this->ptr, utf8_path.c_str(), root_group_options.size() == 0 ? NULL : root_group_options2.data(), options.size() == 0 ? NULL : options2.data());
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
std::shared_ptr<Dataset> Driver::createCopy(std::string utf8_path, std::shared_ptr<Dataset> src, int strict, std::vector<std::string> options = std::vector<std::string>()) {
    std::vector<const char *>options2;
    for (auto &a : options) {
        options2.push_back(a.c_str());
    }
    options2.push_back(0);

    auto result = GDALCreateCopy(this->ptr, utf8_path.c_str(), (GDALDatasetH) src->ptr, strict, options.size() == 0 ? NULL : options2.data(), NULL, NULL);
    if (result == 0) return NULL;
    return Dataset::Create(result);
}
int Driver::deleteDriver(std::string utf8_path) {
    return (int) GDALDeleteDataset(this->ptr, utf8_path.c_str());
}
int Driver::rename(std::string newName, std::string oldName) {
    return (int) GDALRenameDataset(this->ptr, newName.c_str(), oldName.c_str());
}
int Driver::copyFiles(std::string newName, std::string oldName) {
    return (int) GDALCopyDatasetFiles(this->ptr, newName.c_str(), oldName.c_str());
}
int Driver::registerDriver() {
    return (int) GDALRegisterDriver(this->ptr);
}
void Driver::deregisterDriver() {
    GDALDeregisterDriver(this->ptr);
}
// =================================================== DRIVER - PRIVATE ========
Driver::Driver(void* driver) {
    this->ptr = driver;
}

struct Driver::MakeSharedEnabler : public Driver {
    template <typename... Args> MakeSharedEnabler(Args &&... args):Driver(std::forward<Args>(args)...) {}
};

std::shared_ptr<Driver> Driver::Create(void* driver) {
    return std::make_shared<MakeSharedEnabler>(driver);
}
