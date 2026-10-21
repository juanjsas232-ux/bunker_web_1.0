import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Clock,
  MapPin,
  Instagram,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Facebook,
} from 'lucide-react';
import { BunkerLogo } from './BunkerLogo';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const cleanPhone = settings.whatsappNumber.replace(/\D/g, '');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setIsSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
        setIsSubscribed(false);
      }, 5000);
    }
  };

  return (
    <footer className="bg-[#17191D] text-[#FAFAF8] border-t border-[#282C33]">
      {/* 1. TRUST & CONTACT STRIP (Matches the uploaded reference mockup) */}
      <div className="border-b border-[#282C33] bg-[#111315]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola Bunker! Quisiera consultar.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#282C33]/60 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#282C33] group-hover:bg-[#25D366]/20 flex items-center justify-center text-[#25D366] transition flex-shrink-0">
                <MessageCircle size={24} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">PEDÍ POR WHATSAPP</p>
                <p className="text-sm font-black text-white">{settings.whatsappNumber}</p>
                <p className="text-xs text-[#25D366]">Respondemos rápido</p>
              </div>
            </a>

            {/* Support Hours */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-transparent">
              <div className="w-12 h-12 rounded-xl bg-[#282C33] flex items-center justify-center text-gray-300 flex-shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">LUNES A VIERNES</p>
                <p className="text-sm font-black text-white">9:00 a 18:00hs</p>
                <p className="text-xs text-gray-400">Sábados 9:00 a 13:00hs</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-transparent">
              <div className="w-12 h-12 rounded-xl bg-[#282C33] flex items-center justify-center text-gray-300 flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">SALTA, ARGENTINA</p>
                <p className="text-sm font-black text-white">Envíos a todo el país</p>
                <p className="text-xs text-gray-400">Desde nuestra base oficial</p>
              </div>
            </div>

            {/* Social Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#282C33]/60 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#282C33] group-hover:bg-[#F28C28]/20 flex items-center justify-center text-gray-300 group-hover:text-[#F28C28] transition flex-shrink-0">
                <Instagram size={24} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">SEGUINOS EN INSTAGRAM</p>
                <p className="text-sm font-black text-white">{settings.instagramHandle}</p>
                <p className="text-xs text-gray-400">Novedades y ofertas</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <BunkerLogo variant="light" size="md" showSubtitle />
            <p className="text-sm text-gray-400 leading-relaxed pt-2">
              BUNKER es solidez, energía y actitud. Desarrollamos y seleccionamos productos de audio, tecnología, accesorios y estilo de vida con máxima durabilidad y rendimiento garantizado.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#282C33] hover:bg-[#F28C28] flex items-center justify-center text-gray-300 hover:text-white transition"
              >
                <Instagram size={17} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#282C33] hover:bg-[#F28C28] flex items-center justify-center text-gray-300 hover:text-white transition"
              >
                <Facebook size={17} />
              </a>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#282C33] hover:bg-[#25D366] flex items-center justify-center text-gray-300 hover:text-white transition"
              >
                <MessageCircle size={17} />
              </a>
            </div>
          </div>

          {/* Col 2: Información */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">INFORMACIÓN</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link to="/catalogo" className="hover:text-[#F28C28] transition">Catálogo completo</Link>
              </li>
              <li>
                <a href="#como-comprar" onClick={(e) => { e.preventDefault(); alert('1. Elegí tus productos. 2. Añadilos al carrito. 3. Completá tus datos. 4. Se genera el mensaje directo a nuestro WhatsApp para coordinar pago y entrega.'); }} className="hover:text-[#F28C28] transition">Cómo comprar por WhatsApp</a>
              </li>
              <li>
                <span className="hover:text-[#F28C28] cursor-pointer transition" onClick={() => alert('Realizamos envíos a todo el territorio argentino mediante Correo Argentino y Andreani.')}>Envíos y tiempos de entrega</span>
              </li>
              <li>
                <span className="hover:text-[#F28C28] cursor-pointer transition" onClick={() => alert('Tenés 30 días para realizar cambios de producto en su empaque original.')}>Cambios y devoluciones</span>
              </li>
              <li>
                <span className="hover:text-[#F28C28] cursor-pointer transition" onClick={() => alert('Aceptamos transferencia bancaria, Mercado Pago y efectivo contra entrega en Salta.')}>Medios de pago</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Mi cuenta & Administración */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">ACCESO</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link to="/admin" className="text-[#F28C28] hover:underline font-semibold flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  <span>Panel Administrativo</span>
                </Link>
              </li>
              <li>
                <Link to="/catalogo?filtro=novedades" className="hover:text-[#F28C28] transition">Nuevos lanzamientos</Link>
              </li>
              <li>
                <Link to="/catalogo?filtro=ofertas" className="hover:text-[#F28C28] transition">Promociones vigentes</Link>
              </li>
              <li>
                <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noreferrer" className="hover:text-[#F28C28] transition">Atención al cliente</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">NEWSLETTER</h4>
            <p className="text-sm text-gray-400 mb-3">
              Recibí nuestras novedades y ofertas exclusivas directamente en tu correo.
            </p>
            {isSubscribed ? (
              <div className="p-3 bg-[#25D366]/20 border border-[#25D366]/40 rounded-lg flex items-center gap-2 text-xs font-semibold text-[#25D366]">
                <CheckCircle size={16} />
                <span>¡Gracias por suscribirte a BUNKER!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex items-center">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Tu correo electrónico"
                  required
                  className="bg-[#282C33] text-sm text-white placeholder-gray-400 px-3.5 py-2.5 rounded-l-lg border border-[#3F444E] focus:outline-none focus:border-[#F28C28] flex-1 min-w-0"
                />
                <button
                  type="submit"
                  className="bg-[#F28C28] hover:bg-[#d9771e] text-white px-4 py-2.5 rounded-r-lg font-bold transition flex items-center justify-center flex-shrink-0"
                  aria-label="Suscribirse"
                >
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
            <p className="text-[11px] text-gray-500 mt-2">Sin spam. Podés desuscribirte cuando quieras.</p>
          </div>
        </div>
      </div>

      {/* 3. COPYRIGHT BAR */}
      <div className="bg-[#111315] border-t border-[#282C33] py-4 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2024 BUNKER. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            <span>Desarrollada en Argentina</span>
            <span role="img" aria-label="Bandera Argentina">🇦🇷</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
