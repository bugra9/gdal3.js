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
