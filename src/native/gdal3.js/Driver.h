#ifndef _GDAL3JS_DRIVER_H
#define _GDAL3JS_DRIVER_H

#include <memory>
#include <stdlib.h>

class Gdal;
class Dataset;
class Driver;

class Driver {
public:
    friend class Gdal;
    friend class Dataset;
    ~Driver();

    std::string getShortName();
    std::string getLongName();
    bool isReadable();
    bool isWritable();
    bool isRaster();
    bool isVector();
    std::string getOpenOptions();
    std::string getCreationOptions();
    std::string getLayerCreationOptions();
    std::string getExtension();
    std::string getExtensions();
    std::string getHelpTopic();
    std::string getMetadataItem(std::string name);
    std::shared_ptr<Dataset> create(std::string utf8_path, int xsize, int ysize, int bands, int eType, std::vector<std::string> options);
    std::shared_ptr<Dataset> createMultiDimensional(std::string utf8_path, std::vector<std::string> root_group_options, std::vector<std::string> options);
    std::shared_ptr<Dataset> createCopy(std::string utf8_path, std::shared_ptr<Dataset> src, int strict, std::vector<std::string> options);
    int deleteDriver(std::string utf8_path);
    int rename(std::string newName, std::string oldName);
    int copyFiles(std::string newName, std::string oldName);
    int registerDriver();
    void deregisterDriver();


private:
    Driver(void*);
    static std::shared_ptr<Driver> Create(void*);

    struct MakeSharedEnabler;
    void *ptr;
};

#endif
