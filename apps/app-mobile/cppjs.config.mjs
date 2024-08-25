import getDirName from 'cpp.js/src/utils/getDirName.js';
import Gdal3JS from 'gdal3.js/cppjs.config.mjs';
// import Sqlite3 from 'cppjs-package-sqlite3/cppjs.config.js';

export default {
    dependencies: [
        Gdal3JS,
        // Sqlite3,
    ],
	paths: {
        project: getDirName(import.meta.url),
	}
}
