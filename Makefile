GDAL_VERSION = 3.1.0
SPATIALITE_VERSION = 5.0.0-beta0
SQLITE_VERSION = 3310100
GEOS_VERSION = 3.8.1
PROJ_VERSION = 6.3.2
ZLIB_VERSION = 1.2.11
TIFF_VERSION = 4.1.0
GEOTIFF_VERSION = 1.5.1
JPEG_VERSION = 9d
WEBP_VERSION = 1.1.0
EXPAT_VERSION = 2.2.9

SQLITE_URL = "https://www.sqlite.org/2020/sqlite-autoconf-$(SQLITE_VERSION).tar.gz"
PROJ_URL = "http://download.osgeo.org/proj/proj-$(PROJ_VERSION).tar.gz"
GEOS_URL = "http://download.osgeo.org/geos/geos-$(GEOS_VERSION).tar.bz2"
SPATIALITE_URL = "http://www.gaia-gis.it/gaia-sins/libspatialite-sources/libspatialite-$(SPATIALITE_VERSION).tar.gz"
ZLIB_URL = "http://zlib.net/zlib-$(ZLIB_VERSION).tar.gz"
GDAL_URL = "https://github.com/OSGeo/gdal/releases/download/v$(GDAL_VERSION)/gdal-$(GDAL_VERSION).tar.gz"
TIFF_URL = "http://download.osgeo.org/libtiff/tiff-$(TIFF_VERSION).tar.gz"
GEOTIFF_URL = "http://download.osgeo.org/geotiff/libgeotiff/libgeotiff-$(GEOTIFF_VERSION).tar.gz"
JPEG_URL = "http://www.ijg.org/files/jpegsrc.v${JPEG_VERSION}.tar.gz"
WEBP_URL = "https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-${WEBP_VERSION}.tar.gz"
EXPAT_URL = "https://github.com/libexpat/libexpat/releases/download/R_$(subst .,_,$(EXPAT_VERSION))/expat-${EXPAT_VERSION}.tar.gz"

PWD = $(shell pwd)
SRC_DIR = build/src
SRC_DIR_FULL = $(PWD)/$(SRC_DIR)
ROOT_DIR = $(PWD)/build/usr
DIST_DIR = $(PWD)/dist
PREFIX = --prefix=$(ROOT_DIR)
PREFIX_CMAKE = "-DCMAKE_INSTALL_PREFIX=$(ROOT_DIR)"

# EMCC_CFLAGS = -g4 -O0 -fexceptions -DRENAME_INTERNAL_LIBTIFF_SYMBOLS
EMCC_CFLAGS = -O3 -fexceptions -DRENAME_INTERNAL_LIBTIFF_SYMBOLS
EMMAKE ?= EMCC_CFLAGS="$(EMCC_CFLAGS)" emmake
EMCMAKE ?= emcmake
EMCC ?= CFLAGS="$(EMCC_CFLAGS)" emcc
EMCONFIGURE ?= CXXFLAGS="$(EMCC_CFLAGS)" CFLAGS="$(EMCC_CFLAGS)" emconfigure

include GDAL_EMCC_FLAGS


########
# GDAL #
########
GDAL_SRC = $(SRC_DIR)/gdal-$(GDAL_VERSION)

gdal3.js: $(DIST_DIR)/gdal3WebAssembly.js
gdal: $(ROOT_DIR)/lib/libgdal.a

$(DIST_DIR)/gdal3WebAssembly.js: $(ROOT_DIR)/lib/libgdal.a
	mkdir -p $(DIST_DIR); \
	cd $(DIST_DIR); \
	$(EMCC) $(ROOT_DIR)/lib/libgdal.a \
		$(ROOT_DIR)/lib/libproj.a $(ROOT_DIR)/lib/libsqlite3.a $(ROOT_DIR)/lib/libz.a $(ROOT_DIR)/lib/libspatialite.a \
		$(ROOT_DIR)/lib/libgeos.a $(ROOT_DIR)/lib/libgeos_c.a $(ROOT_DIR)/lib/libwebp.a $(ROOT_DIR)/lib/libexpat.a $(ROOT_DIR)/lib/libwebpdemux.a \
		$(ROOT_DIR)/lib/libtiffxx.a $(ROOT_DIR)/lib/libtiff.a $(ROOT_DIR)/lib/libjpeg.a $(ROOT_DIR)/lib/libgeotiff.a \
		-o gdal3WebAssembly.js $(GDAL_EMCC_FLAGS) \
		--preload-file $(ROOT_DIR)/share/gdal@/usr/share/gdal \
		--preload-file $(ROOT_DIR)/share/proj@/usr/share/proj;

$(ROOT_DIR)/lib/libgdal.a: $(GDAL_SRC)/config.status
	cd $(GDAL_SRC); \
	$(EMMAKE) make install;

$(GDAL_SRC)/config.status: $(ROOT_DIR)/lib/libsqlite3.a $(ROOT_DIR)/lib/libproj.a $(ROOT_DIR)/lib/libgeotiff.a $(ROOT_DIR)/lib/libwebp.a $(ROOT_DIR)/lib/libexpat.a $(ROOT_DIR)/lib/libspatialite.a $(GDAL_SRC)/configure
	cd $(GDAL_SRC); \
	$(EMCONFIGURE) ./configure $(PREFIX) \
	CFLAGS="-I$(ROOT_DIR)/include/" \
	CPPFLAGS="-I$(ROOT_DIR)/include/" \
	LDFLAGS="-L$(ROOT_DIR)/lib/" \
	--with-sqlite3=$(ROOT_DIR) --with-proj=$(ROOT_DIR) --with-tiff=$(ROOT_DIR) --with-geotiff=$(ROOT_DIR) \
	--enable-shared=no --with-libz=$(ROOT_DIR) --with-spatialite=$(ROOT_DIR) --with-geos=$(ROOT_DIR)/bin/geos-config \
	--with-webp=$(ROOT_DIR) --with-expat=$(ROOT_DIR);

