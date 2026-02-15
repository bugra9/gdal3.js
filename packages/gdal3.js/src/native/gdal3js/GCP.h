#ifndef _GDAL3JS_GCP_H
#define _GDAL3JS_GCP_H

#include <memory>
#include <stdlib.h>

class Gdal;
class Dataset;

class GCP {
public:
    friend class Gdal;
    friend class Dataset;

    GCP(double x, double y, double z, double pixel, double line, std::string info, std::string id);
    ~GCP();
    double getX();
    double getY();
    double getZ();
    double getPixel();
    double getLine();
    std::string getInfo();
    std::string getId();

    void setX(double x);
    void setY(double y);
    void setZ(double z);
    void setPixel(double pixel);
    void setLine(double line);
    void setInfo(std::string info);
    void setId(std::string id);

private:
    GCP(void*);
    static std::shared_ptr<GCP> Create(void*);

    struct MakeSharedEnabler;
    void *ptr;
};

#endif
