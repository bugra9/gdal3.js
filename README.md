<div align="center">
  <h1>gdal3.js</h1>
<p align="center">
  <strong>Gdal compiled to JavaScript</strong><br>
  WebAssembly & React Native
</p>

<a href="https://www.npmjs.com/package/gdal3.js"><img alt="gdal3.js npm version" src="https://img.shields.io/npm/v/gdal3.js?style=for-the-badge&label=gdal3.js" /></a>
<a href="https://www.npmjs.com/package/@gdal3.js/prebuilt"><img alt="@gdal3.js/prebuilt npm version" src="https://img.shields.io/npm/v/@gdal3.js/prebuilt?style=for-the-badge&label=@gdal3.js/prebuilt" /></a>
</div>

<h3 align="center">
  <a href=".">Home Page</a>
  <span> · </span>
  <a href=".">Documentation</a>
  <span> · </span>
  <a href=".">Migrating from v2.x to v3.x</a>
</h3>

Gdal3.js is a port of Gdal to Webassembly and React Native. It allows you to convert raster and vector geospatial data to various formats and coordinate systems.

Gdal3.js includes Gdal, Proj, Geos, Spatialite, Sqlite, Geotiff, Tiff, Webp, Expat, Zlib and Iconv libraries.

## Supported Formats

### Raster
**Read & Write** \
AAIGrid, ADRG, ARG, BLX, BMP, BT, BYN, CALS, CTable2, DTED, EHdr, ELAS, ENVI, ERS, FIT, GIF, GPKG, GRIB, GS7BG, GSAG, GSBG, GTX, GTiff, HF2, HFA, ILWIS, ISCE, ISIS2, ISIS3, JPEG, KMLSUPEROVERLAY, KRO, LAN, LCP, Leveller, MBTiles, MEM, MFF, MFF2, MRF, NITF, NTv2, NWT_GRD, OpenFileGDB, PAux, PCIDSK, PCRaster, PDS4, PNG, PNM, R, RMF, ROI_PAC, RRASTER, RST, Rasterlite, SAGA, SGI, SIGDEM, SRTMHGT, Terragen, USGSDEM, VICAR, VRT, WEBP, WMTS, XPM, XYZ, ZMap, Zarr

**Read Only** \
ACE2, AIG, AirSAR, BIGGIF, BSB, CAD, CEOS, COASP, COSAR, CPG, CTG, DERIVED, DIMAP, DIPEx, DOQ1, DOQ2, ECRGTOC, EIR, ESAT, ESRIC, FAST, GFF, GRASSASCIIGrid, GSC, GXF, GenBin, IRIS, ISG, JAXAPALSAR, JDEM, L1B, LOSLAS, MAP, MSGN, NDF, NGSGEOID, NOAA_B, NSIDCbin, NWT_GRC, OZI, PDS, PRF, RIK, RPFTOC, RS2, SAFE, SAR_CEOS, SDTS, SENTINEL2, SNODAS, SRP, STACIT, STACTA, TGA, TIL, TSX

**Write Only** \
COG, PDF


### Vector
**Read & Write** \
CSV, DGN, DXF, ESRI Shapefile, FlatGeobuf, GML, GPKG, GPX, GeoJSON, GeoJSONSeq, GeoRSS, Geoconcept, JML, JSONFG, KML, MBTiles, MVT, MapInfo File, MapML, Memory, ODS, OGR_GMT, OpenFileGDB, PCIDSK, PDS4, PMTiles, S57, SQLite, Selafin, VDV, VICAR, WAsP, XLSX

**Read Only** \
AVCBin, AVCE00, CAD, EDIGEO, ESRIJSON, GTFS, Idrisi, LVBAG, OGR_PDS, OGR_SDTS, OGR_VRT, OSM, SVG, SXF, TIGER, TopoJSON, UK .NTF, VFK

**Write Only** \
PDF, PGDUMP

## Packages

