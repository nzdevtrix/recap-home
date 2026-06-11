'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const steps = ['Dati Personali', 'Residenza e Lavoro', 'Documenti', 'Bancari', 'Accesso']

export default function RiderRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    // Step 1 - Personal details
    fullName: '', dateOfBirth: '', placeOfBirth: '', nationality: 'Italiana',
    codiceFiscale: '',
    // Step 2 - Address & work
    residenceAddress: '', domicileAddress: '', desiredWorkCity: '',
    hasBusiness: 'false', vatId: '',
    // Step 3 - Documents
    identityFrontUrl: '', identityBackUrl: '',
    permessoDiSoggiornoUrl: '', tesseraSanitariaUrl: '',
    // Step 4 - Banking
    iban: '', bicSwift: '', accountHolderName: '', bankName: '', bankProofDoc: '',
    // Step 5 - Email access
    email: ''
  })

  const [uploading, setUploading] = useState<string | null>(null)

  const uploadFile = async (field: string, file: File) => {
    setUploading(field)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm({ ...form, [field]: data.url })
    } catch (err: any) {
      setError(err.message)
    }
    setUploading(null)
  }

  const update = (field: string, value: string) => setForm({ ...form, [field]: value })

  const nextStep = () => { setError(''); setStep(s => Math.min(s + 1, steps.length - 1)) }
  const prevStep = () => { setError(''); setStep(s => Math.max(s - 1, 0)) }

  const isItalian = form.nationality?.toLowerCase() === 'italiana' || form.nationality?.toLowerCase() === 'italian'

  const validateStep = (): boolean => {
    switch (step) {
      case 0:
        if (!form.fullName) { setError('Inserisci il nome completo'); return false }
        if (!form.dateOfBirth) { setError('Inserisci la data di nascita'); return false }
        if (!form.placeOfBirth) { setError('Inserisci il luogo di nascita'); return false }
        if (!form.nationality) { setError('Inserisci la nazionalità'); return false }
        if (!form.codiceFiscale) { setError('Inserisci il Codice Fiscale'); return false }
        return true
      case 1:
        if (!form.residenceAddress) { setError('Inserisci la residenza'); return false }
        if (!form.desiredWorkCity) { setError('Indica dove vuoi lavorare'); return false }
        return true
      case 2:
        if (!form.identityFrontUrl) { setError('Carica il fronte della Carta d\'Identità'); return false }
        if (!form.identityBackUrl) { setError('Carica il retro della Carta d\'Identità'); return false }
        if (!isItalian && !form.permessoDiSoggiornoUrl) { setError('Il Permesso di Soggiorno è obbligatorio per cittadini non italiani'); return false }
        if (!form.tesseraSanitariaUrl) { setError('Carica la Tessera Sanitaria'); return false }
        return true
      case 3:
        if (!form.iban) { setError('Inserisci l\'IBAN'); return false }
        if (!form.bicSwift) { setError('Inserisci il BIC/SWIFT'); return false }
        return true
      case 4:
        if (!form.email) { setError('Inserisci l\'email'); return false }
        return true
    }
    return true
  }

  const handleNext = () => { if (validateStep()) nextStep() }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/register/rider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          hasBusiness: form.hasBusiness === 'true'
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <div>
            <Label>Nome e Cognome Completo *</Label>
            <Input value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Mario Rossi" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data di Nascita *</Label>
              <Input type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} />
            </div>
            <div>
              <Label>Luogo di Nascita *</Label>
              <Input value={form.placeOfBirth} onChange={e => update('placeOfBirth', e.target.value)} placeholder="Roma" />
            </div>
          </div>
          <div>
            <Label>Nazionalità *</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.nationality} onChange={e => update('nationality', e.target.value)}>
              <option value="Italiana">Italiana</option>
              <option value="Albanese">Albanese</option>
              <option value="Algerina">Algerina</option>
              <option value="Argentina">Argentina</option>
              <option value="Brasiliana">Brasiliana</option>
              <option value="Bulgaria">Bulgaria</option>
              <option value="Cinese">Cinese</option>
              <option value="Congolese">Congolese</option>
              <option value="Croata">Croata</option>
              <option value="Egiziana">Egiziana</option>
              <option value="Filippina">Filippina</option>
              <option value="Francese">Francese</option>
              <option value="Gambiana">Gambiana</option>
              <option value="Ghanese">Ghanese</option>
              <option value="Giapponese">Giapponese</option>
              <option value="Greca">Greca</option>
              <option value="Indiana">Indiana</option>
              <option value="Irachena">Irachena</option>
              <option value="Iraniana">Iraniana</option>
              <option value="Kosovara">Kosovara</option>
              <option value="Macedone">Macedone</option>
              <option value="Moldava">Moldava</option>
              <option value="Montenegrina">Montenegrina</option>
              <option value="Nigeriana">Nigeriana</option>
              <option value="Pakistana">Pakistana</option>
              <option value="Polacca">Polacca</option>
              <option value="Romena">Romena</option>
              <option value="Russa">Russa</option>
              <option value="Senegalese">Senegalese</option>
              <option value="Serba">Serba</option>
              <option value="Spagnola">Spagnola</option>
              <option value="Sri Lankese">Sri Lankese</option>
              <option value="Statunitense">Statunitense</option>
              <option value="Svizzera">Svizzera</option>
              <option value="Tedesca">Tedesca</option>
              <option value="Tunisina">Tunisina</option>
              <option value="Turca">Turca</option>
              <option value="Ucraina">Ucraina</option>
              <option value="Altro">Altro</option>
            </select>
          </div>
          <div>
            <Label>Codice Fiscale *</Label>
            <Input value={form.codiceFiscale} onChange={e => update('codiceFiscale', e.target.value)} placeholder="RSSMRA80A01H501U" className="uppercase" />
          </div>
        </div>
      )
      case 1: return (
        <div className="space-y-4">
          <div>
            <Label>Indirizzo di Residenza *</Label>
            <Input value={form.residenceAddress} onChange={e => update('residenceAddress', e.target.value)} placeholder="Via della Residenza, 1, Città" />
          </div>
          <div>
            <Label>Indirizzo di Domicilio (se diverso)</Label>
            <Input value={form.domicileAddress} onChange={e => update('domicileAddress', e.target.value)} placeholder="Via del Domicilio, 2, Città" />
          </div>
          <div>
            <Label>Dove desideri lavorare? *</Label>
            <Input value={form.desiredWorkCity} onChange={e => update('desiredWorkCity', e.target.value)} placeholder="Milano, Roma, Torino, ecc." />
          </div>
          <div>
            <Label>Possiedi una Partita IVA?</Label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2">
                <input type="radio" name="hasBusiness" value="true" checked={form.hasBusiness === 'true'} onChange={e => update('hasBusiness', e.target.value)} />
                Sì
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="hasBusiness" value="false" checked={form.hasBusiness === 'false'} onChange={e => update('hasBusiness', e.target.value)} />
                No
              </label>
            </div>
          </div>
          {form.hasBusiness === 'true' && (
            <div>
              <Label>Partita IVA</Label>
              <Input value={form.vatId} onChange={e => update('vatId', e.target.value)} placeholder="IT00000000000" />
            </div>
          )}
        </div>
      )
      case 2: return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Carica le scansioni dei seguenti documenti</p>
          <div>
            <Label>Fronte Carta d'Identità *</Label>
            <Input type="file" accept="image/*,application/pdf" onChange={e => e.target.files?.[0] && uploadFile('identityFrontUrl', e.target.files[0])} />
            {uploading === 'identityFrontUrl' && <p className="text-xs text-muted-foreground mt-1">Caricamento...</p>}
            {form.identityFrontUrl && <p className="text-xs text-green-600 mt-1">✓ Caricato</p>}
          </div>
          <div>
            <Label>Retro Carta d'Identità *</Label>
            <Input type="file" accept="image/*,application/pdf" onChange={e => e.target.files?.[0] && uploadFile('identityBackUrl', e.target.files[0])} />
            {uploading === 'identityBackUrl' && <p className="text-xs text-muted-foreground mt-1">Caricamento...</p>}
            {form.identityBackUrl && <p className="text-xs text-green-600 mt-1">✓ Caricato</p>}
          </div>
          {!isItalian && (
            <div>
              <Label>Permesso di Soggiorno *</Label>
              <Input type="file" accept="image/*,application/pdf" onChange={e => e.target.files?.[0] && uploadFile('permessoDiSoggiornoUrl', e.target.files[0])} />
              {uploading === 'permessoDiSoggiornoUrl' && <p className="text-xs text-muted-foreground mt-1">Caricamento...</p>}
              {form.permessoDiSoggiornoUrl && <p className="text-xs text-green-600 mt-1">✓ Caricato</p>}
              <p className="text-xs text-muted-foreground mt-1">Obbligatorio per cittadini non italiani</p>
            </div>
          )}
          <div>
            <Label>Tessera Sanitaria *</Label>
            <Input type="file" accept="image/*,application/pdf" onChange={e => e.target.files?.[0] && uploadFile('tesseraSanitariaUrl', e.target.files[0])} />
            {uploading === 'tesseraSanitariaUrl' && <p className="text-xs text-muted-foreground mt-1">Caricamento...</p>}
            {form.tesseraSanitariaUrl && <p className="text-xs text-green-600 mt-1">✓ Caricato</p>}
          </div>
        </div>
      )
      case 3: return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Inserisci i dati bancari per ricevere i pagamenti</p>
          <div>
            <Label>IBAN *</Label>
            <Input value={form.iban} onChange={e => update('iban', e.target.value)} placeholder="IT00X0000000000000000000000" className="uppercase" />
          </div>
          <div>
            <Label>BIC / SWIFT *</Label>
            <Input value={form.bicSwift} onChange={e => update('bicSwift', e.target.value)} placeholder="UNCRITMMXXX" className="uppercase" />
          </div>
          <div>
            <Label>Intestatario Conto *</Label>
            <Input value={form.accountHolderName} onChange={e => update('accountHolderName', e.target.value)} placeholder="Come da IBAN" />
          </div>
          <div>
            <Label>Nome Banca</Label>
            <Input value={form.bankName} onChange={e => update('bankName', e.target.value)} placeholder="Nome della banca" />
          </div>
          <div>
            <Label>Documento di Prova *</Label>
            <Input type="file" accept="image/*,application/pdf" onChange={e => e.target.files?.[0] && uploadFile('bankProofDoc', e.target.files[0])} />
            {uploading === 'bankProofDoc' && <p className="text-xs text-muted-foreground mt-1">Caricamento...</p>}
            {form.bankProofDoc && <p className="text-xs text-green-600 mt-1">✓ Caricato</p>}
            <p className="text-xs text-muted-foreground mt-1">Scansione o foto dell'intestazione del conto corrente</p>
          </div>
        </div>
      )
      case 4: return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Inserisci la tua email per ricevere notifiche sullo stato della candidatura</p>
          <div>
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@esempio.com" />
          </div>
          <p className="text-sm text-muted-foreground">
            Riceverai un'email con le istruzioni per verificare lo stato della tua candidatura.
            Potrai accedere al portale rider solo dopo l'approvazione dell'amministratore.
          </p>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Candidatura Rider</CardTitle>
          <CardDescription>Passo {step + 1} di {steps.length}: {steps[step]}</CardDescription>
          <div className="flex gap-2 mt-2">
            {steps.map((s, i) => (
              <div key={i} className={`h-1 flex-1 rounded ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {renderStep()}
          {error && <p className="text-sm text-destructive mt-4">{error}</p>}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={step === 0 ? () => router.push('/register') : prevStep} disabled={loading}>
              {step === 0 ? 'Indietro' : 'Precedente'}
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={handleNext}>Continua</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Invio in corso...' : 'Invia Candidatura'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}