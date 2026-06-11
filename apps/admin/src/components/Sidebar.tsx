'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/riders', label: 'Rider', icon: '🚴' },
  { href: '/businesses', label: 'Business', icon: '🏪' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col h-screen">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold">Recap Home</h1>
        <p className="text-xs text-gray-400">Admin Portal</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${pathname === l.href || pathname.startsWith(l.href + '/') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
            <span>{l.icon}</span> {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
