'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RiderStatusPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ status: string; message: string } | null>(null)
  const [error, setError] = useState('')

  const sendOtp = async () => {
    if (!email) { setError('Inserisci la tua email'); return }
    setLoading(true); setError(''); setStatus(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/register/rider/check-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOtpSent(true)
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  const verifyOtp = async () => {
    if (!otp) { setError('Inserisci il codice OTP'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/register/rider/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus(data)
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200'
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'In Revisione',
    APPROVED: 'Approvata',
    REJECTED: 'Respinta'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verifica Stato Candidatura</CardTitle>
          <CardDescription>{otpSent ? 'Inserisci il codice ricevuto via email' : 'Inserisci l\'email usata per la candidatura'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!otpSent ? (
            <>
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@esempio.com" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={sendOtp} disabled={loading} className="w-full">
                {loading ? 'Invio...' : 'Invia Codice di Verifica'}
              </Button>
            </>
          ) : !status ? (
            <>
              <div>
                <Label>Codice OTP</Label>
                <Input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={verifyOtp} disabled={loading} className="w-full">
                {loading ? 'Verifica...' : 'Verifica Codice'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Non hai ricevuto il codice? <button onClick={sendOtp} className="text-primary hover:underline">Invia di nuovo</button>
              </p>
            </>
          ) : (
            <div className={`p-4 rounded-lg border ${statusColors[status.status] || 'bg-gray-100'}`}>
              <p className="font-semibold">Stato: {statusLabels[status.status] || status.status}</p>
              <p className="text-sm mt-1">{status.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
