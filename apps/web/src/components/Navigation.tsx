"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/register')
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/orders') || pathname?.startsWith('/tracking')

  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/#features', label: 'Funzionalità', icon: '✨' },
    { href: '/#how-it-works', label: 'Come Funziona', icon: '⚡' },
    { href: '/#pricing', label: 'Prezzi', icon: '💰' },
  ]

  const authLinks = [
    { href: '/register', label: 'Registrati', variant: 'outline' },
    { href: '/auth/login', label: 'Accedi', variant: 'default' },
  ]

  const userLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/orders', label: 'Ordini', icon: '📦' },
    { href: '/tracking', label: 'Traccia', icon: '🗺️' },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/95 backdrop-blur-lg shadow-lg" : "bg-background/80",
        isAuthPage || isDashboard ? "hidden" : "block"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Recap<span className="text-accent">Home</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-primary/10 hover:text-primary",
                  pathname === link.href ? "bg-primary/10 text-primary" : "text-foreground/80"
                )}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isDashboard ? (
              userLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
                    pathname?.startsWith(link.href) 
                      ? "bg-primary text-primary-foreground" 
                      : "text-foreground/80 hover:bg-muted"
                  )}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))
            ) : (
              authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    Button({ variant: link.variant as any }),
                    "text-sm font-medium"
                  )}
                >
                  {link.label}
                </Link>
              ))
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="text-xl">☰</span>
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t">
            <div className="flex flex-col gap-2 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                    "hover:bg-primary/10 hover:text-primary",
                    pathname === link.href ? "bg-primary/10 text-primary" : "text-foreground/80"
                  )}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t my-2" />
              
              {isDashboard ? (
                userLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                      pathname?.startsWith(link.href) 
                        ? "bg-primary text-primary-foreground" 
                        : "text-foreground/80 hover:bg-muted"
                    )}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                ))
              ) : (
                authLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors text-center",
                      link.variant === 'default' ? "bg-primary text-primary-foreground" : ""
                    )}
                  >
                    {link.label}
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
