import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { BunkerLogo } from './BunkerLogo';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/utils';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { categories, products, settings, filters, setFilters } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live search preview results
  const searchResults = searchQuery.trim().length > 1
    ? products
        .filter(
          (p) =>
            p.isActive &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.brandName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters((prev) => ({ ...prev, searchQuery: searchQuery.trim() }));
      setIsSearchFocused(false);
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cleanPhone = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <header className="sticky top-0 z-40 w-full bg-[#17191D] text-[#FAFAF8] shadow-md border-b border-[#282C33]">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#111315] border-b border-[#282C33]/60 py-1.5 px-4 text-xs font-medium text-center text-[#9CA3AF] tracking-wide flex items-center justify-center gap-4">
        <span>{settings.announcementText}</span>
      </div>

      {/* 2. MAIN HEADER ROW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 md:gap-8">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-[#282C33] transition"
          aria-label="Abrir menú"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* LOGO */}
        <Link to="/" className="flex-shrink-0 transition-transform active:scale-95">
          <BunkerLogo variant="light" size="md" />
        </Link>

        {/* SEARCH BAR (Desktop & Tablet) */}
        <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-xl relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Buscar por nombre, SKU, marca o categoría..."
              className="w-full bg-[#282C33] text-[#FAFAF8] placeholder-gray-400 text-sm rounded-full pl-11 pr-10 py-2.5 border border-[#3F444E] focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] transition duration-150"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#17191D] border border-[#282C33] rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-2 border-b border-[#282C33] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Productos sugeridos
              </div>
              <div className="divide-y divide-[#282C33]/60 max-h-80 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setIsSearchFocused(false);
                      setSearchQuery('');
                      navigate(`/producto/${product.slug}`);
                    }}
                    className="w-full p-2.5 flex items-center gap-3 hover:bg-[#282C33] text-left transition"
                  >
                    <img
                      src={product.images[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-md bg-[#111315] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{product.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="text-[#F28C28] font-mono">{product.sku}</span>
                        <span>•</span>
                        <span>{product.brandName}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#F28C28]">{formatPrice(product.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleSearchSubmit}
                className="w-full py-2 bg-[#282C33] hover:bg-[#333842] text-xs font-semibold text-white text-center transition"
              >
                Ver todos los resultados ({searchResults.length}+)
              </button>
            </div>
          )}
        </div>

        {/* RIGHT QUICK ACTIONS */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* WhatsApp Direct Chat */}
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola Bunker! Quisiera realizar una consulta.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition"
            title="Consultar por WhatsApp"
          >
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </a>

          {/* Admin / Mi Cuenta */}
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-[#282C33] transition text-sm font-medium"
            title="Panel de Administración"
          >
            <User size={19} />
            <span className="hidden lg:inline text-xs font-semibold">Admin / Cuenta</span>
          </Link>

          {/* Shopping Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 bg-[#282C33] hover:bg-[#333842] border border-[#3F444E] px-3.5 py-2 rounded-full transition active:scale-95 group"
            aria-label="Abrir Carrito"
          >
            <ShoppingCart size={19} className="text-[#FAFAF8] group-hover:text-[#F28C28] transition" />
            <span className="hidden sm:inline text-xs font-bold text-[#FAFAF8]">Carrito</span>
            {totalItems > 0 && (
              <span className="bg-[#F28C28] text-white text-[11px] font-black rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. MOBILE SEARCH ROW (Only visible on small devices) */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos, marcas, SKU..."
            className="w-full bg-[#282C33] text-white placeholder-gray-400 text-sm rounded-lg pl-10 pr-8 py-2 border border-[#3F444E] focus:outline-none focus:border-[#F28C28]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X size={15} />
            </button>
          )}
        </form>
      </div>

      {/* 4. SECONDARY NAVIGATION BAR (DESKTOP) */}
      <nav className="hidden lg:block bg-[#111315] border-t border-[#282C33]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-bold tracking-wider uppercase">
          <div className="flex items-center gap-1">
            {/* Categories Dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                onBlur={() => setTimeout(() => setIsCategoriesDropdownOpen(false), 200)}
                className="flex items-center gap-2 py-3 px-4 hover:bg-[#282C33] text-[#FAFAF8] hover:text-[#F28C28] transition"
              >
                <Menu size={16} />
                <span>CATEGORÍAS</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Categories Popover */}
              {isCategoriesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-[#17191D] border border-[#282C33] rounded-b-xl shadow-2xl py-2 z-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/catalogo?categoria=${cat.slug}`}
                      onClick={() => setIsCategoriesDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-[#282C33] transition font-medium"
                    >
                      <span>{cat.name}</span>
                      {cat.productCount && (
                        <span className="text-[10px] text-gray-500 font-mono">{cat.productCount}</span>
                      )}
                    </Link>
                  ))}
                  <div className="border-t border-[#282C33] mt-2 pt-2 px-4">
                    <Link
                      to="/catalogo"
                      onClick={() => setIsCategoriesDropdownOpen(false)}
                      className="text-[#F28C28] text-xs font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Ver todo el catálogo</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Links */}
            <Link
              to="/catalogo?filtro=novedades"
              className="py-3 px-4 hover:bg-[#282C33] text-gray-300 hover:text-[#FAFAF8] transition flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-[#F28C28]" />
              <span>NOVEDADES</span>
            </Link>

            <Link
              to="/catalogo?filtro=ofertas"
              className="py-3 px-4 hover:bg-[#282C33] text-gray-300 hover:text-[#FAFAF8] transition flex items-center gap-1.5"
            >
              <Tag size={14} className="text-[#F28C28]" />
              <span>OFERTAS</span>
            </Link>

            <Link
              to="/catalogo"
              className="py-3 px-4 hover:bg-[#282C33] text-gray-300 hover:text-[#FAFAF8] transition"
            >
              MARCAS
            </Link>

            <Link
              to="/catalogo"
              className="py-3 px-4 hover:bg-[#282C33] text-gray-300 hover:text-[#FAFAF8] transition"
            >
              CATÁLOGO COMPLETO
            </Link>
          </div>

          <div className="flex items-center gap-4 text-[#9CA3AF] text-[11px] font-normal normal-case">
            <span className="flex items-center gap-1 text-[#25D366]">
              <ShieldCheck size={14} />
              Garantía oficial Bunker
            </span>
          </div>
        </div>
      </nav>

      {/* 5. MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#17191D] border-t border-[#282C33] px-4 py-4 space-y-4 shadow-xl">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Categorías</p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogo?categoria=${cat.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-[#282C33] hover:text-[#F28C28]"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-[#282C33] pt-3 space-y-1">
            <Link
              to="/catalogo?filtro=novedades"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-[#282C33]"
            >
              <Sparkles size={16} className="text-[#F28C28]" />
              Novedades
            </Link>
            <Link
              to="/catalogo?filtro=ofertas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-[#282C33]"
            >
              <Tag size={16} className="text-[#F28C28]" />
              Ofertas
            </Link>
            <Link
              to="/catalogo"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-[#282C33]"
            >
              Todo el Catálogo
            </Link>
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#F28C28] hover:bg-[#282C33]"
            >
              <User size={16} />
              Panel de Administración
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
