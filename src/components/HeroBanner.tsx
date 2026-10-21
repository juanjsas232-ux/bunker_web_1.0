import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HeroBanner: React.FC = () => {
  const { settings } = useStore();

  return (
    <section className="relative w-full bg-[#111315] text-[#FAFAF8] overflow-hidden border-b border-[#282C33]">
      {/* Background glow & dynamic energy curved graphic */}
      <div className="absolute top-0 right-0 w-full lg:w-3/5 h-full pointer-events-none opacity-40 lg:opacity-70">
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#F28C28]/20 rounded-full blur-3xl" />
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 600 600"
          fill="none"
        >
          <path
            d="M300 0C450 150 600 200 600 600H600V0H300Z"
            fill="url(#orange-glow-gradient)"
            opacity="0.15"
          />
          <defs>
            <linearGradient id="orange-glow-gradient" x1="600" y1="0" x2="300" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F28C28" />
              <stop offset="1" stopColor="#17191D" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#282C33] border border-[#3F444E] text-[#F28C28] text-xs font-bold tracking-wider uppercase">
              <Zap size={14} className="fill-[#F28C28]" />
              <span>Nueva Colección 2024</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.05] text-white">
              ENERGÍA.<br />
              DISEÑO.<br />
              <span className="text-[#F28C28]">ACTITUD.</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-xl font-normal leading-relaxed">
              {settings.heroSubtitle || 'Productos seleccionados para potenciar tu día a día.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={settings.heroCtaLink || '/catalogo'}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#F28C28] hover:bg-[#d9771e] text-white font-black text-sm tracking-wide uppercase transition-all shadow-lg hover:shadow-orange-glow transform active:scale-95"
              >
                <span>{settings.heroCtaText || 'VER NOVEDADES'}</span>
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/catalogo"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#282C33] hover:bg-[#333842] text-white font-bold text-sm tracking-wide transition border border-[#3F444E]"
              >
                <span>Explorar Catálogo</span>
              </Link>
            </div>

            {/* Quick bullet trust points */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-gray-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#25D366]" />
                Envíos garantizados
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#25D366]" />
                Hasta 3 cuotas sin interés
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#25D366]" />
                Asesoría WhatsApp directa
              </span>
            </div>
          </div>

          {/* Right Visual Column (Matching the reference headphone on dark pedestal) */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden bg-gradient-to-tr from-[#17191D] via-[#282C33] to-[#1F2228] p-4 flex items-center justify-center border border-[#3F444E]/40 shadow-2xl">
              {/* Radial orange backlight */}
              <div className="absolute inset-0 bg-radial-at-c from-[#F28C28]/25 via-transparent to-transparent pointer-events-none" />

              <img
                src={
                  settings.heroImageUrl ||
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
                }
                alt="BUNKER Hero Audio Gear"
                className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:scale-105"
              />

              {/* Float badge */}
              <div className="absolute bottom-6 left-6 z-20 bg-[#17191D]/90 backdrop-blur-md border border-[#3F444E] px-4 py-2.5 rounded-xl shadow-xl">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Producto Destacado</p>
                <p className="text-sm font-bold text-white">Auriculares Thunder X1</p>
                <p className="text-xs text-[#F28C28] font-bold">ANC Híbrido • 45hs</p>
              </div>

              {/* Slider dots */}
              <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
                <span className="w-5 h-1.5 rounded-full bg-[#F28C28]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
