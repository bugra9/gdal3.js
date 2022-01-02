<template>
    <div>
        <div class="card input">
            <input class="input-file" type="file" name="files[]" id="file" @change="fileChange" multiple :webkitdirectory="isFolder" :directory="isFolder" />
            <p class="title"><span class="bbb">Browse</span> or Drag {{ isFolder ? 'folders': 'files' }} here</p>
        </div>
        <div v-for="dataset in datasets" :key="dataset.path" :class="['card', 'tab', { opened: value === dataset.pointer }]">
            <div class="header tab-label" @click="value = dataset.pointer === value ? -1 : dataset.pointer">
                <div style="width: 50px;"></div>
                <div style="flex: 1;">
                    <p class="title">{{dataset.path}}</p>
                    <p class="desc">{{datasetsInfo[dataset.pointer].driverName}}</p>
                </div>
                <div @click="deleteDataset(dataset)" class="fileAction"><v-icon style="color: red;" name="trash"/></div>
            </div>
            <div class="tab-content">
                <pre v-html="getCode(dataset)" />
            </div>
        </div>
    </div>
</template>

<script>
import { syntaxHighlight } from '../utils';
import 'vue-awesome/icons/trash';

export default {
    name: 'ComponentInputFiles',
    props: {
        datasets: Array,
        datasetsInfo: Object,
        deleteDataset: Function,
        onFileChange: Function,
        isFolder: Boolean,
    },
    data() {
        return {
            value: -1,
        }
    },
    methods: {
        getCode(dataset) {
            const info = this.datasetsInfo ? this.datasetsInfo[dataset.pointer] : {};
            return syntaxHighlight(JSON.stringify(info, null, 2));
        },
        fileChange({ target }) {
            this.onFileChange(target.files);
        },
    },
}
</script>

<style>
pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; white-space: pre-wrap; }
.string { color: green; }
.number { color: darkorange; }
.boolean { color: blue; }
.null { color: magenta; }
.key { color: red; }
</style>

<style scoped>
.card {
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 24px -1px rgba(0,0,0,0.05);
    padding: 0;
}

.card.input {
    border: 2px dashed #d5d9e0;
    background-color: rgba(120, 155, 236, 0.06);
    color: #99a0b2;
    font-weight: bold;
    align-items: center;
    padding: 20px;
}

.input-file {
    position: absolute;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    outline: none;
    opacity: 0;
    cursor: pointer;
}

.card > .header {
    display: flex;
}

.card > .header > img {
    margin-right: 20px;
}

.card > .header p {
    margin: 0;
}

.card > .header .title {
    font-weight: bold;
    color: #74809d;
    font-size: 15px;
}

.card > .header .desc {
    font-size: 12px;
    color:#979fb8;
    margin-top: 3px;
}

.bbb {
  color: #789bec;
}

.tab .header {
    position: relative;
}
.tab {
    color: white;
    overflow: hidden;
}
.tab-label {
    padding: 1em;
    background: white
}
.tab-label:hover {
    background: #eee;
}
.tab-label::after {
    content: "\276F";
    position: absolute;
    right: 0;
    width: 1em;
    height: 1em;
    text-align: center;
    -webkit-transition: all .35s;
    transition: all .35s;
    left: 25px;
    top: 23px;
    cursor: pointer;
    color: #1a252f;
}
.tab-content {
    max-height: 0;
    padding: 0;
    color: #2c3e50;
    background: white;
    -webkit-transition: all .35s;
    transition: all .35s;
    overflow: hidden;
}
.tab-close {
    display: -webkit-box;
    display: flex;
    -webkit-box-pack: end;
            justify-content: flex-end;
    padding: 1em;
    font-size: 0.75em;
    background: #2c3e50;
    cursor: pointer;
}
.tab-close:hover {
    background: #1a252f;
}

.opened .tab-label {
    background: #eee;
}
.opened .tab-label::after {
    -webkit-transform: rotate(90deg);
            transform: rotate(90deg);
}
.opened .tab-content {
    max-height: 100vh;
}
.fileAction {
    display: flex;
    align-items: center;
    cursor: pointer;
}
.fileAction > * {
    height: 30px;
    width: 30px;
}
</style>
