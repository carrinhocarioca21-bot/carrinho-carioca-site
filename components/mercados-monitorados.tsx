import { Store } from "lucide-react"

const mercados = ["Guanabara", "Mundial", "Prezunic", "Pão de Açúcar"]

export function MercadosMonitorados() {
  return (
    <section id="mercados" className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
        <div className="flex items-center gap-2">
          <Store className="size-6 text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Mercados Monitorados
          </h2>
        </div>
        <p className="mt-2 text-muted-foreground">
          Acompanhamos os preços destes supermercados todos os dias.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {mercados.map((mercado) => (
            <div
              key={mercado}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Store className="size-6" aria-hidden="true" />
              </span>
              <span className="font-semibold text-card-foreground">{mercado}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
