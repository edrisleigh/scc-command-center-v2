export function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Organization Info */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Organization</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Name</span>
            <span className="text-sm text-card-foreground font-medium">Halo Agency</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Slug</span>
            <span className="font-mono text-xs text-muted bg-muted/10 rounded px-2 py-0.5">halo</span>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Client</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Name</span>
            <span className="text-sm text-card-foreground font-medium">HEYDUDE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Platform</span>
            <span className="rounded-full bg-[#FE2C55]/10 px-2 py-0.5 text-[11px] font-medium text-[#FE2C55]">
              TikTok
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Slug</span>
            <span className="font-mono text-xs text-muted bg-muted/10 rounded px-2 py-0.5">heydude</span>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-card-foreground">Team Members</h3>
          <button
            disabled
            title="Coming soon"
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted cursor-not-allowed opacity-50"
          >
            Add Member
          </button>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-card-foreground font-medium">Edris Aleigh</p>
            <p className="text-xs text-muted">edris@halo.com</p>
          </div>
          <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] font-medium text-foreground">
            Admin
          </span>
        </div>
      </div>

      {/* Data Sources */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Data Sources</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div>
              <p className="text-sm text-card-foreground font-medium">Mock Data</p>
              <p className="text-xs text-muted">Development environment</p>
            </div>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-card-foreground font-medium">TikTok Shop API</p>
              <p className="text-xs text-muted">Live production data</p>
            </div>
            <span className="rounded-full bg-muted/20 px-2 py-0.5 text-[11px] font-medium text-muted">
              Not Connected
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-danger/40 bg-card p-5">
        <h3 className="text-sm font-semibold text-danger mb-4">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-card-foreground font-medium">Delete Client</p>
            <p className="text-xs text-muted">Permanently remove this client and all associated data.</p>
          </div>
          <button
            disabled
            className="rounded-md border border-danger/40 px-3 py-1.5 text-xs text-danger cursor-not-allowed opacity-50"
          >
            Delete Client
          </button>
        </div>
      </div>
    </div>
  )
}
