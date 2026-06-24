import { ShoppingCart, Mail } from "lucide-react"

function InstagramGlyph() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Instagram"
      className="shrink-0"
    >
      <defs>
        <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-gradient)" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="#fff" />
    </svg>
  )
}

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

        <div className="mt-2 flex w-full flex-col items-center gap-3">
          <a
            href="https://instagram.com/carrinhocarioca21"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full max-w-[320px] items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/20 sm:max-w-[420px]"
          >
            <InstagramGlyph />
            @carrinhocarioca21
          </a>

          <a
            href="mailto:carrinhocarioca21@gmail.com"
            className="flex w-full max-w-[320px] items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/20 sm:max-w-[420px]"
          >
            <Mail className="size-5 shrink-0" aria-hidden="true" />
            carrinhocarioca21@gmail.com
          </a>
        </div>

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
