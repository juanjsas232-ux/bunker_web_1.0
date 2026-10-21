import React from 'react';
import { Truck, ShieldCheck, CreditCard, Headphones } from 'lucide-react';

export const ValueProps: React.FC = () => {
  const props = [
    {
      icon: Truck,
      title: 'ENVÍOS A TODO EL PAÍS',
      description: 'Rápidos y seguros',
    },
    {
      icon: ShieldCheck,
      title: 'COMPRA PROTEGIDA',
      description: 'Tus datos siempre seguros',
    },
    {
      icon: CreditCard,
      title: '3 CUOTAS SIN INTERÉS',
      description: 'En toda la tienda',
    },
    {
      icon: Headphones,
      title: 'ATENCIÓN PERSONALIZADA',
      description: 'Estamos para ayudarte',
    },
  ];

  return (
    <section className="bg-[#FAFAF8] border-b border-[#ECEEF1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {props.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#ECEEF1] shadow-sm hover:shadow-md transition"
              >
                <div className="w-12 h-12 rounded-xl bg-[#17191D] flex items-center justify-center text-[#FAFAF8] flex-shrink-0">
                  <Icon size={22} className="text-[#F28C28]" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wide uppercase text-[#17191D]">{p.title}</h4>
                  <p className="text-xs text-[#68707D] mt-0.5">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
