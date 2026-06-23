import { ShoppingCart, AtSign } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-12 text-center">
        <span className="flex items-center gap-2 text-xl font-bold">
          <ShoppingCart className="size-6" aria-hidden="true" />
          Carrinho Carioca
        </span>
        <p className="max-w-sm text-pretty text-primary-foreground/90">
          Compare preços dos supermercados do Rio de Janeiro.
        </p>

        <a
          href="https://instagram.com/carrinhocarioca21"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-primary-foreground/25"
        >
          <AtSign className="size-4" aria-hidden="true" />
          @carrinhocarioca21
        </a>

        <p className="mt-4 text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Carrinho Carioca · O Rio compra melhor aqui.
        </p>
        <a
          href="/admin"
          className="text-xs text-primary-foreground/60 underline-offset-4 transition-colors hover:text-primary-foreground hover:underline"
        >
          Acesso administrativo
        </a>
      </div>
    </footer>
  )
}
