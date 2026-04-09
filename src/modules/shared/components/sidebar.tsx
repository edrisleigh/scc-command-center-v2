import { Link, useMatchRoute } from '@tanstack/react-router'
import {
  BarChart3,
  Video,
  Megaphone,
  Users,
  FileText,
  Package,
  ClipboardList,
  Target,
  Calendar,
  ListChecks,
  Upload,
  Settings,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTenant } from '@/modules/shared/hooks/use-tenant'

interface NavItem {
  label: string
  icon: React.ElementType
  path: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Agency Dashboard', icon: LayoutDashboard, path: 'overview' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Shop Analytics', icon: BarChart3, path: 'shop' },
      { label: 'Video Performance', icon: Video, path: 'video' },
      { label: 'Ads Management', icon: Megaphone, path: 'ads' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Creators', icon: Users, path: 'creators' },
      { label: 'Content & Spark', icon: FileText, path: 'content' },
      { label: 'Samples & Products', icon: Package, path: 'samples' },
    ],
  },
  {
    title: 'Reporting',
    items: [
      { label: 'Scorecards', icon: ClipboardList, path: 'scorecards' },
      { label: 'Planning & OGSM', icon: Target, path: 'planning' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: 'Calendar', icon: Calendar, path: 'calendar' },
      { label: 'Workflow', icon: ListChecks, path: 'workflow' },
      { label: 'Data Import', icon: Upload, path: 'import' },
      { label: 'Settings', icon: Settings, path: 'settings' },
    ],
  },
]

export function Sidebar() {
  const { orgSlug, clientSlug } = useTenant()
  const matchRoute = useMatchRoute()

  return (
    <aside className="flex w-[220px] shrink-0 flex-col overflow-y-auto bg-accent/50 py-4">
      {sections.map((section) => (
        <div key={section.title} className="mb-4">
          <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {section.title}
          </p>
          {section.items.map((item) => {
            const isOverview = item.path === 'overview'
            const to = isOverview
              ? ('/$orgSlug/overview' as const)
              : ('/$orgSlug/$clientSlug/' + item.path as '/$orgSlug/$clientSlug/shop')

            const params = isOverview
              ? { orgSlug }
              : { orgSlug, clientSlug }

            const isActive = isOverview
              ? !!matchRoute({ to: '/$orgSlug/overview', params: { orgSlug } })
              : !!matchRoute({
                  to: `/$orgSlug/$clientSlug/${item.path}` as '/$orgSlug/$clientSlug/shop',
                  params: { orgSlug, clientSlug },
                })

            return (
              <Link
                key={item.path}
                to={to}
                params={params as never}
                className={cn(
                  'flex items-center gap-3 border-l-2 px-4 py-2 text-sm transition-colors',
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-transparent text-muted-foreground hover:bg-accent hover:text-card-foreground',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}
    </aside>
  )
}
