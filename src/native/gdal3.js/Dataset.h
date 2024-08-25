#ifndef _GDAL3JS_DATASET_H
#define _GDAL3JS_DATASET_H

#include <memory>
#include <stdlib.h>

class Gdal;
class Driver;
class GCP;

class Dataset {
public:
    friend class Gdal;
    friend class Driver;

    ~Dataset();
    int buildOverviews(std::string resampling, std::vector<int> overviewlist, std::vector<std::string> options);
    std::vector<std::shared_ptr<GCP>> getGCPs();
    std::vector<double> getGeoTransform();
    // std::shared_ptr<Layer> getLayer(int index);
    // std::shared_ptr<Layer> getLayer(std::string layerName);
    int getRasterXSize();
    int getRasterYSize();
    int getRasterCount();
    int close();
    std::shared_ptr<Driver> getDriver();
    // std::shared_ptr<Band> getRasterBand(int nBand);
    // std::shared_ptr<Group> getRootGroup();
    std::string getProjectionRef();
    // std::shared_ptr<SpatialReference> getSpatialRef();
    int setProjection(std::string prj);
    // int setSpatialRef(std::shared_ptr<SpatialReference> srs);
    int setGeoTransform(std::vector<double> argin);
    int getGCPCount();
    std::string getGCPProjection();
    // std::shared_ptr<SpatialReference> getGCPSpatialRef();
    int setGCPs(std::vector<std::shared_ptr<GCP>> nGCPs, std::string pszGCPProjection);
    // int setGCPs2(std::vector<std::shared_ptr<GCP>> nGCPs, std::shared_ptr<SpatialReference> hSRS);
    int flushCache();
    int addBand(int datatype, std::vector<std::string> options);
    int createMaskBand(int nFlags);
    std::vector<std::string> getFileList();
    // int adviseRead(int xoff, int yoff, int xsize, int ysize, int buf_xsize, int buf_ysize, int buf_type, std::vector<int> band_list, std::vector<std::string> options);
    // std::shared_ptr<Layer> createLayer(std::string name, std::shared_ptr<SpatialReference> srs, int geom_type, std::vector<std::string> options);
    // std::shared_ptr<Layer> copyLayer(std::shared_ptr<Layer> src_layer, std::string new_name, std::vector<std::string> options);
    int deleteLayer(int index);
    int getLayerCount();
    bool isLayerPrivate(int index);
    // std::shared_ptr<Layer> getLayerByIndex(int index);
    // std::shared_ptr<Layer> getLayerByName(std::string layer_name);
    void resetReading();
    // std::shared_ptr<Feature> getNextFeature();
    bool testCapability(std::string cap);
    // std::shared_ptr<Layer> executeSQL(std::string statement, std::shared_ptr<Geometry> spatialFilter, std::string dialect);
    // void releaseResultSet(std::shared_ptr<Layer> layer);
    // std::shared_ptr<StyleTable> getStyleTable();
    // void setStyleTable(std::shared_ptr<StyleTable> table);
    int abortSQL();
    int startTransaction(int force);
    int commitTransaction();
    int rollbackTransaction();
    void clearStatistics();
    std::vector<std::string> getFieldDomainNames(std::vector<std::string> options);
    // std::shared_ptr<FieldDomain> getFieldDomain(std::string name);
    // bool addFieldDomain(std::shared_ptr<FieldDomain> fieldDomain);
    bool deleteFieldDomain(std::string name);
    // bool updateFieldDomain(std::shared_ptr<FieldDomain> fieldDomain);
    std::vector<std::string> getRelationshipNames(std::vector<std::string> options);
    // std::shared_ptr<Relationship> getRelationship(std::string name);
    // bool addRelationship(std::shared_ptr<Relationship> relationship);
    bool deleteRelationship(std::string name);
    // bool updateRelationship(std::shared_ptr<Relationship> relationship);
    // int readRaster(int xoff, int yoff, int xsize, int ysize, int buf_xsize, int buf_ysize, int buf_type, std::vector<uint8_t> regularArrayOut, std::vector<int> band_list, int nPixelSpace, int nLineSpace, int nBandSpace);
    // int writeRaster(int xoff, int yoff, int xsize, int ysize, int buf_xsize, int buf_ysize, int buf_type, std::vector<uint8_t> regularArrayIn, std::vector<int> band_list, int nPixelSpace, int nLineSpace, int nBandSpace);

    // APPS
    // std::string locationInfo();
    std::string info(std::vector<std::string> psOptions);
    std::string vectorInfo(std::vector<std::string> psOptions);
    std::string multiDimInfo(std::vector<std::string> psOptions);
    std::shared_ptr<Dataset> translate(std::string pszDestFilename, std::vector<std::string> psOptions);
    std::shared_ptr<Dataset> vectorTranslate(std::string pszDest, std::vector<std::string> psOptions);
    std::shared_ptr<Dataset> vectorTranslate2(std::shared_ptr<Dataset> hDstDS, std::vector<std::string> psOptions);
    std::shared_ptr<Dataset> demProcessing(std::string pszDestFilename, std::string pszProcessing, std::string pszColorFilename, std::vector<std::string> psOptions);
    std::shared_ptr<Dataset> nearblack(std::string pszDest, std::shared_ptr<Dataset> hDstDS, std::vector<std::string> psOptions);
    std::shared_ptr<Dataset> grid(std::string pszDest, std::vector<std::string> psOptions);
    std::shared_ptr<Dataset> rasterize(std::string pszDest, std::vector<std::string> psOptions);
    std::shared_ptr<Dataset> rasterize(std::shared_ptr<Dataset> hDstDS, std::vector<std::string> psOptions);
    std::shared_ptr<Dataset> footprint(std::string pszDest, std::shared_ptr<Dataset> hDstDS, std::vector<std::string> psOptions);

private:
    Dataset(void* dataset);
    static std::shared_ptr<Dataset> Create(void* dataset);

    struct MakeSharedEnabler;
    void *ptr;
};

#endif
