import React, { useState } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { ValueProps } from '../components/ValueProps';
import { FeaturedCategories } from '../components/FeaturedCategories';
import { ProductCard } from '../components/ProductCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { WhatsAppCTA } from '../components/WhatsAppCTA';
import { useStore } from '../context/StoreContext';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { filteredProducts, filters, setFilters, resetFilters } = useStore();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* 1. HERO BANNER */}
      <HeroBanner />

      {/* 2. VALUE PROPOSITIONS */}
      <ValueProps />

      {/* 3. FEATURED CATEGORIES */}
      <FeaturedCategories />

      {/* 4. MAIN PRODUCTS & CATALOG SECTION (Exact structure from reference mockup) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="catalogo">
        {/* Section Header & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#ECEEF1]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#17191D]">
              PRODUCTOS DESTACADOS
            </h2>
            <p className="text-xs text-[#68707D] mt-0.5">
              Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E2E4E9] text-xs font-bold text-[#17191D]"
            >
              <SlidersHorizontal size={15} />
              <span>Filtros</span>
            </button>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Ordenar por:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                className="text-xs font-bold bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-[#17191D] focus:outline-none focus:border-[#F28C28]"
              >
                <option value="relevance">Más relevantes</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="newest">Novedades</option>
              </select>
            </div>

            {/* View Switcher (Grid / List) */}
            <div className="hidden sm:flex items-center bg-[#ECEEF1] p-1 rounded-xl">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded-lg transition ${
                  layout === 'grid' ? 'bg-white shadow text-[#F28C28]' : 'text-gray-500 hover:text-black'
                }`}
                title="Vista en cuadrícula"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-1.5 rounded-lg transition ${
                  layout === 'list' ? 'bg-white shadow text-[#F28C28]' : 'text-gray-500 hover:text-black'
                }`}
                title="Vista en lista"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout: Left Sidebar + Right Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-36">
            <FilterSidebar />
          </div>

          {/* Products Grid or Empty State */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#ECEEF1] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-[#F28C28]">
                  <SlidersHorizontal size={28} />
                </div>
                <h3 className="font-black text-lg text-[#17191D]">
                  No se encontraron productos con esos filtros
                </h3>
                <p className="text-xs text-[#68707D] max-w-sm mx-auto">
                  Intentá cambiar el rango de precios o quitar categorías seleccionadas para ver más opciones disponibles.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d9771e] text-white text-xs font-bold uppercase tracking-wider transition"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            ) : (
              <div
                className={
                  layout === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                    : 'flex flex-col gap-4'
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} layout={layout} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. WHATSAPP CTA BANNER */}
      <WhatsAppCTA />

      {/* 6. MOBILE FILTER MODAL */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center lg:hidden">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-sm">Filtros de Búsqueda</h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 text-gray-400 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>
            <FilterSidebar onCloseMobile={() => setIsMobileFiltersOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
