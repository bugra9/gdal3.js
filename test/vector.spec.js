/* eslint-disable global-require */
/* eslint-disable func-names */
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'; // https://github.com/iliakan/detect-node/blob/master/index.js

let Gdal;
let assert;

if (isNode) assert = require('chai').assert;
else assert = chai.assert;

const ignoredInputFormats = [''];
const ignoredOutputFormats = ['GeoJSON', 'S57', 'PDS4', 'PDF', 'PGDUMP', 'GPSBabel'];
const ignoredParams = [
    'ESRI Shapefile-SHPT',
    'CSV',
    'PDS4-SAME_DIRECTORY',
    'GML-XSISCHEMA',
    'GPX-FORCE_GPX_TRACK',
    'SQLite-METADATA',
    'SQLite-INIT_WITH_EPSG',
    'Geoconcept-EXTENSION',
    'MVT-TYPE',
    'MVT-FORMAT',
    'MVT-COMPRESS',
];

const suffixes = {
    'GPX': {file: 'line', inputParams: ['routes']},
    'ESRI Shapefile': {file: 'line'},
    'WAsP': {file: 'line', outputParams: ['-lco', 'WASP_FIELDS=z']},
    'Geoconcept': {file: 'line'},
    'GPSTrackMaker': {file: 'point', inputParams: ['point_waypoints']},
    'MVT': {outputFile: '/0/0/0.pbf'},
};

createTest();
async function createTest() {
    if (isNode) {
        const dest = require('fs').mkdtempSync('/tmp/gdaljs');
        const initGdalJs = require('../build/package/gdal3.coverage');
        Gdal = await initGdalJs({ path: 'build/package', dest });
    } else {
        Gdal = await initGdalJs({ path: '../package', useWorker: false });
    }

    describe('Vector Drivers', async () => {
        Object.values(Gdal.drivers.vector).filter(v => (v.extension !== "" || v.extensions !== "")).forEach(driver => {
            if (ignoredOutputFormats.includes(driver.shortName)) return;
            const suffix = suffixes[driver.shortName] || {};
            const tempParams = suffixes[driver.shortName] && suffixes[driver.shortName].outputParams ? suffixes[driver.shortName].outputParams : [];

            [
                [],
                ...getOptions(driver.layerCreationOptionList).map(value => ['-lco', value]),
                ...getOptions(driver.creationOptionList).map(value => ['-dsco', value]),
            ]
                .filter((s) => s.length != 2 || (!ignoredParams.includes(driver.shortName) && !ignoredParams.includes(driver.shortName+'-'+s[1].split('=')[0])))
                .forEach((s) => {
                    const params = [...s, ...tempParams];
                    const p = ['-f', driver.shortName, ...params];
                    const p2 = `[${params.map(s => "'"+s+"'").join(', ')}]`;

                    let firstDataset2;

                    const writeFunc = async () => {
                        let file = `data/${suffix.file || 'polygon-line-point'}.geojson`;
                        if (!isNode) {
                            const fileData = await fetch(file);
                            file = new File([await fileData.blob()], `${suffix.file || 'polygon-line-point'}.geojson`);
                        } else file = `test/${file}`;

                        const result = await Gdal.open(file);
                        const firstDataset = result.datasets[0];
                        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the geojson file. (ptr == 0)');
                        const outputPath = await Gdal.ogr2ogr(firstDataset, p);

                        const result2 = await Gdal.open(`${outputPath.real}${suffix.outputFile || ''}`);
                        firstDataset2 = result2.datasets[0];
                        const info = await Gdal.getInfo(firstDataset2);
                        assert.strictEqual(firstDataset2.pointer > 0, true, 'An error occurred while converting the file. (ptr == 0)');
                        assert.strictEqual(info.featureCount > 0, true, `${driver.shortName} file has no feature. (featureCount == 0)`);
                    };

                    const readFunc = async () => {
                        const outputPath2 = await Gdal.ogr2ogr(firstDataset2, ['-f', 'GeoJSON', ...(suffix.inputParams || [])]);

                        const result3 = await Gdal.open(outputPath2.real);
                        const firstDataset3 = result3.datasets[0];
                        const info3 = await Gdal.getInfo(firstDataset3);
                        assert.strictEqual(info3.featureCount > 0, true, 'geojson file has no feature. (featureCount == 0)');
                    };
                    if (driver.isReadable && driver.isWritable) {
                        it(`geojson -> ${driver.shortName} params: ${p2} && ${driver.shortName} -> geojson`, async () => {
                            console.log(`geojson -> ${driver.shortName} params: ${p2} && ${driver.shortName} -> geojson`);
                            await writeFunc();
                            await readFunc();
                        });
                    } else if (driver.isWritable) {
                        it(`geojson -> ${driver.shortName} params: ${p2}`, async () => {
                            console.log(`geojson -> ${driver.shortName} params: ${p2}`);
                            await writeFunc();
                        });
                    }
                });
        });
    });
}

function getOptions(optionList) {
    const output = [];
    const list = (optionList || []).filter(o => (o.type === 'string-select' || o.type === 'boolean') && o.scope !== 'raster');
    list.forEach(o => {
        if (o.type === 'boolean') {
            if (o.default === undefined || (o.default !== false && o.default.toLowerCase() !== 'false' && o.default.toLowerCase() !== 'no')) output.push(`${o.name}=NO`);
            if (o.default === undefined || (o.default !== true && o.default.toLowerCase() !== 'true' && o.default.toLowerCase() !== 'yes')) output.push(`${o.name}=YES`);
        } else {
            o.options.forEach(v => {
                if (o.default !== v) output.push(`${o.name}=${v}`);
            });
        }
    });
    return output;
}
