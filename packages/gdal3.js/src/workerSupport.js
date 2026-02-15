import { getSystemError } from './allJsFunctions/helper/error';

function onModuleReady(Gdal) {
    if (this.data && this.data.func && Gdal[this.data.func]) {
        Gdal[this.data.func](...this.data.params).then((result) => {
            postMessage({ success: true, id: this.data.id, data: result });
        }).catch((error) => {
            postMessage({ success: false, id: this.data.id, data: { message: error.message } });
        });
    } else {
        console.error('undefined function', this.data);
    }
}

function onError(err) {
    postMessage({ success: false, id: this.id, data: getSystemError(err.message) });
}

export default function workerInsideSupport(initGdalJs) {
    let moduleReady;
    onmessage = function onmessage(event) {
        if (event.data && event.data.func === 'constructor') {
            let config = { useWorker: false };
            if (event.data.params && event.data.params.config) {
                config = { ...event.data.params.config, ...config };
            }
            moduleReady = initGdalJs(config);
            moduleReady.then(({ drivers }) => postMessage({ success: true, id: 'onload', data: drivers })).catch((e) => postMessage({ success: false, id: 'onload', data: e }));
            return null;
        }

        return moduleReady
            .then(onModuleReady.bind(event))
            .catch(onError.bind(event));
    };
}

const variables = {
    gdalWorkerWrapper: null,
    drivers: null,
};
class WorkerWrapper {
    constructor(file, config, onload) {
        this.promises = { onload: { resolve: onload, reject: console.error } };
        this.gdalWorker = new Worker(file);
        this.gdalWorker.onmessage = (evt) => {
            if (evt.data && evt.data.id && this.promises[evt.data.id]) {
                if (evt.data.success) this.promises[evt.data.id].resolve(evt.data.data);
                else this.promises[evt.data.id].reject(evt.data.data);
            }
        };
        this.gdalWorker.postMessage({ func: 'constructor', params: { config } });
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

const gdalProxy = new Proxy({}, {
    get(target, name) {
        if (name === 'then' || name === 'catch') return target;
        if (name === 'drivers') return variables.drivers;
        return (...args) => new Promise((resolve, reject) => {
            variables.gdalWorkerWrapper.call({ func: name, params: args })
                .then((data) => { resolve(data); }).catch((e) => reject(e));
        });
    },
});

export const workerOutsideSupport = {
    variables,
    WorkerWrapper,
    gdalProxy,
};
