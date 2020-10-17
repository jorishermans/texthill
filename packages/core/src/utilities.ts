export function intersect<T>(s1: Set<T>, s2: Set<T>) {
   return new Set([...s1].filter(x => s2.has(x)))
}