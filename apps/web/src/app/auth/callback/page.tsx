'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Completamento accesso...')

  useEffect(() => {
    const code = searchParams.get('code')
    const redirectUri = window.location.origin + '/auth/callback'

    if (code) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri })
      })
        .then(res => res.json())
        .then(data => {
          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)
            setStatus('Accesso completato! Reindirizzamento...')
            setTimeout(() => router.push('/dashboard'), 1000)
          } else {
            setStatus('Errore: ' + (data.error || 'Accesso fallito'))
          }
        })
        .catch(() => setStatus('Errore di connessione'))
    } else {
      setStatus('Nessun codice di autorizzazione ricevuto')
    }
  }, [])

  return <p className="text-lg">{status}</p>
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center">
      <Suspense fallback={<p className="text-lg">Caricamento...</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  )
}