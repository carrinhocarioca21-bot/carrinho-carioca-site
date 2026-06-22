import { TrendingDown } from "lucide-react"

const ofertas = [
  { produto: "Antarctica 269ml", preco: "R$ 2,17", unidade: "unidade", mercado: "Guanabara" },
  { produto: "Picanha", preco: "R$ 88,98", unidade: "kg", mercado: "Guanabara" },
  { produto: "Heineken 269ml", preco: "R$ 3,79", unidade: "unidade", mercado: "Mundial" },
]

export function TopOfertas() {
  return (
    <section id="ofertas" className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
      <div className="flex items-center gap-2">
        <TrendingDown className="size-6 text-primary" aria-hidden="true" />
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Top Ofertas da Semana
        </h2>
      </div>
      <p className="mt-2 text-muted-foreground">
        Os melhores preços encontrados pelos cariocas nesta semana.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ofertas.map((oferta) => (
          <article
            key={oferta.produto}
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div>
              <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                {oferta.mercado}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-card-foreground">
                {oferta.produto}
              </h3>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <p className="text-3xl font-extrabold text-primary">
                {oferta.preco}
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  /{oferta.unidade}
                </span>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
