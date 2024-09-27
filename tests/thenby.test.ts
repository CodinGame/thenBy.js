import { test, expect, describe } from '@jest/globals'
import { firstBy } from '../src/thenBy.js'

interface CityData {
  id: number
  name: string
  population: number
  country: string
}

describe('Sorting with functions', function () {
  const cityData: CityData[] = [
    { id: 7, name: 'Amsterdam', population: 750000, country: 'Netherlands' },
    { id: 12, name: 'The Hague', population: 450000, country: 'Netherlands' },
    { id: 43, name: 'Rotterdam', population: 600000, country: 'Netherlands' },
    { id: 5, name: 'Berlin', population: 3000000, country: 'Germany' },
    { id: 42, name: 'Düsseldorf', population: 550000, country: 'Germany' },
    { id: 44, name: 'Stuttgard', population: 600000, country: 'Germany' }
  ]

  test('Sort by Country, then by Population', function (done) {
    const s = firstBy<CityData>(function (v1, v2) {
      return v1.country < v2.country ? -1 : v1.country > v2.country ? 1 : 0
    }).thenBy(function (v1, v2) {
      return v1.population - v2.population
    })
    cityData.sort(s)
    expect(cityData[5]!.name).toEqual('Amsterdam')
    expect(cityData[0]!.name).toEqual('Düsseldorf')
    done()
  })
  test('Sort by Country, then by Population, using unary functions', function (done) {
    const s = firstBy((v: CityData) => {
      return v.country
    }).thenBy(function (v) {
      return v.population
    })
    cityData.sort(s)
    expect(cityData[5]!.name).toEqual('Amsterdam')
    expect(cityData[0]!.name).toEqual('Düsseldorf')
    done()
  })
  test('Sort by length of name, then by population, then by ID', function (done) {
    const s = firstBy<CityData>(function (v1, v2) {
      return v1.name.length - v2.name.length
    })
      .thenBy(function (v1, v2) {
        return v1.population - v2.population
      })
      .thenBy(function (v1, v2) {
        return v1.id - v2.id
      })
    cityData.sort(s)
    // shortest name
    expect(cityData[0]!.name).toEqual('Berlin')
    // longest name
    expect(cityData[5]!.name).toEqual('Düsseldorf')

    // expect Stutgard just after Rotterdam, same name length, same population, higher ID
    expect(cityData[2]!.name).toEqual('Rotterdam')
    expect(cityData[3]!.name).toEqual('Stuttgard')
    done()
  })
  test('Sort by length of name, then by population, then by ID, using unary functions', function (done) {
    const s = firstBy<CityData>(function (v) {
      return v.name.length
    })
      .thenBy(function (v) {
        return v.population
      })
      .thenBy(function (v) {
        return v.id
      })
    cityData.sort(s)
    // shortest name
    expect(cityData[0]!.name).toEqual('Berlin')
    // longest name
    expect(cityData[5]!.name).toEqual('Düsseldorf')

    // expect Stutgard just after Rotterdam, same name length, same population, higher ID
    expect(cityData[2]!.name).toEqual('Rotterdam')
    expect(cityData[3]!.name).toEqual('Stuttgard')
    done()
  })
})
describe('Sorting while managing case sensitivity', function () {
  const cityData: CityData[] = [
    { id: 2, name: 'Ostrava', population: 750000, country: 'czech republic' },
    { id: 4, name: 'karvina', population: 450000, country: 'Czech Republic' },
    { id: 6, name: 'Brno', population: 600000, country: 'czech Republic' },
    { id: 8, name: 'prague', population: 3000000, country: 'Czech republic' }
  ]

  test('Sort by Name, using unary function', function (done) {
    const s = firstBy(function (v: CityData) {
      return v.name
    })
    cityData.sort(s)
    expect(cityData[0]!.name).toEqual('Brno')
    expect(cityData[1]!.name).toEqual('Ostrava')
    expect(cityData[2]!.name).toEqual('karvina')
    expect(cityData[3]!.name).toEqual('prague')
    done()
  })
  test('Sort by Name, ignoring the case, using unary function', function (done) {
    const s = firstBy(
      function (v: CityData) {
        return v.name
      },
      { ignoreCase: true, direction: 1 }
    )
    cityData.sort(s)
    expect(cityData[0]!.name).toEqual('Brno')
    expect(cityData[1]!.name).toEqual('karvina')
    expect(cityData[2]!.name).toEqual('Ostrava')
    expect(cityData[3]!.name).toEqual('prague')
    done()
  })
  test('Sort by Name desc, ignoring the case, using unary function', function (done) {
    const s = firstBy(
      function (v: CityData) {
        return v.name
      },
      { ignoreCase: true, direction: 'desc' }
    )
    cityData.sort(s)
    expect(cityData[3]!.name).toEqual('Brno')
    expect(cityData[2]!.name).toEqual('karvina')
    expect(cityData[1]!.name).toEqual('Ostrava')
    expect(cityData[0]!.name).toEqual('prague')
    done()
  })
  test('Sort by Country, then by Name ignoring the case, using property name', function (done) {
    const s = firstBy<CityData>('country').thenBy('name', { ignoreCase: true, direction: 1 })
    cityData.sort(s)
    expect(cityData[0]!.name).toEqual('karvina')
    expect(cityData[1]!.name).toEqual('prague')
    expect(cityData[2]!.name).toEqual('Brno')
    expect(cityData[3]!.name).toEqual('Ostrava')
    done()
  })
  test('Sort by Country ignoring the case using inline .toLowerCase(), then by Name, using function', function (done) {
    const s = firstBy<CityData>(function (v1, v2) {
      const v1Country = v1.country.toLowerCase()
      const v2Country = v2.country.toLowerCase()
      return v1Country < v2Country ? -1 : v1Country > v2Country ? 1 : 0
    }).thenBy('name')
    cityData.sort(s)
    expect(cityData[0]!.name).toEqual('Brno')
    expect(cityData[1]!.name).toEqual('Ostrava')
    expect(cityData[2]!.name).toEqual('karvina')
    expect(cityData[3]!.name).toEqual('prague')
    done()
  })
  test('Sort by Country ignoring the case, then by Name ignoring the case, using unary function', function (done) {
    const s = firstBy(
      function (v: CityData) {
        return v.country
      },
      { ignoreCase: true, direction: 1 }
    ).thenBy(
      function (v) {
        return v.name
      },
      { ignoreCase: true, direction: 1 }
    )
    cityData.sort(s)
    expect(cityData[0]!.name).toEqual('Brno')
    expect(cityData[1]!.name).toEqual('karvina')
    expect(cityData[2]!.name).toEqual('Ostrava')
    expect(cityData[3]!.name).toEqual('prague')
    done()
  })
})
describe('Sorting with property names', function () {
  const cityData: CityData[] = [
    { id: 7, name: 'Amsterdam', population: 750000, country: 'Netherlands' },
    { id: 12, name: 'The Hague', population: 450000, country: 'Netherlands' },
    { id: 43, name: 'Rotterdam', population: 600000, country: 'Netherlands' },
    { id: 5, name: 'Berlin', population: 3000000, country: 'Germany' },
    { id: 42, name: 'Düsseldorf', population: 550000, country: 'Germany' },
    { id: 44, name: 'Stuttgard', population: 600000, country: 'Germany' }
  ]

  test('Sort by Country, then by Population', function (done) {
    const s = firstBy<CityData>('country').thenBy('population')
    cityData.sort(s)
    expect(cityData[5]!.name).toEqual('Amsterdam')
    expect(cityData[0]!.name).toEqual('Düsseldorf')
    done()
  })
  test('Sort by Country desc, then by Population', function (done) {
    const s = firstBy<CityData>('country', 'desc').thenBy('population')
    cityData.sort(s)
    expect(cityData[5]!.name).toEqual('Berlin')
    expect(cityData[0]!.name).toEqual('The Hague')
    done()
  })
  test('Sort by Country asc, then by Population desc', function (done) {
    const s = firstBy<CityData>('country', 'asc').thenBy('population', 'desc')
    cityData.sort(s)
    expect(cityData[5]!.name).toEqual('The Hague')
    expect(cityData[0]!.name).toEqual('Berlin')
    done()
  })
  test('Sort by Country, then by Population desc (using -1)', function (done) {
    const s = firstBy<CityData>('country').thenBy('population', -1)
    cityData.sort(s)
    expect(cityData[5]!.name).toEqual('The Hague')
    expect(cityData[0]!.name).toEqual('Berlin')
    done()
  })
})
describe('Sorting with functions and property names together', function () {
  const cityData = [
    { id: 7, name: 'Amsterdam', population: 750000, country: 'Netherlands' },
    { id: 12, name: 'The Hague', population: 450000, country: 'Netherlands' },
    { id: 43, name: 'Rotterdam', population: 600000, country: 'Netherlands' },
    { id: 5, name: 'Berlin', population: 3000000, country: 'Germany' },
    { id: 42, name: 'Düsseldorf', population: 550000, country: 'Germany' },
    { id: 44, name: 'Stuttgard', population: 600000, country: 'Germany' }
  ]

  test('Sort by name length, then by Population', function (done) {
    const s = firstBy<CityData>(function (v1, v2) {
      return v1.name.length - v2.name.length
    }).thenBy('population')
    cityData.sort(s)
    expect(cityData[0]!.name).toEqual('Berlin')
    expect(cityData[5]!.name).toEqual('Düsseldorf')
    done()
  })
  test('Sort by name length using a unary function, then by Population', function (done) {
    const s = firstBy<CityData>(function (v) {
      return v.name.length
    }).thenBy('population')
    cityData.sort(s)
    expect(cityData[0]!.name).toEqual('Berlin')
    expect(cityData[5]!.name).toEqual('Düsseldorf')
    done()
  })
  test('Sort by name length desc, then by Population', function (done) {
    const s = firstBy<CityData>(function (v1, v2) {
      return v1.name.length - v2.name.length
    }, 'desc').thenBy('population')
    cityData.sort(s)
    expect(cityData[4]!.name).toEqual('Amsterdam')
    expect(cityData[1]!.name).toEqual('The Hague')
    done()
  })
  test('Sort by name length desc using a unary function, then by Population', function (done) {
    const s = firstBy<CityData>(function (v) {
      return v.name.length
    }, -1).thenBy('population')
    cityData.sort(s)
    expect(cityData[4]!.name).toEqual('Amsterdam')
    expect(cityData[1]!.name).toEqual('The Hague')
    done()
  })
  test('Sort by name length, then by Population desc', function (done) {
    const s = firstBy<CityData>(function (v1, v2) {
      return v1.name.length - v2.name.length
    }).thenBy('population', -1)
    cityData.sort(s)
    expect(cityData[1]!.name).toEqual('Amsterdam')
    expect(cityData[4]!.name).toEqual('The Hague')
    done()
  })
  test('Sort by name length using a unary function, then by Population desc', function (done) {
    const s = firstBy<CityData>(function (v) {
      return v.name.length
    }).thenBy('population', -1)
    cityData.sort(s)
    expect(cityData[1]!.name).toEqual('Amsterdam')
    expect(cityData[4]!.name).toEqual('The Hague')
    done()
  })
})
describe('Sorting with property names and undefined properties', function () {
  const cityData: CityData[] = [
    { id: 7, name: 'Amsterdam', population: 750000, country: 'Netherlands' },
    { id: 12, name: 'The Hague', population: 450000, country: 'Netherlands' },
    { id: 43, name: 'Rotterdam', population: 600000 } as CityData, // Missing country: Netherlands
    { id: 5, name: 'Berlin', population: 3000000, country: 'Germany' },
    { id: 42, name: 'Düsseldorf', country: 'Germany' } as CityData, // Missing population: 550000
    { id: 44, population: 600000, country: 'Germany' } as CityData // Missing name: Stuttgard
  ]

  test('Sort by Country, then by Population, missing country comes first', function (done) {
    const s = firstBy<CityData>('country').thenBy('population')
    cityData.sort(s)
    expect(cityData[5]!.name).toEqual('Amsterdam')
    expect(cityData[0]!.name).toEqual('Rotterdam')
    done()
  })
  test('Sort by Country desc, then by Population, missing country comes last', function (done) {
    const s = firstBy<CityData>('country', -1).thenBy('population')
    cityData.sort(s)
    expect(cityData[5]!.name).toEqual('Rotterdam')
    expect(cityData[0]!.name).toEqual('The Hague')
    done()
  })
  test('Sort by Country, then by Population desc', function (done) {
    const s = firstBy<CityData>('country').thenBy('population', 'desc')
    cityData.sort(s)
    expect(cityData[5]!.name).toEqual('The Hague')
    expect(cityData[0]!.name).toEqual('Rotterdam')
    done()
  })
})
describe('Sorting with unary function and custom compare', function () {
  const suits = ['C', 'D', 'H', 'S']
  const cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  const suitCompare = (s1: string, s2: string) => {
    return suits.indexOf(s1) - suits.indexOf(s2)
  }
  const cardCompare = (c1: string, c2: string) => {
    return cards.indexOf(c1) - cards.indexOf(c2)
  }
  interface Card {
    id: number
    suit: string
    card: string
  }
  const handOfCards: Card[] = [
    { id: 7, suit: 'C', card: 'A' },
    { id: 8, suit: 'H', card: '10' },
    { id: 9, suit: 'S', card: '10' },
    { id: 10, suit: 'D', card: '10' },
    { id: 11, suit: 'S', card: '9' }
  ]

  test('Sort by value, then by suit', function (done) {
    const s = firstBy<Card, 'card'>('card', { cmp: cardCompare, direction: -1 }).thenBy('suit', {
      cmp: suitCompare,
      direction: -1
    })
    handOfCards.sort(s)
    expect(handOfCards[0]!.id).toEqual(7)
    expect(handOfCards[1]!.id).toEqual(9)
    expect(handOfCards[2]!.id).toEqual(8)
    expect(handOfCards[3]!.id).toEqual(10)
    expect(handOfCards[4]!.id).toEqual(11)
    done()
  })
  test('using Intl.Collator', function (done) {
    const cmp = new Intl.Collator('en').compare
    const data = [{ a: 'aäb' }, { a: 'aãb' }, { a: 'aab' }, { a: 'abb' }, { a: 'Aäb' }]
    data.sort(firstBy('a', { cmp }))
    expect(data[0]!.a).toEqual('aab')
    expect(data[1]!.a).toEqual('aäb')
    expect(data[2]!.a).toEqual('Aäb')
    expect(data[3]!.a).toEqual('aãb')
    expect(data[4]!.a).toEqual('abb')
    done()
  })
})
describe('Sorting on numerical values', function () {
  test('Sort strings with numbers in them', function (done) {
    const values = ['2', '20', '03', '-2', '0', '200', '2']
    const sorted = values.sort(firstBy(Number))

    ;['-2', '0', '2', '2', '03', '20', '200'].forEach((v, i) => {
      expect(v).toEqual(sorted[i])
    })
    done()
  })
  test('Sort strings with numbers in them and normal numbers together', function (done) {
    const values = ['2', '20', '03', '-2', '0', 200, '2']
    const sorted = values.sort(firstBy(Number))

    ;['-2', '0', '2', '2', '03', '20', 200].forEach((v, i) => {
      expect(v).toEqual(sorted[i])
    })
    done()
  })
  test('Sort strings with numbers in them in properties', function (done) {
    const values = [
      { a: '2' },
      { a: '20' },
      { a: '03' },
      { a: '-2' },
      { a: '0' },
      { a: '200' },
      { a: '2' }
    ]
    const sorted = values.sort(
      firstBy(function (v) {
        return Number(v.a)
      })
    )

    ;['-2', '0', '2', '2', '03', '20', '200'].forEach((v, i) => {
      expect(v).toEqual(sorted[i]!.a)
    })
    done()
  })
})

