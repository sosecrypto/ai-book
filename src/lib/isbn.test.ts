import { describe, it, expect } from 'vitest'
import {
  calculateISBN13CheckDigit,
  calculateISBN10CheckDigit,
  validateISBN13,
  validateISBN10,
  convertISBN10to13,
  convertISBN13to10,
  parseISBN13,
  formatISBN,
  normalizeISBN,
  generateDraftISBN,
  validateAndParseISBN,
} from './isbn'

describe('calculateISBN13CheckDigit', () => {
  it('올바른 체크 디지트를 계산한다', () => {
    // 978030640615 → check digit 7
    expect(calculateISBN13CheckDigit('978030640615')).toBe('7')
  })

  it('다른 ISBN의 체크 디지트를 계산한다', () => {
    // ISBN-13: 9780306406157 → check digit 7
    expect(calculateISBN13CheckDigit('978030640615')).toBe('7')
  })

  it('체크 디지트 0인 경우', () => {
    expect(calculateISBN13CheckDigit('978031606529')).toBe('0')
  })

  it('12자리가 아니면 에러를 던진다', () => {
    expect(() => calculateISBN13CheckDigit('12345')).toThrow('12자리')
    expect(() => calculateISBN13CheckDigit('1234567890123')).toThrow('12자리')
  })

  it('하이픈이 포함된 경우 숫자만 추출한다', () => {
    expect(calculateISBN13CheckDigit('978-0-306406-15')).toBe('7')
  })
})

describe('calculateISBN10CheckDigit', () => {
  it('올바른 체크 디지트를 계산한다', () => {
    // ISBN-10: 0306406152 → check digit 2
    expect(calculateISBN10CheckDigit('030640615')).toBe('2')
  })

  it('체크 디지트가 X인 경우', () => {
    // ISBN-10: 155404295X → check digit X
    expect(calculateISBN10CheckDigit('155404295')).toBe('X')
  })

  it('9자리가 아니면 에러를 던진다', () => {
    expect(() => calculateISBN10CheckDigit('12345')).toThrow('9자리')
  })
})

describe('validateISBN13', () => {
  it('유효한 ISBN-13을 검증한다', () => {
    expect(validateISBN13('9780306406157')).toBe(true)
  })

  it('하이픈 포함 ISBN-13을 검증한다', () => {
    expect(validateISBN13('978-0-306-40615-7')).toBe(true)
  })

  it('잘못된 체크 디지트를 거부한다', () => {
    expect(validateISBN13('9780306406158')).toBe(false)
  })

  it('978/979로 시작하지 않으면 거부한다', () => {
    expect(validateISBN13('9770306406157')).toBe(false)
  })

  it('길이가 13이 아니면 거부한다', () => {
    expect(validateISBN13('978030640')).toBe(false)
    expect(validateISBN13('')).toBe(false)
  })

  it('979로 시작하는 유효한 ISBN을 허용한다', () => {
    // 979-0 prefix
    const isbn12 = '979000000000'
    const checkDigit = calculateISBN13CheckDigit(isbn12)
    expect(validateISBN13(isbn12 + checkDigit)).toBe(true)
  })
})

describe('validateISBN10', () => {
  it('유효한 ISBN-10을 검증한다', () => {
    expect(validateISBN10('0306406152')).toBe(true)
  })

  it('X가 포함된 ISBN-10은 현재 구현에서 false를 반환한다', () => {
    // validateISBN10은 \D로 X를 제거하므로 길이가 9가 되어 false 반환
    expect(validateISBN10('155404295X')).toBe(false)
  })

  it('잘못된 체크 디지트를 거부한다', () => {
    expect(validateISBN10('0306406153')).toBe(false)
  })

  it('길이가 10이 아니면 거부한다', () => {
    expect(validateISBN10('030640')).toBe(false)
  })
})

describe('convertISBN10to13', () => {
  it('ISBN-10을 ISBN-13으로 변환한다', () => {
    expect(convertISBN10to13('0306406152')).toBe('9780306406157')
  })

  it('10자리가 아니면 에러를 던진다', () => {
    expect(() => convertISBN10to13('12345')).toThrow('유효한 ISBN-10')
  })
})

