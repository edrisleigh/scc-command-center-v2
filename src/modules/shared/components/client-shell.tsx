import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function ClientShell() {
  return (
    <div className="flex h-screen flex-col">
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
