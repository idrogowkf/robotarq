/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["react", "react-dom"],
    },
    async redirects() {
        return [
            // Redirige TODO lo antiguo de /reformas-bares → Home
            { source: "/reformas-bares", destination: "/", permanent: true },
            { source: "/reformas-bares/:slug*", destination: "/", permanent: true },
        ];
    },
};

export default nextConfig;
