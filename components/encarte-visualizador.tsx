"use client"

import { useEffect } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { ehPdf } from "@/lib/usar-paginas-encarte"

type Props = {
  url: string
  titulo: string
  onClose: () => void
}

export function EncarteVisualizador({ url, titulo, onClose }: Props) {
  // Fecha com a tecla ESC e bloqueia o scroll do body enquanto aberto.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", aoTeclar)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", aoTeclar)
      document.body.style.overflow = overflowAnterior
    }
  }, [onClose])

  const pdf = ehPdf(url)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-20 rounded-full bg-white/15 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/25"
        aria-label="Fechar"
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      {pdf ? (
        // PDF: visualizador nativo do navegador (navegacao entre paginas + zoom embutidos).
        <iframe
          src={`${url}#view=FitH`}
          title={titulo}
          className="h-[92vh] w-full max-w-4xl rounded-lg bg-white"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        // Imagem: zoom (roda/pinca), arraste e botoes de controle.
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={6}
          centerOnInit
          wheel={{ step: 0.2 }}
          doubleClick={{ mode: "zoomIn", step: 1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <div
              className="flex h-full w-full items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/15 px-2 py-1.5 backdrop-blur">
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
                  aria-label="Diminuir zoom"
                >
                  <ZoomOut className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
                  aria-label="Aumentar zoom"
                >
                  <ZoomIn className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => resetTransform()}
                  className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
                  aria-label="Restaurar zoom"
                >
                  <RotateCcw className="size-5" aria-hidden="true" />
                </button>
              </div>
              <TransformComponent
                wrapperClass="!h-[92vh] !w-full !max-w-5xl"
                contentClass="!h-full !w-full flex items-center justify-center"
              >
                {/* Imagem em alta resolucao. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url || "/placeholder.svg"}
                  alt={titulo}
                  className="max-h-[92vh] w-auto select-none rounded-lg object-contain"
                  draggable={false}
                />
              </TransformComponent>
            </div>
          )}
        </TransformWrapper>
      )}
    </div>
  )
}
