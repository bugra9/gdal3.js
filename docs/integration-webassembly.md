# Integration - WebAssembly

## Script (CDN) 
```html
<script type="text/javascript"
    src="https://cdn.jsdelivr.net/npm/gdal3.js@3.0.0-beta.1/dist/gdal3js.browser.js"
    integrity="sha384-PfNA9w/SrHFWvTnW83HsR8YEdDSjyXzS0O228IO6XeaQLE/CO2xeCBe2h+/GQ43b"
    crossorigin="anonymous"
></script>
```

```js
initCppJs({ path: 'https://cdn.jsdelivr.net/npm/gdal3.js@3.0.0-beta.1/dist' }).then(({ Gdal }) => {});
```
> Example: [https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser](https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser)

## ES Module
```html
<script type="module">
    import 'gdal3js.browser.js'

    initCppJs().then(({ Gdal }) => {});
</script>
```
> Example: [https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser-module](https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser-module)

## Bundler such as Webpack (Vue, React, Angular, ...)
```bash
pnpm add gdal3.js
```

```js
import initCppJs from 'gdal3.js';

initCppJs({ path: 'dist' }).then(({ Gdal }) => {});
```

```js
plugins: [
    new CopyWebpackPlugin({
        patterns: [
            { from: require.resolve('gdal3.js/dist/gdal3js.wasm'), to: 'dist' },
            { from: require.resolve('gdal3.js/dist/gdal3js.data.txt'), to: 'dist' }
        ]
    })
]
```
> Full working example: [https://github.com/bugra9/gdal3.js/blob/master/packages/gdal3js-app-web/src/App.vue](https://github.com/bugra9/gdal3.js/blob/master/packages/gdal3js-app-web/src/App.vue)

## Vite + Vue3
```bash
pnpm add gdal3.js
```

```html
<script setup>
import { ref } from 'vue'
import dataUrl from 'gdal3.js/dist/gdal3js.data.txt?url'
import wasmUrl from 'gdal3.js/dist/gdal3js.wasm?url'
import 'gdal3.js';

const paths = {
  wasm: wasmUrl,
  data: dataUrl,
};

const count = ref(0);
initCppJs({paths}).then(({ Gdal, toArray }) => {
    Gdal.allRegister();
    const drivers = toArray(Gdal.getDrivers());
    count.value = drivers.length;
});
</script>

<template>
  <div>Number of drivers: {{ count }}</div>
</template>
```

> Example: [https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser-vite](https://github.com/bugra9/gdal3.js/tree/master/packages/gdal3js-sample-browser-vite)

## Node
```bash
pnpm add gdal3.js
```

```js
const initCppJs = require('gdal3.js/node.js');

initCppJs().then(({ Gdal }) => {});
```
> Example: [https://github.com/bugra9/gdal3.js/blob/master/packages/gdal3js-sample-nodejs/index.js](https://github.com/bugra9/gdal3.js/blob/master/packages/gdal3js-sample-nodejs/index.js)
