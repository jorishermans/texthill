export function inspectText(obj: any, ignoreProps: string[] = []) : string {
    // transform object to string
    if ((typeof obj == 'string' || obj instanceof String)) {
        return `${obj}`;
    }
    const keys: string[] = Object.keys(obj);
    let text = [];
    for (let k of keys) {
        if ((typeof obj[k] == 'string' || obj[k] instanceof String) && ignoreProps.indexOf(k) === -1) {
            text.push(obj[k]);
        }
        if (typeof obj[k] === 'object' && obj[k] !== null && !(obj[k] instanceof Date)) {
            const deepText = inspectText(obj[k], ignoreProps);
            text.push(deepText);
        }
    }
    return `${text.join(' ')}`;
}