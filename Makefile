GDAL_VERSION = 3.8.3
SPATIALITE_VERSION = 5.1.0
SQLITE_VERSION = 3450100
GEOS_VERSION = 3.12.1
PROJ_VERSION = 9.3.1
ZLIB_VERSION = 1.3.1
TIFF_VERSION = 4.6.0
GEOTIFF_VERSION = 1.7.1
WEBP_VERSION = 1.3.2
EXPAT_VERSION = 2.6.0
ICONV_VERSION = 1.17

SQLITE_URL = "https://www.sqlite.org/2024/sqlite-autoconf-$(SQLITE_VERSION).tar.gz"
PROJ_URL = "http://download.osgeo.org/proj/proj-$(PROJ_VERSION).tar.gz"
GEOS_URL = "http://download.osgeo.org/geos/geos-$(GEOS_VERSION).tar.bz2"
SPATIALITE_URL = "http://www.gaia-gis.it/gaia-sins/libspatialite-sources/libspatialite-$(SPATIALITE_VERSION).tar.gz"
ZLIB_URL = "http://zlib.net/zlib-$(ZLIB_VERSION).tar.gz"
GDAL_URL = "https://github.com/OSGeo/gdal/releases/download/v$(GDAL_VERSION)/gdal-$(GDAL_VERSION).tar.gz"
TIFF_URL = "http://download.osgeo.org/libtiff/tiff-$(TIFF_VERSION).tar.gz"
GEOTIFF_URL = "http://download.osgeo.org/geotiff/libgeotiff/libgeotiff-$(GEOTIFF_VERSION).tar.gz"
WEBP_URL = "https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-${WEBP_VERSION}.tar.gz"
EXPAT_URL = "https://github.com/libexpat/libexpat/releases/download/R_$(subst .,_,$(EXPAT_VERSION))/expat-${EXPAT_VERSION}.tar.gz"
ICONV_URL = "https://ftp.gnu.org/pub/gnu/libiconv/libiconv-${ICONV_VERSION}.tar.gz"

PWD = $(shell pwd)
SRC_DIR = build/native/src
SRC_DIR_FULL = $(PWD)/$(SRC_DIR)
ROOT_DIR = $(PWD)/build/native/usr
DIST_DIR = $(PWD)/build/package
PREFIX = --prefix=$(ROOT_DIR)
PREFIX_CMAKE = "-DCMAKE_INSTALL_PREFIX=$(ROOT_DIR)"

ifeq ($(type), debug)
TYPE_FLAGS = -g4 -O0
else
TYPE_FLAGS = -O3
endif

# EMCC_CFLAGS = -g4 -O0 -fexceptions -DRENAME_INTERNAL_LIBTIFF_SYMBOLS
EMCC_CFLAGS = $(TYPE_FLAGS) -fexceptions -DRENAME_INTERNAL_LIBTIFF_SYMBOLS -s ERROR_ON_UNDEFINED_SYMBOLS=0
EMMAKE ?= EMCC_CFLAGS="$(EMCC_CFLAGS)" emmake
EMCMAKE ?= emcmake
EMCC ?= CFLAGS="$(EMCC_CFLAGS)" emcc
EMCONFIGURE ?= CXXFLAGS="$(EMCC_CFLAGS)" CFLAGS="$(EMCC_CFLAGS)" emconfigure

include GDAL_EMCC_FLAGS.mk


########
# GDAL #
########
GDAL_SRC = $(SRC_DIR)/gdal-$(GDAL_VERSION)

gdal3.js: $(DIST_DIR)/gdal3WebAssembly.js
gdal: $(ROOT_DIR)/lib/libgdal.a

