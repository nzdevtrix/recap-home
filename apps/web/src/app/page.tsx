import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Recap Home</h1>
        <nav className="space-x-4">
          <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
          <Link href="/orders" className="text-sm hover:underline">Orders</Link>
          <Link href="/tracking" className="text-sm hover:underline">Track</Link>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">Delivery & Logistics Platform</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Real-time tracking, multi-role support, and AI-powered assistance for all your delivery needs.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-6 text-sm font-medium">
            Get Started
          </Link>
          <Link href="/tracking" className="inline-flex items-center justify-center rounded-md border border-input bg-background h-10 px-6 text-sm font-medium">
            Track Order
          </Link>
        </div>
      </main>
    </div>
  )
}