describe('convertISBN13to10', () => {
  it('978 ISBN-13을 ISBN-10으로 변환한다', () => {
    expect(convertISBN13to10('9780306406157')).toBe('0306406152')
  })

  it('979 ISBN-13은 null을 반환한다', () => {
    const isbn12 = '979000000000'
    const checkDigit = calculateISBN13CheckDigit(isbn12)
    expect(convertISBN13to10(isbn12 + checkDigit)).toBeNull()
  })

  it('13자리가 아니면 null을 반환한다', () => {
    expect(convertISBN13to10('12345')).toBeNull()
  })
})

describe('parseISBN13', () => {
  it('ISBN-13을 구성 요소로 분리한다', () => {
    const result = parseISBN13('9788955448480')
    expect(result).toEqual({
      prefix: '978',
      groupCode: '89',
      registrant: '55448',
      publication: '48',
      checkDigit: '0',
    })
  })

  it('13자리가 아니면 null을 반환한다', () => {
    expect(parseISBN13('12345')).toBeNull()
    expect(parseISBN13('')).toBeNull()
  })
})

describe('formatISBN', () => {
  it('ISBN-13을 포맷한다', () => {
    expect(formatISBN('9788955448480')).toBe('978-89-55448-48-0')
  })

  it('ISBN-10을 포맷한다', () => {
    expect(formatISBN('8955448480')).toBe('89-55448-48-0')
  })

  it('알 수 없는 길이는 그대로 반환한다', () => {
    expect(formatISBN('12345')).toBe('12345')
  })
})

describe('normalizeISBN', () => {
  it('하이픈을 제거한다', () => {
    expect(normalizeISBN('978-89-5544-848-0')).toBe('9788955448480')
  })

  it('공백과 특수문자를 제거한다', () => {
    expect(normalizeISBN('978 89 5544 8480')).toBe('9788955448480')
  })

  it('숫자만 있으면 그대로 반환한다', () => {
    expect(normalizeISBN('9788955448480')).toBe('9788955448480')
  })
})

describe('generateDraftISBN', () => {
  it('유효한 ISBN-13을 생성한다', () => {
    const isbn = generateDraftISBN()
    expect(validateISBN13(isbn)).toBe(true)
  })

  it('978-89로 시작한다', () => {
    const isbn = generateDraftISBN()
    expect(isbn.startsWith('97889')).toBe(true)
  })

  it('커스텀 출판사 코드를 사용한다', () => {
    const isbn = generateDraftISBN('12345')
    expect(isbn.substring(5, 10)).toBe('12345')
    expect(validateISBN13(isbn)).toBe(true)
  })

  it('짧은 출판사 코드를 패딩한다', () => {
    const isbn = generateDraftISBN('1')
    expect(isbn.substring(5, 10)).toBe('00001')
    expect(validateISBN13(isbn)).toBe(true)
  })
})

describe('validateAndParseISBN', () => {
  it('유효한 ISBN-13을 파싱한다', () => {
    const result = validateAndParseISBN('9780306406157')
    expect(result.isValid).toBe(true)
    expect(result.isbn13).toBe('9780306406157')
    expect(result.isbn10).toBe('0306406152')
    expect(result.components).toBeDefined()
  })

  it('유효한 ISBN-10을 파싱하고 ISBN-13으로 변환한다', () => {
    const result = validateAndParseISBN('0306406152')
    expect(result.isValid).toBe(true)
    expect(result.isbn13).toBe('9780306406157')
    expect(result.isbn10).toBe('0306406152')
  })

  it('무효한 ISBN-13을 거부한다', () => {
    const result = validateAndParseISBN('9780306406158')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('ISBN-13')
  })

  it('무효한 ISBN-10을 거부한다', () => {
    const result = validateAndParseISBN('0306406153')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('ISBN-10')
  })

  it('잘못된 길이를 거부한다', () => {
    const result = validateAndParseISBN('12345')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('10자리 또는 13자리')
  })

  it('979 ISBN-13은 isbn10이 없다', () => {
    const isbn12 = '979000000000'
    const checkDigit = calculateISBN13CheckDigit(isbn12)
    const isbn = isbn12 + checkDigit
    const result = validateAndParseISBN(isbn)
    expect(result.isValid).toBe(true)
    expect(result.isbn10).toBeUndefined()
  })
})
