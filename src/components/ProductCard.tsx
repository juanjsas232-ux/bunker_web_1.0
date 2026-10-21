import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, MessageCircle, Check } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { formatPrice, calculateInstallments, buildProductInquiryWhatsAppUrl } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid' }) => {
  const { addItem } = useCart();
  const { settings } = useStore();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
  const effectivePrice = selectedVariant?.price ?? product.price;
  const isOutOfStock = product.stock <= 0 || (selectedVariant && selectedVariant.stock <= 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || effectivePrice === null) return;

    const added = addItem(product, selectedVariant, 1);
    if (added) {
      setIsAddedRecently(true);
      setTimeout(() => setIsAddedRecently(false), 2000);
    }
  };

  const handleWhatsAppConsult = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = buildProductInquiryWhatsAppUrl(
      product.name,
      product.sku,
      selectedVariant?.name,
      settings.whatsappNumber
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (layout === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-[#ECEEF1] p-4 flex flex-col sm:flex-row items-center gap-6 hover:shadow-lg transition group">
        <Link to={`/producto/${product.slug}`} className="w-full sm:w-48 aspect-square relative bg-[#F7F8FA] rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-[#F28C28] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
              NUEVO!
            </span>
          )}
        </Link>

        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{product.brandName}</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-mono text-gray-400">{product.sku}</span>
          </div>

          <Link to={`/producto/${product.slug}`} className="block">
            <h3 className="font-bold text-base text-[#17191D] hover:text-[#F28C28] transition line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-[#68707D] line-clamp-2">{product.description}</p>

          <div className="flex items-center gap-3 pt-1">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isOutOfStock ? 'text-red-500' : 'text-[#25D366]'}`}>
              <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-[#25D366]'}`} />
              {isOutOfStock ? 'Agotado' : 'En stock'}
            </span>
            {effectivePrice !== null && (
              <span className="text-xs text-gray-500">
                {calculateInstallments(effectivePrice, 3)}
              </span>
            )}
          </div>
        </div>

        <div className="w-full sm:w-48 flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ECEEF1]">
          <div className="text-left sm:text-right">
            {product.compareAtPrice && product.compareAtPrice > (effectivePrice || 0) && (
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </p>
            )}
            <p className="text-xl font-black text-[#17191D]">
              {formatPrice(effectivePrice)}
            </p>
          </div>

          <button
            onClick={effectivePrice === null ? handleWhatsAppConsult : handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isAddedRecently
                ? 'bg-[#25D366] text-white'
                : 'bg-[#F28C28] hover:bg-[#d9771e] text-white shadow-sm'
            }`}
          >
            {isOutOfStock ? (
              'Sin stock'
            ) : isAddedRecently ? (
              <>
                <Check size={16} />
                <span>¡Agregado!</span>
              </>
            ) : effectivePrice === null ? (
              <>
                <MessageCircle size={16} />
                <span>Consultar</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl border border-[#ECEEF1] p-3.5 flex flex-col justify-between hover:shadow-xl hover:border-gray-300 transition-all duration-300 relative">
      {/* 1. TOP BADGES */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-1 items-start">
        {product.isNew && (
          <span className="bg-[#F28C28] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
            NUEVO!
          </span>
        )}
        {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
          <span className="bg-[#17191D] text-[#F28C28] border border-[#F28C28] text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
            {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
          </span>
        )}
      </div>

      {/* 2. PRODUCT IMAGE */}
      <Link
        to={`/producto/${product.slug}`}
        className="w-full aspect-square bg-[#F7F8FA] rounded-xl overflow-hidden relative flex items-center justify-center p-4 block group"
      >
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
        />

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-[#17191D] text-xs font-bold py-1.5 px-3 rounded-full shadow-lg flex items-center gap-1.5">
            <Eye size={14} />
            Ver detalle
          </span>
        </div>
      </Link>

      {/* 3. PRODUCT INFO */}
      <div className="pt-3.5 pb-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-gray-400">
              {product.brandName || 'BUNKER'}
            </span>
            <span className="font-mono text-[10px] text-gray-400">{product.sku}</span>
          </div>

          <Link to={`/producto/${product.slug}`} className="block">
            <h3 className="font-bold text-sm text-[#17191D] hover:text-[#F28C28] transition line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Installments */}
        <div className="pt-2">
          {product.compareAtPrice && product.compareAtPrice > (effectivePrice || 0) ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
              <span className="text-lg font-black text-[#F28C28]">
                {formatPrice(effectivePrice)}
              </span>
            </div>
          ) : (
            <p className="text-lg font-black text-[#17191D]">
              {formatPrice(effectivePrice)}
            </p>
          )}

          {/* Stock Indicator */}
          <div className="flex items-center justify-between mt-1 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 font-semibold text-[11px] ${
                isOutOfStock ? 'text-red-500' : 'text-[#25D366]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-[#25D366]'}`} />
              {isOutOfStock ? 'Agotado' : 'En stock'}
            </span>

            {/* Installments teaser */}
            {effectivePrice !== null && (
              <span className="text-[10px] text-gray-400 font-medium">
                3 cuotas sin interés
              </span>
            )}
          </div>
        </div>

        {/* Variants Color dots (matching the uploaded mockup) */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-1.5 pt-2.5">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedVariant(v);
                  }}
                  title={`${v.name} (Stock: ${v.stock})`}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    isSelected ? 'ring-2 ring-[#F28C28] scale-110' : 'border-gray-300 opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: v.colorHex || '#17191D',
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ACTIONS */}
      <div className="pt-2">
        {effectivePrice === null ? (
          <button
            onClick={handleWhatsAppConsult}
            className="w-full py-2.5 px-3 rounded-xl bg-[#282C33] hover:bg-[#3F444E] text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <MessageCircle size={15} className="text-[#25D366]" />
            <span>Consultar precio</span>
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : isAddedRecently
                ? 'bg-[#25D366] text-white'
                : 'bg-[#F28C28] hover:bg-[#d9771e] text-white shadow-sm hover:shadow-md'
            }`}
          >
            {isOutOfStock ? (
              'Agotado'
            ) : isAddedRecently ? (
              <>
                <Check size={16} />
                <span>¡Agregado al carrito!</span>
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                <span>Agregar al carrito</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
