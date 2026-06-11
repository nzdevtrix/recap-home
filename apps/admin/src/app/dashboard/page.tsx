'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({ users: 0, riders: 0, businesses: 0, pendingRiders: 0, pendingBusinesses: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const token = localStorage.getItem('accessToken')
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        const [usersRes, ridersRes, bizRes] = await Promise.all([
          fetch(`${API}/admin/users`, { headers }).catch(() => null),
          fetch(`${API}/riders`, { headers }).catch(() => null),
          fetch(`${API}/admin/businesses`, { headers }).catch(() => null),
        ])

        const usersData = usersRes?.ok ? await usersRes.json() : { users: [] }
        const ridersData = ridersRes?.ok ? await ridersRes.json() : []
        const bizData = bizRes?.ok ? await bizRes.json() : { businesses: [] }

        setStats({
          users: Array.isArray(usersData) ? usersData.length : usersData?.users?.length || 0,
          riders: Array.isArray(ridersData) ? ridersData.length : ridersData?.riders?.length || 0,
          businesses: Array.isArray(bizData) ? bizData.length : bizData?.businesses?.length || 0,
          pendingRiders: Array.isArray(ridersData) ? ridersData.filter((r: any) => r.approvalStatus === 'PENDING').length : 0,
          pendingBusinesses: Array.isArray(bizData) ? bizData.filter((b: any) => b.status === 'PENDING_BANKING').length : 0,
        })
      } catch (e) {}
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'Utenti Totali', value: stats.users, href: '/users', color: 'bg-blue-500' },
    { label: 'Rider', value: stats.riders, href: '/riders', color: 'bg-green-500' },
    { label: 'Business', value: stats.businesses, href: '/businesses', color: 'bg-purple-500' },
    { label: 'Rider in Attesa', value: stats.pendingRiders, href: '/riders', color: 'bg-yellow-500' },
    { label: 'Business in Attesa', value: stats.pendingBusinesses, href: '/businesses', color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(c => (
          <Link key={c.label} href={c.href} className="block">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
              <div className={`w-10 h-10 rounded ${c.color} mb-3`} />
              <p className="text-2xl font-bold">{loading ? '...' : c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
