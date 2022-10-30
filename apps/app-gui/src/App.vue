<template>
    <div id="app">
        <Header />
        <Tab :options="['Input', 'Convert', 'Output']" default="Input" ref="tab">
            <template slot="Input">
                <TabRadio :options="['File', 'Folder']" default="File">
                    <InputFiles slot="File" :datasets="datasets" :datasetsInfo="datasetsInfo" :onFileChange="onFileChange" :deleteDataset="deleteDataset" />
                    <InputFiles slot="Folder" isFolder :datasets="datasets" :datasetsInfo="datasetsInfo" :onFileChange="onFileChange" :deleteDataset="deleteDataset" />
                </TabRadio>
                <div class="center"><button @click="$refs.tab.value = 'Convert'">Convert Options ⮞</button></div>
            </template>
            <template slot="Convert">
                <div>
                    <label>Format (Required)</label>
                    <MultiSelect
                        v-model="translateFormat" :options="formatList"
                        :showLabels="false" placeholder="Select one" :maxHeight="500"
                        label="text" track-by="value" group-values="formats" group-label="name"
                    />
                </div>
                <div v-if="this.gdalProgram === 'ogr2ogr'">
                    <label>Projection</label>
                    <MultiSelect
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
                    <label>
                        Options
                        <span v-if="dsco" class="right modal-link" @click="$modal.show('createoptions')">+ Open creation options dialog</span>
                        <span v-if="lco" class="right modal-link info-color" @click="$modal.show('layercreateoptions')">+ Open layer creation options dialog</span>
                    </label>
                    <textarea placeholder="eg: -order 1" class="input" v-model="translateOptions" />
                </div>
                <div>
                    <label>Command Preview</label>
                    <p class="preview">{{ preview }}</p>
                </div>
                <div class="center"><button @click="translate()">Convert ⮞</button></div>
            </template>
            <template slot="Output">
                <OutputFiles :files="files" :downloadFile="downloadFile" />
            </template>
        </Tab>
        <ul class="appinfo">
            <li><a href="https://github.com/bugra9/gdal3.js" target="_blank"><img src="github.png" /></a></li>
            <li @click="$modal.show('about')">About</li>
            <li @click="$modal.show('supporteddrivers')">Formats</li>
            <li @click="$modal.show('releasenotes')" :title="projectNews[0].version+' - '+projectNews[0].date">{{ projectNews[0].version }}</li>
        </ul>
        <modal name="about" adaptive scrollable height="auto">
            <div class="right"><button class="close" @click="$modal.hide('about')">✖</button></div>

            <h2>{{ projectInfo.gui.name }} <span> {{ projectNews[0].version }}</span></h2>
            <p v-for="description in projectInfo.gui.descriptions" :key="description" v-html="description" />
            <p v-for="description in projectInfo.cli.descriptions" :key="description" v-html="description" />
            <br />
            <p>
                <a :href="projectInfo.license.url" target="_blank"><b>License:</b> {{ projectInfo.license.name }}</a><br />
                <b>Source Code:</b> <a :href="projectInfo.sourceCodeUrl" target="_blank">{{ projectInfo.sourceCodeUrl }}</a><br />
                <b>Documentation:</b> <a :href="projectInfo.apiReferencesUrl" target="_blank">{{ projectInfo.apiReferencesUrl }}</a><br />
                <b>Test on your browser:</b> <a :href="projectInfo.testUrl" target="_blank">{{ projectInfo.testUrl }}</a><br />
                <b>Test Coverage:</b> <a :href="projectInfo.coverageUrl" target="_blank">{{ projectInfo.coverageUrl }}</a>
            </p>
            <div class="grid-list-2">
                <div>
                    <h4>Compiled with</h4>
                    <ul>
                        <li v-for="dep in projectInfo.nativeDependencies" :key="dep.name">
                            <a :href="dep.url" target="_blank" :title="dep.title || dep.name">{{ dep.name }}</a>
                            <a :href="dep.licenseUrl" target="_blank" class="license"> License</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4>Inspired by</h4>
                    <ul>
                        <li v-for="dep in projectInfo.inspiredBy" :key="dep.name">
                            <a :href="dep.url" target="_blank">{{ dep.name }}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </modal>
        <modal name="releasenotes" adaptive scrollable height="auto" width="1000">
            <div class="right"><button class="close" @click="$modal.hide('releasenotes')">✖</button></div>

            <h2>Release Notes</h2>
            <template v-for="note in projectNews">
                <h3 :key="note.version">{{ note.version }} <span class="right date">{{ note.date }}</span></h3>
                <ul :key="note.date">
                    <li v-for="commit in note.commits" :key="commit.description">
                        {{ commit.description }}
                        <span class="right grid-list desktop">
                            <a class="hash link" :href="`https://github.com/bugra9/gdal3.js/commit/${commit.hash}`" target="_blank">{{ commit.hash.substr(0, 7) }}</a>
                            <a class="user link" :href="`https://github.com/${commit.user}`" target="_blank">@{{ commit.user }}</a>
                        </span>
                    </li>
                </ul>
            </template>
        </modal>
        <modal name="supporteddrivers" adaptive scrollable height="auto" width="1000">
            <div class="right"><button class="close" @click="$modal.hide('supporteddrivers')">✖</button></div>

            <div class="middle-search desktop"><input type="text" v-model="driverSearchText" placeholder="Search" /></div>
            <h4>Supported Raster Drivers</h4>
            <div class="grid-list-auto">
                <a v-for="driver in gdalRasterDriversFiltered" :key="'r-'+driver.longName+driver.shortName" :title="getDriverDesc(driver)">{{ driver.shortName }}</a>
            </div>
            <h4>Supported Vector Drivers</h4>
            <div class="grid-list-auto">
                <a v-for="driver in gdalVectorDriversFiltered" :key="'v-'+driver.longName+driver.shortName" :title="getDriverDesc(driver)">{{ driver.shortName }}</a>
            </div>
        </modal>
        <modal  v-if="dsco" name="createoptions" class="light" adaptive scrollable height="auto">
            <div class="right"><button class="close" @click="$modal.hide('createoptions')">✖</button></div>
            <h4>Database/Dataset Creation Options <a v-if="selectedFormat && selectedFormat.helpUrl" :href="`https://gdal.org/${selectedFormat.helpUrl}`" class="info-color" target="_blank">🛈</a></h4>
            <Form :inputs="dsco" :prefix="drivers[0].type === 'vector' ? '-dsco' : '-co'" :self="this" />
        </modal>
        <modal  v-if="lco" name="layercreateoptions" class="light" adaptive scrollable height="auto">
            <div class="right"><button class="close" @click="$modal.hide('layercreateoptions')">✖</button></div>
            <h4>Layer Creation Options <a v-if="selectedFormat && selectedFormat.helpUrl" :href="`https://gdal.org/${selectedFormat.helpUrl}`" class="info-color" target="_blank">🛈</a></h4>
            <Form :inputs="lco" :self="this" prefix="-lco" />
        </modal>
        <loading :active.sync="isLoading" color="#007BFF" :width="150" :height="150" />
    </div>
