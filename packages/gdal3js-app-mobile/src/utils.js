export function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
    );
}

export function split(str) {
    const output = [];
    let isInside = false;
    let temp = '';
    str.split('').forEach(c => {
        if (c === '"') {
            if (isInside) {
                if (temp.length > 0) {
                    output.push(temp);
                }
                temp = '';
            }
            isInside = !isInside;
        } else if (c === ' ' && !isInside) {
            if (temp.length > 0) {
                output.push(temp);
            }
            temp = '';
        } else {
            temp += c;
        }
    });
    if (temp.length > 0) {
        output.push(temp);
    }

    return output;
}

/* export function xmlToJs(data) {
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
} */

export function getFileExtension(driver) {
    if (!driver) {
        return 'tif';
    }

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
