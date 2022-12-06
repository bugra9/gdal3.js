/* eslint-disable global-require */
/* eslint-disable func-names */
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'; // https://github.com/iliakan/detect-node/blob/master/index.js

let Gdal;
let assert;

if (isNode) assert = require('chai').assert;
else assert = chai.assert;

describe('application / gdal_location_info', function () {
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
    it('gdal_location_info', async function () {
        let file = 'data/vfr_wall.tif';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'vfr_wall.tif');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const firstDataset = result.datasets[0];
        
        const stLouisAirport = await Gdal.gdal_location_info(firstDataset,[38.7548,-90.3575]);
        
        assert.strictEqual(stLouisAirport.pixel === 11511, true, 'An error occurred while converting the coordinates (wrong result, for pixel)');
        assert.strictEqual(stLouisAirport.line === 5349, true, 'An error occurred while converting the coordinates (wrong result, for line)');
    });
});
