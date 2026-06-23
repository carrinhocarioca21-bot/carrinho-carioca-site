import { TrendingDown, Medal, MapPin } from "lucide-react"

const ofertas = [
  {
    rank: 1,
    produto: "Antarctica 269ml",
    preco: "R$ 2,17",
    unidade: "unidade",
    mercado: "Guanabara",
    medalha: "text-amber-500",
    anel: "ring-amber-400/40",
  },
  {
    rank: 2,
    produto: "Heineken 269ml",
    preco: "R$ 3,79",
    unidade: "unidade",
    mercado: "Mundial",
    medalha: "text-slate-400",
    anel: "ring-slate-300/40",
  },
  {
    rank: 3,
    produto: "Picanha",
    preco: "R$ 88,98",
    unidade: "kg",
    mercado: "Guanabara",
    medalha: "text-orange-700",
    anel: "ring-orange-600/30",
  },
]

export function TopOfertas() {
  return (
    <section id="ofertas" className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
      <div className="animate-fade-up flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <TrendingDown className="size-5" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          Top Ofertas da Semana
        </h2>
      </div>
      <p className="animate-fade-up mt-2 text-muted-foreground" style={{ animationDelay: "60ms" }}>
        Os melhores preços encontrados pelos cariocas nesta semana.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ofertas.map((oferta, i) => (
          <article
            key={oferta.produto}
            className="animate-fade-up group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/20"
            style={{ animationDelay: `${120 + i * 90}ms` }}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`flex size-11 items-center justify-center rounded-full bg-muted ring-2 ${oferta.anel}`}>
                  <Medal className={`size-6 ${oferta.medalha}`} aria-hidden="true" />
                </span>
                <span className="text-3xl font-black text-muted-foreground/20">
                  {oferta.rank}º
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                {oferta.produto}
              </h3>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                <MapPin className="size-3" aria-hidden="true" />
                {oferta.mercado}
              </span>
            </div>
            <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
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
