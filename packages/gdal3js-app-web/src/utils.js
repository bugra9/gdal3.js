import convert from 'xml-js';

export function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

export function split(str) {
    const output = [];
    let isInside = false;
    let temp = '';
    str.split('').forEach(c => {
        if (c === '"') {
        if (isInside) {
            if (temp.length > 0) output.push(temp);
            temp = '';
        }
        isInside = !isInside;
    } else if (c === ' ' && !isInside) {
        if (temp.length > 0) output.push(temp);
        temp = '';
    }
    else temp += c;
    });
    if (temp.length > 0) output.push(temp);

    return output;
}

export function xmlToJs(data) {
    if (data) {
        const tempJs = convert.xml2js(data);
        if (tempJs.elements && tempJs.elements.length > 0) {
            if (tempJs.elements.length !== 1) console.warn('invalid xml!');
            if (tempJs.elements[0] && tempJs.elements[0].elements) {
                return tempJs.elements[0].elements.map((o) => {
                    const temp = o.attributes;
                    if (o.elements && o.elements.length > 0) {
                        temp.options = o.elements.map((o2) => o2.elements[0].text);
                    }
                    return temp;
                });
            }
        }
    }
    return null;
}

export function getFileExtension(driver) {
    if (!driver) return 'tif';

    const extensions = driver.getExtensions();
    let extension = driver.getExtension();
    if (extension === '' && extensions !== '') {
        extension = extensions.split(' ')[0];
    }
    if (extension !== '') {
        extension = extension.replace('.', '').replace('/', '');
    }

    return extension;
}