</template>

<script>
import Loading from 'vue-loading-overlay';
import Header from './components/Header.vue'
import Tab from './components/Tab.vue'
import TabRadio from './components/TabRadio.vue'
import InputFiles from './components/InputFiles.vue'
import OutputFiles from './components/OutputFiles.vue'
import Form from './components/Form.vue'
import { split } from './utils';
import initGdalJs from '../../../build/package/gdal3';
import crs from './crs.json';
import projectNews from '../../../.news.json';
import projectInfo from '../../../.info.json';
import './App.css';
import 'vue-loading-overlay/dist/vue-loading.css';
import 'vue-multiselect/dist/vue-multiselect.min.css';

let gdal;

export default {
    name: 'App',
    components: {
        Header,
        Loading,
        Tab,
        TabRadio,
        InputFiles,
        OutputFiles,
        Form,
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
            driverSearchText: '',
            projectNews,
            projectInfo
        }
    },
    mounted() {
        initGdalJs({path: 'package'}).then((gdalInstance) => {
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

            if (this.translateOptions !== '') parameters.push(...split(this.translateOptions));

            return parameters;
        },
        preview() {
            return this.gdalProgram + ' ' + this.gdalParams.map(p => p[0] === '-' ? p : `"${p}"`).join(' ');
        },
        selectedFormat() {
            const temp = this.drivers.filter(d => d.shortName === this.translateFormat.value);
            if (temp && temp.length === 1) return temp[0];
            return null;
        },
        dsco() {
            if (this.translateFormat && this.selectedFormat && this.selectedFormat.creationOptionList) {
                const temp = this.selectedFormat.creationOptionList.filter(o => !o.scope || o.scope === 'raster,vector' || o.scope === this.drivers[0].type);
                return temp;
            }
            return null;
        },
        lco() {
            if (this.drivers && this.drivers.length > 0 && this.drivers[0].type === 'vector' && this.translateFormat && this.selectedFormat && this.selectedFormat.layerCreationOptionList) {
                const temp = this.selectedFormat.layerCreationOptionList.filter(o => !o.scope || o.scope === 'raster,vector' || o.scope === this.drivers[0].type);
                return temp;
            }
            return null;
        },
        gdalRasterDriversFiltered() {
            if (!this.driverSearchText || this.driverSearchText.length < 1) return this.gdalRasterDrivers;
            return this.gdalRasterDrivers.filter(d => d.longName.toLowerCase().search(this.driverSearchText.toLowerCase()) !== -1 || d.shortName.toLowerCase().search(this.driverSearchText.toLowerCase()) !== -1);
        },
        gdalVectorDriversFiltered() {
            if (!this.driverSearchText || this.driverSearchText.length < 1) return this.gdalVectorDrivers;
            return this.gdalVectorDrivers.filter(d => d.longName.toLowerCase().search(this.driverSearchText.toLowerCase()) !== -1 || d.shortName.toLowerCase().search(this.driverSearchText.toLowerCase()) !== -1);
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
    padding-left: 5px;
    padding-right: 5px;
}
.preview {
    font-family: monospace;
    line-height: 1.5;
    font-size: 10px;
    border-radius: .25em;
    border: 1px solid #96c8da;
    padding: 10px;
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
    column-gap: 30px;
}
.grid-list-auto {
    display: grid;
    font-size: 13px;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.license {
    font-size: 10px;
    color: #bbdefb;
}

a.hash {
    color: #ffe0b2;
}

a.user {
    color: #c8e6c9;
}

.date {
    font-size: 15px;
}

.grid-list {
    display: flex;
    gap: 15px;
}
</style>
