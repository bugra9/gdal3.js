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
    'GPX': { file: 'line', inputParams: ['routes'] },
    'ESRI Shapefile': { file: 'line' },
    'WAsP': { file: 'line', outputParams: ['-lco', 'WASP_FIELDS=z'] },
    'Geoconcept': { file: 'line' },
    'GPSTrackMaker': { file: 'point', inputParams: ['point_waypoints'] },
    'MVT': { outputFile: '/0/0/0.pbf' },
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
        if (!window.isGdalReadyToTest) {
            window.isGdalReadyToTest = initCppJs({ path: '../dist', useWorker: true }).then(async (data) => {
                window.Module = data;
                window.Gdal = window.Module.Gdal;
                window.dest = await window.Module.getRandomPath();
                await window.Gdal.allRegister();
            });
        }
        window.isGdalReadyToTest.then(() => {
            Module = window.Module;
            Gdal = window.Gdal;
            dest = window.dest;
            const p = createTest();
            window.testsRegistered = Promise.all([window.testsRegistered, p].filter(Boolean));
        });
    }
}
async function createTest() {
    const drivers = await Module.toArray(await Gdal.getDrivers());

    const driverInfos = (await Promise.all(drivers.map(async (driver) => {
        const [isVector, ext, exts, shortName, layerOpts, createOpts, isReadable, isWritable] = await Promise.all([
            driver.isVector(), driver.getExtension(), driver.getExtensions(),
            driver.getShortName(), driver.getLayerCreationOptions(),
            driver.getCreationOptions(), driver.isReadable(), driver.isWritable(),
        ]);
        if (!isVector || (ext === '' && exts === '')) return null;
        if (ignoredOutputFormats.includes(shortName)) return null;
        return {
            driver, shortName, ext, exts,
            layerCreationOptions: getOptions(layerOpts),
            creationOptions: getOptions(createOpts),
            isReadable, isWritable,
        };
    }))).filter(Boolean);

    describe('Vector Drivers', () => {
        driverInfos.forEach(({ shortName, ext, exts, layerCreationOptions, creationOptions, isReadable, isWritable }) => {
            const suffix = suffixes[shortName] || {};
            const tempParams = suffix.outputParams || [];

            [
                [],
                ...layerCreationOptions.map(value => ['-lco', value]),
                ...creationOptions.map(value => ['-dsco', value]),
            ]
                .filter((s) => s.length != 2 || (!ignoredParams.includes(shortName) && !ignoredParams.includes(shortName + '-' + s[1].split('=')[0])))
                .forEach((s) => {
                    const params = [...s, ...tempParams];
                    const p = ['-f', shortName, ...params];
                    const p2 = `[${params.map(s => "'" + s + "'").join(', ')}]`;

                    let firstDataset2;

                    const writeFunc = async () => {
                        const tag = `[VEC ${shortName} ${p2}]`;
                        console.log(`${tag} 1: start`);
                        let file = `/test/data/${suffix.file || 'polygon-line-point'}.geojson`;
                        if (!isNode) {
                            const fileData = await fetch(file);
                            file = new File([await fileData.blob()], `${suffix.file || 'polygon-line-point'}.geojson`);
                            console.log(`${tag} 2: fetched, mounting`);
                            file = (await Module.autoMountFiles([file]))[0];
                            console.log(`${tag} 3: mounted -> ${file}`);
                        }

                        console.log(`${tag} 4: openEx src`);
                        const firstDataset = await Gdal.openEx(file);
                        console.log(`${tag} 5: openEx src done`);
                        assert.strictEqual(firstDataset !== null, true, 'An error occurred while opening the geojson file. (ptr == 0)');

                        const r = Math.random();
                        let extension = ext;
                        if (extension === '' && exts !== '') {
                            extension = exts.split(' ')[0];
                        }
                        if (extension !== '') {
                            extension = extension.replace('.', '').replace('/', '');
                        }

                        let extName = extension || 'unknown';
                        if (shortName === 'MapInfo File' && p.indexOf('FORMAT=MIF') !== -1) extName = 'mif';

                        console.log(`${tag} 6: toVector for opts`);
                        const pVector = await Module.toVector('VectorString', p);

                        console.log(`${tag} 7: vectorTranslate`);
                        const abc = await firstDataset.vectorTranslate(dest + '/d' + r + '.' + extName, pVector);
                        console.log(`${tag} 8: vectorTranslate done abc=${abc !== null}`);
                        assert.strictEqual(abc !== null, true, 'An error occurred while converting the file2. (ptr == 0)');
                        await abc.close();
                        console.log(`${tag} 9: abc closed`);

                        firstDataset2 = await Gdal.openEx(dest + '/d' + r + '.' + extName + (suffix.outputFile || ''));
                        console.log(`${tag} 10: openEx out done`);
                        assert.strictEqual(firstDataset2 !== null, true, 'An error occurred while converting the file. (ptr == 0)');

                        const b = await Module.toVector('VectorString', ['-json']);
                        console.log(`${tag} 11: vectorInfo`);
                        const info = JSON.parse(await firstDataset2.vectorInfo(b));
                        console.log(`${tag} 12: done`);
                        const featureCount = info.layers.reduce((acc, layer) => acc + layer.featureCount, 0);
                        assert.strictEqual(featureCount > 0, true, `${shortName} file has no feature. (featureCount == 0)`);
                    };

                    const readFunc = async () => {
                        const options = ['-f', 'GeoJSON', ...(suffix.inputParams || [])];
                        const pVector2 = await Module.toVector('VectorString', options);
                        const r = Math.random();
                        const abc = await firstDataset2.vectorTranslate(dest + '/d' + r + '.geojson', pVector2);
                        console.log(abc);
                        assert.strictEqual(abc !== null, true, 'An error occurred while converting the file2. (ptr == 0)');
                        await abc.close();

                        const firstDataset3 = await Gdal.openEx(dest + '/d' + r + '.geojson');
                        assert.strictEqual(firstDataset3 !== null, true, 'An error occurred while converting the file. (ptr == 0)');

                        const b2 = await Module.toVector('VectorString', ['-json']);
                        const info3 = JSON.parse(await firstDataset3.vectorInfo(b2));
                        const featureCount = info3.layers.reduce((acc, layer) => acc + layer.featureCount, 0);
                        assert.strictEqual(featureCount > 0, true, 'geojson file has no feature. (featureCount == 0)');
                    };
                    if (isReadable && isWritable) {
                        console.log(`geojson -> ${shortName} params: ${p2} && ${shortName} -> geojson`);
                        it(`geojson -> ${shortName} params: ${p2} && ${shortName} -> geojson`, async () => {
                            console.log(`geojson -> ${shortName} params: ${p2} && ${shortName} -> geojson`);
                            await writeFunc();
                            await readFunc();
                        });
                    } else if (isWritable) {
                        console.log(`geojson -> ${shortName} params: ${p2}`);
                        it(`geojson -> ${shortName} params: ${p2}`, async () => {
                            console.log(`geojson -> ${shortName} params: ${p2}`);
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
