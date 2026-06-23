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
} from "lucide-react"

export function EnviarOfertaForm({ mercados }: { mercados: Mercado[] }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [erroArquivo, setErroArquivo] = useState<string | null>(null)
  const [mercadoId, setMercadoId] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  const [state, formAction, pending] = useActionState(enviarOferta, { ok: false })

  const bairro = mercados.find((m) => m.id === mercadoId)?.bairro ?? ""

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setPreview(null)
      setMercadoId("")
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

        {/* Bairro (preenchido a partir do mercado) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bairro" className="text-sm font-medium">
            Bairro
          </label>
          <input
            id="bairro"
            type="text"
            readOnly
            value={bairro}
            placeholder="Selecione um mercado"
            className="h-11 rounded-xl border border-input bg-muted px-3 text-sm text-muted-foreground outline-none"
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
