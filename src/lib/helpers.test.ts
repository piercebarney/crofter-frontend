import { describe, it, expect } from 'vitest'
import {
	snakeCase,
	camelToSnakeCase,
	kebabCase,
	camelToKebabCase,
	snakeToCamelCase,
	capitalize,
	formatPhone,
	classes,
	stringifyAny,
} from './helpers'

describe('snakeCase', () => {
	it('converts space-separated words to snake_case', () => {
		expect(snakeCase('hello world')).toBe('hello_world')
	})

	it('converts camelCase to snake_case', () => {
		expect(snakeCase('helloWorld')).toBe('hello_world')
	})

	it('returns non-string values unchanged', () => {
		expect(snakeCase(123 as any)).toBe(123)
	})
})

describe('camelToSnakeCase', () => {
	it('converts camelCase to snake_case', () => {
		expect(camelToSnakeCase('helloWorld')).toBe('hello_world')
	})

	it('handles multiple uppercase letters', () => {
		expect(camelToSnakeCase('myHTTPServer')).toBe('my_httpserver')
	})

	it('returns non-string values unchanged', () => {
		expect(camelToSnakeCase(null as any)).toBe(null)
	})
})

describe('kebabCase', () => {
	it('converts space-separated words to kebab-case', () => {
		expect(kebabCase('hello world')).toBe('hello-world')
	})

	it('handles custom delimiter', () => {
		expect(kebabCase('hello_world', '_')).toBe('hello-world')
	})

	it('returns non-string values unchanged', () => {
		expect(kebabCase(undefined as any)).toBe(undefined)
	})
})

describe('camelToKebabCase', () => {
	it('converts camelCase to kebab-case', () => {
		expect(camelToKebabCase('helloWorld')).toBe('hello-world')
	})

	it('handles already lowercase strings', () => {
		expect(camelToKebabCase('hello')).toBe('hello')
	})
})

describe('snakeToCamelCase', () => {
	it('converts snake_case to camelCase', () => {
		expect(snakeToCamelCase('hello_world')).toBe('helloWorld')
	})

	it('handles multiple underscores', () => {
		expect(snakeToCamelCase('hello_big_world')).toBe('helloBigWorld')
	})

	it('returns non-string values unchanged', () => {
		expect(snakeToCamelCase(42 as any)).toBe(42)
	})
})

describe('capitalize', () => {
	it('capitalizes first letter of each word', () => {
		expect(capitalize('hello world')).toBe('Hello World')
	})

	it('handles single word', () => {
		expect(capitalize('hello')).toBe('Hello')
	})

	it('handles custom delimiter', () => {
		expect(capitalize('hello-world', '-')).toBe('Hello World')
	})
})

describe('formatPhone', () => {
	it('formats 10-digit phone number', () => {
		expect(formatPhone('1234567890')).toBe('123-456-7890')
	})

	it('formats 11-digit phone number', () => {
		expect(formatPhone('11234567890')).toBe('123-456-7890')
	})

	it('strips +1 prefix', () => {
		expect(formatPhone('+11234567890')).toBe('123-456-7890')
	})

	it('returns null for null input', () => {
		expect(formatPhone(null)).toBe(null)
	})
})

describe('classes', () => {
	it('joins string classes', () => {
		expect(classes('foo', 'bar')).toBe('foo bar')
	})

	it('handles conditional object classes', () => {
		expect(classes('foo', { bar: true }, { baz: false })).toBe('foo bar')
	})

	it('converts camelCase to kebab-case', () => {
		expect(classes('fooBar')).toBe('foo-bar')
	})

	it('returns undefined for empty input', () => {
		expect(classes()).toBe(undefined)
	})
})

describe('stringifyAny', () => {
	it('returns strings unchanged', () => {
		expect(stringifyAny('hello')).toBe('hello')
	})

	it('stringifies objects', () => {
		expect(stringifyAny({ a: 1 })).toBe('{"a":1}')
	})

	it('handles null', () => {
		expect(stringifyAny(null)).toBe('null')
	})

	it('handles undefined', () => {
		expect(stringifyAny(undefined)).toBe('undefined')
	})
})
