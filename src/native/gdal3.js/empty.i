#ifndef _GDALCPP_I
#define _GDALCPP_I

%module gdal

%{
#include <gdal3.js/empty.h>
#include <gdal3.js/Driver.h>

EMSCRIPTEN_BINDINGS(stl_wrappers) {
    emscripten::register_vector<int>("VectorInt");
    emscripten::register_vector<std::string>("VectorString");
    emscripten::register_vector<std::shared_ptr<Driver>>("VectorDriver");
    emscripten::register_map<int,int>("MapIntInt");
    emscripten::register_map<std::string, std::string>("MapStringString");
}

%}

%feature("shared_ptr");
%feature("polymorphic_shared_ptr");

%include <gdal3.js/empty.h>

#endif