$(DIST_DIR)/gdal3WebAssembly.js: $(ROOT_DIR)/lib/libgdal.a
	mkdir -p $(DIST_DIR); \
	cd $(DIST_DIR); \
	EMCC_CORES=4 $(EMCC) $(ROOT_DIR)/lib/libgdal.a \
		$(ROOT_DIR)/lib/libproj.a $(ROOT_DIR)/lib/libsqlite3.a $(ROOT_DIR)/lib/libz.a $(ROOT_DIR)/lib/libspatialite.a \
		$(ROOT_DIR)/lib/libgeos.a $(ROOT_DIR)/lib/libgeos_c.a $(ROOT_DIR)/lib/libwebp.a $(ROOT_DIR)/lib/libsharpyuv.a $(ROOT_DIR)/lib/libwebpdemux.a \
		$(ROOT_DIR)/lib/libexpat.a $(ROOT_DIR)/lib/libtiffxx.a $(ROOT_DIR)/lib/libtiff.a $(ROOT_DIR)/lib/libgeotiff.a \
        $(ROOT_DIR)/lib/libiconv.a \
		-o $@ $(GDAL_EMCC_FLAGS) \
		--preload-file $(ROOT_DIR)/share/gdal@/usr/share/gdal \
		--preload-file $(ROOT_DIR)/share/proj@/usr/share/proj;

$(ROOT_DIR)/lib/libgdal.a: $(GDAL_SRC)/build/Makefile
	cd $(GDAL_SRC)/build; \
	$(EMMAKE) make -j4 install;

$(GDAL_SRC)/build/Makefile: $(ROOT_DIR)/lib/libsqlite3.a $(ROOT_DIR)/lib/libproj.a $(ROOT_DIR)/lib/libgeotiff.a $(ROOT_DIR)/lib/libwebp.a $(ROOT_DIR)/lib/libexpat.a $(ROOT_DIR)/lib/libspatialite.a $(ROOT_DIR)/lib/libiconv.a $(ROOT_DIR)/include/linux/fs.h $(GDAL_SRC)/CMakeLists.txt
	cd $(GDAL_SRC); \
	sed -i 's/ iconv_open/ libiconv_open/g' ./port/cpl_recode_iconv.cpp; \
    sed -i 's/        iconv/        libiconv/g' ./port/cpl_recode_iconv.cpp; \
    sed -i 's/#include <iconv.h>/# include <iconv.h>\nextern "C" {\n    extern __attribute__((__visibility__("default"))) iconv_t libiconv_open (const char* tocode, const char* fromcode);\n    extern __attribute__((__visibility__("default"))) size_t libiconv (iconv_t cd,  char* * inbuf, size_t *inbytesleft, char* * outbuf, size_t *outbytesleft);\n}/g' ./port/cpl_recode_iconv.cpp; \
	rm -rf $(ROOT_DIR)/lib/cmake; \
	mkdir build; \
	cd build; \
	$(EMCMAKE) cmake .. $(PREFIX_CMAKE) -DBUILD_SHARED_LIBS=OFF -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_APPS=OFF \
        -DGDAL_ENABLE_DRIVER_PDS=OFF \
        -DOGR_ENABLE_DRIVER_GPSBABEL=OFF \
        -DCMAKE_PREFIX_PATH=$(ROOT_DIR) -DCMAKE_FIND_ROOT_PATH=$(ROOT_DIR) \
        -DGDAL_USE_HDF5=OFF -DGDAL_USE_HDFS=OFF -DACCEPT_MISSING_SQLITE3_MUTEX_ALLOC=ON \
        -DSQLite3_INCLUDE_DIR=$(ROOT_DIR)/include -DSQLite3_LIBRARY=$(ROOT_DIR)/lib/libsqlite3.a \
        -DPROJ_INCLUDE_DIR=$(ROOT_DIR)/include -DPROJ_LIBRARY_RELEASE=$(ROOT_DIR)/lib/libproj.a \
        -DTIFF_INCLUDE_DIR=$(ROOT_DIR)/include -DTIFF_LIBRARY_RELEASE=$(ROOT_DIR)/lib/libtiff.a \
        -DGEOTIFF_INCLUDE_DIR=$(ROOT_DIR)/include -DGEOTIFF_LIBRARY_RELEASE=$(ROOT_DIR)/lib/libgeotiff.a \
        -DZLIB_INCLUDE_DIR=$(ROOT_DIR)/include -DZLIB_LIBRARY_RELEASE=$(ROOT_DIR)/lib/libz.a \
        -DSPATIALITE_INCLUDE_DIR=$(ROOT_DIR)/include -DSPATIALITE_LIBRARY=$(ROOT_DIR)/lib/libspatialite.a \
        -DGEOS_INCLUDE_DIR=$(ROOT_DIR)/include -DGEOS_LIBRARY=$(ROOT_DIR)/lib/libgeos.a \
        -DWEBP_INCLUDE_DIR=$(ROOT_DIR)/include -DWEBP_LIBRARY=$(ROOT_DIR)/lib/libwebp.a \
        -DEXPAT_INCLUDE_DIR=$(ROOT_DIR)/include -DEXPAT_LIBRARY=$(ROOT_DIR)/lib/libexpat.a \
        -DIconv_INCLUDE_DIR=$(ROOT_DIR)/include -DIconv_LIBRARY=$(ROOT_DIR)/lib/libiconv.a;

