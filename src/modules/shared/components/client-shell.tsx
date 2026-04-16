import { Outlet } from '@tanstack/react-router'
import { Info } from 'lucide-react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function ClientShell() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex shrink-0 items-center justify-center gap-1.5 bg-amber-100 px-4 py-1.5 text-xs text-amber-900">
        <Info className="h-3.5 w-3.5 shrink-0" />
        <span>
          This dashboard uses mock data for demonstration purposes. It does not
          reflect real metrics or performance.
        </span>
      </div>
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
