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
const ignoredOutputFormats = [
    'GTiff', 'NITF', 'DTED', 'SRTMHGT', 'ISIS3', 'KMLSUPEROVERLAY', 'PDF', 'BYN',
    'ADRG', 'LCP', 'BLX', 'SAGA', 'USGSDEM', 'VRT', 'COG', 'OpenFileGDB', 'RRASTER'
];
const ignoredParams = [
    'JPEG-COLOR_TRANSFORM',
    'PCIDSK-INTERLEAVING',
    'RMF-COMPRESS',
    'Rasterlite-WIPE',
    'Rasterlite-TILED',
    'Rasterlite-PHOTOMETRIC',
    'MRF-COMPRESS',
    'HF2-COMPRESS',
    'JPEG-LOSSLESS_COPY',
    'WEBP-LOSSLESS_COPY',
    'Zarr-CONVERT_TO_KERCHUNK_PARQUET_REFERENCE',
    'Zarr-APPEND_SUBDATASET',
];

const suffixes = {
    'Leveller': { outputParams: ['-ot', 'Float32', '-co', 'MINUSERPIXELVALUE=1'] },
    'Terragen': { outputParams: ['-ot', 'Float32', '-co', 'MINUSERPIXELVALUE=1', '-co', 'MAXUSERPIXELVALUE=2'] },
    'PDS4': {
        outputParams: [
            '-co', 'VAR_TARGET_TYPE=Satellite',
            '-co', 'VAR_TARGET=Moon',
            '-co', 'VAR_OBSERVING_SYSTEM_NAME=LOLA',
            '-co', 'VAR_LOGICAL_IDENTIFIER=Lunar_LRO_LOLA_DEM_Global_64ppd.tif',
            '-co', 'VAR_TITLE="LRO LOLA Digital Elevation Model (DEM) 64ppd"',
            '-co', 'VAR_INVESTIGATION_AREA_NAME="Lunar Reconnaissance Orbiter"',
            '-co', 'VAR_INVESTIGATION_AREA_LID_REFERENCE="urn:nasa:pds:context:instrument_host:spacecraft.lro"',
        ]
    },
    'BT': { outputParams: ['-ot', 'Float32'] },
    'GTX': { outputParams: ['-ot', 'Float32'] },
    'NTv2': { outputParams: ['-ot', 'Float32'], file: 'simple-polygon-line-point' },
    'WEBP': { file: 'ycbcr_44_lzw_optimized' },
    'NWT_GRD': { outputParams: ['-ot', 'Float32'] },
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
        const [isRaster, ext, exts, shortName, createOpts, isReadable, isWritable] = await Promise.all([
            driver.isRaster(), driver.getExtension(), driver.getExtensions(),
            driver.getShortName(), driver.getCreationOptions(),
            driver.isReadable(), driver.isWritable(),
        ]);
        if (!isRaster || (ext === '' && exts === '')) return null;
        if (ignoredOutputFormats.includes(shortName)) return null;
        return {
            driver, shortName, ext, exts,
            creationOptions: getOptions(createOpts),
            isReadable, isWritable,
        };
    }))).filter(Boolean);

    describe('Raster Drivers', () => {
        driverInfos.forEach(({ shortName, ext, exts, creationOptions, isReadable, isWritable }) => {
            const suffix = suffixes[shortName] || {};
            const tempParams = suffix.outputParams || [];
            [
                [],
                ...creationOptions.map(value => ['-co', value]),
            ]
                .filter((s) => s.length != 2 || (!ignoredParams.includes(shortName) && !ignoredParams.includes(shortName + '-' + s[1].split('=')[0])))
                .forEach((s) => {
                    const params = [...s, ...tempParams];
                    const p = ['-of', shortName, ...params];
                    const p2 = `[${params.map(s => "'" + s + "'").join(', ')}]`;

                    let firstDataset2;

                    const writeFunc = async () => {
                        let file = `/test/data/${suffix.file || 'spaf27_epsg'}.tif`;
                        if (!isNode) {
                            const fileData = await fetch(file);
                            file = new File([await fileData.blob()], `${suffix.file || 'spaf27_epsg'}.tif`);
                            file = (await Module.autoMountFiles([file]))[0];
                        }

                        const firstDataset = await Gdal.openEx(file);
                        assert.strictEqual(firstDataset !== null, true, 'An error occurred while opening the tif file. (ptr == 0)');
                        const r = Math.random();

                        let extension = ext;
                        if (extension === '' && exts !== '') {
                            extension = exts.split(' ')[0];
                        }
                        if (extension !== '') {
                            extension = extension.replace('.', '').replace('/', '');
                        }

                        const extName = extension || 'unknown';

                        const pVector = await Module.toVector('VectorString', p);

                        const abc = await firstDataset.translate(dest + '/d' + r + '.' + extName, pVector);
                        assert.strictEqual(abc !== null, true, 'An error occurred while converting the file2. (ptr == 0)');
                        await abc.close();
                        firstDataset2 = await Gdal.openEx(dest + '/d' + r + '.' + extName);
                        assert.strictEqual(firstDataset2 !== null, true, 'An error occurred while converting the file. (ptr == 0)');

                        const a = await Module.toVector('VectorString', ['-json']);
                        const info = JSON.parse(await firstDataset2.info(a));
                        assert.strictEqual(info.bands.length > 0, true, `${shortName} file has no layer. (bandCount == 0)`);
                    };

                    const readFunc = async () => {
                        const outputPath2 = await Gdal.ogr2ogr(firstDataset2, ['-of', 'GTiff', ...(suffix.inputParams || [])]);

                        const result3 = await Gdal.open(outputPath2.real);
                        const firstDataset3 = result3.datasets[0];
                        const info3 = await Gdal.getInfo(firstDataset3);
                        assert.strictEqual(info3.bandCount > 0, true, `tif file has no layer. (bandCount == 0)`);
                    };
                    if (isReadable && isWritable) {
                        console.log(`tif -> ${shortName} params: ${p2} && ${shortName} -> tif`);
                        it(`tif -> ${shortName} params: ${p2} && ${shortName} -> tif`, async () => {
                            console.log(`tif -> ${shortName} params: ${p2} && ${shortName} -> tif`);
                            await writeFunc();
                            // await readFunc();
                        });
                    } else if (isWritable) {
                        console.log(`tif -> ${shortName} params: ${p2}`);
                        it(`tif -> ${shortName} params: ${p2}`, async () => {
                            console.log(`tif -> ${shortName} params: ${p2}`);
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
