/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
  async redirects() {
    return [
      // Cualquier URL antigua de /reformas-bares → Home
      { source: "/reformas-bares", destination: "/", permanent: true },
      { source: "/reformas-bares/:path*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
