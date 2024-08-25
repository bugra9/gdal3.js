/* eslint-disable global-require */
/* eslint-disable func-names */
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'; // https://github.com/iliakan/detect-node/blob/master/index.js

let Gdal;
let assert;

if (isNode) assert = require('chai').assert;
else assert = chai.assert;

describe('function / open', function () {
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
    it('open array multiple', async function () {
        let file = 'data/polygon-line-point.geojson';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'polygon-line-point.geojson');
        } else file = `test/${file}`;

        const result = await Gdal.open([file, file]);
        const firstDataset = result.datasets[0];
        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the geojson file. (ptr == 0)');
        assert.strictEqual(firstDataset.type === 'vector', true, 'No vector data in input file.');
    });
    if (!isNode) {
        it('open FileList', async function () {
            class FileList {
                constructor() {
                    this.length = 0;
                    this.files = [];
                    this.index = -1;
                }

                item(index) {
                    return this.files[index];
                }

                add(item) {
                    this.files.push(item);
                    this.length = this.files.length;
                }

                next() {
                    this.index += 1;
                    return { value: this.item(this.index), done: this.index === this.length };
                }

                [Symbol.iterator]() { return this; }
            }
            window.FileList = FileList;
            const fileList = new FileList();

            let file = 'data/polygon-line-point.geojson';
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'polygon-line-point.geojson');
            fileList.add(file);

            const result = await Gdal.open(fileList);
            const firstDataset = result.datasets[0];
            assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the geojson file. (ptr == 0)');
            assert.strictEqual(firstDataset.type === 'vector', true, 'No vector data in input file.');
        });
    }
    it('open vector', async function () {
        let file = 'data/polygon-line-point.geojson';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'polygon-line-point.geojson');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const firstDataset = result.datasets[0];
        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the geojson file. (ptr == 0)');
        assert.strictEqual(firstDataset.type === 'vector', true, 'No vector data in input file.');
    });
    it('open with open options', async function () {
        let file = 'data/pts.csv';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'pts.csv');
        } else file = `test/${file}`;

        const input = await Gdal.open(file, ['AUTODETECT_TYPE=YES', 'X_POSSIBLE_NAMES=lng', 'Y_POSSIBLE_NAMES=lat']);
        const output = await Gdal.ogr2ogr(input.datasets[0], ['-f', 'GeoJSON', '-s_srs', 'EPSG:4326', '-t_srs', 'EPSG:4326']);
        const bytes = await Gdal.getFileBytes(output);

        const result = JSON.parse(new TextDecoder().decode(bytes));
        assert.strictEqual(result.features.length, 2, 'Wrong number of features');
        assert.strictEqual(typeof result.features[0].properties.lng === 'number', true, 'Open option AUTODETECT_TYPE failed');
        assert.strictEqual(typeof result.features[0].properties.lat === 'number', true, 'Open option AUTODETECT_TYPE failed');
        assert.strictEqual(result.features[0].geometry !== null, true, 'Open options X_POSSIBLE_NAMES/Y_POSSIBLE_NAMES failed');
    });
    it('open raster', async function () {
        let file = 'data/simple-polygon-line-point.tif';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'simple-polygon-line-point.tif');
        } else file = `test/${file}`;

        const result = await Gdal.open(file);
        const firstDataset = result.datasets[0];
        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the tif file. (ptr == 0)');
        assert.strictEqual(firstDataset.type === 'raster', true, 'No raster data in input file.');
    });
    it('open fail', async function () {
        let file = 'data/unknown.geojson';
        if (!isNode) {
            const fileData = await fetch(file);
            file = new File([await fileData.blob()], 'unknown.geojson');
        } else file = `test/${file}`;

        let failed = false;
        Gdal.open(file).then(() => { failed = false; }).catch(() => { failed = true; })
            .finally(() => { assert.strictEqual(failed, true, 'An error occurred'); });
    });
    it('open fail2', async function () {
        let failed = false;
        Gdal.open('/output/unknown').then(() => { failed = false; }).catch(() => { failed = true; })
            .finally(() => { assert.strictEqual(failed, true, 'An error occurred'); });
    });
    it('open local/real', async function () {
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

        const result3 = await Gdal.open(outputPath.local);
        const firstDataset3 = result3.datasets[0];
        const info3 = await Gdal.getInfo(firstDataset3);
        assert.strictEqual(firstDataset3.pointer > 0, true, 'An error occurred while converting the file. (ptr == 0)');
        assert.strictEqual(info3.featureCount > 0, true, 'mif file has no feature. (featureCount == 0)');
    });
});
