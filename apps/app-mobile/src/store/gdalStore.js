import 'gdal3.js/empty.i';
import 'gdal3.js/gdal3.js/Gdal.h';
import 'gdal3.js/gdal3.js/Driver.h';
import 'gdal3.js/gdal3.js/Dataset.h';
import { initCppJs, Native } from 'cpp.js';
import RNFS from 'react-native-fs';
import { makeAutoObservable } from 'mobx';
import crs from '../constants/crs.json';
import { toTitleCase, split, getFileExtension } from '../utils';

const programMapper = {
    translate: 'gdal_translate',
    vectorTranslate: 'ogr2ogr',
    rasterize: 'gdal_rasterize',
    polygonize: 'gdal_polygonize',
};

class GdalStore {
    gdalPath = `${RNFS.TemporaryDirectoryPath}/gdal3js`.replace('//', '/');
    drivers = [];
    datasetsInfo = {};
    datasets = [];
    translateFormat = null;
    translateProj = null;
    translateQuery = '';
    translateOptions = '';
    files = [];

    constructor() {
        makeAutoObservable(this);
        RNFS.exists(this.gdalPath).then(isExist => {
            if (isExist) {
                RNFS.unlink(this.gdalPath).then(() => {
                    RNFS.mkdir(this.gdalPath);
                });
            } else {
                RNFS.mkdir(this.gdalPath);
            }
        });
        console.log('initCppJs', initCppJs, Native);
        initCppJs().then(() => {
            Native.Gdal.allRegister();
            this.drivers = Native.toArray(Native.Gdal.getDrivers()).sort(
                (a, b) => a.getShortName().localeCompare(b.getShortName()),
            );
            console.log(this.drivers.length);
        });
    }

    get crs() {
        return crs.map(c => ({
            code: c.code,
            name: c.name,
            value: `EPSG:${c.code}`,
            label: `EPSG:${c.code} - ${c.name}`,
            search: `EPSG:${c.code} - ${c.name}`.toLowerCase(),
        }));
    }

    get rasterDrivers() {
        return this.drivers.filter(d => d.isRaster());
    }

    get vectorDrivers() {
        return this.drivers.filter(d => d.isVector());
    }

    get datasetDriverType() {
        if (Object.keys(this.datasetsInfo).length === 0) {
            return '';
        }
        return Object.values(this.datasetsInfo).reduce(
            (out, obj) => (out === obj.type ? out : ''),
            Object.values(this.datasetsInfo)[0].type,
        );
    }

    get datasetDrivers() {
        if (!this.datasetDriverType) {
            return [];
        }

        return (
            this.datasetDriverType === 'raster'
                ? this.rasterDrivers
                : this.vectorDrivers
        ).filter(d => d.isWritable());
    }

    get formatList() {
        if (this.datasetDrivers.length === 0) {
            return [];
        }

        const parent = {};
        const out = [];
        if (this.datasetDrivers[0].isVector()) {
            parent.raster = true;
            out.push({
                value: 'raster',
                label: 'Raster Drivers',
            });

            out.push({
                value: 'GTiff',
                label: 'GTiff - GeoTIFF',
                parent: 'raster',
            });
        }

        if (!parent[this.datasetDriverType]) {
            parent[this.datasetDriverType] = true;
            out.push({
                value: this.datasetDriverType,
                label: `${toTitleCase(this.datasetDriverType)} Drivers`,
            });
        }

        out.push(
            ...this.datasetDrivers.map(d => ({
                value: d.getShortName(),
                label: d.getShortName() + ' - ' + d.getLongName(),
                parent: this.datasetDriverType,
            })),
        );
        return out;
    }

    get program() {
        if (this.datasetDrivers.length > 0 && this.translateFormat) {
            if (this.datasetDriverType === 'vector') {
                if (this.translateFormat === 'GTiff') {
                    return 'rasterize';
                } else if (this.translateFormat !== null) {
                    return 'vectorTranslate';
                }
            } else if (this.datasetDriverType === 'raster') {
                if (this.translateFormat === 'GML') {
                    return 'polygonize';
                } else if (this.translateFormat !== null) {
                    return 'translate';
                }
            }
        }
        return '';
    }

