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

            // Fallback: si llega peti con host www.robotarq.com, redirige a sin www.
            // Nota: Vercel ya lo puede hacer desde Settings → Domains (recomendado).
            {
                source: "/:path*",
                has: [{ type: "host", value: "www.robotarq.com" }],
                destination: "https://robotarq.com/:path*",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
