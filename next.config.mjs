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
  serverExternalPackages: ['@react-pdf/renderer', 'pdfkit'], // <-- AGGIUNTO 'pdfkit'

  // Forza Vercel a includere i file dei font fisici di pdfkit nella build serverless
  outputFileTracingIncludes: {
    '/**/*': ['./node_modules/pdfkit/js/standard-fonts/**/*'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  experimental: {
    // Upload del file di Poste tramite Server Action (default 1 MB)
    serverActions: { bodySizeLimit: '25mb' },
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

export default nextConfig