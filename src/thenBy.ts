function identity<T>(v: T): T {
  return v
}

function ignoreCase<T>(v: T): T {
  return typeof v === 'string' ? (v.toLowerCase() as T) : v
}

function simpleComparator<T>(v1: T, v2: T) {
  return v1 < v2 ? -1 : v1 > v2 ? 1 : 0
}

type SortOrder = 'asc' | 'desc' | -1 | 1
export interface Opt {
  direction?: SortOrder
  ignoreCase?: boolean
}

export interface TypedOpt<T> extends Opt {
  cmp?: (a: T, b: T) => number
}

export interface Comparator<T> {
  (v1: T, v2: T): number
}
export interface Extractor<T, U> {
  (v: T): U
}
export type KeyName<T> = keyof T
export type SortParam<T, U = unknown> = Comparator<T> | Extractor<T, U> | KeyName<T>

export interface IThenBy<T> {
  (v1: T, v2: T): number
  /**
   * Full format to compare two elements and determine which sorts first.
   * @param compare function that receives two values from the sorted array and returns a number indicating which comes first: < 0: first comes first, 0: doesn't matter, > 0: second comes first.
   * @param direction can be used to reverse the sorting by passing -1
   **/
  thenBy(compare: (v1: T, v2: T) => number, direction?: SortOrder | Opt): IThenBy<T>
  /**
   * Shorthand for selecting a value to sort on from the sorted element.
   * @param select function that receives a value from the sorted array and selects the thing to sort on
   * @param direction reverse by passing -1. opt for other options
   **/
  thenBy<U>(select: (v: T) => U, direction?: SortOrder | TypedOpt<U>): IThenBy<T>
  /**
   * Shorthand for sorting on a simple property.
   * @param byPropertyName is the name of the property to sort on as a string
   * @param direction reverse by passing -1. opt for other options
   **/
  thenBy<O extends keyof T>(byPropertyName: O, direction?: SortOrder | TypedOpt<T[O]>): IThenBy<T>
}

function isKeyName<T>(compareFunction: SortParam<T>): compareFunction is KeyName<T> {
  return typeof compareFunction !== 'function'
}
function isExtractor<T, U>(compareFunction: SortParam<T, U>): compareFunction is Extractor<T, U> {
  return typeof compareFunction === 'function' && compareFunction.length === 1
}

function makeCompareFunction<T, U extends keyof T>(
  param: SortParam<T, U>,
  opt?: SortOrder | TypedOpt<U>
) {
  opt = typeof opt === 'object' ? opt : { direction: opt }

  if (isKeyName(param)) {
    const key = param
    param = <Extractor<T, U>>function (v1: T) {
      return v1[key] ?? ''
    }
  }
  if (isExtractor(param)) {
    const extractor = param
    const preprocess = (opt.ignoreCase ?? false) ? ignoreCase : identity
    const cmp = opt.cmp ?? simpleComparator
    param = function (v1, v2) {
      return cmp(preprocess(extractor(v1)), preprocess(extractor(v2)))
    }
  }
  const comparator = param
  if (opt.direction != null && (opt.direction === -1 || opt.direction === 'desc'))
    return function (v1: T, v2: T) {
      return -comparator(v1, v2)
    }
  return comparator
}

function createComparator<T, U extends keyof T>(
  param: SortParam<T, U>,
  opt?: SortOrder | TypedOpt<U>,
  previous?: Comparator<T>
): IThenBy<T> {
  const thenComparator = makeCompareFunction(param, opt)

  const comparator: Comparator<T> = (a, b) => {
    let result = previous?.(a, b) ?? 0
    if (result === 0) {
      result = thenComparator(a, b)
    }
    return result
  }

  ;(comparator as IThenBy<T>).thenBy = function <U extends keyof T>(
    param: SortParam<T, U>,
    opt?: SortOrder | TypedOpt<U>
  ) {
    return createComparator(param, opt, comparator)
  }

  return comparator as IThenBy<T>
}

/**
 * Full format to compare two elements and determine which sorts first.
 * @param compare function that receives two values from the sorted array and returns a number indicating which comes first: < 0: first comes first, 0: doesn't matter, > 0: second comes first.
 * @param direction can be used to reverse the sorting by passing -1
 **/
export function firstBy<T>(compare: Comparator<T>, direction?: SortOrder | Opt): IThenBy<T>
/**
 * Shorthand for selecting a value to sort on from the sorted element.
 * @param select function that receives a value from the sorted array and selects the thing to sort on
 * @param direction reverse by passing -1. opt for other options
 **/
export function firstBy<T, U>(
  select: Extractor<T, U>,
  direction?: SortOrder | TypedOpt<U>
): IThenBy<T>
/**
 * Shorthand for sorting on a simple property.
 * @param byPropertyName is the name of the property to sort on as a string
 * @param direction reverse by passing -1. opt for other options
 **/
export function firstBy<T, N extends keyof T = keyof T, U = T[N]>(
  byPropertyName: N,
  direction?: SortOrder | TypedOpt<U>
): IThenBy<T>

export function firstBy<T, U extends keyof T>(
  param: SortParam<T, U>,
  opt?: SortOrder | TypedOpt<U>
): IThenBy<T> {
  return createComparator(param, opt)
}
