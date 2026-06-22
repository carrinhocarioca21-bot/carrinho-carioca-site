import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

const exemplos = ["Heineken", "Picanha", "Café Pilão", "Leite"]

export function HeroSearch() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
        <span className="inline-flex items-center rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
          Barra · Recreio · Jacarepaguá
        </span>
        <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
          Carrinho Carioca
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
          Compare preços e descubra onde comprar mais barato.
        </p>

        <form
          className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          role="search"
        >
          <label htmlFor="busca" className="sr-only">
            O que você procura hoje?
          </label>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="busca"
              type="search"
              placeholder="O que você procura hoje?"
              className="h-12 w-full rounded-xl border border-transparent bg-background pl-11 pr-4 text-base text-foreground shadow-sm outline-none ring-offset-2 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary-foreground"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 bg-background text-primary hover:bg-background/90"
          >
            Buscar
          </Button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-primary-foreground/70">Exemplos:</span>
          {exemplos.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-full border border-primary-foreground/30 px-3 py-1 text-sm transition-colors hover:bg-primary-foreground/15"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
