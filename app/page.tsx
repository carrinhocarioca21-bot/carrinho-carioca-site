import { SiteHeader } from "@/components/site-header"
import { HeroSearch } from "@/components/hero-search"
import { TopOfertas } from "@/components/top-ofertas"
import { OfertasExplorer } from "@/components/ofertas-explorer"
import { MercadosMonitorados } from "@/components/mercados-monitorados"
import { EncartesPublicos } from "@/components/encartes-publicos"
import { WhatsappCta } from "@/components/whatsapp-cta"
import { SiteFooter } from "@/components/site-footer"
import { AdSlot } from "@/components/ad-slot"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSearch />
        <TopOfertas />
        <div className="px-4 py-2">
          <AdSlot />
        </div>
        <OfertasExplorer />
        <EncartesPublicos />
        <MercadosMonitorados />
        <div className="px-4 py-2">
          <AdSlot />
        </div>
        <WhatsappCta />
      </main>
      <SiteFooter />
    </div>
  )
}
