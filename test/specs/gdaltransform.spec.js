/* eslint-disable global-require */
/* eslint-disable func-names */
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'; // https://github.com/iliakan/detect-node/blob/master/index.js

let Gdal;
let assert;

if (isNode) assert = require('chai').assert;
else assert = chai.assert;

describe('application / gdaltransform', function () {
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
    it('gdaltransform', async function () {
        const coords = [
            [27.143757, 38.4247972, 0],
        ];
        const options = [
            '-s_srs', 'EPSG:4326',
            '-t_srs', 'EPSG:3857',
        ];
        const newCoords = await Gdal.gdaltransform(coords, options);
        assert.strictEqual(newCoords.length === 1 && newCoords[0].length >= 2, true, 'An error occurred while transforming the coordinates.');
        assert.closeTo(newCoords[0][0], 3021629.2074563554, 0.00000001, 'An error occurred while transforming the coordinates.');
        assert.closeTo(newCoords[0][1], 4639610.441991095, 0.00000001, 'An error occurred while transforming the coordinates.');
        assert.strictEqual(newCoords[0][2], 0, 'An error occurred while transforming the coordinates.');
    });
    it('gdaltransform 2', async function () {
        const coords = [
            [3021629.2074563554, 4639610.441991095],
        ];
        const options = [
            '-s_srs', 'EPSG:4326',
            '-t_srs', 'EPSG:3857',
            '-output_xy',
            '-geoloc',
            '-rpc',
            '-i',
            '-tps',
            '-order', '1',
            '-ct', '',
            '-to', 'DST_SRS=EPSG:3857',
        ];
        const newCoords = await Gdal.gdaltransform(coords, options);
        assert.strictEqual(newCoords.length === 1 && newCoords[0].length >= 2, true, 'An error occurred while transforming the coordinates.');
        assert.closeTo(newCoords[0][0], 27.143757, 0.000000001, 'An error occurred while transforming the coordinates.');
        assert.closeTo(newCoords[0][1], 38.4247972, 0.000000001, 'An error occurred while transforming the coordinates.');
    });
});
