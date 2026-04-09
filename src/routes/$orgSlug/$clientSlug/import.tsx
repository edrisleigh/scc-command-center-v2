import { createFileRoute } from '@tanstack/react-router'
import { CsvImportWizard } from '@/modules/import/components/csv-import-wizard'

export const Route = createFileRoute('/$orgSlug/$clientSlug/import')({
  component: () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Data Import</h2>
        <p className="text-sm text-muted">Upload CSV files to import data into the system</p>
      </div>
      <CsvImportWizard />
    </div>
  ),
})
