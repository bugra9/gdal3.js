# gdal3.js

## Installation

**Direct <script>**
```html
<script src="https://cdn.jsdelivr.net/npm/gdal3.js/dist/gdal3.js"></script>
<!--or use as web worker-->
<script src="https://cdn.jsdelivr.net/npm/gdal3.js/dist/gdal3-worker.js"></script>
```

```js
Gdal3().then((instance) => {});
```
> Example: https://github.com/trylab-net/gdal3.js/tree/master/examples/browser
> Example: https://github.com/trylab-net/gdal3.js/tree/master/examples/browser-worker

**ES Module**
```html
<script type="module">
    import 'https://cdn.jsdelivr.net/npm/gdal3.js/dist/gdal3.js'
    // or use as web worker
    import 'https://cdn.jsdelivr.net/npm/gdal3.js/dist/gdal3-worker.js'

    Gdal3().then((instance) => {});
</script>
```
> Example: https://github.com/trylab-net/gdal3.js/tree/master/examples/module-browser
> Example: https://github.com/trylab-net/gdal3.js/tree/master/examples/module-browser-worker

**Builder such as Webpack (Vue, React, Angular, ...)**
```bash
yarn add gdal3.js
# or
npm install gdal3.js
```

```js
import Gdal3 from 'gdal3.js';
// or use as web worker
import Gdal3 from 'gdal3-worker.js';

Gdal3({ path: 'static' }).then((instance) => {});
```

```js
plugins: [
    new CopyWebpackPlugin({
        patterns: [
            { from: '../node_modules/gdal3.js/gdal3WebAssembly.wasm', to: 'static' },
            { from: '../node_modules/gdal3.js/gdal3WebAssembly.data', to: 'static' }
        ]
    })
]
```
> Full working example: https://github.com/trylab-net/gdal3.js/blob/master/GdalWeb/src/App.vue

**Node**
```bash
yarn add gdal3.js
# or
npm install gdal3.js
```

```js
import Gdal3 from 'gdal3.js';

Gdal3().then((instance) => {});
```
> Example: https://github.com/trylab-net/gdal3.js/blob/master/examples/node/index.js

## Usage
```js
const gdal3 = await Gdal3();

const result = await gdal3.open(files);
const firstDataset = result.dataset[0];
const outputs = await gdal3.ogr2ogr(firstDataset, ['-f', 'GeoJSON']);
const bytes = await gdal3.getFileBytes(outputs[0]);
```

## API

### Gdal3
```js
/*
    Create an instance of Gdal.

    @param      {Object} Configuration Object.
    config.path {String} Path of wasm and data files.
    config.dest {String} Destination path where the created files will be saved.

    @return {Promise -> Instance} "Promise" returns instance of Gdal.
*/
Gdal3(config)
```

### open

```js
/*
    Opens files selected with HTML <input> element (browser) or given file path (Node.js).

    @param {FileList|String|Array<String>} Returned by the files property of the HTML <input> element or file path.
    @return {Promise -> { datasets, errors }} "Promise" returns dataset list and error list.
*/
open(files)
```
```js
const dataset = (await gdal.open(files)).datasets[0];
```

### close

```js
/*
    Close the dataset. The memory associated to the dataset will be freed.

    Datasets **must** be closed when you're finished with them, or the
    memory consumption will grow forever.

    @param  {object} Dataset to be closed.
    @return {Promise -> void}
*/
close(dataset)
```
```js
await gdal.close(dataset);
```

### gdal_translate
```js
/*
    gdal_translate function can be used to convert raster data between different formats,
    potentially performing some operations like subsettings, resampling,
    and rescaling pixels in the process.

    @param  {object} Dataset to be converted.
    @param  {Array} Options (https://gdal.org/programs/gdal_translate.html)
    @return {Promise -> Array} "Promise" returns paths of created files.
*/
gdal_translate(dataset, options)
```
```js
const dataset = (await gdal.open(files)).datasets[0];
const outputs = await gdal.gdal_translate(dataset, ['-of', 'GTiff']);
```
> Visit for options: https://gdal.org/programs/gdal_translate.html


### ogr2ogr
```js
/*
    ogr2ogr function can be used to convert simple features data between file formats.
    It can also perform various operations during the process,
    such as spatial or attribute selection, reducing the set of attributes,
    setting the output coordinate system or even reprojecting the features during translation.

    @param  {object} Dataset to be converted.
    @param  {Array} Options (https://gdal.org/programs/ogr2ogr.html)
    @return {Promise -> Array} "Promise" returns paths of created files.
*/
ogr2ogr(dataset, options)
```
```js
const dataset = (await gdal.open(files)).datasets[0];
const outputs = await gdal.ogr2ogr(dataset, ['-f', 'GeoJSON']);
```
> Visit for options: https://gdal.org/programs/ogr2ogr.html