| Package | Description |
| ------- | ----------- |
| `gdal3.js` | package contains only the WebAssembly output, eliminating the need for compilation. It is compatible with both browser and Node.js environments. |
| `@gdal3.js/prebuilt` | package includes precompiled libraries for Android, iOS, and WebAssembly. It is compatible with Browser, Node.js, and React Native environments. However, due to its dependencies, the download size is relatively large. If storage space and internet bandwidth are not a concern, this package is highly recommended for ease of use. |
| &nbsp; | &nbsp; |
| `@gdal3.js/app-web` | package is a web application that provides a user interface for using the gdal_translate, ogr2ogr, and gdal_rasterize tools online. It utilizes gdal3.js in the background to process files directly in the browser, ensuring all file conversions occur on the client side. <br /><br /> [https://gdal3.js.org](https://gdal3.js.org) |
| `@gdal3.js/app-mobile` | package is a mobile application that also provides a user interface for the gdal_translate, ogr2ogr, and gdal_rasterize tools. Similar to the web application, it uses gdal3.js in the background to handle file conversions entirely on the client side, running directly on mobile devices. |

## Guide

### Installation with Cpp.js Plugins (Web, Node.js, React Native, ...)

> [!TIP]  
> The @gdal3.js/prebuilt package is fully compatible with **Cpp.js**. For more details, [click here](https://cpp.js.org/).

> [!WARNING]  
> Due to its dependencies, the download size is relatively large. If storage space and internet bandwidth are not a concern in the development environment, this package is highly recommended for ease of use.

Add gdal3.js prebuilt library.

```bash
pnpm add @gdal3.js/prebuilt
```

Add the cpp.js plugin of the bundler you are using and intregrate it. [(Integration)](https://cpp.js.org/docs/guide/integrate-into-existing-project/overview)

Cpp.js requires a configuration file to work. For a minimal setup, create a cppjs.config.js file and add the following content.
```js
export default {
    paths: {
        config: import.meta.url,
    },
};
```
<br />

\# **To use directly gdal3.js header files in JavaScript**
```js
import { initCppJs, Gdal } from '@gdal3.js/prebuilt/Gdal.h';
import '@gdal3.js/prebuilt/Driver.h';
import '@gdal3.js/prebuilt/Dataset.h';

await initCppJs();
```
<br />

\# **Using gdal3.js in c++ file and calling it from JavaScript**  

Create your C++ code to the src/native directory and import gdal3.js. For example;

```c++
// src/native/MySample.h
#pragma once
#include <gdal3js/Gdal.h>

int getGdalDriverCount() {
    return Gdal::getDriverCount();
}
```

```js
// src/index.js
import { initCppJs, getGdalDriverCount } from './native/MySample.h';

await initCppJs();
console.log(getGdalDriverCount());
```

> Example: [https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser-vite-plugin](https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser-vite-plugin)

<br />

### Installation with gdal3.js

**Script (CDN)** 
```html
<script type="text/javascript"
    src="https://cdn.jsdelivr.net/npm/gdal3.js@3.0.0-beta.1/dist/gdal3js.browser.js"
    integrity="sha384-PfNA9w/SrHFWvTnW83HsR8YEdDSjyXzS0O228IO6XeaQLE/CO2xeCBe2h+/GQ43b"
    crossorigin="anonymous"
></script>
```

```js
initCppJs({ path: 'https://cdn.jsdelivr.net/npm/gdal3.js@3.0.0-beta.1/dist' }).then(({ Gdal }) => {});
```
> Example: [https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser](https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser)

**ES Module**
```html
<script type="module">
    import 'gdal3js.browser.js'

    initCppJs().then(({ Gdal }) => {});
</script>
```
> Example: [https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser-module](https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser-module)

**Builder such as Webpack (Vue, React, Angular, ...)**
```bash
pnpm add gdal3.js
```

```js
import initCppJs from 'gdal3.js';

initCppJs({ path: 'dist' }).then(({ Gdal }) => {});
```

```js
plugins: [
    new CopyWebpackPlugin({
        patterns: [
            { from: require.resolve('gdal3.js/dist/gdal3js.wasm'), to: 'dist' },
            { from: require.resolve('gdal3.js/dist/gdal3js.data.txt'), to: 'dist' }
        ]
    })
]
```
> Full working example: [https://github.com/bugra9/gdal3.js/blob/master/packages/gdal3js-app-web/src/App.vue](https://github.com/bugra9/gdal3.js/blob/master/packages/gdal3js-app-web/src/App.vue)

**Vite + Vue3**
```bash
pnpm add gdal3.js
```

```html
<script setup>
import { ref } from 'vue'
import dataUrl from 'gdal3.js/dist/gdal3js.data.txt?url'
import wasmUrl from 'gdal3.js/dist/gdal3js.wasm?url'
import 'gdal3.js';

const paths = {
  wasm: wasmUrl,
  data: dataUrl,
};

const count = ref(0);
initCppJs({paths}).then(({ Gdal, toArray }) => {
    Gdal.allRegister();
    const drivers = toArray(Gdal.getDrivers());
    count.value = drivers.length;
});
</script>

<template>
  <div>Number of drivers: {{ count }}</div>
</template>
```

> Example: [https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser-vite](https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser-vite)

**Node**
```bash
pnpm add gdal3.js
```

```js
const initCppJs = require('gdal3.js/node.js');

initCppJs().then(({ Gdal }) => {});
```
> Example: [https://github.com/bugra9/gdal3.js/blob/master/packages/gdal3js-sample-nodejs/index.js](https://github.com/bugra9/gdal3.js/blob/master/packages/gdal3js-sample-nodejs/index.js)

### Basic Usage
```js
import { initCppJs, Gdal, AllSymbols } from '@gdal3.js/prebuilt/Gdal.h';
import '@gdal3.js/prebuilt/Driver.h';
import '@gdal3.js/prebuilt/Dataset.h';

await initCppJs();
const { autoMountFiles, toVector, VectorString, generateVirtualPath, getFileBytes } = AllSymbols;
const virtualTempPath = generateVirtualPath();

Gdal.allRegister();

const files = autoMountFiles(['a.mbtiles', 'b.tif']); // [Vector, Raster]
const mbTilesDataset = Gdal.openEx(files[0]);
const tifDataset = Gdal.openEx(files[1]);

/* ======== Dataset Info ======== */
let infoOptions = ['-json'];
infoOptions = toVector(VectorString, infoOptions);
const mbTilesDatasetInfo = JSON.parse(mbTilesDataset.info(infoOptions));
const tifDatasetInfo = JSON.parse(tifDataset.info(infoOptions));

/* ======== Vector translate (mbtiles -> geojson) ======== */
let options = [
    '-f', 'GeoJSON',
    '-t_srs', 'EPSG:4326'
];
options = toVector(VectorString, options);
const outputPath = `${virtualTempPath}/a.geojson`;
mbTilesDataset.vectorTranslate(outputPath, options);
const bytes = getFileBytes(outputPath);

/* ======== Raster translate (tif -> png) ======== */
let options = [
    '-of', 'PNG'
];
options = toVector(VectorString, options);
const outputPath = `${virtualTempPath}/b.png`;
tifDataset.translate(outputPath, options);
const bytes = getFileBytes(outputPath);

/* ======== Rasterize (mbtiles -> tif) ======== */
let options = [
    '-of', 'GTiff',
    '-co', 'alpha=yes'
];
options = toVector(VectorString, options);
const outputPath = `${virtualTempPath}/b.png`;
mbTilesDataset.rasterize(outputPath, options);
const bytes = getFileBytes(outputPath);

/* ======== Warp (reprojection) ======== */
let options = [ // https://gdal.org/programs/gdalwarp.html#description
    '-of', 'GTiff',
    '-t_srs', 'EPSG:4326'
];
options = toVector(VectorString, options);
const outputPath = `${virtualTempPath}/c.tif`;
Gdal.warp(outputPath, tifDataset, options);
const bytes = getFileBytes(outputPath);

// Close all datasets.
tifDataset.close();
mbTilesDataset.close();

/* ======== Transform (Coordinate) ======== */



/* ======== Transform (Coordinate) ======== */
const coords = [
    [27.143757, 38.4247972],
];
const options = [ // https://gdal.org/programs/gdaltransform.html#description
    '-s_srs', 'EPSG:4326',
    '-t_srs', 'EPSG:3857',
    '-output_xy',
];
const newCoords = await Gdal.gdaltransform(coords, options); // https://gdal3.js.org/docs/module-a_gdaltransform.html
console.log(newCoords); // [ [ 3021629.2074563554, 4639610.441991095 ] ]
```

## Documentation
[https://gdal3.js.org/docs/](https://gdal3.js.org/docs/)

## Development

Gdal3.js provides a high-level wrapper for GDAL, enabling easy and smooth usage. The project relies on Cpp.js for compilation and seamless integration.

The source code for the Gdal3.js project is available at [packages/gdal3js-prebuilt/src/native](https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-prebuilt/src/native). The WebAssembly output is automatically copied to the Gdal3.js package.

The dependencies of Gdal3.js—GDAL, Proj, GEOS, SpatiaLite, SQLite, GeoTIFF, TIFF, WebP, Expat, zlib, and Iconv—are compiled using Cpp.js. Changes to these dependencies can be made via the [Cpp.js project](https://github.com/bugra9/cpp.js/tree/main/packages).

For more information about the dependencies, refer to [Cpp.js Packages](https://cpp.js.org/docs/package/package/showcase).

## License
GNU Lesser General Public License v2.1 or later

See [LICENSE](https://github.com/bugra9/gdal3.js/blob/master/LICENSE) to see the full text.

**Compiled with**
- [Cpp.js 1.0.4](https://cpp.js.org/) [(License)](https://github.com/bugra9/cpp.js/blob/main/LICENSE)
- [Emscripten 3.1.51](https://github.com/emscripten-core/emscripten) [(License)](https://github.com/emscripten-core/emscripten/blob/main/LICENSE)
- [Gdal 3.10.1](https://github.com/OSGeo/gdal) [(License)](https://github.com/OSGeo/gdal/blob/master/LICENSE.TXT)
- [Proj 9.5.1](https://github.com/OSGeo/PROJ) [(License)](https://github.com/OSGeo/PROJ/blob/master/COPYING)
- [Geos 3.13.0](https://github.com/libgeos/geos) [(License)](https://github.com/libgeos/geos/blob/master/COPYING)
- [Spatialite 5.1.0](https://www.gaia-gis.it/fossil/libspatialite/index) [(License)](http://www.gnu.org/licenses/lgpl-2.1.html)
- [Sqlite 3.48.0](https://www.sqlite.org/index.html) [(License)](https://www.sqlite.org/copyright.html)
- [GeoTIFF 1.7.3](https://github.com/OSGeo/libgeotiff) [(License)](https://github.com/OSGeo/libgeotiff/blob/master/libgeotiff/LICENSE)
- [Tiff 4.7.0](https://gitlab.com/libtiff/libtiff) [(License)](https://gitlab.com/libtiff/libtiff/-/blob/master/COPYRIGHT)
- [WebP 1.5.0](https://chromium.googlesource.com/webm/libwebp) [(License)](https://chromium.googlesource.com/webm/libwebp/+/refs/heads/master/COPYING)
- [Expat 2.6.4](https://github.com/libexpat/libexpat) [(License)](https://github.com/libexpat/libexpat/blob/master/expat/COPYING)
- [Zlib 1.3.1](https://www.zlib.net/) [(License)](https://www.zlib.net/zlib_license.html)
- [Iconv 1.18](https://www.gnu.org/software/libiconv/) [(License)](https://www.gnu.org/software/libiconv/)
