'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ToastProvider'

interface Rider { id: string; fullName: string; email: string; codiceFiscale: string; approvalStatus: string; nationality: string; createdAt: string; user?: { email: string } }

export default function RidersPage() {
  const { toast } = useToast()
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const load = async () => {
    const token = localStorage.getItem('accessToken')
    try {
      const res = await fetch(`${API}/admin/users?role=RIDER`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setRiders(Array.isArray(data) ? data : data?.users || [])
    } catch (e) { toast({ title: 'Error loading riders', variant: 'destructive' }) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('accessToken')
    try {
      const res = await fetch(`${API}/riders/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approvalStatus: status })
      })
      if (!res.ok) throw new Error('Failed')
      toast({ title: `Rider ${status === 'APPROVED' ? 'approvato' : 'respinto'}` })
      load()
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }) }
  }

  const filtered = filter === 'ALL' ? riders : riders.filter(r => r.approvalStatus === filter)

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { PENDING: 'bg-yellow-100 text-yellow-800', APPROVED: 'bg-green-100 text-green-800', REJECTED: 'bg-red-100 text-red-800' }
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[s] || 'bg-gray-100'}`}>{s}</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Rider Applications</h1>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr><th className="text-left p-3">Nome</th><th className="text-left p-3">Email</th><th className="text-left p-3">Codice Fiscale</th><th className="text-left p-3">Nazionalità</th><th className="text-left p-3">Stato</th><th className="text-left p-3">Azioni</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{r.fullName}</td>
                  <td className="p-3">{r.user?.email || '-'}</td>
                  <td className="p-3 font-mono text-xs">{r.codiceFiscale}</td>
                  <td className="p-3">{r.nationality}</td>
                  <td className="p-3">{statusBadge(r.approvalStatus)}</td>
                  <td className="p-3 space-x-2">
                    {r.approvalStatus === 'PENDING' && <>
                      <button onClick={() => updateStatus(r.id, 'APPROVED')} className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700">Approva</button>
                      <button onClick={() => updateStatus(r.id, 'REJECTED')} className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700">Respingi</button>
                    </>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nessun rider trovato</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