$(GDAL_SRC)/configure:
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
	CFLAGS="-ULOADABLE_EXTENSION -DACCEPT_USE_OF_DEPRECATED_PROJ_API_H=1" \
	CPPFLAGS="-I$(ROOT_DIR)/include/ -DACCEPT_USE_OF_DEPRECATED_PROJ_API_H=1" \
	LDFLAGS="-L$(ROOT_DIR)/lib/" \
	--with-geosconfig="$(ROOT_DIR)/bin/geos-config" \
	--enable-geosadvanced=yes \
	--enable-epsg=no \
	--enable-mathsql=no \
	--enable-rttopo=no \
	--enable-knn=no \
	--enable-geocallbacks=no \
	--enable-geosreentrant=no \
	--enable-geopackage=yes \
	--enable-freexl=no \
	--enable-lwgeom=no  \
	--enable-libxml2=no \
	--enable-gcov=no \
	--enable-examples=no;

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
	$(EMMAKE) make install;
	cd $(GEOS_SRC)/tools; \
	$(EMMAKE) make install;

$(GEOS_SRC)/build/Makefile: $(GEOS_SRC)/configure
	cd $(GEOS_SRC); \
	sed -i 's/add_subdirectory(doc)//g' ./CMakeLists.txt; \
	sed -i 's/add_subdirectory(benchmarks)//g' ./CMakeLists.txt; \
	$(EMCONFIGURE) ./configure $(PREFIX) --enable-tests=no; \
	mkdir -p build; \
	cd build; \
	$(EMCMAKE) cmake $(PREFIX_CMAKE) -DDISABLE_GEOS_INLINE=ON -DENABLE_TESTS=OFF -DBUILD_TESTING=OFF -DCMAKE_BUILD_TYPE=Release ..;

$(GEOS_SRC)/configure:
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
	--with-proj=$(ROOT_DIR) --with-libtiff=$(ROOT_DIR) --with-zlib=$(ROOT_DIR) --with-jpeg=$(ROOT_DIR) \
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

$(PROJ_SRC)/Makefile: $(ROOT_DIR)/lib/libtiff.a $(ROOT_DIR)/lib/libsqlite3.a $(PROJ_SRC)/configure
	cd $(PROJ_SRC); \
	$(EMCONFIGURE) ./configure $(PREFIX) --without-curl --enable-shared=no  \
	CFLAGS="-I$(ROOT_DIR)/include" \
	CPPFLAGS="-I$(ROOT_DIR)/include" \
	LDFLAGS="-L$(ROOT_DIR)/lib" \
	SQLITE3_LIBS="-L${ROOT_DIR}/lib -lsqlite3" \
	TIFF_LIBS="-L${ROOT_DIR}/lib -ltiff";

$(PROJ_SRC)/configure:
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
	CFLAGS="-I$(ROOT_DIR)/include -DLONGDOUBLE_TYPE=double -DSQLITE_OMIT_LOAD_EXTENSION -DSQLITE_DISABLE_LFS -DSQLITE_ENABLE_FTS3 -DSQLITE_ENABLE_FTS3_PARENTHESIS -DSQLITE_THREADSAFE=0" \
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

$(TIFF_SRC)/Makefile: $(ROOT_DIR)/lib/libz.a $(ROOT_DIR)/lib/libjpeg.a $(TIFF_SRC)/configure
	cd $(TIFF_SRC); \
	$(EMCONFIGURE) ./configure $(PREFIX) --enable-shared=no \
	--with-zlib-include-dir=${ROOT_DIR}/include \
	--with-zlib-lib-dir=${ROOT_DIR}/lib \
	--with-jpeg-include-dir=${ROOT_DIR}/include \
	--with-jpeg-lib-dir=${ROOT_DIR}/lib;

$(TIFF_SRC)/configure:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(TIFF_URL); \
	tar -xf tiff-$(TIFF_VERSION).tar.gz;

###########
# JPEG #
###########
JPEG_SRC = $(SRC_DIR)/jpeg-$(JPEG_VERSION)

jpeg: $(ROOT_DIR)/lib/libjpeg.a

$(ROOT_DIR)/lib/libjpeg.a: $(JPEG_SRC)/Makefile
	cd $(JPEG_SRC); \
	$(EMMAKE) make clean; \
	$(EMMAKE) make install;

$(JPEG_SRC)/Makefile: $(JPEG_SRC)/configure
	cd $(JPEG_SRC); \
	$(EMCONFIGURE) ./configure $(PREFIX) --enable-shared=no;

$(JPEG_SRC)/configure:
	mkdir -p $(SRC_DIR); \
	cd $(SRC_DIR); \
	wget -nc $(JPEG_URL); \
	tar -xf jpegsrc.v$(JPEG_VERSION).tar.gz;

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
	$(EMCONFIGURE) ./configure $(PREFIX) --enable-shared=no;

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
