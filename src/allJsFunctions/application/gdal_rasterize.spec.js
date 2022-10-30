/* eslint-disable global-require */
/* eslint-disable func-names */
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'; // https://github.com/iliakan/detect-node/blob/master/index.js

let Gdal;
let assert;

if (isNode) assert = require('chai').assert;
else assert = chai.assert;

describe('application / gdal_rasterize', function () {
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
    it('gdal_rasterize', async function () {
        let file = 'data/simple-polygon-line-point.geojson';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'simple-polygon-line-point.geojson');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const firstDataset = result.datasets[0];
        const info = await Gdal.getInfo(firstDataset);
        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the geojson file. (ptr == 0)');
        assert.strictEqual(info.featureCount > 0, true, 'geojson file has no feature. (featureCount == 0)');
        const outputPath = await Gdal.gdal_rasterize(firstDataset, ['-of', 'GTiff', '-co', 'alpha=yes', '-burn', '255', '-burn', '0', '-burn', '0', '-burn', '100', '-ot', 'Byte', '-ts', '256', '256']);
        assert.strictEqual(outputPath.local, '/output/simple-polygon-line-point.tif', 'An error occurred while converting the file.');

        const result2 = await Gdal.open(outputPath.real);
        const firstDataset2 = result2.datasets[0];
        const info2 = await Gdal.getInfo(firstDataset2);
        assert.strictEqual(firstDataset2.pointer > 0, true, 'An error occurred while converting the file. (ptr == 0)');
        assert.strictEqual(info2.bandCount === 4, true, `tif file does not have four layers. (bandCount == ${info2.bandCount})`);
    });
    it('gdal_rasterize fail', async function () {
        let file = 'data/simple-polygon-line-point.geojson';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'simple-polygon-line-point.geojson');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const firstDataset = result.datasets[0];
        const info = await Gdal.getInfo(firstDataset);
        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the geojson file. (ptr == 0)');
        assert.strictEqual(info.featureCount > 0, true, 'geojson file has no feature. (featureCount == 0)');

        let failed = false;
        return Gdal.gdal_rasterize(firstDataset, ['-of', 'GTiff']).then(() => { failed = false; }).catch(() => { failed = true; })
            .finally(() => { assert.strictEqual(failed, true, 'An error occurred'); });
    });
    it('gdal_rasterize with config', async function () {
        let file = 'data/simple-polygon-line-point.geojson';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'simple-polygon-line-point.geojson');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const firstDataset = result.datasets[0];
        const info = await Gdal.getInfo(firstDataset);
        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the geojson file. (ptr == 0)');
        assert.strictEqual(info.featureCount > 0, true, 'geojson file has no feature. (featureCount == 0)');
        const outputPath = await Gdal.gdal_rasterize(firstDataset, ['-of', 'GTiff', '-co', 'alpha=yes', '-burn', '255', '-burn', '0', '-burn', '0', '-burn', '100', '-ot', 'Byte', '-ts', '256', '256', '--config', 'NAME', 'TEST']);
        assert.strictEqual(outputPath.local, '/output/simple-polygon-line-point.tif', 'An error occurred while converting the file.');

        const result2 = await Gdal.open(outputPath.real);
        const firstDataset2 = result2.datasets[0];
        const info2 = await Gdal.getInfo(firstDataset2);
        assert.strictEqual(firstDataset2.pointer > 0, true, 'An error occurred while converting the file. (ptr == 0)');
        assert.strictEqual(info2.bandCount === 4, true, `tif file does not have four layers. (bandCount == ${info2.bandCount})`);
    });
});
