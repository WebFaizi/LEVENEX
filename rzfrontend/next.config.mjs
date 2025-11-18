/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Disable Next.js image optimization for cPanel
    domains: [
      'api.digitalstandeeonrent.in',
      'api.desktoponrent.in',
      'localhost',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.digitalstandeeonrent.in',
      },
      {
        protocol: 'https',
        hostname: '**.desktoponrent.in',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8002',
      },
    ],
  },
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Reduce bundle size in production
    if (!dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          commons: {
            name: 'commons',
            chunks: 'initial',
            minChunks: 2,
            enforce: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    // Minimize JS parsing time
    config.optimization.minimize = !dev;
    
    return config;
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Remove modularizeImports as it's causing import issues
  // modularizeImports: {
  //   'lucide-react': {
  //     transform: 'lucide-react/dist/esm/icons/{{member}}',
  //     skipDefaultConversion: true,
  //   },
  // },

  experimental: {
    // optimizeCss: true, // Disabled - requires critters package
    optimizeServerReact: true,
    // Enable modern bundle splitting
    esmExternals: true,
  },
  
  // Turbopack configuration for faster development builds
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