$(ROOT_DIR)/include/linux/fs.h:
	mkdir -p $(ROOT_DIR)/include/linux; \
	touch $(ROOT_DIR)/include/linux/fs.h;

$(GDAL_SRC)/CMakeLists.txt:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(GDAL_URL); \
	tar -xf gdal-$(GDAL_VERSION).tar.gz;

##############
# SPATIALITE #
##############
SPATIALITE_SRC = $(SRC_DIR)/libspatialite-$(SPATIALITE_VERSION)

spatialite: $(ROOT_DIR)/lib/libspatialite.a

$(ROOT_DIR)/lib/libspatialite.a: $(SPATIALITE_SRC)/Makefile
	cd $(SPATIALITE_SRC); \
	$(EMMAKE) make install;

$(SPATIALITE_SRC)/Makefile: $(ROOT_DIR)/lib/libsqlite3.a $(ROOT_DIR)/lib/libproj.a $(ROOT_DIR)/lib/libz.a $(ROOT_DIR)/lib/libgeos.a $(SPATIALITE_SRC)/configure
	cd $(SPATIALITE_SRC); \
	$(EMCONFIGURE) ./configure $(PREFIX) --enable-shared=no \
	CFLAGS="-I$(ROOT_DIR)/include -ULOADABLE_EXTENSION" \
	CPPFLAGS="-I$(ROOT_DIR)/include" \
	LDFLAGS="-L$(ROOT_DIR)/lib" \
	SQLITE3_CFLAGS="-I$(ROOT_DIR)/include" \
	SQLITE3_LIBS="-L$(ROOT_DIR)/lib" \
	--with-geosconfig="$(ROOT_DIR)/bin/geos-config" \
	--enable-geosadvanced=yes \
    --enable-geopackage=yes \
    --enable-examples=no \
    --enable-minizip=no \
    --enable-libxml2=no \
	--disable-rttopo \
    --enable-freexl=no;

$(SPATIALITE_SRC)/configure:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(SPATIALITE_URL); \
	tar -xf libspatialite-$(SPATIALITE_VERSION).tar.gz;

########
# GEOS #
########

GEOS_SRC = $(SRC_DIR)/geos-$(GEOS_VERSION)

geos: $(ROOT_DIR)/lib/libgeos.a

$(ROOT_DIR)/lib/libgeos.a: $(GEOS_SRC)/build/Makefile
	cd $(GEOS_SRC)/build; \
	$(EMMAKE) make -j4 install;

$(GEOS_SRC)/build/Makefile: $(GEOS_SRC)/CMakeLists.txt
	cd $(GEOS_SRC); \
    mkdir build; \
	cd build; \
	$(EMCMAKE) cmake .. $(PREFIX_CMAKE) -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF -DBUILD_TESTING=OFF;

$(GEOS_SRC)/CMakeLists.txt:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(GEOS_URL); \
	tar -xf geos-$(GEOS_VERSION).tar.bz2;

###########
# GEOTIFF #
###########
GEOTIFF_SRC = $(SRC_DIR)/libgeotiff-$(GEOTIFF_VERSION)

geotiff: $(ROOT_DIR)/lib/libgeotiff.a