### gdal_rasterize
```js
/*
    gdal_rasterize function burns vector geometries (points, lines, and polygons)
    into the raster band(s) of a raster image. Vectors are read from OGR supported vector formats.

    @param  {object} Dataset to be converted.
    @param  {Array} Options (https://gdal.org/programs/gdal_rasterize.html)
    @return {Promise -> Array} "Promise" returns paths of created files.
*/
gdal_rasterize(dataset, options)
```
```js
const dataset = (await gdal.open(files)).datasets[0];
const outputs = await gdal.gdal_rasterize(dataset, ['-of', 'GTiff', '-ts', '256', '256']);
```
> Visit for options: https://gdal.org/programs/gdal_rasterize.html

### gdalwarp
```js
/*
    gdalwarp function is an image mosaicing, reprojection and warping utility.
    The function can reproject to any supported projection,
    and can also apply GCPs stored with the image if the image is “raw” with control information.

    @param  {object} Dataset to be converted.
    @param  {Array} Options (https://gdal.org/programs/gdalwarp.html)
    @return {Promise -> Array} "Promise" returns paths of created files.
*/
gdalwarp(dataset, options)
```
```js
const dataset = (await gdal.open(files)).datasets[0];
const outputs = await gdal.gdalwarp(dataset, ['-of', 'GTiff', '-t_srs', 'EPSG:4326']);
```
> Visit for options: https://gdal.org/programs/gdalwarp.html

### getInfo
```js
/*
    @param  {object} Dataset
    @return {Promise -> Object} "Promise" returns an object containing file information.
*/
getInfo(dataset)
```
```js
const dataset = (await gdal.open(files)).datasets[0];
const info = await gdal.gdalInfo(dataset);
```

### getOutputFiles
```js
/*
    Get paths of created files.

    @return {Promise -> Array} "Promise" returns path and size of created files.
*/
getOutputFiles()
```
```js
const outputs = await gdal.getOutputFiles();
```

### getFileBytes

```js
/*
    @param  {string} The path of the file to be downloaded.
    @return {Promise -> Uint8Array} "Promise" returns an array of bytes of the file.
*/
getFileBytes()
```
```js
const bytes = await gdal.getFileBytes('/output/polygon.tab');
```

## Compiling
- Install the EMSDK, [as described here](https://emscripten.org/docs/getting_started/downloads.html)
- Run `yarn compile` or `make`
- Run `yarn build`

## License
GNU General Public License v3.0 or later

See [LICENSE](https://github.com/trylab-net/gdal3.js/blob/master/LICENSE) to see the full text.

**Compiled with**
- [Gdal 3.1.0](https://github.com/OSGeo/gdal) [(License)](https://github.com/OSGeo/gdal/blob/master/gdal/LICENSE.TXT)
- [Proj 6.3.2](https://github.com/OSGeo/PROJ) [(License)](https://github.com/OSGeo/PROJ/blob/master/COPYING)
- [Geos 3.8.1](https://github.com/libgeos/geos) [(License)](https://github.com/libgeos/geos/blob/master/COPYING)
- [Spatialite 5.0.0-beta0](https://www.gaia-gis.it/fossil/libspatialite/index) [(License)](http://www.gnu.org/licenses/lgpl-2.1.html)
- [Sqlite 3.31.1](https://www.sqlite.org/index.html) [(License)](https://www.sqlite.org/copyright.html)
- [GeoTIFF 1.5.1](https://github.com/OSGeo/libgeotiff) [(License)](https://github.com/OSGeo/libgeotiff/blob/master/libgeotiff/LICENSE)
- [Tiff 4.1.0](https://gitlab.com/libtiff/libtiff) [(License)](https://gitlab.com/libtiff/libtiff/-/blob/master/COPYRIGHT)
- [WebP 1.1.0](https://chromium.googlesource.com/webm/libwebp) [(License)](https://chromium.googlesource.com/webm/libwebp/+/refs/heads/master/COPYING)
- [JPEG JFIF 9d](https://www.ijg.org/) [(License)](https://spdx.org/licenses/IJG.html) (This software is based in part on the work of the Independent JPEG Group)
- [Expat 2.2.9](https://github.com/libexpat/libexpat) [(License)](https://github.com/libexpat/libexpat/blob/master/expat/COPYING)
- [Zlib 1.2.11](https://www.zlib.net/) [(License)](https://www.zlib.net/zlib_license.html)

**Inspired by**
- [Emscripten](https://github.com/emscripten-core/emscripten)
- [ddohler/gdal-js](https://github.com/ddohler/gdal-js)
- [sql-js/sql.js](https://github.com/sql-js/sql.js)
- [jvail/spatiasql.js](https://github.com/jvail/spatiasql.js)
