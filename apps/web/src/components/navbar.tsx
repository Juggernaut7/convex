"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { WalletConnectButton } from "@/components/connect-button"
import convexLogo from "@/assets/convex.png"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Markets", href: "/markets" },
  { name: "Create", href: "/create" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Docs", href: "https://docs.celo.org", external: true },
]

export function Navbar() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex items-center gap-2 mb-8">
                <Image
                  src={convexLogo}
                  alt="Convex logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-contain"
                  priority
                />
                <span className="font-bold text-lg text-[#0F172A]">
                  Convex
                </span>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-2 text-base font-medium transition-colors hover:text-primary ${
                      pathname === link.href.replace(/#.*/, "") ? "text-foreground" : "text-foreground/70"
                    }`}
                  >
                    {link.name}
                    {link.external && <ExternalLink className="h-4 w-4" />}
                  </Link>
                ))}
                <div className="mt-6 pt-6 border-t">
                  <Button asChild className="w-full">
                    <WalletConnectButton />
                  </Button>
                </div>
                <div className="pt-4">
                  <Button asChild className="w-full bg-[#111827] text-white hover:bg-[#0b152b]">
                    <Link href="/create">Create market</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src={convexLogo}
              alt="Convex logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-contain"
              priority
            />
            <span className="hidden font-bold text-xl text-[#0F172A] sm:inline-block">
              Convex
            </span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href.replace(/#.*/, "")
                  ? "text-foreground"
                  : "text-foreground/70"
              }`}
            >
              {link.name}
              {link.external && <ExternalLink className="h-4 w-4" />}
            </Link>
          ))}
          
          <div className="flex items-center gap-3">
            <WalletConnectButton />
            <Button asChild className="rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b152b]">
              <Link href="/create">Create market</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
