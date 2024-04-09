export function get<T = any>(obj: any, path: string): T | undefined {
    function _get(o: any, pp: string[]): T | undefined {
        const [p, ...tail] = pp
        if (tail.length) {
            return _get(o[p], tail)
        }
        return o[p]
    }

    return _get(obj, path.split('.'))
}
