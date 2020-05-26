/* eslint-disable camelcase */
import ogr2ogr from './allJsFunctions/program/ogr2ogr';
import gdal_translate from './allJsFunctions/program/gdal_translate';
import gdal_rasterize from './allJsFunctions/program/gdal_rasterize';
import gdalwarp from './allJsFunctions/program/gdalwarp';
import gdaltransform from './allJsFunctions/program/gdaltransform';

import open from './allJsFunctions/function/open';
import close from './allJsFunctions/function/close';
import getInfo from './allJsFunctions/function/getInfo';
import getOutputFiles from './allJsFunctions/function/getOutputFiles';
import getFileBytes from './allJsFunctions/function/getFileBytes';

import { drivers } from './allJsFunctions/helper/drivers';

export default {
    ogr2ogr,
    gdal_translate,
    gdal_rasterize,
    gdalwarp,
    gdaltransform,
    open,
    close,
    getInfo,
    getOutputFiles,
    getFileBytes,
    drivers,
};
