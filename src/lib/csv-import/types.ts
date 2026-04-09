export type ImportDataType = 'shop' | 'video' | 'ads' | 'creators' | 'samples' | 'content'

export interface ColumnMapping {
  sourceColumn: string
  targetField: string
}

export interface ParsedData {
  headers: string[]
  rows: Record<string, string>[]
  totalRows: number
}

export interface ValidationError {
  row: number
  column: string
  message: string
}

export interface ImportConfig {
  dataType: ImportDataType
  columnMappings: ColumnMapping[]
}
