import Papa from 'papaparse'
import type { ParsedData } from './types'

export function parseCsv(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields ?? []
        const rows = results.data as Record<string, string>[]
        resolve({ headers, rows, totalRows: rows.length })
      },
      error: (error) => reject(error),
    })
  })
}
