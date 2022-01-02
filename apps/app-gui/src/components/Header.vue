<template>
    <header>
        <ul class="apps">
            <li class="selected"><a :href="projectInfo.homepage">{{ projectInfo.cli.name }}</a></li>
            <li><a href="docs">Documentation</a></li>
            <li><a href="test">Test</a></li>
            <li class="desktop" style="text-align: right; flex: 1;cursor: auto;" v-html="projectInfo.description" />
        </ul>
    </header>
</template>

<script>
import projectInfo from '../../../../.info.json';

export default {
    name: 'ComponentHeader',
    data() {
        return {
            projectInfo,
        };
    }
}
</script>

<style scoped>
    header {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
    }
</style>
