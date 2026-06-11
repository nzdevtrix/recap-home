'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const LEGAL_TYPES = [
  { value: 'INDIVIDUALE', label: 'Ditta Individuale' },
  { value: 'SNC', label: 'Società in Nome Collettivo (S.N.C.)' },
  { value: 'SAS', label: 'Società in Accomandita Semplice (S.A.S.)' },
  { value: 'SRL', label: 'Società a Responsabilità Limitata (S.R.L.)' },
  { value: 'SRLS', label: 'S.R.L. Semplificata' },
  { value: 'SPA', label: 'Società per Azioni (S.p.A.)' },
  { value: 'SAPA', label: 'Società in Accomandita per Azioni (S.A.p.A.)' },
  { value: 'COOPERATIVA', label: 'Società Cooperativa' },
  { value: 'CONSORZIO', label: 'Consorzio' },
  { value: 'ONLUS', label: 'Organizzazione Non Lucrativa (ONLUS)' },
  { value: 'FREELANCE', label: 'Libero Professionista' },
  { value: 'ALTRO', label: 'Altro' }
]

const BUSINESS_CATEGORIES = [
  { value: 'RISTORAZIONE', label: 'Ristorazione' },
  { value: 'FAST_FOOD', label: 'Fast Food / Street Food' },
  { value: 'BAR', label: 'Bar / Caffetteria' },
  { value: 'GELATERIA', label: 'Gelateria' },
  { value: 'PASTICCERIA', label: 'Pasticceria / Dolciumi' },
  { value: 'PANIFICIO', label: 'Panificio / Forno' },
  { value: 'RISTORANTE', label: 'Ristorante' },
  { value: 'PIZZERIA', label: 'Pizzeria' },
  { value: 'RISTORANTE_ETNICO', label: 'Ristorante Etnico' },
  { value: 'AGRITURISMO', label: 'Agriturismo' },
  { value: 'SUPERMERCATO', label: 'Supermercato' },
  { value: 'IPERMERCATO', label: 'Ipermercato' },
  { value: 'DISCOUNT', label: 'Discount Alimentare' },
  { value: 'MINIMERCATO', label: 'Minimercato / Drogheria' },
  { value: 'NEGOZIO_ALIMENTARI', label: 'Negozio di Alimentari' },
  { value: 'MACELLERIA', label: 'Macelleria' },
  { value: 'PESCHERIA', label: 'Pescheria' },
  { value: 'ORTOFRUTTA', label: 'Frutta e Verdura' },
  { value: 'FORMAGGIO', label: 'Formaggeria / Latticini' },
  { value: 'SALUMERIA', label: 'Salumeria' },
  { value: 'ENOTECA', label: 'Enoteca' },
  { value: 'OLIO', label: 'Oleificio' },
  { value: 'GASTRONOMIA', label: 'Gastronomia' },
  { value: 'RISTORAZIONE_COLLETTIVA', label: 'Ristorazione Collettiva (Mense, Catering)' },
  { value: 'CATERING', label: 'Catering per Eventi' },
  { value: 'COMMERCIO_ELETTRONICO', label: 'E-commerce Alimentare' },
  { value: 'PRODOTTI_BIOLOGICI', label: 'Prodotti Biologici e Naturali' },
  { value: 'ALIMENTI_ANIMALI', label: 'Alimenti per Animali' },
  { value: 'BEVANDE', label: 'Produzione e Vendita Bevande' },
  { value: 'ALTRO', label: 'Altro' }
]

const steps = ['Attività', 'Legale Rappresentante', 'Bancari', 'Accesso']

