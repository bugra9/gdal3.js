import fs from "node:fs";

fs.cpSync('packages/gdal3js-app-web/dist/', 'dist/', { recursive: true });
fs.cpSync('packages/gdal3.js/test', 'dist/test', { recursive: true });
fs.cpSync('docs', 'dist/docs', { recursive: true });
