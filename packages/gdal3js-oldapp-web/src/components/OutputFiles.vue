<template>
    <div>
        <div v-for="file in files" :key="file.path" class="card pointer" @click="downloadFile(file.path)">
            <div class="header tab-label">
                <div style="width: 50px;"></div>
                <div style="flex: 1;">
                    <p class="title">{{ getFileTitle(file.path) }}</p>
                    <p class="desc">{{ getFileSize(file.size) }}</p>
                </div>
                <div class="fileAction"><v-icon style="color: black;" name="download"/></div>
            </div>
        </div>
    </div>
</template>

<script>
import 'vue-awesome/icons/download';

export default {
    name: 'ComponentOutputFiles',
    props: {
        files: Array,
        downloadFile: Function,
    },
    methods: {
        getFileTitle(file) {
            return file.substring(8, file.length);
        },
        getFileSize(size) {
            if (size > 1073741824) { // 1024 * 1024 * 1024
                return this.ceil(size / 1073741824) + ' GB';
            } else if (size > 1048576) { // 1024 * 1024
                return this.ceil(size / 1048576) + ' MB';
            } else if (size > 1024) {
                return this.ceil(size / 1024) + ' KB';
            } else return size + ' B';
        },
        ceil(num) {
            return Math.ceil(num*10) / 10;
        }
    },
}
</script>

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
