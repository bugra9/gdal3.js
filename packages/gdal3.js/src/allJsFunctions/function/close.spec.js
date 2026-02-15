/* eslint-disable global-require */
/* eslint-disable func-names */
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'; // https://github.com/iliakan/detect-node/blob/master/index.js

let Gdal;
let assert;

if (isNode) assert = require('chai').assert;
else assert = chai.assert;

describe('function / close', function () {
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
    it('close successfully', async function () {
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
        await Gdal.close(firstDataset);
    });
});
