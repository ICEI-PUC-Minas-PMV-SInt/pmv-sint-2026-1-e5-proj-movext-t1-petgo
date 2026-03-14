import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental features para melhor performance
  experimental: {
    optimizePackageImports: ["lucide-react", "@tanstack/react-query"],
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Configurações de imagem - CORRIGIDO
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5021",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "5021",
        pathname: "/**",
      },
      // Adicionar via.placeholder.com para desenvolvimento
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      // Adicionar outros domínios comuns para imagens
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      // Adicionar domínios de imagens mock para o seed
      {
        protocol: "https",
        hostname: "loremflickr.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "place.dog",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  // Rewrites para proxy da API
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5021/api/:path*",
      },
    ];
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
