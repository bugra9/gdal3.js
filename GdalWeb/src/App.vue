<template>
    <div id="app">
        <Tab :options="['Input', 'Translate', 'Output']" default="Input" ref="tab">
            <template slot="Input">
                <TabRadio :options="['File', 'Folder']" default="File">
                    <InputFiles slot="File" :datasets="datasets" :datasetsInfo="datasetsInfo" :onFileChange="onFileChange" :deleteDataset="deleteDataset" />
                    <InputFiles slot="Folder" isFolder :datasets="datasets" :datasetsInfo="datasetsInfo" :onFileChange="onFileChange" :deleteDataset="deleteDataset" />
                </TabRadio>
                <div class="center"><button @click="$refs.tab.value = 'Translate'">Translate Options ⮞</button></div>
            </template>
            <template slot="Translate">
                <div>
                    <label>Format (Required)</label>
                    <multiselect
                        v-model="translateFormat" :options="formatList"
                        :showLabels="false" placeholder="Select one" :maxHeight="500"
                        label="text" track-by="value" group-values="formats" group-label="name"
                    />
                </div>
                <div v-if="this.gdalProgram === 'ogr2ogr'">
                    <label>Projection</label>
                    <multiselect
                        v-model="translateProj" :options="crs"
                        :optionsLimit="20" :showLabels="false"
                        placeholder="Select one" label="text" track-by="value"
                    />
                </div>
                <div v-if="this.gdalProgram === 'ogr2ogr'">
                    <label>Query</label>
                    <input placeholder="eg: SELECT * FROM CITIES" type="text" name="a" class="input" v-model="translateQuery" />
                </div>
                <div>
                    <label>Options</label>
                    <textarea placeholder="eg: -order 1" class="input" v-model="translateOptions" />
                </div>
                <div>
                    <label>Command Preview</label>
                    <p class="preview">{{ preview }}</p>
                </div>
                <div class="center"><button @click="translate()">Translate ⮞</button></div>
            </template>
            <template slot="Output">
                <OutputFiles :files="files" :downloadFile="downloadFile" />
            </template>
        </Tab>
        <ul class="appinfo">
            <li><a href="https://github.com/bugra9/gdal3.js" target="_blank">Github</a></li>
            <li @click="$modal.show('about')">About</li>
            <li @click="$modal.show('supporteddrivers')">Formats</li>
            <li @click="$modal.show('releasenotes')">v1.0.0</li>
        </ul>
        <modal name="about" adaptive scrollable height="auto">
            <h2>GdalWeb <span> v1.0.0</span></h2>
            <p>This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.</p>
            <p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.</p>
            <p>You should have received a copy of the GNU General Public License along with this program. If not, see: https://www.gnu.org/licenses/</p>
            <div class="grid-list-2">
                <div>
                    <h4>Compiled with</h4>
                    <ul>
                        <li><a href="https://github.com/OSGeo/gdal" target="_blank">Gdal 3.1.0</a> <a href="https://github.com/OSGeo/gdal/blob/master/gdal/LICENSE.TXT" target="_blank" class="license">License</a></li>
                        <li><a href="https://github.com/OSGeo/PROJ" target="_blank">Proj 6.3.2</a> <a href="https://github.com/OSGeo/PROJ/blob/master/COPYING" target="_blank" class="license">License</a></li>
                        <li><a href="https://github.com/libgeos/geos" target="_blank">Geos 3.8.1</a> <a href="https://github.com/libgeos/geos/blob/master/COPYING" target="_blank" class="license">License</a></li>
                        <li><a href="https://www.gaia-gis.it/fossil/libspatialite/index" target="_blank">Spatialite 5.0.0-beta0</a> <a href="http://www.gnu.org/licenses/lgpl-2.1.html" target="_blank" class="license">License</a></li>
                        <li><a href="https://www.sqlite.org/index.html" target="_blank">Sqlite 3.31.1</a> <a href="https://www.sqlite.org/copyright.html" target="_blank" class="license">License</a></li>
                        <li><a href="https://github.com/OSGeo/libgeotiff" target="_blank">GeoTIFF 1.5.1</a> <a href="https://github.com/OSGeo/libgeotiff/blob/master/libgeotiff/LICENSE" target="_blank" class="license">License</a></li>
                        <li><a href="https://gitlab.com/libtiff/libtiff" target="_blank">Tiff 4.1.0</a> <a href="https://gitlab.com/libtiff/libtiff/-/blob/master/COPYRIGHT" target="_blank" class="license">License</a></li>
                        <li><a href="https://chromium.googlesource.com/webm/libwebp" target="_blank">WebP 1.1.0</a> <a href="https://chromium.googlesource.com/webm/libwebp/+/refs/heads/master/COPYING" target="_blank" class="license">License</a></li>
                        <li><a href="https://www.ijg.org/" target="_blank" title="This software is based in part on the work of the Independent JPEG Group">JPEG JFIF 9d</a> <a href="https://spdx.org/licenses/IJG.html" target="_blank" class="license">License</a></li>
                        <li><a href="https://github.com/libexpat/libexpat" target="_blank">Expat 2.2.9</a> <a href="https://github.com/libexpat/libexpat/blob/master/expat/COPYING" target="_blank" class="license">License</a></li>
                        <li><a href="https://www.zlib.net/" target="_blank">Zlib 1.2.11</a> <a href="https://www.zlib.net/zlib_license.html" target="_blank" class="license">License</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Inspired by</h4>
                    <ul>
                        <li><a href="https://github.com/emscripten-core/emscripten" target="_blank">Emscripten</a></li>
                        <li><a href="https://github.com/ddohler/gdal-js" target="_blank">ddohler/gdal-js</a></li>
                        <li><a href="https://github.com/sql-js/sql.js" target="_blank">sql-js/sql.js</a></li>
                        <li><a href="https://github.com/jvail/spatiasql.js" target="_blank">jvail/spatiasql.js</a></li>
                    </ul>
                </div>
            </div>
        </modal>
        <modal name="releasenotes" adaptive scrollable height="auto">
            <h2>Release Notes</h2>
            <p>v1.0.0</p>
        </modal>
        <modal name="supporteddrivers" adaptive scrollable height="auto" width="1000">
            <h4>Supported Raster Drivers</h4>
            <div class="grid-list-7">
                <a v-for="driver in gdalRasterDrivers" :key="driver.longName" :title="getDriverDesc(driver)">{{ driver.shortName }}</a>
            </div>
            <h4>Supported Vector Drivers</h4>
            <div class="grid-list-7">
                <a v-for="driver in gdalVectorDrivers" :key="driver.longName" :title="getDriverDesc(driver)">{{ driver.shortName }}</a>
            </div>
        </modal>
        <loading :active.sync="isLoading" color="#007BFF" :width="150" :height="150" />
    </div>
