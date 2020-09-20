<template>
    <header>
        <ul class="apps">
            <li class="selected"><a href="https://github.com/trylab-net/gdalweb" title="Convert raster and vector geospatial data to various formats and coordinate systems.">GdalWeb</a></li>
            <li style="text-align: right; flex: 1;cursor: auto;">Convert raster and vector geospatial data to various formats and coordinate systems.</li>
        </ul>
    </header>
</template>

<script>
export default {
    name: 'Header',
}
</script>

<style scoped>
    header {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
    }
    a {
        color: inherit;
        text-decoration: none;
    }
</style>
