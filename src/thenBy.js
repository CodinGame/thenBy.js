function identity(v) {
    return v;
}
function ignoreCase(v) {
    return typeof v === 'string' ? v.toLowerCase() : v;
}
function simpleComparator(v1, v2) {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}
function isKeyName(compareFunction) {
    return typeof compareFunction !== 'function';
}
function isExtractor(compareFunction) {
    return typeof compareFunction === 'function' && compareFunction.length === 1;
}
function makeCompareFunction(param, opt) {
    opt = typeof opt === 'object' ? opt : { direction: opt };
    if (isKeyName(param)) {
        const key = param;
        param = function (v1) {
            return v1[key] ?? '';
        };
    }
    if (isExtractor(param)) {
        const extractor = param;
        const preprocess = (opt.ignoreCase ?? false) ? ignoreCase : identity;
        const cmp = opt.cmp ?? simpleComparator;
        param = function (v1, v2) {
            return cmp(preprocess(extractor(v1)), preprocess(extractor(v2)));
        };
    }
    const comparator = param;
    if (opt.direction != null && (opt.direction === -1 || opt.direction === 'desc'))
        return function (v1, v2) {
            return -comparator(v1, v2);
        };
    return comparator;
}
function createComparator(param, opt, previous) {
    const thenComparator = makeCompareFunction(param, opt);
    const comparator = (a, b) => {
        let result = previous?.(a, b) ?? 0;
        if (result === 0) {
            result = thenComparator(a, b);
        }
        return result;
    };
    comparator.thenBy = function (param, opt) {
        return createComparator(param, opt, comparator);
    };
    return comparator;
}
export function firstBy(param, opt) {
    return createComparator(param, opt);
}
