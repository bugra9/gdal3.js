/* eslint-disable global-require */
/* eslint-disable func-names */
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'; // https://github.com/iliakan/detect-node/blob/master/index.js

let Gdal;
let assert;
let destPath;

if (isNode) assert = require('chai').assert;
else assert = chai.assert;

describe('function / clearFS', function () {
    before(async function () {
        if (isNode) {
            this.timeout(15000);
            destPath = require('fs').mkdtempSync('/tmp/gdaljs');
            const initGdalJs = require('../../../build/package/gdal3.coverage');
            Gdal = await initGdalJs({ path: 'build/package', dest: destPath });
        } else {
            this.timeout(30000);
            Gdal = await initGdalJs({ path: '../package', useWorker: false });
        }
    });

    it('cleans /output after conversion', async function () {
        let file = 'data/polygon-line-point.geojson';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'polygon-line-point.geojson');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const dataset = result.datasets[0];
        assert.strictEqual(dataset.pointer > 0, true, 'An error occurred while opening the geojson file. (ptr == 0)');

        const output = await Gdal.ogr2ogr(dataset, ['-f', 'GeoJSON']);
        await Gdal.close(dataset);

        if (isNode) {
            // With config.dest set, output goes to real disk via NODEFS.
            // clearFS must not delete real files.
            const fs = require('fs');
            assert.isTrue(fs.existsSync(output.real), 'output file should exist on disk before clearFS');

            await Gdal.clearFS();

            assert.isTrue(fs.existsSync(output.real), 'real output file should remain after clearFS (NODEFS is not cleaned)');
        } else {
            const filesBefore = await Gdal.getOutputFiles();
            assert.isAbove(filesBefore.length, 0, 'output should have files before clearFS');

            await Gdal.clearFS();

            const filesAfter = await Gdal.getOutputFiles();
            assert.strictEqual(filesAfter.length, 0, 'output should be empty after clearFS');
        }
    });

    it('cleans /input after conversion (browser only)', async function () {
        if (isNode) {
            // /input is always NODEFS on Node.js — clearFS intentionally skips it
            this.skip();
            return;
        }

        const fileData = await fetch('data/polygon.geojson');
        const file = new File([await fileData.blob()], 'polygon.geojson');

        const openResult = await Gdal.open(file);
        assert.isAbove(openResult.datasets.length, 0, 'file should open successfully before clearFS');
        await Gdal.close(openResult.datasets[0]);

        await Gdal.clearFS();

        // After clearFS the file must no longer be accessible in /input
        try {
            const reopenResult = await Gdal.open('/input/polygon.geojson');
            assert.strictEqual(reopenResult.datasets.length, 0, '/input should be empty after clearFS');
        } catch (errors) {
            // open() rejects when all files fail — also proves the file was removed
            assert.isAbove(errors.length, 0, 'open should fail for a cleaned /input file');
        }
    });
});