    get params() {
        const parameters = [];
        switch (this.program) {
            case 'vectorTranslate':
                if (this.translateFormat !== null) {
                    parameters.push('-f', this.translateFormat);
                }
                if (this.translateProj !== null) {
                    parameters.push('-t_srs', this.translateProj);
                }
                if (this.translateQuery !== '') {
                    parameters.push('-sql', this.translateQuery);
                }
                break;
            case 'translate':
                if (this.translateFormat !== null) {
                    parameters.push('-of', this.translateFormat);
                }
                break;
            case 'rasterize':
                parameters.push('-of', 'GTiff');
                break;
        }

        if (this.translateOptions !== '') {
            parameters.push(...split(this.translateOptions));
        }

        return parameters;
    }

    get preview() {
        if (!this.program) {
            return '';
        }
        return (
            programMapper[this.program] +
            ' ' +
            this.params.map(p => (p[0] === '-' ? p : `"${p}"`)).join(' ')
        );
    }

    open(file) {
        const dataset = Native.Gdal.openEx(file.replace('file://', ''));
        if (dataset) {
            let info = JSON.parse(
                dataset.info(Native.toVector(Native.VectorString, ['-json'])),
            );
            const hasSize =
                info.size &&
                info.size.length >= 2 &&
                (info.size[0] > 0 || info.size[1] > 0);
            const type = info.bands.length > 0 && hasSize ? 'raster' : 'vector';
            if (type === 'vector') {
                info = JSON.parse(
                    dataset.vectorInfo(
                        Native.toVector(Native.VectorString, ['-json']),
                    ),
                );
            }
            this.datasets.push(dataset);
            this.datasetsInfo[this.datasets.length - 1] = { type, ...info };
        }
    }

    deleteDataset(index) {
        for (let i = index; i < this.datasets.length - 1; i += 1) {
            this.datasetsInfo[index] = this.datasetsInfo[index + 1];
        }
        delete this.datasetsInfo[this.datasets.length - 1];
        this.datasets.splice(index, 1);
    }

    translate() {
        return new Promise(resolve => {
            let promises = [];
            let options = this.params;
            this.datasets.forEach((d, dIndex) => {
                let ext = '';
                if (
                    this.program === 'vectorTranslate' &&
                    this.translateFormat === 'MapInfo File' &&
                    options.indexOf('FORMAT=MIF') !== -1
                ) {
                    ext = 'mif';
                } else {
                    ext = getFileExtension(
                        this.drivers.find(
                            driver =>
                                driver.getShortName() === this.translateFormat,
                        ),
                    );
                }

                let fileName = this.datasetsInfo[dIndex].description
                    .split('/')
                    .at(-1);
                const fileNameArr = fileName.split('.');
                fileNameArr.pop();
                fileName = fileNameArr.join('.');

                promises.push(
                    d[this.program](
                        `${this.gdalPath}/${fileName}.${ext}`,
                        Native.toVector(Native.VectorString, options),
                    ),
                );
            });
            Promise.allSettled(promises).then(results => {
                console.log('results', results);
                results.forEach(({ value: d }) => d.close());
                RNFS.readDir(this.gdalPath).then(files => {
                    results
                        .filter(r => r.status === 'rejected')
                        .forEach(({ reason }) => {
                            console.error(reason);
                        });
                    this.setFiles(files);
                    resolve();
                });
            });
        });
    }

    loadSampleGeojsonDataset() {
        const sampleDataPath = `${this.gdalPath}/polygon-line-point.geojson`;
        const sampleData = require('../assets/polygon-line-point.json');
        RNFS.writeFile(sampleDataPath, JSON.stringify(sampleData), 'utf8')
            .then(() => {
                this.open(sampleDataPath);
            })
            .catch(err => {
                console.log(err.message);
            });
    }

    setFiles(files) {
        this.files = files;
    }

    setTranslateFormat(format) {
        this.translateFormat = format;
    }

    setProjection(proj) {
        this.translateProj = proj;
    }

