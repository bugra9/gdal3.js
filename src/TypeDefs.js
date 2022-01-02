/**
 * @namespace TypeDefs
 */

/**
 * @typedef {Object} FileInfo
 * @memberof TypeDefs
 * @property {string} path Local path of the opened file.
 * @property {number} size File size in bytes.
 */

/**
 * @typedef {Object} FilePath
 * @memberof TypeDefs
 * @property {string} local Example: /output/polygon-line-point.mbtiles
 * @property {string} real Example: /tmp/gdaljsGClKZk/polygon-line-point.mbtiles
 */

/**
 * @typedef {Object} Dataset
 * @memberof TypeDefs
 * @property {number} pointer Memory address of this dataset allocated from the native code. It must be greater than zero.
 * @property {string} path Local path of the opened file.
 * @property {string} type Dataset type. (raster/vector)
 */

/**
 * @typedef {Object} DatasetList
 * @memberof TypeDefs
 * @property {Array<Dataset>} datasets Datasets
 * @property {Array<string>} errors Errors
 */

/**
 * @typedef {Object} DatasetInfo
 * @memberof TypeDefs
 * @property {string} type Dataset type. (raster or vector)
 * @property {string} dsName (raster/vector) Name of the data source.
 * @property {string} driverName (raster/vector) Long name of a driver.
 * @property {number} bandCount (raster only) Number of raster bands on this dataset.
 * @property {number} width (raster only) Raster width in pixels.
 * @property {number} height (raster only) Raster height in pixels.
 * @property {string} projectionWkt (raster only) Projection definition string for this dataset.
 * @property {Array<number>} coordinateTransform (raster only) Affine transformation coefficients.
 * @property {Array<Array<number>>} corners (raster only) Corner coordinates
 * @property {number} layerCount (vector only) Number of layers in this dataset.
 * @property {number} featureCount (vector only) Number of features in this dataset.
 * @property {Array<Object>} layers (vector only) Layers
 * @property {string} layers[].name Layer name
 * @property {number} layers[].featureCount Feature count in this layer.
 */
