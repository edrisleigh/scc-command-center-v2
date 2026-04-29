import { useEffect, useState } from 'react'

interface NumInputProps {
  value: number
  onChange: (next: number) => void
  className?: string
  disabled?: boolean
  min?: number
  step?: number | string
  ariaLabel?: string
}

export function NumInput({ value, onChange, className, disabled, min, step, ariaLabel }: NumInputProps) {
  const [draft, setDraft] = useState<string>(() => String(value))

  useEffect(() => {
    const parsed = draft === '' || draft === '-' ? NaN : Number(draft)
    if (!Number.isFinite(parsed) || parsed !== value) {
      setDraft(String(value))
    }
  }, [value])

  return (
    <input
      type="number"
      inputMode="decimal"
      step={step ?? 'any'}
      min={min}
      disabled={disabled}
      aria-label={ariaLabel}
      value={draft}
      className={className}
      onChange={(e) => {
        const raw = e.target.value
        setDraft(raw)
        if (raw === '' || raw === '-') return
        const num = Number(raw)
        if (Number.isFinite(num)) onChange(num)
      }}
      onBlur={() => {
        if (draft === '' || draft === '-') {
          setDraft(String(value))
        }
      }}
    />
  )
}
