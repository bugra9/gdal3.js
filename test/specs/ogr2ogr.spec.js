/* eslint-disable global-require */
/* eslint-disable func-names */
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'; // https://github.com/iliakan/detect-node/blob/master/index.js

let Gdal;
let assert;

if (isNode) assert = require('chai').assert;
else assert = chai.assert;

describe('application / ogr2ogr', function () {
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
    it('ogr2ogr', async function () {
        let file = 'data/polygon-line-point.geojson';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'polygon-line-point.geojson');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const firstDataset = result.datasets[0];
        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the geojson file. (ptr == 0)');
        const outputPath = await Gdal.ogr2ogr(firstDataset, ['-f', 'MapInfo File', '-dsco', 'FORMAT=MIF']);
        assert.strictEqual(outputPath.local, '/output/polygon-line-point.mif', 'An error occurred while converting the file.');

        const result2 = await Gdal.open(outputPath.real);
        const firstDataset2 = result2.datasets[0];
        const info = await Gdal.getInfo(firstDataset2);
        assert.strictEqual(firstDataset2.pointer > 0, true, 'An error occurred while converting the file. (ptr == 0)');
        assert.strictEqual(info.featureCount > 0, true, 'mif file has no feature. (featureCount == 0)');
        const outputPath2 = await Gdal.ogr2ogr(firstDataset2, ['-f', 'GeoJSON']);

        const result3 = await Gdal.open(outputPath2.real);
        const firstDataset3 = result3.datasets[0];
        const info3 = await Gdal.getInfo(firstDataset3);
        assert.strictEqual(info3.featureCount > 0, true, 'geojson file has no feature. (featureCount == 0)');
    });
    it('ogr2ogr fail', async function () {
        let file = 'data/polygon-line-point.geojson';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'polygon-line-point.geojson');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const firstDataset = result.datasets[0];
        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the geojson file. (ptr == 0)');

        let failed = false;
        return Gdal.ogr2ogr(firstDataset, ['-f', 'PCIDSK2']).then(() => { failed = false; }).catch(() => { failed = true; })
            .finally(() => { assert.strictEqual(failed, true, 'An error occurred'); });
    });
    it('ogr2ogr with config', async function () {
        let file = 'data/polygon-line-point.geojson';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'polygon-line-point.geojson');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const firstDataset = result.datasets[0];
        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the geojson file. (ptr == 0)');
        const outputPath = await Gdal.ogr2ogr(firstDataset, ['-f', 'MapInfo File', '-dsco', 'FORMAT=MIF', '--config', 'MITAB_SET_TOWGS84_ON_KNOWN_DATUM', 'YES']);
        assert.strictEqual(outputPath.local, '/output/polygon-line-point.mif', 'An error occurred while converting the file.');

        const result2 = await Gdal.open(outputPath.real);
        const firstDataset2 = result2.datasets[0];
        assert.strictEqual(firstDataset2.pointer > 0, true, 'An error occurred while converting the file. (ptr == 0)');
    });
});
