import React from 'react';
import { Link } from 'react-router-dom';
import { BunkerLogo } from '../components/BunkerLogo';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-full bg-orange-50 border border-orange-200 text-[#F28C28] flex items-center justify-center mx-auto">
          <Compass size={40} />
        </div>
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#F28C28]">
            Error 404
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#17191D] mt-1">
            Página No Encontrada
          </h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            La dirección que intentás consultar no existe o ha cambiado de ubicación en la tienda BUNKER.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F28C28] hover:bg-[#d9771e] text-white font-bold text-xs uppercase tracking-wider shadow-md transition"
          >
            <ArrowLeft size={16} />
            <span>Volver al Inicio</span>
          </Link>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#17191D] hover:bg-[#282C33] text-white font-bold text-xs uppercase tracking-wider transition"
          >
            <span>Explorar Catálogo</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
