import { Store, Check } from "lucide-react"

const mercados = [
  { nome: "Guanabara", sigla: "G" },
  { nome: "Mundial", sigla: "M" },
  { nome: "Prezunic", sigla: "P" },
  { nome: "Pão de Açúcar", sigla: "PA" },
]

export function MercadosMonitorados() {
  return (
    <section id="mercados" className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
        <div className="animate-fade-up flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Store className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Mercados Monitorados
          </h2>
        </div>
        <p className="animate-fade-up mt-2 text-muted-foreground" style={{ animationDelay: "60ms" }}>
          Acompanhamos os preços destes supermercados todos os dias.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {mercados.map((mercado, i) => (
            <div
              key={mercado.nome}
              className="animate-fade-up group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ animationDelay: `${100 + i * 80}ms` }}
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                {mercado.sigla}
              </span>
              <span className="font-semibold text-card-foreground">{mercado.nome}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <Check className="size-3" aria-hidden="true" />
                Ativo
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
