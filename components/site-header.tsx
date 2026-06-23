import { ShoppingCart } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <a href="#" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShoppingCart className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Carrinho <span className="text-primary">Carioca</span>
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          <a href="/#top-dia" className="transition-colors hover:text-foreground">
            Top 10
          </a>
          <a href="/ofertas" className="transition-colors hover:text-foreground">
            Todas as Ofertas
          </a>
          <a href="/#mercados" className="transition-colors hover:text-foreground">
            Mercados
          </a>
        </nav>
      </div>
    </header>
  )
}
