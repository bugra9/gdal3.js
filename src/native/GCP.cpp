#include <gdal3.js/GCP.h>
#include <gdal3.js/Gdal.h>

#include "cpl_string.h"
#include "gdal.h"

GCP::GCP(double x, double y, double z, double pixel, double line, std::string info = "", std::string id = "") {
    GDAL_GCP *self = (GDAL_GCP*) CPLMalloc( sizeof( GDAL_GCP ) );
    self->dfGCPX = x;
    self->dfGCPY = y;
    self->dfGCPZ = z;
    self->dfGCPPixel = pixel;
    self->dfGCPLine = line;
    self->pszInfo = CPLStrdup(info.c_str());
    self->pszId = CPLStrdup(id.c_str());
    GCP((void*) self);
}
GCP::~GCP() {
    GDAL_GCP* self = (GDAL_GCP*) this->ptr;
    CPLFree(self->pszInfo);
    CPLFree(self->pszId);
    CPLFree(this->ptr);
}

double GCP::getX() {
    return ((GDAL_GCP*) this->ptr)->dfGCPX;
}
double GCP::getY() {
    return ((GDAL_GCP*) this->ptr)->dfGCPY;
}
double GCP::getZ() {
    return ((GDAL_GCP*) this->ptr)->dfGCPZ;
}
double GCP::getPixel() {
    return ((GDAL_GCP*) this->ptr)->dfGCPPixel;
}
double GCP::getLine() {
    return ((GDAL_GCP*) this->ptr)->dfGCPLine;
}
std::string GCP::getInfo() {
    return Gdal::charPtrToString(((GDAL_GCP*) this->ptr)->pszInfo);
}
std::string GCP::getId() {
    return Gdal::charPtrToString(((GDAL_GCP*) this->ptr)->pszId);
}
void GCP::setX(double x) {
    ((GDAL_GCP*) this->ptr)->dfGCPX = x;
}
void GCP::setY(double y) {
    ((GDAL_GCP*) this->ptr)->dfGCPY = y;
}
void GCP::setZ(double z) {
    ((GDAL_GCP*) this->ptr)->dfGCPZ = z;
}
void GCP::setPixel(double pixel) {
    ((GDAL_GCP*) this->ptr)->dfGCPPixel = pixel;
}
void GCP::setLine(double line) {
    ((GDAL_GCP*) this->ptr)->dfGCPLine = line;
}
void GCP::setInfo(std::string info) {
    ((GDAL_GCP*) this->ptr)->pszInfo = CPLStrdup(info.c_str());
}
void GCP::setId(std::string id) {
    ((GDAL_GCP*) this->ptr)->pszId = CPLStrdup(id.c_str());
}
// =================================================== GCP - PRIVATE ========
GCP::GCP(void* gcp) {
    this->ptr = gcp;
}

struct GCP::MakeSharedEnabler : public GCP {
    template <typename... Args> MakeSharedEnabler(Args &&... args):GCP(std::forward<Args>(args)...) {}
};

std::shared_ptr<GCP> GCP::Create(void* gcp) {
    return std::make_shared<MakeSharedEnabler>(gcp);
}
