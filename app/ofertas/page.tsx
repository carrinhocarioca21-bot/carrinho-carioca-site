import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { OfertasPage } from "@/components/ofertas-page"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Todas as Ofertas",
  description:
    "Pesquise produtos, filtre por mercado, ordene por maior desconto ou menor preço e compartilhe as melhores ofertas dos supermercados do Rio de Janeiro.",
  alternates: { canonical: "/ofertas" },
}

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <OfertasPage />
      </main>
      <SiteFooter />
    </div>
  )
}
