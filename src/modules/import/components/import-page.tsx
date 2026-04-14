import { CsvImportWizard } from '@/modules/import/components/csv-import-wizard'

export function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Data Import</h2>
        <p className="text-sm text-muted">Upload CSV files to import data into the system</p>
      </div>
      <CsvImportWizard />
    </div>
  )
}
