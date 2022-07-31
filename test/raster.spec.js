/* eslint-disable global-require */
/* eslint-disable func-names */
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'; // https://github.com/iliakan/detect-node/blob/master/index.js

let Gdal;
let assert;

if (isNode) assert = require('chai').assert;
else assert = chai.assert;

const ignoredInputFormats = [''];
const ignoredOutputFormats = ['GTiff', 'NITF', 'DTED', 'SRTMHGT', 'ISIS3', 'KMLSUPEROVERLAY', 'PDF', 'BYN', 'ADRG', 'LCP', 'BLX', 'SAGA', 'USGSDEM'];
const ignoredParams = [
    'JPEG-COLOR_TRANSFORM',
    'PCIDSK-INTERLEAVING',
    'RMF-COMPRESS',
    'Rasterlite-WIPE',
    'Rasterlite-TILED',
    'Rasterlite-PHOTOMETRIC',
    'MRF-COMPRESS',
    'HF2-COMPRESS',
];

const suffixes = {
    'Leveller': { outputParams: ['-ot', 'Float32', '-co', 'MINUSERPIXELVALUE=1'] },
    'Terragen': { outputParams: ['-ot', 'Float32','-co', 'MINUSERPIXELVALUE=1', '-co', 'MAXUSERPIXELVALUE=2'] },
    'PDS4': { outputParams: [
        '-co', 'VAR_TARGET_TYPE=Satellite',
        '-co', 'VAR_TARGET=Moon',
        '-co', 'VAR_OBSERVING_SYSTEM_NAME=LOLA',
        '-co', 'VAR_LOGICAL_IDENTIFIER=Lunar_LRO_LOLA_DEM_Global_64ppd.tif',
        '-co', 'VAR_TITLE="LRO LOLA Digital Elevation Model (DEM) 64ppd"',
        '-co', 'VAR_INVESTIGATION_AREA_NAME="Lunar Reconnaissance Orbiter"',
        '-co', 'VAR_INVESTIGATION_AREA_LID_REFERENCE="urn:nasa:pds:context:instrument_host:spacecraft.lro"',
    ] },
    'BT': { outputParams: ['-ot', 'Float32'] },
    'GTX': { outputParams: ['-ot', 'Float32'] },
    'NTv2': { outputParams: ['-ot', 'Float32'], file: 'simple-polygon-line-point' },
    'WEBP': { file: 'ycbcr_44_lzw_optimized' },
    'NWT_GRD': { outputParams: ['-ot', 'Float32'] },
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

    describe('Raster Drivers', async () => {
        Object.values(Gdal.drivers.raster).filter(v => (v.extension !== "" || v.extensions !== "")).forEach(driver => {
            if (ignoredOutputFormats.includes(driver.shortName)) return;
            const suffix = suffixes[driver.shortName] || {};
            const tempParams = suffixes[driver.shortName] && suffixes[driver.shortName].outputParams ? suffixes[driver.shortName].outputParams : [];

            [
                [],
                ...getOptions(driver.creationOptionList).map(value => ['-co', value]),
            ]
                .filter((s) => s.length != 2 || (!ignoredParams.includes(driver.shortName) && !ignoredParams.includes(driver.shortName+'-'+s[1].split('=')[0])))
                .forEach((s) => {
                    const params = [...s, ...tempParams];
                    const p = ['-of', driver.shortName, ...params];
                    const p2 = `[${params.map(s => "'"+s+"'").join(', ')}]`;

                    let firstDataset2;

                    const writeFunc = async () => {
                        let file = `data/${suffix.file || 'spaf27_epsg'}.tif`;
                        if (!isNode) {
                            const fileData = await fetch(file);
                            file = new File([await fileData.blob()], `${suffix.file || 'spaf27_epsg'}.tif`);
                        } else file = `test/${file}`;

                        const result = await Gdal.open(file);
                        const firstDataset = result.datasets[0];
                        assert.strictEqual(firstDataset.pointer > 0, true, 'An error occurred while opening the tif file. (ptr == 0)');
                        const outputPath = await Gdal.gdal_translate(firstDataset, p);

                        const result2 = await Gdal.open(`${outputPath.real}${suffix.outputFile || ''}`);
                        firstDataset2 = result2.datasets[0];
                        const info = await Gdal.getInfo(firstDataset2);
                        assert.strictEqual(firstDataset2.pointer > 0, true, 'An error occurred while converting the file. (ptr == 0)');
                        assert.strictEqual(info.bandCount > 0, true, `${driver.shortName} file has no layer. (bandCount == 0)`);
                    };

                    const readFunc = async () => {
                        const outputPath2 = await Gdal.ogr2ogr(firstDataset2, ['-of', 'GTiff', ...(suffix.inputParams || [])]);

                        const result3 = await Gdal.open(outputPath2.real);
                        const firstDataset3 = result3.datasets[0];
                        const info3 = await Gdal.getInfo(firstDataset3);
                        assert.strictEqual(info3.bandCount > 0, true, `tif file has no layer. (bandCount == 0)`);
                    };
                    if (driver.isReadable && driver.isWritable) {
                        it(`tif -> ${driver.shortName} params: ${p2} && ${driver.shortName} -> tif`, async () => {
                            console.log(`tif -> ${driver.shortName} params: ${p2} && ${driver.shortName} -> tif`);
                            await writeFunc();
                            // await readFunc();
                        });
                    } else if (driver.isWritable) {
                        it(`tif -> ${driver.shortName} params: ${p2}`, async () => {
                            console.log(`tif -> ${driver.shortName} params: ${p2}`);
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
