// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
  async redirects() {
    return [
      // Home → landing principal
      { source: "/", destination: "/reformas-bares", permanent: true },
    ];
  },
};

export default nextConfig;
