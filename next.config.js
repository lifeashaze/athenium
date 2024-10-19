const nextConfig = {
  // ... other configurations ...
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        path: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
