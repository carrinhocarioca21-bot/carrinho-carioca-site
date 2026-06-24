"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { enviarOferta } from "@/app/enviar/actions"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Mercado } from "@/lib/supabase"
import {
  Upload,
  Loader2,
  ImageIcon,
  CheckCircle2,
  ShoppingCart,
  ArrowLeft,
  MapPin,
  MapPinOff,
} from "lucide-react"

type GeoStatus = "idle" | "carregando" | "ok" | "negado" | "erro"

export function EnviarOfertaForm({ mercados }: { mercados: Mercado[] }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [erroArquivo, setErroArquivo] = useState<string | null>(null)
  const [mercadoId, setMercadoId] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  // Geolocalizacao opcional
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [bairro, setBairro] = useState("")
  const [regiao, setRegiao] = useState("")

  const [state, formAction, pending] = useActionState(enviarOferta, { ok: false })

  const mercadoBairro = mercados.find((m) => m.id === mercadoId)?.bairro ?? ""

  // Solicita a localizacao ao abrir a pagina (opcional).
  function solicitarLocalizacao() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("erro")
      return
    }
    setGeoStatus("carregando")
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`,
          )
          const data = await res.json()
          const novoBairro = data.locality || data.city || ""
          const novaRegiao = [data.city, data.principalSubdivision]
            .filter(Boolean)
            .join(" - ")
          if (novoBairro) setBairro(novoBairro)
          if (novaRegiao) setRegiao(novaRegiao)
        } catch {
          // Mantem as coordenadas mesmo se o reverse geocoding falhar.
        }
        setGeoStatus("ok")
      },
      () => setGeoStatus("negado"),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  useEffect(() => {
    solicitarLocalizacao()
  }, [])

  // Se o usuario ainda nao tem bairro (via geo) e escolhe um mercado, usa o bairro do mercado.
  useEffect(() => {
    if (!bairro && mercadoBairro) setBairro(mercadoBairro)
  }, [mercadoBairro, bairro])

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setPreview(null)
      setMercadoId("")
      setBairro("")
      setRegiao("")
      setErroArquivo(null)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [state.ok])

  function aoEscolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setErroArquivo(null)
    if (!file) {
      setPreview(null)
      return
    }
    const tiposOk = ["image/jpeg", "image/png", "image/webp"]
    if (!tiposOk.includes(file.type)) {
      setErroArquivo("Formato inválido. Use JPG, PNG ou WEBP.")
      setPreview(null)
      e.target.value = ""
      return
    }
    setPreview(URL.createObjectURL(file))
  }

  // Tela de sucesso
  if (state.ok) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-9" aria-hidden="true" />
        </span>
        <h1 className="text-balance text-2xl font-bold">
          Oferta enviada com sucesso. Obrigado por colaborar.
        </h1>
        <p className="text-pretty text-sm text-muted-foreground">
          Sua oferta foi recebida e passará por uma análise antes de aparecer no site.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => formRef.current?.reset()}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Enviar outra oferta
          </button>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="mb-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShoppingCart className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold leading-tight">Enviar oferta</h1>
            <p className="text-sm text-muted-foreground">
              Achou um bom preço? Compartilhe com o Rio.
            </p>
          </div>
        </div>
      </header>

      <form ref={formRef} action={formAction} className="flex flex-col gap-5">
        {/* Status da geolocalizacao (opcional) */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm",
            geoStatus === "ok"
              ? "border-primary/30 bg-primary/5 text-foreground"
              : "border-border bg-muted/40 text-muted-foreground",
          )}
        >
          {geoStatus === "carregando" ? (
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
          ) : geoStatus === "ok" ? (
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
          ) : (
            <MapPinOff className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span className="flex-1 text-pretty">
            {geoStatus === "carregando" && "Buscando sua localização..."}
            {geoStatus === "ok" && "Localização detectada. Confira o bairro e a região abaixo."}
            {geoStatus === "negado" && "Localização não autorizada. Você pode preencher o bairro manualmente."}
            {geoStatus === "erro" && "Localização indisponível neste dispositivo."}
            {geoStatus === "idle" && "Use sua localização para preencher o bairro automaticamente."}
          </span>
          {geoStatus !== "ok" && geoStatus !== "carregando" && (
            <button
              type="button"
              onClick={solicitarLocalizacao}
              className="shrink-0 font-medium text-primary underline-offset-4 hover:underline"
            >
              Usar localização
            </button>
          )}
        </div>

        {/* Coordenadas (ocultas, salvas com a oferta) */}
        <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
        <input type="hidden" name="longitude" value={coords?.lng ?? ""} />

        {/* Foto (obrigatoria) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="foto" className="text-sm font-medium">
            Foto da oferta <span className="text-destructive">*</span>
          </label>
          <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40">
            {preview ? (
              <Image
                src={preview || "/placeholder.svg"}
                alt="Pré-visualização da foto"
                width={500}
                height={500}
                unoptimized
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="size-9" aria-hidden="true" />
                <span className="text-xs">A foto aparecerá aqui</span>
              </div>
            )}
          </div>
          <label
            htmlFor="foto"
            className={cn(buttonVariants({ variant: "secondary" }), "cursor-pointer gap-2")}
          >
            <Upload className="size-4" aria-hidden="true" />
            {preview ? "Trocar foto" : "Escolher foto"}
          </label>
          <input
            id="foto"
            name="foto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={aoEscolherFoto}
            className="sr-only"
          />
          {erroArquivo && <p className="text-sm text-destructive">{erroArquivo}</p>}
        </div>

        {/* Produto */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="produto" className="text-sm font-medium">
            Produto <span className="text-destructive">*</span>
          </label>
          <input
            id="produto"
            name="produto"
            type="text"
            required
            placeholder="Ex.: Arroz Tio João 5kg"
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        {/* Precos */}
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="preco" className="text-sm font-medium">
              Preço atual <span className="text-destructive">*</span>
            </label>
            <input
              id="preco"
              name="preco"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0,00"
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="preco_antigo" className="text-sm font-medium">
              Preço antigo
            </label>
            <input
              id="preco_antigo"
              name="preco_antigo"
              type="number"
              step="0.01"
              min="0"
              placeholder="Opcional"
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        {/* Mercado */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mercado_id" className="text-sm font-medium">
            Mercado <span className="text-destructive">*</span>
          </label>
          <select
            id="mercado_id"
            name="mercado_id"
            required
            value={mercadoId}
            onChange={(e) => setMercadoId(e.target.value)}
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            <option value="" disabled>
              Selecione o mercado
            </option>
            {mercados.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Bairro e Regiao (preenchidos pela localizacao, editaveis) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bairro" className="text-sm font-medium">
            Bairro
          </label>
          <input
            id="bairro"
            name="bairro"
            type="text"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Detectado pela localização ou pelo mercado"
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="regiao" className="text-sm font-medium">
            Região
          </label>
          <input
            id="regiao"
            name="regiao"
            type="text"
            value={regiao}
            onChange={(e) => setRegiao(e.target.value)}
            placeholder="Detectada pela sua localização"
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={cn(buttonVariants({ size: "lg" }), "mt-1 h-12 gap-2 text-base font-semibold")}
        >
          {pending && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
          ENVIAR
        </button>
      </form>
    </>
  )
}
