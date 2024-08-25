/* eslint-disable global-require */
/* eslint-disable func-names */
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'; // https://github.com/iliakan/detect-node/blob/master/index.js

let Module;
let Gdal;
let dest;
let assert;
let xml2js;

if (isNode) {
    assert = require('chai').assert;
    xml2js = require('xml-js').xml2js;
} else {
    assert = chai.assert;
    xml2js = window.xml2js;
}

const ignoredInputFormats = [''];
const ignoredOutputFormats = ['GeoJSON', 'S57', 'PDS4', 'PDF', 'PGDUMP', 'OpenFileGDB', 'GPSBabel'];
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

init();
async function init() {
    if (isNode) {
        dest = require('fs').mkdtempSync('/tmp/gdal3js');
        const initGdalJs = require('../node.js');
        Module = await initGdalJs({ path: 'dist' });
        Gdal = Module.Gdal;
        Gdal.allRegister();
        createTest();
    } else {
        window.isGdalReadyToTest.then(() => {
            Module = window.Module;
            Gdal = window.Gdal;
            dest = window.dest;
            createTest();
        });
    }
}
async function createTest() {
    describe('Vector Drivers', async () => {
        const b = new Module.VectorString();
        b.push_back('-json');
        const drivers = Module.toArray(Gdal.getDrivers());
        drivers.filter(d => d.isVector() && (d.getExtension() !== '' || d.getExtensions() !== '')).forEach((driver) => {
            const driverShortName = driver.getShortName();
            if (ignoredOutputFormats.includes(driverShortName)) return;
            const suffix = suffixes[driverShortName] || {};
            const tempParams = suffixes[driverShortName] && suffixes[driverShortName].outputParams ? suffixes[driverShortName].outputParams : [];

            [
                [],
                ...getOptions(driver.getLayerCreationOptions()).map(value => ['-lco', value]),
                ...getOptions(driver.getCreationOptions()).map(value => ['-dsco', value]),
            ]
                .filter((s) => s.length != 2 || (!ignoredParams.includes(driverShortName) && !ignoredParams.includes(driverShortName+'-'+s[1].split('=')[0])))
                .forEach((s) => {
                    const params = [...s, ...tempParams];
                    const p = ['-f', driverShortName, ...params];
                    const pVector = new Module.VectorString();
                    p.forEach((a) => pVector.push_back(a));
                    const p2 = `[${params.map(s => "'"+s+"'").join(', ')}]`;

                    let firstDataset2;

                    const writeFunc = async () => {
                        let file = `data/${suffix.file || 'polygon-line-point'}.geojson`;
                        if (!isNode) {
                            const fileData = await fetch(file);
                            file = new File([await fileData.blob()], `${suffix.file || 'polygon-line-point'}.geojson`);
                            file = (await Module.autoMountFiles([file]))[0];
                        } else file = `test/${file}`;

                        const firstDataset = Gdal.openEx(file);
                        assert.strictEqual(firstDataset !== null, true, 'An error occurred while opening the geojson file. (ptr == 0)');

                        const r = Math.random();
                        const extensions = driver.getExtensions();
                        let extension = driver.getExtension();
                        if (extension === '' && extensions !== '') {
                            extension = extensions.split(' ')[0];
                        }
                        if (extension !== '') {
                            extension = extension.replace('.', '').replace('/', '');
                        }

                        let ext = extension || 'unknown';
                        if (driverShortName === 'MapInfo File' && p.indexOf('FORMAT=MIF') !== -1) ext = 'mif';

                        const abc = firstDataset.vectorTranslate(dest + '/d' + r + '.' + ext, pVector);
                        assert.strictEqual(abc !== null, true, 'An error occurred while converting the file2. (ptr == 0)');
                        abc.close();

                        firstDataset2 = Gdal.openEx(dest + '/d' + r + '.' + ext + (suffix.outputFile || ''));
                        assert.strictEqual(firstDataset2 !== null, true, 'An error occurred while converting the file. (ptr == 0)');

                        const info = JSON.parse(firstDataset2.vectorInfo(b));
                        const featureCount = info.layers.reduce((acc, layer) => acc + layer.featureCount, 0);
                        assert.strictEqual(featureCount > 0, true, `${driverShortName} file has no feature. (featureCount == 0)`);
                    };

                    const readFunc = async () => {
                        const options = ['-f', 'GeoJSON', ...(suffix.inputParams || [])];
                        const pVector2 = new Module.VectorString();
                        options.forEach((a) => pVector2.push_back(a));
                        const r = Math.random();
                        const abc = firstDataset2.vectorTranslate(dest + '/d' + r + '.geojson', pVector2);
                        assert.strictEqual(abc !== null, true, 'An error occurred while converting the file2. (ptr == 0)');
                        abc.close();

                        const firstDataset3 = Gdal.openEx(dest + '/d' + r + '.geojson');
                        assert.strictEqual(firstDataset3 !== null, true, 'An error occurred while converting the file. (ptr == 0)');

                        const info3 = JSON.parse(firstDataset3.vectorInfo(b));
                        const featureCount = info3.layers.reduce((acc, layer) => acc + layer.featureCount, 0);
                        assert.strictEqual(featureCount > 0, true, 'geojson file has no feature. (featureCount == 0)');
                    };
                    if (driver.isReadable() && driver.isWritable()) {
                        it(`geojson -> ${driverShortName} params: ${p2} && ${driverShortName} -> geojson`, async () => {
                            console.log(`geojson -> ${driverShortName} params: ${p2} && ${driverShortName} -> geojson`);
                            await writeFunc();
                            await readFunc();
                        });
                    } else if (driver.isWritable()) {
                        it(`geojson -> ${driverShortName} params: ${p2}`, async () => {
                            console.log(`geojson -> ${driverShortName} params: ${p2}`);
                            await writeFunc();
                        });
                    }
                });
        });
    });
}

function getOptions(optionList2) {
    const optionList = xmlToJs(optionList2);
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

function xmlToJs(data) {
    if (data) {
        const tempJs = xml2js(data);
        if (tempJs.elements && tempJs.elements.length > 0) {
            if (tempJs.elements.length !== 1) console.warn('invalid xml!');
            if (tempJs.elements[0] && tempJs.elements[0].elements) {
                return tempJs.elements[0].elements.map((o) => {
                    const temp = o.attributes;
                    if (o.elements && o.elements.length > 0) {
                        temp.options = o.elements.map((o2) => o2.elements[0].text);
                    }
                    return temp;
                });
            }
        }
    }
    return null;
}