$(ROOT_DIR)/lib/libgeotiff.a: $(GEOTIFF_SRC)/Makefile
	cd $(GEOTIFF_SRC); \
	$(EMMAKE) make install;

$(GEOTIFF_SRC)/Makefile: $(ROOT_DIR)/lib/libz.a $(ROOT_DIR)/lib/libproj.a $(GEOTIFF_SRC)/configure
	cd $(GEOTIFF_SRC); \
	$(EMCONFIGURE) ./configure $(PREFIX) --enable-shared=no \
	--with-proj=$(ROOT_DIR) --with-libtiff=$(ROOT_DIR) --with-zlib=$(ROOT_DIR) \
	CFLAGS="-I$(ROOT_DIR)/include" \
	CPPFLAGS="-I$(ROOT_DIR)/include" \
	LDFLAGS="-L$(ROOT_DIR)/lib";

$(GEOTIFF_SRC)/configure:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(GEOTIFF_URL); \
	tar -xf libgeotiff-$(GEOTIFF_VERSION).tar.gz;

########
# PROJ #
########
PROJ_SRC = $(SRC_DIR)/proj-$(PROJ_VERSION)

proj: $(ROOT_DIR)/lib/libproj.a

$(ROOT_DIR)/lib/libproj.a: $(PROJ_SRC)/Makefile
	cd $(PROJ_SRC); \
	$(EMMAKE) make install;

$(PROJ_SRC)/Makefile: $(ROOT_DIR)/lib/libtiff.a $(ROOT_DIR)/lib/libsqlite3.a $(PROJ_SRC)/CMakeLists.txt
	cd $(PROJ_SRC); \
	$(EMCMAKE) cmake . $(PREFIX_CMAKE)  \
    -DSQLITE3_INCLUDE_DIR=${ROOT_DIR}/include \
    -DSQLITE3_LIBRARY=${ROOT_DIR}/lib/libsqlite3.a \
    -DTIFF_INCLUDE_DIR=${ROOT_DIR}/include \
    -DTIFF_LIBRARY_RELEASE=${ROOT_DIR}/lib/libtiff.a \
    -DENABLE_CURL=OFF \
    -DBUILD_TESTING=OFF \
    -DBUILD_SHARED_LIBS=OFF \
    -DBUILD_APPS=OFF;


$(PROJ_SRC)/CMakeLists.txt:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(PROJ_URL); \
	tar -xf proj-$(PROJ_VERSION).tar.gz;

###########
# SQLITE3 #
###########
SQLITE3_SRC = $(SRC_DIR)/sqlite-autoconf-$(SQLITE_VERSION)

sqlite3: $(ROOT_DIR)/lib/libsqlite3.a

$(ROOT_DIR)/lib/libsqlite3.a: $(SQLITE3_SRC)/Makefile
	cd $(SQLITE3_SRC); \
	$(EMMAKE) make install;

$(SQLITE3_SRC)/Makefile: $(ROOT_DIR)/lib/libz.a $(SQLITE3_SRC)/configure
	cd $(SQLITE3_SRC); \
	$(EMCONFIGURE) ./configure $(PREFIX) --enable-shared=no \
	CFLAGS="-I$(ROOT_DIR)/include -DSQLITE_DISABLE_LFS -DSQLITE_ENABLE_FTS3 -DSQLITE_ENABLE_FTS3_PARENTHESIS -DSQLITE_ENABLE_JSON1 -DSQLITE_THREADSAFE=0 -DSQLITE_ENABLE_NORMALIZE" \
	CPPFLAGS="-I$(ROOT_DIR)/include" \
	LDFLAGS="-L$(ROOT_DIR)/lib";

$(SQLITE3_SRC)/configure:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(SQLITE_URL); \
	tar -xf sqlite-autoconf-$(SQLITE_VERSION).tar.gz;

###########
# TIFF #
###########
TIFF_SRC = $(SRC_DIR)/tiff-$(TIFF_VERSION)

tiff: $(ROOT_DIR)/lib/libtiff.a

