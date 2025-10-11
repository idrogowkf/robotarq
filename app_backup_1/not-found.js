export const dynamic = "force-static";

export default function NotFound() {
    return (
        <main style={{ padding: 24 }}>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>Página no encontrada</h1>
            <p>Vuelve al <a href="/reformas-bares">inicio</a>.</p>
        </main>
    );
}
