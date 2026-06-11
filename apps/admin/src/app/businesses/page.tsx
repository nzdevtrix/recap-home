'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ToastProvider'

interface Business { id: string; legalName: string; vatId: string; legalType: string; status: string; ownerFullName: string; user?: { email: string } }

export default function BusinessesPage() {
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const load = async () => {
    const token = localStorage.getItem('accessToken')
    try {
      const res = await fetch(`${API}/admin/users?role=BUSINESS`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setBusinesses(Array.isArray(data) ? data : data?.users || [])
    } catch (e) { toast({ title: 'Error loading businesses', variant: 'destructive' }) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('accessToken')
    try {
      const res = await fetch(`${API}/admin/businesses/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed')
      toast({ title: `Business ${status === 'ACTIVE' ? 'attivato' : status === 'SUSPENDED' ? 'sospeso' : 'aggiornato'}` })
      load()
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }) }
  }

  const filtered = filter === 'ALL' ? businesses : businesses.filter(b => b.status === filter)

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { PENDING_BANKING: 'bg-yellow-100 text-yellow-800', ACTIVE: 'bg-green-100 text-green-800', SUSPENDED: 'bg-red-100 text-red-800', DEACTIVATED: 'bg-gray-100 text-gray-800' }
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[s] || 'bg-gray-100'}`}>{s}</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Business Applications</h1>
        <div className="flex gap-2">
          {['ALL', 'PENDING_BANKING', 'ACTIVE', 'SUSPENDED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr><th className="text-left p-3">Ragione Sociale</th><th className="text-left p-3">Email</th><th className="text-left p-3">Partita IVA</th><th className="text-left p-3">Tipo</th><th className="text-left p-3">Stato</th><th className="text-left p-3">Azioni</th></tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{b.legalName}</td>
                  <td className="p-3">{b.user?.email || '-'}</td>
                  <td className="p-3 font-mono text-xs">{b.vatId}</td>
                  <td className="p-3">{b.legalType}</td>
                  <td className="p-3">{statusBadge(b.status)}</td>
                  <td className="p-3 space-x-2">
                    {b.status === 'PENDING_BANKING' && <>
                      <button onClick={() => updateStatus(b.id, 'ACTIVE')} className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700">Attiva</button>
                      <button onClick={() => updateStatus(b.id, 'SUSPENDED')} className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700">Sospendi</button>
                    </>}
                    {b.status === 'ACTIVE' && <button onClick={() => updateStatus(b.id, 'SUSPENDED')} className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700">Sospendi</button>}
                    {b.status === 'SUSPENDED' && <button onClick={() => updateStatus(b.id, 'ACTIVE')} className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700">Riattiva</button>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nessun business trovato</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