$(ROOT_DIR)/lib/libtiff.a: $(TIFF_SRC)/Makefile
	cd $(TIFF_SRC); \
	$(EMMAKE) make install;

$(TIFF_SRC)/Makefile: $(ROOT_DIR)/lib/libz.a $(TIFF_SRC)/configure
	cd $(TIFF_SRC); \
	$(EMCONFIGURE) ./configure $(PREFIX) --enable-shared=no --disable-docs \
	--with-zlib-include-dir=${ROOT_DIR}/include \
	--with-zlib-lib-dir=${ROOT_DIR}/lib;

$(TIFF_SRC)/configure:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(TIFF_URL); \
	tar -xf tiff-$(TIFF_VERSION).tar.gz;

###########
# WEBP #
###########
WEBP_SRC = $(SRC_DIR)/libwebp-$(WEBP_VERSION)

webp: $(ROOT_DIR)/lib/libwebp.a

$(ROOT_DIR)/lib/libwebp.a: $(WEBP_SRC)/Makefile
	cd $(WEBP_SRC); \
	$(EMMAKE) make install;

$(WEBP_SRC)/Makefile: $(WEBP_SRC)/configure
	cd $(WEBP_SRC); \
    sed -i 's/SUBDIRS += examples//g' ./Makefile.am; \
	$(EMCONFIGURE) ./configure $(PREFIX) --enable-shared=no;

$(WEBP_SRC)/configure:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(WEBP_URL); \
	tar -xf libwebp-$(WEBP_VERSION).tar.gz;

###########
# EXPAT #
###########
EXPAT_SRC = $(SRC_DIR)/expat-$(EXPAT_VERSION)

expat: $(ROOT_DIR)/lib/libexpat.a

$(ROOT_DIR)/lib/libexpat.a: $(EXPAT_SRC)/Makefile
	cd $(EXPAT_SRC); \
	$(EMMAKE) make install;

$(EXPAT_SRC)/Makefile: $(EXPAT_SRC)/configure
	cd $(EXPAT_SRC); \
	$(EMCONFIGURE) ./configure $(PREFIX) --enable-shared=no --without-getrandom --without-sys-getrandom;

$(EXPAT_SRC)/configure:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(EXPAT_URL); \
	tar -xf expat-$(EXPAT_VERSION).tar.gz;

########
# ZLIB #
########
ZLIB_SRC = $(SRC_DIR)/zlib-$(ZLIB_VERSION)

zlib: $(ROOT_DIR)/lib/libz.a

$(ROOT_DIR)/lib/libz.a: $(ZLIB_SRC)/Makefile
	export PATH=$(ROOT_DIR)/bin:$(PATH); \
	cd $(ZLIB_SRC); \
	$(EMMAKE) make install;

$(ZLIB_SRC)/Makefile: $(ZLIB_SRC)/configure
	export PATH=$(ROOT_DIR)/bin:$(PATH); \
	cd $(ZLIB_SRC); \
	$(EMCONFIGURE) ./configure $(PREFIX) --static;

$(ZLIB_SRC)/configure:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(ZLIB_URL); \
	tar -xf zlib-$(ZLIB_VERSION).tar.gz;

###########
# ICONV #
###########
ICONV_SRC = $(SRC_DIR)/libiconv-$(ICONV_VERSION)

iconv: $(ROOT_DIR)/lib/libiconv.a

$(ROOT_DIR)/lib/libiconv.a: $(ICONV_SRC)/Makefile
	cd $(ICONV_SRC); \
	$(EMMAKE) make lib/localcharset.h; \
    cd lib && $(EMMAKE) make install prefix='$(ROOT_DIR)' exec_prefix='$(ROOT_DIR)' libdir='$(ROOT_DIR)/lib';

$(ICONV_SRC)/Makefile: $(ICONV_SRC)/configure
	cd $(ICONV_SRC); \
	$(EMCONFIGURE) ./configure $(PREFIX) --enable-shared=no;

$(ICONV_SRC)/configure:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(ICONV_URL); \
	tar -xf libiconv-$(ICONV_VERSION).tar.gz;
