# gdal3.js - Gdal compiled to JavaScript
[![npm](https://img.shields.io/npm/v/gdal3.js?style=for-the-badge)](https://www.npmjs.com/package/gdal3.js)

gdal3.js is a port of Gdal applications (**gdal_translate**, **ogr2ogr**, **gdal_rasterize**, **gdalwarp**, **gdaltransform**) to Webassembly. It allows you to convert raster and vector geospatial data to various formats and coordinate systems.

gdal3.js uses emscripten to compile Gdal, proj, geos, spatialite, sqlite, geotiff, tiff, webp, jpeg, expat and zlib to webassembly.

If you are building a native application in JavaScript (using Electron for instance), or are working in node.js, you will likely prefer to use a native binding of Gdal to JavaScript. A native binding will be faster because it will run native code.

**gdal3.js GUI**

gdal3.js GUI is a web application that provides a gui to gdal_translate, ogr2ogr and gdal_rasterize applications to be used online. Uses gdal3.js in the background.
It runs on the browser and files are converted on the client side.

[https://gdal3.js.org](https://gdal3.js.org)

## Supported Formats

### Raster
**Read & Write** \
AAIGrid, ADRG, ARG, BLX, BMP, BT, BYN, CALS, CTable2, DTED, EHdr, ELAS, ENVI, ERS, FIT, GIF, GPKG, GRIB, GS7BG, GSAG, GSBG, GTX, GTiff, HF2, HFA, ILWIS, ISCE, ISIS2, ISIS3, JPEG, KMLSUPEROVERLAY, KRO, LAN, LCP, Leveller, MBTiles, MEM, MFF, MFF2, MRF, NITF, NTv2, NWT_GRD, PAux, PCIDSK, PCRaster, PDS4, PNG, PNM, R, RMF, ROI_PAC, RRASTER, RST, Rasterlite, SAGA, SGI, SIGDEM, SRTMHGT, Terragen, USGSDEM, VICAR, VRT, WEBP, WMTS, XPM, XYZ, ZMap, Zarr

**Read Only** \
ACE2, AIG, AirSAR, BIGGIF, BSB, CAD, CEOS, COASP, COSAR, CPG, CTG, DERIVED, DIMAP, DIPEx, DOQ1, DOQ2, ECRGTOC, EIR, ESAT, ESRIC, FAST, GFF, GRASSASCIIGrid, GSC, GXF, GenBin, IRIS, ISG, JAXAPALSAR, JDEM, L1B, LOSLAS, MAP, MSGN, NDF, NGSGEOID, NWT_GRC, OGCAPI, OZI, PDS, PRF, RIK, RPFTOC, RS2, SAFE, SAR_CEOS, SDTS, SENTINEL2, SNODAS, SRP, STACIT, STACTA, TGA, TIL, TSX

**Write Only** \
COG, PDF


### Vector
**Read & Write** \
CSV, DGN, DXF, ESRI Shapefile, FlatGeobuf, GML, GPKG, GPSBabel, GPX, GeoJSON, GeoJSONSeq, GeoRSS, Geoconcept, JML, KML, MBTiles, MVT, MapInfo File, MapML, Memory, ODS, OGR_GMT, PCIDSK, PDS4, S57, SQLite/Spatialite, VDV, VICAR, WAsP, XLSX

**Read Only** \
AVCBin, AVCE00, CAD, EDIGEO, ESRIJSON, Idrisi, LVBAG, OGCAPI, OGR_PDS, OGR_SDTS, OGR_VRT, OSM, OpenFileGDB, SVG, SXF, TIGER, TopoJSON, UK .NTF, VFK

**Write Only** \
PDF, PGDUMP


## Guide

### Installation

**Script (CDN)** \
Note:  It doesn't work with web worker.
```html
<script type="text/javascript"
    src="https://cdn.jsdelivr.net/npm/gdal3.js@2.4.0/dist/package/gdal3.js"
    integrity="sha384-XlqVvSG4V8zz8Kdw95OpRdsWyJnWE5QUZy++BeAIEVb+f2n5RM7jdbZh5lm0pHWk"
    crossorigin="anonymous"
></script>
```

```js
initGdalJs({ path: 'https://cdn.jsdelivr.net/npm/gdal3.js@2.4.0/dist/package', useWorker: false }).then((Gdal) => {});
```
> Example: [https://github.com/bugra9/gdal3.js/tree/master/apps/example-browser](https://github.com/bugra9/gdal3.js/tree/master/apps/example-browser)

**Script (Local)**
```html
<script type="text/javascript" src="gdal3.js"></script>
```

```js
initGdalJs().then((Gdal) => {});
```
> Example: [https://github.com/bugra9/gdal3.js/tree/master/apps/example-browser-worker](https://github.com/bugra9/gdal3.js/tree/master/apps/example-browser-worker)

**ES Module**
```html
<script type="module">
    import 'gdal3.js'

    initGdalJs().then((Gdal) => {});
</script>
```
> Example: [https://github.com/bugra9/gdal3.js/tree/master/apps/example-module-browser-worker](https://github.com/bugra9/gdal3.js/tree/master/apps/example-module-browser-worker) \
> Example: [https://github.com/bugra9/gdal3.js/tree/master/apps/example-module-browser](https://github.com/bugra9/gdal3.js/tree/master/apps/example-module-browser)

**Builder such as Webpack (Vue, React, Angular, ...)**
```bash
yarn add gdal3.js
# or
npm install gdal3.js
```

```js
import initGdalJs from 'gdal3.js';

initGdalJs({ path: 'static' }).then((Gdal) => {});
```

```js
plugins: [
    new CopyWebpackPlugin({
        patterns: [
            { from: '../node_modules/gdal3.js/dist/package/gdal3WebAssembly.wasm', to: 'static' },
            { from: '../node_modules/gdal3.js/dist/package/gdal3WebAssembly.data', to: 'static' }
        ]
    })
]
```
> Full working example: [https://github.com/bugra9/gdal3.js/blob/master/apps/app-gui/src/App.vue](https://github.com/bugra9/gdal3.js/blob/master/apps/app-gui/src/App.vue)

**Vite + Vue3**
```bash
yarn add gdal3.js
# or
npm install gdal3.js
```

```html
<script setup>
import { ref } from 'vue'
import workerUrl from 'gdal3.js/dist/package/gdal3.js?url'
import dataUrl from 'gdal3.js/dist/package/gdal3WebAssembly.data?url'
import wasmUrl from 'gdal3.js/dist/package/gdal3WebAssembly.wasm?url'
import initGdalJs from 'gdal3.js';

const paths = {
  wasm: wasmUrl,
  data: dataUrl,
  js: workerUrl,
};

const count = ref(0);
initGdalJs({paths}).then((Gdal) => {
    count.value = Object.keys(Gdal.drivers.raster).length + Object.keys(Gdal.drivers.vector).length;
});
</script>

<template>
  <div>Number of drivers: {{ count }}</div>
</template>
```

**Node**
```bash
yarn add gdal3.js
# or
npm install gdal3.js
```

```js
const initGdalJs = require('gdal3.js/node');

initGdalJs().then((Gdal) => {});
```
> Example: [https://github.com/bugra9/gdal3.js/blob/master/apps/example-node/index.js](https://github.com/bugra9/gdal3.js/blob/master/apps/example-node/index.js)

### Basic Usage
```js
const Gdal = await initGdalJs();

const files = ['a.mbtiles', 'b.tif']; // [Vector, Raster]
const result = await Gdal.open(files); // https://gdal3.js.org/docs/module-f_open.html
const mbTilesDataset = result.datasets[0];
const tifDataset = result.datasets[1];


/* ======== Dataset Info ======== */
// https://gdal3.js.org/docs/module-f_getInfo.html
const mbTilesDatasetInfo = await Gdal.getInfo(mbTilesDataset); // Vector
const tifDatasetInfo = await Gdal.getInfo(tifDataset); // Raster


/* ======== Vector translate (mbtiles -> geojson) ======== */
const options = [ // https://gdal.org/programs/ogr2ogr.html#description
    '-f', 'GeoJSON',
    '-t_srs', 'EPSG:4326'
];
const output = await Gdal.ogr2ogr(mbTilesDataset, options); // https://gdal3.js.org/docs/module-a_ogr2ogr.html
const bytes = await Gdal.getFileBytes(output); // https://gdal3.js.org/docs/module-f_getFileBytes.html


/* ======== Raster translate (tif -> png) ======== */
const options = [ // https://gdal.org/programs/gdal_translate.html#description
    '-of', 'PNG'
];
const output = await Gdal.gdal_translate(tifDataset, options); // https://gdal3.js.org/docs/module-a_gdal_translate.html
const bytes = await Gdal.getFileBytes(output); // https://gdal3.js.org/docs/module-f_getFileBytes.html


/* ======== Rasterize (mbtiles -> tif) ======== */
const options = [ // https://gdal.org/programs/gdal_rasterize.html#description
    '-of', 'GTiff',
    '-co', 'alpha=yes'
];
const output = await Gdal.gdal_rasterize(mbTilesDataset, options); // https://gdal3.js.org/docs/module-a_gdal_rasterize.html
const bytes = await Gdal.getFileBytes(output); // https://gdal3.js.org/docs/module-f_getFileBytes.html


/* ======== Warp (reprojection) ======== */
const options = [ // https://gdal.org/programs/gdalwarp.html#description
    '-of', 'GTiff',
    '-t_srs', 'EPSG:4326'
];
const output = await Gdal.gdalwarp(tifDataset, options); // https://gdal3.js.org/docs/module-a_gdalwarp.html
const bytes = await Gdal.getFileBytes(output); // https://gdal3.js.org/docs/module-f_getFileBytes.html


// Close all datasets. // https://gdal3.js.org/docs/module-f_close.html
Gdal.close(mbTilesDataset);
Gdal.close(tifDataset);


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

## API References
[https://gdal3.js.org/docs](https://gdal3.js.org/docs)

## Examples
- Full working example with worker and Vue.js -> [Code](https://github.com/bugra9/gdal3.js/blob/master/apps/app-gui/), [Live](https://gdal3.js.org/)
- Browser with Worker -> [Code](https://github.com/bugra9/gdal3.js/blob/master/apps/example-browser-worker/), [Live](https://gdal3.js.org/examples/example-browser-worker/)
- Browser without Worker -> [Code](https://github.com/bugra9/gdal3.js/blob/master/apps/example-browser/), [Live](https://gdal3.js.org/examples/example-browser/)
- Browser with Worker (Module) -> [Code](https://github.com/bugra9/gdal3.js/blob/master/apps/example-module-browser-worker/), [Live](https://gdal3.js.org/examples/example-module-browser-worker/)
- Browser without Worker (Module) -> [Code](https://github.com/bugra9/gdal3.js/blob/master/apps/example-module-browser/), [Live](https://gdal3.js.org/examples/example-module-browser/)
- Node.js -> [Code](https://github.com/bugra9/gdal3.js/blob/master/apps/example-node/)

## Development

### Compiling
- Install the EMSDK, [as described here](https://emscripten.org/docs/getting_started/downloads.html)
- Install Sqlite3. ([#31](https://github.com/bugra9/gdal3.js/issues/31))
- Run `yarn compile` or `make`. Run `make type=debug` for debug version.
- Run `yarn build`. Run `yarn build-dev` for debug version.

## License
GNU Lesser General Public License v2.1 or later

See [LICENSE](https://github.com/bugra9/gdal3.js/blob/master/LICENSE) to see the full text.

**Compiled with**
- [Emscripten 3.1.7](https://github.com/emscripten-core/emscripten) [(License)](https://github.com/emscripten-core/emscripten/blob/main/LICENSE)
- [Gdal 3.5.1](https://github.com/OSGeo/gdal) [(License)](https://github.com/OSGeo/gdal/blob/master/gdal/LICENSE.TXT)
- [Proj 9.0.1](https://github.com/OSGeo/PROJ) [(License)](https://github.com/OSGeo/PROJ/blob/master/COPYING)
- [Geos 3.9.2](https://github.com/libgeos/geos) [(License)](https://github.com/libgeos/geos/blob/master/COPYING)
- [Spatialite 5.0.1](https://www.gaia-gis.it/fossil/libspatialite/index) [(License)](http://www.gnu.org/licenses/lgpl-2.1.html)
- [Sqlite 3.38.5](https://www.sqlite.org/index.html) [(License)](https://www.sqlite.org/copyright.html)
- [GeoTIFF 1.7.1](https://github.com/OSGeo/libgeotiff) [(License)](https://github.com/OSGeo/libgeotiff/blob/master/libgeotiff/LICENSE)
- [Tiff 4.4.0](https://gitlab.com/libtiff/libtiff) [(License)](https://gitlab.com/libtiff/libtiff/-/blob/master/COPYRIGHT)
- [WebP 1.2.0](https://chromium.googlesource.com/webm/libwebp) [(License)](https://chromium.googlesource.com/webm/libwebp/+/refs/heads/master/COPYING)
- [JPEG JFIF 9d](https://www.ijg.org/) [(License)](https://spdx.org/licenses/IJG.html)
- [Expat 2.4.8](https://github.com/libexpat/libexpat) [(License)](https://github.com/libexpat/libexpat/blob/master/expat/COPYING)
- [Zlib 1.2.12](https://www.zlib.net/) [(License)](https://www.zlib.net/zlib_license.html)
- [Iconv 1.17](https://www.gnu.org/software/libiconv/) [(License)](https://www.gnu.org/software/libiconv/)

**Inspired by**
- [ddohler/gdal-js](https://github.com/ddohler/gdal-js)
- [sql-js/sql.js](https://github.com/sql-js/sql.js)
- [jvail/spatiasql.js](https://github.com/jvail/spatiasql.js)
- [azavea/loam](https://github.com/azavea/loam)
