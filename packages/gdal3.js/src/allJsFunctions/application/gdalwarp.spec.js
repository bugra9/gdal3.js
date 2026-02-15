/* eslint-disable global-require */
/* eslint-disable func-names */
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'; // https://github.com/iliakan/detect-node/blob/master/index.js

let Gdal;
let assert;

if (isNode) assert = require('chai').assert;
else assert = chai.assert;

describe('application / gdalwarp', function () {
    before(async function () {
        if (isNode) {
            this.timeout(15000);
            const dest = require('fs').mkdtempSync('/tmp/gdaljs');
            const initGdalJs = require('../../../build/package/gdal3.coverage');
            Gdal = await initGdalJs({ path: 'build/package', dest });
        } else {
            this.timeout(30000);
            Gdal = await initGdalJs({ path: '../package', useWorker: false });
        }
    });
    it('gdalwarp', async function () {
        let file = 'data/simple-polygon-line-point.tif';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'simple-polygon-line-point.tif');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const firstDataset = result.datasets[0];
        const info = await Gdal.getInfo(firstDataset);
        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the tif file. (ptr == 0)');
        assert.strictEqual(info.bandCount > 0, true, `tif file has no layer. (bandCount == ${info.bandCount})`);
        assert.strictEqual(info.projectionWkt.substr(info.projectionWkt.length - 50).indexOf('AUTHORITY["EPSG","4326"]') !== -1, true, '4326');
        assert.strictEqual(info.projectionWkt.substr(info.projectionWkt.length - 50).indexOf('AUTHORITY["EPSG","3857"]') !== -1, false, '3857');

        const outputPath = await Gdal.gdalwarp(firstDataset, ['-of', 'GTiff', '-t_srs', 'EPSG:3857']);
        assert.strictEqual(outputPath.local, '/output/simple-polygon-line-point.tif', 'An error occurred while converting the file.');

        const result2 = await Gdal.open(outputPath.real);
        const firstDataset2 = result2.datasets[0];
        const info2 = await Gdal.getInfo(firstDataset2);
        assert.strictEqual(firstDataset2.pointer > 0, true, 'An error occurred while converting the file. (ptr == 0)');
        assert.strictEqual(info2.projectionWkt.substr(info2.projectionWkt.length - 50).indexOf('AUTHORITY["EPSG","4326"]') !== -1, false, '4326 2');
        assert.strictEqual(info2.projectionWkt.substr(info2.projectionWkt.length - 50).indexOf('AUTHORITY["EPSG","3857"]') !== -1, true, '3857 2');
    });
    it('gdalwarp fail', async function () {
        let file = 'data/simple-polygon-line-point.tif';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'simple-polygon-line-point.tif');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const firstDataset = result.datasets[0];
        const info = await Gdal.getInfo(firstDataset);
        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the tif file. (ptr == 0)');
        assert.strictEqual(info.bandCount > 0, true, `tif file has no layer. (bandCount == ${info.bandCount})`);
        assert.strictEqual(info.projectionWkt.substr(info.projectionWkt.length - 50).indexOf('AUTHORITY["EPSG","4326"]') !== -1, true, '4326');
        assert.strictEqual(info.projectionWkt.substr(info.projectionWkt.length - 50).indexOf('AUTHORITY["EPSG","3857"]') !== -1, false, '3857');
        let failed = false;
        return Gdal.gdalwarp(firstDataset, []).then(() => { failed = false; }).catch(() => { failed = true; })
            .finally(() => { assert.strictEqual(failed, true, 'An error occurred'); });
    });
    it('gdalwarp with config', async function () {
        let file = 'data/simple-polygon-line-point.tif';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'simple-polygon-line-point.tif');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const firstDataset = result.datasets[0];
        const info = await Gdal.getInfo(firstDataset);
        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the tif file. (ptr == 0)');
        assert.strictEqual(info.bandCount > 0, true, `tif file has no layer. (bandCount == ${info.bandCount})`);
        assert.strictEqual(info.projectionWkt.substr(info.projectionWkt.length - 50).indexOf('AUTHORITY["EPSG","4326"]') !== -1, true, '4326');
        assert.strictEqual(info.projectionWkt.substr(info.projectionWkt.length - 50).indexOf('AUTHORITY["EPSG","3857"]') !== -1, false, '3857');

        const outputPath = await Gdal.gdalwarp(firstDataset, ['-of', 'GTiff', '-t_srs', 'EPSG:3857', '--config', 'NAME', 'TEST']);
        assert.strictEqual(outputPath.local, '/output/simple-polygon-line-point.tif', 'An error occurred while converting the file.');

        const result2 = await Gdal.open(outputPath.real);
        const firstDataset2 = result2.datasets[0];
        const info2 = await Gdal.getInfo(firstDataset2);
        assert.strictEqual(firstDataset2.pointer > 0, true, 'An error occurred while converting the file. (ptr == 0)');
        assert.strictEqual(info2.projectionWkt.substr(info2.projectionWkt.length - 50).indexOf('AUTHORITY["EPSG","4326"]') !== -1, false, '4326 2');
        assert.strictEqual(info2.projectionWkt.substr(info2.projectionWkt.length - 50).indexOf('AUTHORITY["EPSG","3857"]') !== -1, true, '3857 2');
    });
});