describe('Sorting performance', function () {
  interface RandomData {
    firstNumber: number
    secondNumber: number
  }
  const randomData: RandomData[] = []
  for (let i = 0; i < 1000; i++) {
    randomData.push({
      firstNumber: Math.floor(Math.random() * 100),
      secondNumber: Math.floor(Math.random() * 100)
    })
  }

  test('Should not be much slower than handcoded', function (done) {
    let clone: RandomData[] = []
    let compare: (a: RandomData, b: RandomData) => number = firstBy<RandomData>(
      'firstNumber'
    ).thenBy('secondNumber', -1)
    for (let i = 0; i < 100; i++) {
      clone = randomData.slice(0)
      clone.sort(compare)
    }
    const secondNumberOne = clone[0]!.secondNumber

    compare = firstBy<RandomData>(function (a) {
      return a.firstNumber
    }).thenBy(function (a) {
      return a.secondNumber
    }, -1)
    for (let i = 0; i < 100; i++) {
      clone = randomData.slice(0)
      clone.sort(compare)
    }
    expect(secondNumberOne).toEqual(clone[0]!.secondNumber)

    compare = firstBy<RandomData>(function (a, b) {
      return a.firstNumber - b.firstNumber
    }).thenBy(function (a, b) {
      return b.secondNumber - a.secondNumber
    })
    for (let i = 0; i < 100; i++) {
      clone = randomData.slice(0)
      clone.sort(compare)
    }
    expect(secondNumberOne).toEqual(clone[0]!.secondNumber)

    compare = function (a: RandomData, b: RandomData) {
      if (a.firstNumber === b.firstNumber) {
        return b.secondNumber - a.secondNumber
      }
      return a.firstNumber - b.firstNumber
    }
    for (let i = 0; i < 100; i++) {
      clone = randomData.slice(0)
      clone.sort(compare)
    }
    done()
  })
})
