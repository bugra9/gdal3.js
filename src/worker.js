let gdalWorkerWrapper;

class WorkerWrapper {
    constructor(file, onload) {
        this.promises = { onload: { resolve: onload, reject: console.error } };
        this.gdalWorker = new Worker(file);
        this.gdalWorker.onmessage = (evt) => {
            if (evt.data && evt.data.id && this.promises[evt.data.id]) {
                if (evt.data.success) this.promises[evt.data.id].resolve(evt.data.data);
                else this.promises[evt.data.id].reject(evt.data.data);
            }
        };
    }

    call(i) {
        return new Promise((resolve, reject) => {
            i.id = Math.floor(Math.random() * 100000);
            this.promises[i.id] = { resolve, reject };
            this.gdalWorker.postMessage(i);
        });
    }

    terminate() {
        this.gdalWorker.terminate();
        delete this.gdalWorker;
        delete this.promises;
    }
}

let drivers;
const gdalProxy = new Proxy({}, {
    get(target, name) {
        if (name === 'then' || name === 'catch') return target;
        if (name === 'drivers') return drivers;
        return (...args) => new Promise((resolve, reject) => {
            gdalWorkerWrapper.call({ func: name, params: args })
                .then((data) => { resolve(data); }).catch((e) => reject(e));
        });
    },
});

export default function Gdal3(config = {}) {
    return new Promise((resolve) => {
        gdalWorkerWrapper = new WorkerWrapper(`${config.path || ''}/gdal3.js`, (d) => {
            drivers = d;
            resolve(gdalProxy);
        });
    });
}

if (typeof window !== 'undefined') {
    window.Gdal3 = Gdal3;
}
