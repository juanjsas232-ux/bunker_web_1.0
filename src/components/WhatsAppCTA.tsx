import React from 'react';
import { MessageCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WhatsAppCTA: React.FC = () => {
  const { settings } = useStore();
  const cleanPhone = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F28C28] via-[#e87f1a] to-[#d9771e] text-white p-8 sm:p-12 shadow-2xl">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text */}
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-sm">
              <Zap size={14} className="fill-white" />
              <span>Atención Directa y Personalizada</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.08] drop-shadow-sm">
              TU COMPRA,<br />
              POR WHATSAPP
            </h2>

            <p className="text-white/90 text-sm sm:text-base max-w-lg font-medium leading-relaxed">
              Hacé tu pedido directo, consultá disponibilidad inmediata de variantes y recibí asesoramiento de nuestro equipo comercial en tiempo real.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola BUNKER! Quiero consultar sobre productos y realizar una compra.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-[#17191D] hover:bg-[#282C33] text-white font-black text-sm uppercase tracking-wider shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <MessageCircle size={20} className="text-[#25D366]" />
                <span>PEDIR POR WHATSAPP</span>
              </a>

              <span className="flex items-center gap-1.5 text-xs font-bold text-white/90">
                <ShieldCheck size={16} />
                Respondemos en minutos
              </span>
            </div>
          </div>

          {/* Right Visual (Smartphone mockup with WhatsApp logo and basket) */}
          <div className="md:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
              {/* WhatsApp Icon Big Pill */}
              <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-md p-6 flex items-center justify-center shadow-2xl border border-white/30 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                <MessageCircle size={72} className="text-white fill-[#25D366] stroke-[#25D366]" />
              </div>

              {/* Shopping basket badge */}
              <div className="absolute -bottom-2 -right-2 bg-[#17191D] text-white p-4 rounded-2xl shadow-2xl border border-white/20 transform rotate-6">
                <p className="text-[10px] font-bold text-[#F28C28] uppercase tracking-wider">Número Oficial</p>
                <p className="text-xs font-mono font-black text-white">{settings.whatsappNumber}</p>
                <p className="text-[10px] text-[#25D366] mt-0.5">● En línea ahora</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
