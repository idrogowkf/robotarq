// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
  async redirects() {
    return [
      // ⚠️ Nada desde "/" a "/reformas-bares".
      // Añade aquí otras redirecciones si quieres, pero nunca la raíz.
    ];
  },
};

export default nextConfig;
