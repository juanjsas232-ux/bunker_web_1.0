import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FeaturedCategories: React.FC = () => {
  const { categories, filters, setFilters } = useStore();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-[#17191D]">
            CATEGORÍAS DESTACADAS
          </h2>
          <p className="text-xs text-[#68707D] mt-1">Explorá los departamentos de la tienda BUNKER</p>
        </div>
        <Link
          to="/catalogo"
          className="text-xs font-bold text-[#F28C28] hover:text-[#d9771e] flex items-center gap-1 uppercase tracking-wider"
        >
          <span>VER TODAS</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((cat, index) => {
          const isSelected = filters.categoryId === cat.id;
          const isFirstCard = index === 0 && !filters.categoryId;
          const highlight = isSelected || isFirstCard;

          return (
            <Link
              key={cat.id}
              to={`/catalogo?categoria=${cat.slug}`}
              onClick={() => {
                setFilters((prev) => ({ ...prev, categoryId: cat.id }));
              }}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:-translate-y-1.5 shadow-sm hover:shadow-lg flex flex-col ${
                highlight
                  ? 'bg-gradient-to-b from-[#F28C28] to-[#d9771e] text-white'
                  : 'bg-[#17191D] text-white hover:border-[#F28C28]'
              } border border-transparent`}
            >
              {/* Product Category Visual Aspect */}
              <div className="w-full aspect-square p-4 flex items-center justify-center overflow-hidden bg-black/10">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Category Info Bottom */}
              <div className="p-4 pt-1">
                <h3 className="font-black text-sm uppercase tracking-wide truncate">
                  {cat.name}
                </h3>
                <p className={`text-xs mt-0.5 ${highlight ? 'text-white/80' : 'text-gray-400'}`}>
                  {cat.productCount ? `${cat.productCount} productos` : 'Explorar'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
