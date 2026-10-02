/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // @react-pdf/renderer usa API Node (stream, fontkit): va lasciato fuori dal bundle server
  serverExternalPackages: ['@react-pdf/renderer'],
  experimental: {
    // Upload del file di Poste tramite Server Action (default 1 MB)
    serverActions: { bodySizeLimit: '25mb' },
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

export default nextConfig
