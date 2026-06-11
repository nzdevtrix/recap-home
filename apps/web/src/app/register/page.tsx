import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const roles = [
  {
    title: "Private",
    description: "Ordina e ricevi consegne come cliente privato",
    href: "/register/private",
    icon: "👤"
  },
  {
    title: "Business / Azienda",
    description: "Registra la tua attività per vendere e consegnare",
    href: "/register/business",
    icon: "🏪"
  },
  {
    title: "Rider / Corriere",
    description: "Candidati come fattorino per le consegne",
    href: "/register/rider",
    icon: "🛵"
  }
]

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold hover:underline">Recap Home</Link>
          <h1 className="text-3xl font-bold mt-4">Registrati su Recap Home</h1>
          <p className="text-muted-foreground mt-2">Scegli il tipo di account che desideri creare</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Link key={role.href} href={role.href}>
              <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="text-4xl mb-2">{role.icon}</div>
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-primary font-medium">Registrati →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <p className="text-center mt-8 text-sm text-muted-foreground">
          Hai già un account? <Link href="/auth/login" className="text-primary hover:underline">Accedi</Link>
        </p>
      </div>
    </div>
  )
}