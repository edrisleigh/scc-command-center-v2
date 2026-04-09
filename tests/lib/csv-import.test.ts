import { describe, it, expect } from 'vitest'
import { validateImport } from '@/lib/csv-import/validator'
import type { ColumnMapping } from '@/lib/csv-import/types'

describe('validateImport', () => {
  it('returns errors for unmapped required fields', () => {
    const mappings: ColumnMapping[] = [
      { sourceColumn: 'Date', targetField: 'date' },
    ]
    const rows = [{ Date: '2025-10-01' }]
    const errors = validateImport(rows, 'shop', mappings)
    expect(errors.some((e) => e.message.includes('gmv'))).toBe(true)
  })

  it('returns no errors when all required fields are mapped with data', () => {
    const mappings: ColumnMapping[] = [
      { sourceColumn: 'Date', targetField: 'date' },
      { sourceColumn: 'GMV', targetField: 'gmv' },
      { sourceColumn: 'Orders', targetField: 'orders' },
      { sourceColumn: 'Customers', targetField: 'customers' },
    ]
    const rows = [{ Date: '2025-10-01', GMV: '140000', Orders: '2500', Customers: '2300' }]
    const errors = validateImport(rows, 'shop', mappings)
    expect(errors.length).toBe(0)
  })

  it('returns errors for missing required values in rows', () => {
    const mappings: ColumnMapping[] = [
      { sourceColumn: 'Date', targetField: 'date' },
      { sourceColumn: 'GMV', targetField: 'gmv' },
      { sourceColumn: 'Orders', targetField: 'orders' },
      { sourceColumn: 'Customers', targetField: 'customers' },
    ]
    const rows = [{ Date: '2025-10-01', GMV: '', Orders: '2500', Customers: '2300' }]
    const errors = validateImport(rows, 'shop', mappings)
    expect(errors.some((e) => e.row === 1 && e.column === 'GMV')).toBe(true)
  })
})
