/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["react", "react-dom"],
    },
    // Sin redirecciones al antiguo /reformas-bares
    async redirects() {
        return [];
    },
};

export default nextConfig;
