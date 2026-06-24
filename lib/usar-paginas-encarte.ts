"use client"

import { useEffect, useState } from "react"

export function ehPdf(url: string) {
  return url.toLowerCase().split("?")[0].endsWith(".pdf")
}

// Cache simples por URL para evitar recarregar o mesmo PDF varias vezes.
const cachePaginas = new Map<string, number>()

/**
 * Retorna a quantidade de paginas de um encarte.
 * - Imagem: sempre 1.
 * - PDF: detecta via pdf.js (carregado dinamicamente, somente no cliente).
 */
export function usarPaginasEncarte(url: string): number | null {
  const pdf = ehPdf(url)
  const [paginas, setPaginas] = useState<number | null>(() => {
    if (!pdf) return 1
    return cachePaginas.get(url) ?? null
  })

  useEffect(() => {
    if (!pdf) {
      setPaginas(1)
      return
    }
    if (cachePaginas.has(url)) {
      setPaginas(cachePaginas.get(url)!)
      return
    }

    let cancelado = false
    ;(async () => {
      try {
        const pdfjs = await import("pdfjs-dist")
        // Worker via CDN compativel com a versao instalada.
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
        const doc = await pdfjs.getDocument({ url }).promise
        if (!cancelado) {
          cachePaginas.set(url, doc.numPages)
          setPaginas(doc.numPages)
        }
        doc.destroy()
      } catch {
        // Se falhar a deteccao, nao mostramos contagem.
        if (!cancelado) setPaginas(null)
      }
    })()

    return () => {
      cancelado = true
    }
  }, [url, pdf])

  return paginas
}
