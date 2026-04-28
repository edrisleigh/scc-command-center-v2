import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Store,
  Video,
  Megaphone,
  Users,
  Package,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { parseCsv, validateImport } from '@/lib/csv-import'
import type { ImportDataType, ParsedData, ColumnMapping, ValidationError } from '@/lib/csv-import'
import { useRecordRefresh } from '@/modules/freshness/hooks'
import type { DataSource } from '@/modules/freshness/types'

const IMPORT_TO_DATA_SOURCE: Record<ImportDataType, DataSource> = {
  shop: 'shop-daily',
  video: 'video-daily',
  ads: 'ads-daily',
  creators: 'creators',
  samples: 'samples',
  content: 'content',
}

const DATA_TYPES: {
  value: ImportDataType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: 'shop', label: 'Shop', description: 'Daily shop metrics (GMV, orders, customers)', icon: Store },
  { value: 'video', label: 'Video', description: 'Video performance data (views, GMV)', icon: Video },
  { value: 'ads', label: 'Ads', description: 'Ad spend and driven GMV data', icon: Megaphone },
  { value: 'creators', label: 'Creators', description: 'Creator profiles and stats', icon: Users },
  { value: 'samples', label: 'Samples', description: 'Sample orders and product tracking', icon: Package },
  { value: 'content', label: 'Content', description: 'Content submissions and video URLs', icon: FileText },
]

const TARGET_FIELDS: Record<ImportDataType, { field: string; label: string }[]> = {
  shop: [
    { field: 'date', label: 'Date' },
    { field: 'gmv', label: 'GMV' },
    { field: 'orders', label: 'Orders' },
    { field: 'customers', label: 'Customers' },
    { field: 'visitors', label: 'Visitors' },
    { field: 'conversionRate', label: 'Conversion Rate' },
    { field: 'grossRevenue', label: 'Gross Revenue' },
  ],
  video: [
    { field: 'date', label: 'Date' },
    { field: 'videoGmv', label: 'Video GMV' },
    { field: 'videoViews', label: 'Video Views' },
    { field: 'videoOrders', label: 'Video Orders' },
  ],
  ads: [
    { field: 'date', label: 'Date' },
    { field: 'adSpend', label: 'Ad Spend' },
    { field: 'adDrivenGmv', label: 'Ad-Driven GMV' },
    { field: 'adImpressions', label: 'Impressions' },
    { field: 'adClicks', label: 'Clicks' },
  ],
  creators: [
    { field: 'username', label: 'Username' },
    { field: 'displayName', label: 'Display Name' },
    { field: 'followers', label: 'Followers' },
    { field: 'gmv', label: 'GMV' },
  ],
  samples: [
    { field: 'orderId', label: 'Order ID' },
    { field: 'creatorUsername', label: 'Creator Username' },
    { field: 'productName', label: 'Product Name' },
    { field: 'status', label: 'Status' },
  ],
  content: [
    { field: 'creatorName', label: 'Creator Name' },
    { field: 'videoUrl', label: 'Video URL' },
    { field: 'views', label: 'Views' },
    { field: 'status', label: 'Status' },
  ],
}

const STEP_LABELS = ['Data Type', 'Upload', 'Map Columns', 'Preview', 'Confirm']

