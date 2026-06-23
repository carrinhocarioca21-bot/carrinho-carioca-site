import { MessageCircle, Send } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const mensagemPromo = encodeURIComponent(
  "Olá! Encontrei uma promoção e quero enviar para o Carrinho Carioca:\n\nProduto:\nPreço:\nMercado:\nBairro:",
)

export function WhatsappCta() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
      <div className="animate-fade-up flex flex-col items-center gap-5 rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
        <span className="animate-float flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <MessageCircle className="size-7" aria-hidden="true" />
        </span>
        <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          Não perca nenhuma promoção
        </h2>
        <p className="max-w-md text-pretty text-muted-foreground">
          Receba as melhores ofertas dos mercados do Rio direto no seu celular.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-2 px-6 text-base shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-105 hover:bg-primary/90",
            )}
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            Receber Promoções
          </a>
          <a
            href={`https://wa.me/?text=${mensagemPromo}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 gap-2 px-6 text-base transition-transform duration-300 hover:scale-105",
            )}
          >
            <Send className="size-5" aria-hidden="true" />
            Enviar Promoção
          </a>
        </div>
      </div>
    </section>
  )
}
