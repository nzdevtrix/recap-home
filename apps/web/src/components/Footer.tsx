import Link from "next/link"
import { Button } from "./ui/button"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  const footerLinks = {
    platform: [
      { href: '/', label: 'Home' },
      { href: '/register', label: 'Registrati' },
      { href: '/auth/login', label: 'Accedi' },
      { href: '/tracking', label: 'Traccia Ordine' },
    ],
    services: [
      { href: '/#delivery', label: 'Consegne Rapide' },
      { href: '/#rider', label: 'Diventa Rider' },
      { href: '/#business', label: 'Business' },
      { href: '/#api', label: 'API' },
    ],
    company: [
      { href: '/about', label: 'Chi Siamo' },
      { href: '/contact', label: 'Contattaci' },
      { href: '/careers', label: 'Lavora con Noi' },
      { href: '/blog', label: 'Blog' },
    ],
    legal: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Termini di Servizio' },
      { href: '/cookies', label: 'Cookie Policy' },
      { href: '/gdpr', label: 'GDPR' },
    ],
  }

  const socialLinks = [
    { href: 'https://facebook.com/recap.home', icon: '📘', label: 'Facebook' },
    { href: 'https://twitter.com/recap_home', icon: '🐦', label: 'Twitter' },
    { href: 'https://instagram.com/recap.home', icon: '📷', label: 'Instagram' },
    { href: 'https://linkedin.com/company/recap-home', icon: '💼', label: 'LinkedIn' },
    { href: 'https://youtube.com/recap.home', icon: '📺', label: 'YouTube' },
  ]

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
              Recap<span className="text-accent">Home</span>
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              La piattaforma di consegne più veloce e affidabile in Italia.
              Connetti clienti, rider e business in un'unica soluzione.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/register">
                  <span className="text-xs">📦 Inizia Ora</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4">Piattaforma</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-semibold mb-4">Servizi</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Azienda</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Secondary Footer */}
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Legal Links */}
            <div className="flex flex-wrap gap-4">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors text-lg"
                  title={social.label}
                >
                  <span>{social.icon}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Recap Home. Tutti i diritti riservati.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Made with ❤️ in Italy
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
