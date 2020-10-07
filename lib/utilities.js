export function intersect(s1, s2) {
    return new Set([...s1].filter(x => s2.has(x)));
}