</template>

<script>
import Tab from './components/Tab.vue'
import TabRadio from './components/TabRadio.vue'
import InputFiles from './components/InputFiles.vue'
import OutputFiles from './components/OutputFiles.vue'
import Gdal from '../../dist/gdal3-worker';
import crs from './crs.json';
import Loading from 'vue-loading-overlay';
import './App.css';
import 'vue-loading-overlay/dist/vue-loading.css';
import 'vue-multiselect/dist/vue-multiselect.min.css';

let gdal;

export default {
    name: 'App',
    components: {
        Loading,
        Tab,
        TabRadio,
        InputFiles,
        OutputFiles,
    },
    data() {
        return {
            datasets: [],
            datasetsInfo: {},
            drivers: [],
            files: [],
            translateFormat: null,
            translateProj: null,
            translateQuery: '',
            translateOptions: '',
            program: '',
            parameters: '',
            crs: crs.map(c => ({ code: c.code, name: c.name, value: `EPSG:${c.code}`, text: `EPSG:${c.code} - ${c.name}`, search: `EPSG:${c.code} - ${c.name}`.toLowerCase() })),
            isLoading: false,
            isGdalLoaded: false,
            gdalRasterDrivers: [],
            gdalVectorDrivers: [],
        }
    },
    mounted() {
        Gdal().then((gdalInstance) => {
            gdal = gdalInstance;
            this.gdalRasterDrivers = Object.values(gdal.drivers.raster).sort((a, b) => a.shortName.localeCompare(b.shortName));
            this.gdalVectorDrivers = Object.values(gdal.drivers.vector).sort((a, b) => a.shortName.localeCompare(b.shortName));
            this.isGdalLoaded = true;
            this.isLoading = false;
        }).catch(e => console.error(e));
        setTimeout(() => {
            if (!this.isGdalLoaded) this.isLoading = true;
        }, 2000);
    },
    computed: {
        formatList() {
            if (this.drivers.length === 0) return [];
            
            const out = [];
            if (this.drivers[0].type === 'vector') {
                out.push({ name: 'raster', formats: [{ value: 'GTiff', text: 'GTiff - GeoTIFF' }] });
            }

            out.push({
                name: this.drivers[0].type,
                formats: this.drivers.map(d => ({ value: d.shortName, text: d.shortName + ' - ' + d.longName }))
            });

            return out;
        },
        gdalProgram() {
            if (this.drivers.length > 0 && this.translateFormat) {
                if (this.drivers[0].type === 'vector') {
                    if (this.translateFormat.value === 'GTiff') return 'gdal_rasterize';
                    else if (this.translateFormat.value !== null) return 'ogr2ogr';
                } else if (this.drivers[0].type === 'raster') {
                    if (this.translateFormat.value === 'GML') return 'gdal_polygonize';
                    else if (this.translateFormat.value !== null) return 'gdal_translate';
                }
            }
            return "";
        },
        gdalFunction() {
            return this.gdalProgram;
        },
        gdalParams() {
            const parameters = [];
            switch(this.gdalProgram) {
                case 'ogr2ogr':
                    if (this.translateFormat !== null) parameters.push('-f', this.translateFormat.value);
                    if (this.translateProj !== null) parameters.push('-t_srs', this.translateProj.value);
                    if (this.translateQuery !== '') parameters.push('-sql', this.translateQuery);
                    break;
                case 'gdal_translate':
                    if (this.translateFormat !== null) parameters.push('-of', this.translateFormat.value);
                    break;
                case 'gdal_rasterize':
                    parameters.push('-of', 'GTiff');
                    break
            }

            if (this.translateOptions !== '') parameters.push(...this.translateOptions.split(' '));
            
            return parameters;
        },
        preview() {
            return this.gdalProgram + ' ' + this.gdalParams.join(' ');
        },
    },
    watch: {
        gdalProgram(value) {
            if (value === 'gdal_rasterize') this.translateOptions = '-co alpha=yes -burn 255 -burn 0 -burn 0 -burn 100 -ot Byte -ts 256 256';
            else this.translateOptions = '';
        }
    },
    methods: {
        translate() {
            this.isLoading = true;
            let promises = [];
            let options = this.gdalParams;
            this.datasets.forEach(d => promises.push(gdal[this.gdalFunction](d, options)));
            Promise.allSettled(promises).then((results) => {
                gdal.getOutputFiles().then(files => {
                    results.filter(r => r.status === 'rejected').forEach(({reason}) => {
                        console.error(reason);
                        this.$toast.error(reason.message);
                    });
                    this.files = files;
                    this.isLoading = false;
                    this.$refs.tab.value = 'Output';
                });
            });
        },
        onFileChange(files) {
            this.isLoading = true;
            gdal.open(files).then(({datasets, errors}) => {
                if (datasets && datasets.length > 0) {
                    const promises = [];
                    datasets.forEach((d) => {
                        const infoPromise = gdal.getInfo(d);
                        infoPromise.then(info => this.datasetsInfo[d.pointer] = info);
                        promises.push(infoPromise);
                    });

                    Promise.all(promises).then(() => {
                        this.datasets = this.datasets.concat(datasets);

                        let drivers = [];
                        let type = this.datasets.reduce((out, obj) =>  (out === obj.type) ? out : '', this.datasets[0].type);
                        if (type !== '') {
                            drivers = Object.values(gdal.drivers[type]).filter(d => d.isWritable);
                            drivers.sort((a, b) => a.shortName.localeCompare(b.shortName));
                        }
                        this.program = '';
                        this.parameters = '';
                        this.isLoading = false;
                        this.drivers = drivers;
                        this.clearTranslateParameters()
                    });
                } else {
                    this.isLoading = false;
                }
                if (errors && errors.length > 0) {
                    errors.forEach(error => console.warn(error));
                }
            }).catch(e => {
                if (e && e.length > 0) {
                    e.forEach(error => this.$toast.error(error.message));
                }
                
                this.isLoading = false;
            });
        },
        deleteDataset(dataset) {
            gdal.close(dataset);
            let drivers = [];
            let datasets = this.datasets.filter(v => v !== dataset);
            if (datasets.length > 0) {
                let type = datasets.reduce((out, obj) =>  (out === obj.type) ? out : '', datasets[0].type);
                if (type !== '') {
                    drivers = Object.values(gdal.drivers[type]).filter(d => d.isWritable);
                    drivers.sort((a, b) => a.shortName.localeCompare(b.shortName));
                }
            }

            this.datasets = datasets;
            this.drivers = drivers;
            this.clearTranslateParameters();
        },
        clearTranslateParameters() {
            this.translateFormat = null;
            this.translateProj = null;
            this.translateQuery = '';
            this.translateOptions = '';
        },
        downloadFile(path) {
            const temp = path.split('/');
            const filename = temp[temp.length-1];
            gdal.getFileBytes(path).then(bytes => {
                const blob = new Blob([bytes]);
                this.saveAs(blob, filename);
            }).catch(e => console.error(e));
        },
        saveAs(blob, fileName) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        },
        getDriverDesc(driver) {
            let info = [];
            if (driver.isReadable) info.push('Read');
            if (driver.isWritable) info.push('Write');
            return `${driver.longName} (${info.join(', ')})`;
        },
    },
}
</script>

<style scoped>
#app {
    max-width: 600px;
    margin: 0 auto;
    margin-bottom: 40px;
}
.preview {
    font-family: monospace;
    line-height: 1.5;
    font-size: 10px;
    border-radius: .25em;
    border: 1px solid #96c8da;
    padding: 10px;
}
ul.appinfo {
    position: fixed;
    bottom: 0;
    left: 0;
    display: flex;
    margin: 0;
    padding: 10px 10px;
    background-color: white;
    width: 100%;
}

ul.appinfo > li {
    list-style-type: none;
    margin: 0 20px;
    color: #333;
    font-size: 15px;
    cursor: pointer;
}
ul.appinfo > li:hover {
    color: #666;
}
a {
    color: inherit;
    text-decoration: none;
}
a.link {
   text-decoration: underline;
   color: #ccc;
   cursor: pointer;
}
.grid-list-7 {
    display: grid;
    font-size: 13px;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
}
.grid-list-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
}

.license {
    font-size: 10px;
    color: #bbdefb;
}
</style>
