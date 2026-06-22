import { MessageCircle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function WhatsappCta() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <MessageCircle className="size-7" aria-hidden="true" />
        </span>
        <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          Não perca nenhuma promoção
        </h2>
        <p className="max-w-md text-pretty text-muted-foreground">
          Receba as melhores ofertas dos mercados do Rio direto no seu celular.
        </p>
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-12 gap-2 px-6 text-base hover:bg-primary/90",
          )}
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          Receber Promoções no WhatsApp
        </a>
      </div>
    </section>
  )
}
