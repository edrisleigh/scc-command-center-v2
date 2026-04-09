export function exportToCsv<T extends object>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[],
) {
  if (data.length === 0) return

  const cols = columns ?? Object.keys(data[0]).map(k => ({ key: k as keyof T, header: k as string }))
  const header = cols.map(c => c.header).join(',')
  const rows = data.map(row =>
    cols.map(c => {
      const val = (row as Record<string, unknown>)[c.key as string]
      const str = String(val ?? '')
      // Escape commas and quotes
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
    }).join(',')
  )

  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
