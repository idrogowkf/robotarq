import "./globals.css";

export const metadata = {
  title: {
    default: "Robotarq | Reformas de Bares",
    template: "%s | Robotarq"
  },
  description: "Reformas de bares: proyecto, licencia y obra. Atencion online.",
  alternates: { canonical: "/reformas-bares" },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head />
      <body>{children}</body>
    </html>
  );
}