export default function BusinessRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')

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

  const [form, setForm] = useState({
    // Step 1 - Business
    legalName: '', legalType: 'INDIVIDUALE', vatId: '', businessCategory: '',
    businessAddress: '', city: '', postalCode: '', phone: '',
    // Step 2 - Legal Rep
    ownerFullName: '', ownerDob: '', ownerPlaceOfBirth: '',
    ownerCodiceFiscale: '', ownerResidence: '', pecAddress: '',
    // Step 3 - Banking
    iban: '', bicSwift: '', accountHolderName: '', bankName: '', bankProofDoc: '',
    // Step 4 - Credentials
    username: '', email: '', password: '', confirmPassword: ''
  })

  const update = (field: string, value: string) => setForm({ ...form, [field]: value })

  const nextStep = () => { setError(''); setStep(s => Math.min(s + 1, steps.length - 1)) }
  const prevStep = () => { setError(''); setStep(s => Math.max(s - 1, 0)) }

  const validateStep = (): boolean => {
    if (step === 0 && !form.legalName) { setError('Inserisci il nome dell\'attività'); return false }
    if (step === 0 && !form.vatId) { setError('Inserisci la Partita IVA'); return false }
    if (step === 1 && !form.ownerFullName) { setError('Inserisci il nome del legale rappresentante'); return false }
    if (step === 1 && !form.ownerCodiceFiscale) { setError('Inserisci il Codice Fiscale'); return false }
    if (step === 1 && !form.ownerDob) { setError('Inserisci la data di nascita'); return false }
    if (step === 2 && !form.iban) { setError('Inserisci l\'IBAN'); return false }
    if (step === 2 && !form.bicSwift) { setError('Inserisci il BIC/SWIFT'); return false }
    if (step === 3 && !form.email) { setError('Inserisci l\'email'); return false }
    if (step === 3 && !form.password) { setError('Inserisci la password'); return false }
    if (step === 3 && form.password !== form.confirmPassword) { setError('Le password non corrispondono'); return false }
    if (step === 3 && form.password.length < 8) { setError('La password deve essere di almeno 8 caratteri'); return false }
    return true
  }

  const handleNext = () => {
    if (validateStep()) nextStep()
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/register/business`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
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
            <Label>Nome dell Ditta/Azienda *</Label>
            <Input value={form.legalName} onChange={e => update('legalName', e.target.value)} placeholder="Ragione sociale" />
          </div>
          <div>
            <Label>Tipo di Attività *</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.legalType} onChange={e => update('legalType', e.target.value)}>
              {LEGAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <Label>Partita IVA *</Label>
            <Input value={form.vatId} onChange={e => update('vatId', e.target.value)} placeholder="IT00000000000" />
          </div>
          <div>
            <Label>Categoria *</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.businessCategory} onChange={e => update('businessCategory', e.target.value)}>
              <option value="">Seleziona categoria...</option>
              {BUSINESS_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <Label>Indirizzo Sede *</Label>
            <Input value={form.businessAddress} onChange={e => update('businessAddress', e.target.value)} placeholder="Via, numero, città" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Città</Label>
              <Input value={form.city} onChange={e => update('city', e.target.value)} />
            </div>
            <div>
              <Label>CAP</Label>
              <Input value={form.postalCode} onChange={e => update('postalCode', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Telefono</Label>
            <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+39 000 000 0000" />
          </div>
        </div>
      )
      case 1: return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Inserisci i dati del Legale Rappresentante / Titolare</p>
          <div>
            <Label>Nome e Cognome Completo *</Label>
            <Input value={form.ownerFullName} onChange={e => update('ownerFullName', e.target.value)} placeholder="Mario Rossi" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data di Nascita *</Label>
              <Input type="date" value={form.ownerDob} onChange={e => update('ownerDob', e.target.value)} />
            </div>
            <div>
              <Label>Luogo di Nascita *</Label>
              <Input value={form.ownerPlaceOfBirth} onChange={e => update('ownerPlaceOfBirth', e.target.value)} placeholder="Roma" />
            </div>
          </div>
          <div>
            <Label>Codice Fiscale *</Label>
            <Input value={form.ownerCodiceFiscale} onChange={e => update('ownerCodiceFiscale', e.target.value)} placeholder="RSSMRA80A01H501U" className="uppercase" />
          </div>
          <div>
            <Label>Residenza *</Label>
            <Input value={form.ownerResidence} onChange={e => update('ownerResidence', e.target.value)} placeholder="Via della Residenza, 1" />
          </div>
          <div>
            <Label>Email PEC</Label>
            <Input type="email" value={form.pecAddress} onChange={e => update('pecAddress', e.target.value)} placeholder="pec@pec.it" />
          </div>
        </div>
      )
      case 2: return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Inserisci i dati bancari per ricevere i pagamenti. Verranno verificati prima dell'attivazione.</p>
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
            <Input value={form.bankName} onChange={e => update('bankName', e.target.value)} placeholder="Intesa Sanpaolo, Unicredit, ecc." />
          </div>
          <div>
            <Label>Documento di Prova *</Label>
            <Input type="file" accept="image/*,application/pdf" onChange={e => e.target.files?.[0] && uploadFile('bankProofDoc', e.target.files[0])} />
            {uploading === 'bankProofDoc' && <p className="text-xs text-muted-foreground mt-1">Caricamento...</p>}
            {form.bankProofDoc && <p className="text-xs text-green-600 mt-1">✓ Caricato</p>}
            <p className="text-xs text-muted-foreground mt-1">Carica una scansione o foto dell'intestazione del conto (estratto conto, modulo IBAN)</p>
          </div>
        </div>
      )
      case 3: return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Imposta le credenziali di accesso per Recap Home</p>
          <div>
            <Label>Username</Label>
            <Input value={form.username} onChange={e => update('username', e.target.value)} placeholder="Scegli un username" />
          </div>
          <div>
            <Label>Email di Accesso *</Label>
            <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@esempio.com" />
          </div>
          <div>
            <Label>Password *</Label>
            <Input type="password" value={form.password} onChange={e => update('password', e.target.value)} minLength={8} />
          </div>
          <div>
            <Label>Conferma Password *</Label>
            <Input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Registrazione Attività</CardTitle>
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
                {loading ? 'Invio in corso...' : 'Completa Registrazione'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}