/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // External modules that shouldn't be bundled
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Ignore React Native modules that MetaMask SDK tries to import (client-side only)
    if (!isServer) {
      config.externals.push('@react-native-async-storage/async-storage');
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
      };
    }
    
    return config
  },
};

module.exports = nextConfig;
