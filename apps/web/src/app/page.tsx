import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const features = [
    {
      icon: "🚀",
      title: "Consegne Lampo",
      description: "Ordina e ricevi in pochissimi minuti con la nostra rete di rider professionisti",
    },
    {
      icon: "🗺️",
      title: "Tracking in Tempo Reale",
      description: "Segui il tuo ordine in tempo reale sulla mappa con aggiornamenti live",
    },
    {
      icon: "💼",
      title: "Per Aziende",
      description: "Espandi il tuo business con consegne rapide e gestione ordini semplificata",
    },
    {
      icon: "💰",
      title: "Guadagna come Rider",
      description: "Lavora quando vuoi, scegli le consegne e guadagna con flessibilità",
    },
    {
      icon: "🛡️",
      title: "Sicurezza Totale",
      description: "Pagamenti sicuri, verifica identità e supporto 24/7 per tutti gli utenti",
    },
    {
      icon: "🌍",
      title: "Copertura Nazionale",
      description: "Attivi in tutte le principali città italiane: Milano, Roma, Napoli e altro",
    },
  ]

  const stats = [
    { number: "10K+", label: "Utenti Attivi" },
    { number: "500+", label: "Rider Professionisti" },
    { number: "200+", label: "Business Partner" },
    { number: "50+", label: "Città Coperte" },
  ]

  const userTypes = [
    {
      title: "Cliente Privato",
      description: "Ordina cibo, spesa o qualsiasi prodotto e ricevilo a casa",
      icon: "🛒",
      cta: "Ordina Ora",
      href: "/register/private",
      color: "from-primary to-secondary",
    },
    {
      title: "Rider",
      description: "Guadagna consegnando ordini con orari flessibili",
      icon: "🏍️",
      cta: "Diventa Rider",
      href: "/register/rider",
      color: "from-secondary to-accent",
    },
    {
      title: "Business",
      description: "Aumenta le vendite con consegne rapide e gestione integrata",
      icon: "🏪",
      cta: "Registra Business",
      href: "/register/business",
      color: "from-accent to-primary",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in slide-up">
              <span>✨</span>
              <span>La piattaforma #1 per consegne in Italia</span>
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-in slide-up delay-100">
              Consegne {
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Rapide e Sicure
                </span>
              } in Tutta Italia
            </h1>

            {/* Hero Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in slide-up delay-200">
              Connettiamo clienti, rider e business in un&apos;unica piattaforma.
              Ordina, consegna o gestisci il tuo business con Recap Home.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center animate-in slide-up delay-300">
              <Button size="lg" className="gap-2 hover-lift" asChild>
                <Link href="/register">
                  <span>🚀</span>
                  Inizia Ora - Gratis
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <Link href="/tracking">
                  <span>🗺️</span>
                  Traccia il tuo Ordine
                </Link>
              </Button>
            </div>

            {/* Hero Image / Illustration */}
            <div className="mt-16 animate-in slide-up delay-400">
              <div className="relative max-w-2xl mx-auto">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🏍️</div>
                    <p className="text-muted-foreground">
                      Illustrazione: Rider in consegna
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => (
              <Card
                key={stat.label}
                className="animate-in slide-up delay-{index * 100}"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="py-6">
                  <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Scegli il tuo Ruolo
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recap Home è progettato per tutti: clienti, rider e business.
              Seleziona il tuo ruolo e inizia subito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userTypes.map((type, index) => (
              <Card
                key={type.title}
                className="group hover-lift transition-all duration-300 animate-in slide-up delay-{index * 200}"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader className={`bg-gradient-to-br ${type.color} rounded-t-xl`}>
                  <div className="text-center">
                    <div className="text-5xl mb-4">{type.icon}</div>
                    <CardTitle className="text-xl font-bold text-white">
                      {type.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-6">{type.description}</p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={type.href}>
                      {type.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perché Scegliere Recap Home?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tutte le funzionalità di cui hai bisogno per consegne perfette.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group hover-scale transition-all duration-300 animate-in slide-up delay-{index * 100}"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{feature.icon}</div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary to-secondary border-0">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Pronto a Iniziare?
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Unisciti a migliaia di utenti soddisfatti e inizia a usare Recap Home oggi stesso.
                Registrazione gratuita, senza impegno.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="gap-2 bg-white text-primary hover:bg-white/90" asChild>
                  <Link href="/register">
                    <span>🚀</span>
                    Registrati Gratis
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="gap-2 text-white border-white/30 hover:bg-white/10" asChild>
                  <Link href="/auth/login">
                    <span>🔑</span>
                    Ho già un Account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
