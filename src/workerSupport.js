import { getSystemError } from './allJsFunctions/helper/error';

function onModuleReady(Gdal) {
    if (this.data && this.data.func && Gdal[this.data.func]) {
        Gdal[this.data.func](...this.data.params).then((result) => {
            postMessage({ success: true, id: this.data.id, data: result });
        }).catch((error) => {
            postMessage({ success: false, id: this.data.id, data: error });
        });
    } else {
        console.error('undefined function', this.data);
    }
}

function onError(err) {
    postMessage({ success: false, id: this.id, data: getSystemError(err.message) });
}

export default function workerSupport(Gdal3) {
    const moduleReady = Gdal3();
    moduleReady.then(({ drivers }) => postMessage({ success: true, id: 'onload', data: drivers })).catch((e) => postMessage({ success: false, id: 'onload', data: e }));
    onmessage = function onmessage(event) {
        return moduleReady
            .then(onModuleReady.bind(event))
            .catch(onError.bind(event));
    };
}