export function CsvImportWizard() {
  const [step, setStep] = useState(0)
  const [dataType, setDataType] = useState<ImportDataType | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number>(0)
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [importComplete, setImportComplete] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recordRefresh = useRecordRefresh('client-1')

  const handleFileSelect = useCallback(
    async (file: File) => {
      setFileName(file.name)
      setFileSize(file.size)
      const result = await parseCsv(file)
      setParsedData(result)

      // Auto-map columns with matching names (case-insensitive)
      if (dataType) {
        const targets = TARGET_FIELDS[dataType]
        const autoMappings: ColumnMapping[] = []
        for (const header of result.headers) {
          const match = targets.find(
            (t) => t.field.toLowerCase() === header.toLowerCase() || t.label.toLowerCase() === header.toLowerCase(),
          )
          if (match) {
            autoMappings.push({ sourceColumn: header, targetField: match.field })
          }
        }
        setMappings(autoMappings)
      }
    },
    [dataType],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect],
  )

  const handleValidate = useCallback(() => {
    if (!parsedData || !dataType) return
    const validationErrors = validateImport(parsedData.rows, dataType, mappings)
    setErrors(validationErrors)
  }, [parsedData, dataType, mappings])

  const updateMapping = (sourceColumn: string, targetField: string) => {
    setMappings((prev) => {
      const existing = prev.findIndex((m) => m.sourceColumn === sourceColumn)
      if (targetField === '') {
        return prev.filter((m) => m.sourceColumn !== sourceColumn)
      }
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { sourceColumn, targetField }
        return updated
      }
      return [...prev, { sourceColumn, targetField }]
    })
  }

  const canProceed = () => {
    switch (step) {
      case 0:
        return dataType !== null
      case 1:
        return parsedData !== null
      case 2:
        return mappings.length > 0
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step === 2) {
      handleValidate()
    }
    if (step === 4) {
      if (dataType) {
        recordRefresh.mutate(IMPORT_TO_DATA_SOURCE[dataType], {
          onSuccess: () => toast.success(`${dataType} data marked as refreshed`),
          onError: (err) => toast.error(err.message),
        })
      }
      setImportComplete(true)
      return
    }
    setStep((s) => Math.min(s + 1, 4))
  }

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0))
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i < step
                    ? 'bg-success text-background'
                    : i === step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-muted'
                }`}
              >
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`mt-1 text-xs ${i === step ? 'text-foreground' : 'text-muted'}`}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`mx-2 h-px w-12 sm:w-20 ${i < step ? 'bg-success' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-lg border border-border bg-card p-6">
        {/* Step 1: Select Data Type */}
        {step === 0 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Select Data Type</h3>
            <p className="mb-6 text-sm text-muted">Choose the type of data you are importing.</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {DATA_TYPES.map((dt) => {
                const Icon = dt.icon
                return (
                  <button
                    key={dt.value}
                    onClick={() => setDataType(dt.value)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors ${
                      dataType === dt.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-accent text-muted hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{dt.label}</span>
                    <span className="text-xs text-muted">{dt.description}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Upload File */}
        {step === 1 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Upload File</h3>
            <p className="mb-6 text-sm text-muted">Upload a CSV file containing your data.</p>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : parsedData
                    ? 'border-success bg-success/5'
                    : 'border-border hover:border-primary/50'
              }`}
            >
              <Upload className={`mb-3 h-10 w-10 ${parsedData ? 'text-success' : 'text-muted'}`} />
              {parsedData ? (
                <div className="text-center">
                  <p className="font-medium text-foreground">{fileName}</p>
                  <p className="text-sm text-muted">
                    {(fileSize / 1024).toFixed(1)} KB &middot; {parsedData.totalRows} rows &middot;{' '}
                    {parsedData.headers.length} columns
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-medium text-foreground">Drop your CSV file here</p>
                  <p className="text-sm text-muted">or click to browse</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
            </div>
          </div>
        )}

        {/* Step 3: Map Columns */}
        {step === 2 && parsedData && dataType && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Map Columns</h3>
            <p className="mb-6 text-sm text-muted">
              Match your CSV columns to the target fields. Columns with matching names are auto-mapped.
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold uppercase tracking-wider text-muted">
                <span>Source Column (CSV)</span>
                <span>Target Field</span>
              </div>
              {parsedData.headers.map((header) => {
                const currentMapping = mappings.find((m) => m.sourceColumn === header)
                return (
                  <div key={header} className="grid grid-cols-2 items-center gap-4">
                    <span className="truncate rounded bg-accent px-3 py-2 text-sm text-foreground">{header}</span>
                    <select
                      value={currentMapping?.targetField ?? ''}
                      onChange={(e) => updateMapping(header, e.target.value)}
                      className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                      <option value="">-- Skip --</option>
                      {TARGET_FIELDS[dataType].map((tf) => (
                        <option key={tf.field} value={tf.field}>
                          {tf.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 4: Preview & Validate */}
        {step === 3 && parsedData && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Preview & Validate</h3>
            {errors.length > 0 && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
                <AlertCircle className="h-4 w-4" />
                {errors.length} validation error{errors.length !== 1 && 's'} found
              </div>
            )}
            {errors.length === 0 && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
                <CheckCircle className="h-4 w-4" />
                All validations passed
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted">Row</th>
                    {mappings.map((m) => (
                      <th key={m.targetField} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
                        {TARGET_FIELDS[dataType!]?.find((t) => t.field === m.targetField)?.label ?? m.targetField}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.rows.slice(0, 10).map((row, i) => {
                    const rowErrors = errors.filter((e) => e.row === i + 1)
                    return (
                      <tr key={i} className="border-b border-border">
                        <td className="px-3 py-2 text-muted">{i + 1}</td>
                        {mappings.map((m) => {
                          const hasError = rowErrors.some((e) => e.column === m.sourceColumn)
                          return (
                            <td
                              key={m.targetField}
                              className={`px-3 py-2 ${hasError ? 'text-danger' : 'text-card-foreground'}`}
                            >
                              {row[m.sourceColumn] || <span className="italic text-muted">empty</span>}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted">Showing first 10 of {parsedData.totalRows} rows</p>
          </div>
        )}

        {/* Step 5: Confirm */}
        {step === 4 && (
          <div>
            {importComplete ? (
              <div className="flex flex-col items-center py-12">
                <CheckCircle className="mb-4 h-16 w-16 text-success" />
                <h3 className="text-xl font-semibold text-foreground">Import Successful</h3>
                <p className="mt-2 text-sm text-muted">
                  {parsedData?.totalRows} rows of {dataType} data have been imported.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-foreground">Confirm Import</h3>
                <div className="space-y-3 rounded-lg border border-border bg-accent p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Data Type</span>
                    <span className="font-medium text-foreground capitalize">{dataType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">File</span>
                    <span className="font-medium text-foreground">{fileName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Total Rows</span>
                    <span className="font-medium text-foreground">{parsedData?.totalRows}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Mapped Fields</span>
                    <span className="font-medium text-foreground">{mappings.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Validation Errors</span>
                    <span className={`font-medium ${errors.length > 0 ? 'text-danger' : 'text-success'}`}>
                      {errors.length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      {!importComplete && (
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="rounded-lg border border-border bg-accent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === 4 ? 'Import' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
