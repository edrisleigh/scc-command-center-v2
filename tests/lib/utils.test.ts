import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, formatPercent, formatNumber, formatCompactNumber } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })
})

describe('formatCurrency', () => {
  it('formats millions', () => {
    expect(formatCurrency(1_500_000)).toBe('$1.50M')
  })

  it('formats thousands', () => {
    expect(formatCurrency(25_000)).toBe('$25.0K')
  })

  it('formats small values', () => {
    expect(formatCurrency(42.5)).toBe('$42.50')
  })
})

describe('formatPercent', () => {
  it('formats decimal as percent', () => {
    expect(formatPercent(0.125)).toBe('12.5%')
  })
})

describe('formatNumber', () => {
  it('formats with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })
})

describe('formatCompactNumber', () => {
  it('formats millions', () => {
    expect(formatCompactNumber(2_500_000)).toBe('2.5M')
  })

  it('formats thousands', () => {
    expect(formatCompactNumber(15_000)).toBe('15.0K')
  })

  it('formats small values', () => {
    expect(formatCompactNumber(42)).toBe('42')
  })
})
