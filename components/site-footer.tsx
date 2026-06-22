import { ShoppingCart } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-12 text-center">
        <span className="flex items-center gap-2 text-lg font-bold">
          <ShoppingCart className="size-5" aria-hidden="true" />
          Carrinho Carioca
        </span>
        <p className="text-primary-foreground/90">O Rio compra melhor aqui.</p>
        <p className="mt-4 text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Carrinho Carioca
        </p>
      </div>
    </footer>
  )
}
