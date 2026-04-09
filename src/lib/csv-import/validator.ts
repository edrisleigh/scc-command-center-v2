import type { ImportDataType, ColumnMapping, ValidationError } from './types'

const requiredFields: Record<ImportDataType, string[]> = {
  shop: ['date', 'gmv', 'orders', 'customers'],
  video: ['date', 'videoGmv', 'videoViews'],
  ads: ['date', 'adSpend', 'adDrivenGmv'],
  creators: ['username'],
  samples: ['orderId', 'creatorUsername', 'productName'],
  content: ['creatorName', 'videoUrl'],
}

export function validateImport(
  rows: Record<string, string>[],
  dataType: ImportDataType,
  mappings: ColumnMapping[],
): ValidationError[] {
  const errors: ValidationError[] = []
  const required = requiredFields[dataType]
  const mappedTargets = new Set(mappings.map((m) => m.targetField))

  // Check all required fields are mapped
  for (const field of required) {
    if (!mappedTargets.has(field)) {
      errors.push({ row: 0, column: field, message: `Required field "${field}" is not mapped` })
    }
  }

  // Check first 100 rows for data quality
  const limit = Math.min(rows.length, 100)
  for (let i = 0; i < limit; i++) {
    for (const mapping of mappings) {
      const value = rows[i][mapping.sourceColumn]
      if (!value && required.includes(mapping.targetField)) {
        errors.push({ row: i + 1, column: mapping.sourceColumn, message: `Required value missing` })
      }
    }
  }

  return errors
}