    setQuery(value) {
        this.translateQuery = value;
    }

    setOptions(value) {
        this.translateOptions = value;
    }
}

const gdalStore = new GdalStore();
export default gdalStore;
/*
let drivers;
let gdalRasterDrivers;
let gdalVectorDrivers;

initCppJs().then(() => {
    Native.Gdal.allRegister();
    drivers = Native.toArray(Native.Gdal.getDrivers()).sort((a, b) => a.getShortName().localeCompare(b.getShortName()));
    console.log('basla3');
    gdalRasterDrivers = drivers.filter(d => d.isRaster());
    gdalVectorDrivers = drivers.filter(d => d.isVector());
});

const datasetsInfo = {};
const datasets = [];
export function open(file) {
    const dataset = Native.Gdal.openEx(file.replace('file://', ''));
    if (dataset) {
        let info = JSON.parse(dataset.info(Native.toVector(Native.VectorString, ['-json'])));
        const hasSize = info.size && info.size.length >= 2 && (info.size[0] > 0 || info.size[1] > 0);
        const type = info.bands.length > 0 && hasSize ? 'raster' : 'vector';
        if (type === 'vector') {
            info = JSON.parse(dataset.vectorInfo(Native.toVector(Native.VectorString, ['-json'])));
        }
        datasetsInfo[dataset] = {type, ...info};
        datasets.push(dataset);
    }
}

export default Native;

/* initCppJs().then(Cppjs => {
    console.log('BugraClass', Cppjs.BugraClass, Cppjs);
    const BugraClass = Cppjs.BugraClass;
    const Bugra2Class = Cppjs.Bugra2Class;
    const Bugra3Class = Cppjs.Bugra3Class;
    const z = new BugraClass(7);
    z.setB(4);
    console.log('BugraClass.b2 = ', z.getB());

    const r = z.deneme(3);
    console.log(r);
    console.log(Bugra3Class.oo(2));
    console.log('getSqliteVersion', Bugra3Class.getSqliteVersion());

    const f = new Bugra2Class(6);
    console.log(Bugra3Class.waav(f, 6));

    Cppjs.Gdal.allRegister();
    vector().catch(e => console.error(e));
}); */

/*
async function vector() {
    console.log('abc');
    const filePath = await RNFetchBlob.config({fileCache: true})
        .fetch('GET', 'https://gdal3.js.org/test/data/simple-polygon-line-point.geojson')
        .then(res => res.path());
    console.log('data', filePath, Native.Gdal.openEx);

    const dataset = Native.Gdal.openEx(filePath);
    console.log(dataset);
    if (dataset) {
        // console.log(dataset.vectorInfo(new Cppjs.VectorString()));
        const newPath = `${RNFS.TemporaryDirectoryPath}simple-polygon-line-point.sqlite`;
        console.log('newPath', newPath);
        const options = new Native.VectorString();
        options.push_back('-f');
        options.push_back('SQLite');
        options.push_back('-lco');
        options.push_back('FORMAT=SPATIALITE');
        options.push_back('-t_srs');
        options.push_back('EPSG:3821');
        console.log('--');
        const d2 = dataset.vectorTranslate(newPath, options);
        console.log(d2);
    }
}

async function raster() {
    console.log('abc');
    const filePath = await RNFetchBlob.config({fileCache: true})
        .fetch('GET', 'https://gdal3.js.org/test/data/simple-polygon-line-point.tif')
        .then(res => res.path());
    console.log('data', filePath);

    const dataset = Native.Gdal.openEx(filePath);
    if (dataset) {
        const newPath = `${RNFS.TemporaryDirectoryPath}/simple-polygon-line-point.png`;
        console.log('newPath', newPath);
        const options = new Native.VectorString();
        options.push_back('-of');
        options.push_back('PNG');
        console.log('--');
        const d2 = dataset.translate(newPath, options);
        console.log(d2);
        console.log(d2.getRasterXSize());
        // const filelist = d2.getFileList();
        // for (let i = 0; i < filelist.size(); i += 1) {
        //     console.log('fileList: ', filelist.get(i));
        // }
    }
}
*/
