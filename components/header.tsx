"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Social Networks", href: "/social-networks" },
  { name: "Visualizations", href: "/visualizations" },
  { name: "Insights", href: "/insights" },
  { name: "Passports", href: "/passports" },
  { name: "Conversation Log", href: "/conversation-log" },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg">
            AAC Personalization
          </Link>
          <nav className="hidden md:flex gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/profile">Profile</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
