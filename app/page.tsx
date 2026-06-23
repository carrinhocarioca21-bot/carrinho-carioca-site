import { SiteHeader } from "@/components/site-header"
import { HeroSearch } from "@/components/hero-search"
import { TopOfertas } from "@/components/top-ofertas"
import { OfertasExplorer } from "@/components/ofertas-explorer"
import { MercadosMonitorados } from "@/components/mercados-monitorados"
import { WhatsappCta } from "@/components/whatsapp-cta"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSearch />
        <TopOfertas />
        <OfertasExplorer />
        <MercadosMonitorados />
        <WhatsappCta />
      </main>
      <SiteFooter />
    </div>
  )
}
