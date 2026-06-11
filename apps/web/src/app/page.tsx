import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">Recap Home</Link>
        <nav className="space-x-4 flex items-center">
          <Link href="/register" className="text-sm hover:underline">Registrati</Link>
          <Link href="/auth/login" className="text-sm hover:underline">Accedi</Link>
          <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">Delivery &amp; Logistics Platform</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Real-time tracking, multi-role support, and AI-powered assistance for all your delivery needs.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-6 text-sm font-medium">
            Registrati Ora
          </Link>
          <Link href="/auth/login" className="inline-flex items-center justify-center rounded-md border border-input bg-background h-10 px-6 text-sm font-medium">
            Accedi
          </Link>
          <Link href="/tracking" className="inline-flex items-center justify-center rounded-md border border-input bg-background h-10 px-6 text-sm font-medium">
            Traccia Ordine
          </Link>
        </div>
      </main>
    </div>
  )
}