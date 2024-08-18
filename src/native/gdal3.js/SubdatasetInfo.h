#ifndef _GDAL3JS_SUBDATASETINFO_H
#define _GDAL3JS_SUBDATASETINFO_H

#include <memory>
#include <stdlib.h>

class Gdal;

class SubdatasetInfo {
public:
    friend class Gdal;
    SubdatasetInfo(std::string pszFileName);
    ~SubdatasetInfo();

    std::string getPathComponent();
    std::string getSubdatasetComponent();
    std::string modifyPathComponent(std::string pszNewFileName);

private:
    SubdatasetInfo(void*);
    static std::shared_ptr<SubdatasetInfo> Create(void*);

    struct MakeSharedEnabler;
    void *ptr;
};

#endif
