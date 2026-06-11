'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PrivateRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Le password non corrispondono')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/register/private`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          email: form.email,
          password: form.password
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/auth/login?registered=true')
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleGoogleRegister = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google/url?redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Registrazione Privata</CardTitle>
          <CardDescription>Crea il tuo account personale</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome *</Label>
                <Input name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div>
                <Label>Cognome</Label>
                <Input name="lastName" value={form.lastName} onChange={handleChange} />
              </div>
            </div>
            <div>
              <Label>Username</Label>
              <Input name="username" value={form.username} onChange={handleChange} placeholder="Scegli un username" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <Label>Password *</Label>
              <Input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} />
            </div>
            <div>
              <Label>Conferma Password *</Label>
              <Input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrazione...' : 'Registrati'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Oppure</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleRegister}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Registrati con Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Hai già un account? <a href="/auth/login" className="text-primary hover:underline">Accedi</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}