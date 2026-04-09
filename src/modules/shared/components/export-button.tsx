import { Download } from 'lucide-react'

interface ExportButtonProps {
  onClick: () => void
  label?: string
}

export function ExportButton({ onClick, label = 'Export CSV' }: ExportButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-card-foreground hover:border-card-foreground transition-colors"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
