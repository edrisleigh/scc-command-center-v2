import { useState } from 'react'
import { Flag as FlagIcon } from 'lucide-react'
import { FlagDialog } from '@/modules/flags/components/flag-dialog'
import type { FlagSection } from '@/modules/flags/types'

interface FlagButtonProps {
  section: FlagSection
  dataPointRef?: string
  clientId?: string
}

export function FlagButton({ section, dataPointRef, clientId }: FlagButtonProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted transition hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-400"
        aria-label="Flag this section"
        title="Flag an issue with this section"
      >
        <FlagIcon className="h-3 w-3" />
        Flag
      </button>
      <FlagDialog
        open={open}
        onClose={() => setOpen(false)}
        section={section}
        dataPointRef={dataPointRef}
        clientId={clientId}
      />
    </>
  )
}
