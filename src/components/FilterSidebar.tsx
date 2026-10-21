import React from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/utils';

interface FilterSidebarProps {
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ onCloseMobile }) => {
  const { categories, brands, products, filters, setFilters, resetFilters } = useStore();

  const handleCategoryToggle = (catId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: prev.categoryId === catId ? null : catId,
    }));
  };

  const handleBrandToggle = (brandId: string) => {
    setFilters((prev) => {
      const exists = prev.brandIds.includes(brandId);
      return {
        ...prev,
        brandIds: exists ? prev.brandIds.filter((b) => b !== brandId) : [...prev.brandIds, brandId],
      };
    });
  };

  // Color options present in variants
  const colorOptions = [
    { name: 'Negro', hex: '#17191D' },
    { name: 'Gris', hex: '#68707D' },
    { name: 'Blanco', hex: '#FAFAF8' },
    { name: 'Azul', hex: '#1E3A8A' },
    { name: 'Verde', hex: '#14532D' },
    { name: 'Naranja', hex: '#F28C28' },
  ];

  const totalInStock = products.filter((p) => p.stock > 0).length;

  return (
    <div className="w-full bg-white rounded-2xl border border-[#ECEEF1] p-5 space-y-6">
      {/* 1. HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ECEEF1]">
        <h3 className="font-black text-xs uppercase tracking-wider text-[#17191D]">
          FILTRAR PRODUCTOS
        </h3>
        <button
          onClick={resetFilters}
          className="text-[11px] font-bold text-[#F28C28] hover:text-[#d9771e] flex items-center gap-1 transition"
        >
          <RotateCcw size={12} />
          <span>Limpiar filtros</span>
        </button>
      </div>

      {/* 2. CATEGORÍAS */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-[#17191D] mb-3">
          CATEGORÍA
        </h4>
        <div className="space-y-2">
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const isChecked = filters.categoryId === cat.id;

            return (
              <label
                key={cat.id}
                className="flex items-center justify-between text-xs text-gray-700 hover:text-[#17191D] cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#F28C28] focus:ring-[#F28C28] accent-[#F28C28] cursor-pointer"
                  />
                  <span className={`group-hover:font-medium ${isChecked ? 'font-bold text-[#F28C28]' : ''}`}>
                    {cat.name}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. PRECIO RANGE */}
      <div className="pt-2 border-t border-[#ECEEF1]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#17191D]">
            PRECIO (ARS)
          </h4>
          {(filters.minPrice !== null || filters.maxPrice !== null) && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, minPrice: null, maxPrice: null }))}
              className="text-[10px] text-gray-400 hover:text-[#F28C28]"
            >
              Restablecer
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 font-medium">Mínimo</span>
              <input
                type="number"
                placeholder="$ 0"
                value={filters.minPrice ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minPrice: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full text-xs bg-[#FAFAF8] border border-[#E2E4E9] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#F28C28]"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-medium">Máximo</span>
              <input
                type="number"
                placeholder="$ 300.000"
                value={filters.maxPrice ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxPrice: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full text-xs bg-[#FAFAF8] border border-[#E2E4E9] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#F28C28]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. MARCA */}
      <div className="pt-2 border-t border-[#ECEEF1]">
        <h4 className="text-xs font-black uppercase tracking-wider text-[#17191D] mb-3">
          MARCA
        </h4>
        <div className="space-y-2">
          {brands.map((brand) => {
            const count = products.filter((p) => p.brandId === brand.id || p.brandName === brand.name).length;
            const isChecked = filters.brandIds.includes(brand.id);

            return (
              <label
                key={brand.id}
                className="flex items-center justify-between text-xs text-gray-700 hover:text-[#17191D] cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandToggle(brand.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#F28C28] focus:ring-[#F28C28] accent-[#F28C28] cursor-pointer"
                  />
                  <span className={`group-hover:font-medium ${isChecked ? 'font-bold text-[#F28C28]' : ''}`}>
                    {brand.name}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. DISPONIBILIDAD */}
      <div className="pt-2 border-t border-[#ECEEF1]">
        <h4 className="text-xs font-black uppercase tracking-wider text-[#17191D] mb-3">
          DISPONIBILIDAD
        </h4>
        <label className="flex items-center justify-between text-xs text-gray-700 hover:text-[#17191D] cursor-pointer">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-[#F28C28] focus:ring-[#F28C28] accent-[#F28C28] cursor-pointer"
            />
            <span className={filters.inStockOnly ? 'font-bold text-[#25D366]' : ''}>
              Solo en stock
            </span>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">({totalInStock})</span>
        </label>
      </div>

      {/* 6. COLORES */}
      <div className="pt-2 border-t border-[#ECEEF1]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#17191D]">
            COLORES
          </h4>
          {filters.selectedColorHex && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, selectedColorHex: null }))}
              className="text-[10px] text-gray-400 hover:text-[#F28C28]"
            >
              Quitar
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => {
            const isSelected = filters.selectedColorHex?.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    selectedColorHex: isSelected ? null : color.hex,
                  }))
                }
                title={color.name}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                  isSelected ? 'ring-2 ring-[#F28C28] scale-110' : 'border-gray-300 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <Check
                    size={12}
                    className={color.hex === '#FAFAF8' ? 'text-black' : 'text-white'}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {onCloseMobile && (
        <button
          onClick={onCloseMobile}
          className="w-full mt-4 py-2.5 bg-[#17191D] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          Aplicar Filtros
        </button>
      )}
    </div>
  );
};
