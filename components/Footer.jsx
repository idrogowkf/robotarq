export default function Footer() {
    return (
        <footer className="bg-neutral-950 text-neutral-300 text-sm py-10 mt-24">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6">
                <div>
                    <h3 className="font-semibold text-white mb-3">robotARQ</h3>
                    <p className="text-neutral-400 leading-relaxed">
                        Reformas con Inteligencia Artificial. Calcula tu presupuesto técnico con partidas y precios en toda España.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-3">Servicios</h4>
                    <ul className="space-y-1">
                        <li><a href="/reformas-bares" className="hover:text-white">Reformas de Bares</a></li>
                        <li><a href="/reformas-locales" className="hover:text-white">Reformas de Locales</a></li>
                        <li><a href="/reformas-viviendas" className="hover:text-white">Reformas de Viviendas</a></li>
                        <li><a href="/reformas-hosteleria" className="hover:text-white">Reformas de Hostelería</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-3">Contacto</h4>
                    <p>
                        <a href="mailto:hola@robotarq.com" className="hover:text-white">hola@robotarq.com</a><br />
                        <a href="https://wa.me/34624473123" className="hover:text-white">+34 624 473 123</a>
                    </p>
                    <p className="mt-3">Madrid, España</p>
                </div>
            </div>
            <div className="text-center text-neutral-500 mt-10 border-t border-neutral-800 pt-5">
                © {new Date().getFullYear()} robotARQ · Todos los derechos reservados
            </div>
        </footer>
    );
}
