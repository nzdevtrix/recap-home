'use client'
export function Header() {
  return (
    <header className="border-b px-6 py-3 flex items-center justify-between bg-white">
      <h2 className="text-sm text-muted-foreground">Control Center</h2>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Admin</span>
      </div>
    </header>
  )
}
