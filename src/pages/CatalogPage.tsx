import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { WhatsAppCTA } from '../components/WhatsAppCTA';
import { LayoutGrid, List, SlidersHorizontal, ChevronRight, X, Sparkles, Tag } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filteredProducts, categories, filters, setFilters, resetFilters } = useStore();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync URL search params with store filters
  useEffect(() => {
    const q = searchParams.get('q');
    const catSlug = searchParams.get('categoria');
    const filtro = searchParams.get('filtro');

    if (q) {
      setFilters((prev) => ({ ...prev, searchQuery: q }));
    }
    if (catSlug) {
      const match = categories.find((c) => c.slug === catSlug);
      if (match) {
        setFilters((prev) => ({ ...prev, categoryId: match.id }));
      }
    }
    if (filtro === 'novedades') {
      setFilters((prev) => ({ ...prev, sortBy: 'newest' }));
    }
  }, [searchParams, categories, setFilters]);

  const activeCategory = categories.find((c) => c.id === filters.categoryId);

  return (
    <div className="space-y-8 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#F28C28]">Inicio</Link>
          <ChevronRight size={14} />
          <span className="text-[#17191D] font-bold">Catálogo</span>
          {activeCategory && (
            <>
              <ChevronRight size={14} />
              <span className="text-[#F28C28] font-bold">{activeCategory.name}</span>
            </>
          )}
        </nav>

        {/* Catalog Banner / Title */}
        <div className="bg-[#17191D] text-white rounded-3xl p-6 sm:p-8 mb-8 border border-[#282C33] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#F28C28] uppercase tracking-wider mb-2">
              <Sparkles size={14} />
              <span>Catálogo Oficial BUNKER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {activeCategory ? activeCategory.name : 'Todos los Productos'}
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              {activeCategory?.description || 'Equipamiento robusto, audio de alto impacto y tecnología para tu día a día.'}
            </p>
          </div>

          {/* Quick Active Filters Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#282C33] text-xs font-medium text-gray-200 border border-[#3F444E]">
                Búsqueda: "{filters.searchQuery}"
                <button onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}>
                  <X size={12} className="hover:text-red-400" />
                </button>
              </span>
            )}
            {activeCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F28C28]/20 text-xs font-medium text-[#F28C28] border border-[#F28C28]/40">
                {activeCategory.name}
                <button onClick={() => setFilters((prev) => ({ ...prev, categoryId: null }))}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#ECEEF1]">
          <div>
            <p className="text-xs text-[#68707D]">
              Mostrando <strong className="text-[#17191D]">{filteredProducts.length}</strong> artículos disponibles
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E2E4E9] text-xs font-bold text-[#17191D]"
            >
              <SlidersHorizontal size={15} />
              <span>Filtros</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Ordenar:</span>
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

            <div className="hidden sm:flex items-center bg-[#ECEEF1] p-1 rounded-xl">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded-lg transition ${
                  layout === 'grid' ? 'bg-white shadow text-[#F28C28]' : 'text-gray-500 hover:text-black'
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-1.5 rounded-lg transition ${
                  layout === 'list' ? 'bg-white shadow text-[#F28C28]' : 'text-gray-500 hover:text-black'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className="hidden lg:block lg:col-span-1 sticky top-36">
            <FilterSidebar />
          </div>

          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#ECEEF1] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-[#F28C28]">
                  <SlidersHorizontal size={28} />
                </div>
                <h3 className="font-black text-lg text-[#17191D]">
                  No se encontraron productos coincidentes
                </h3>
                <p className="text-xs text-[#68707D] max-w-sm mx-auto">
                  Probá modificando los criterios de búsqueda o limpiá los filtros aplicados.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#F28C28] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#d9771e] transition"
                >
                  Restablecer filtros
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
      </div>

      <WhatsAppCTA />

      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center lg:hidden">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-sm">Filtros de Búsqueda</h3>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1 text-gray-400">
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
