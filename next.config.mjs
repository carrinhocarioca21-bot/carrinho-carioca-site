/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Encartes (PDF/imagem) e fotos de ofertas passam do limite padrao de 1MB.
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
}

export default nextConfig
