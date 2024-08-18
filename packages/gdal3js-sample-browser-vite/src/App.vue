<script setup>
import { ref } from 'vue'
import dataUrl from 'gdal3.js/data.txt?url'
import wasmUrl from 'gdal3.js/wasm?url'
import initGdalJs from 'gdal3.js';

const paths = {
  wasm: wasmUrl,
  data: dataUrl,
};

const count = ref(0);
initGdalJs({paths}).then(({ Gdal, toArray }) => {
    Gdal.allRegister();
    const drivers = toArray(Gdal.getDrivers());
    count.value = drivers.length;
});
</script>

<template>
  <p>Number of drivers: {{ count }}</p>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
