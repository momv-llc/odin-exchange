/** @type {import('next').NextConfig} */
const nextConfig = {
  // Для Cloudflare Pages не нужен standalone
  images: {
    unoptimized: true,
  },
  
  // API proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '')}/:path*`
          : 'http://localhost:3000/api/:path*',
      },
    ];
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  
  // Отключаем ESLint при сборке (опционально, чтобы избежать предупреждений)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Отключаем проверку типов при сборке (если нужно быстрее)
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
