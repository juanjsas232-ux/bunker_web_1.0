import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { ProductVariant } from '../types';
import {
  formatPrice,
  calculateInstallments,
  buildProductInquiryWhatsAppUrl,
} from '../lib/utils';
import { ProductCard } from '../components/ProductCard';
import {
  ShoppingCart,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  Plus,
  Minus,
  CreditCard,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, settings } = useStore();
  const { addItem } = useCart();

  const product = products.find((p) => p.slug === slug || p.id === slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [postalCode, setPostalCode] = useState('');
  const [shippingCalcResult, setShippingCalcResult] = useState<string | null>(null);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedVariant(product.variants?.[0]);
      setQuantity(1);
      window.scrollTo(0, 0);
    }
  }, [product, slug]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-[#17191D]">Producto no encontrado</h2>
        <p className="text-sm text-gray-500 mt-2">El artículo que estás buscando no existe o fue descontinuado.</p>
        <Link
          to="/catalogo"
          className="inline-block mt-4 px-6 py-2.5 bg-[#F28C28] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = effectiveStock <= 0;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'default', productId: product.id, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', isPrimary: true, order: 1 }];

  const handleAddToCart = () => {
    if (isOutOfStock || effectivePrice === null) return;
    const ok = addItem(product, selectedVariant, quantity);
    if (ok) {
      setIsAddedFeedback(true);
      setTimeout(() => setIsAddedFeedback(false), 2500);
    }
  };

  const handleWhatsAppInquiry = () => {
    const url = buildProductInquiryWhatsAppUrl(
      product.name,
      selectedVariant?.sku || product.sku,
      selectedVariant?.name,
      settings.whatsappNumber
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (postalCode.trim().length >= 4) {
      const isFree = effectivePrice && effectivePrice >= (settings.freeShippingMinAmount || 85000);
      setShippingCalcResult(
        isFree
          ? '¡Envío BONIFICADO a tu localidad mediante Correo Argentino / Andreani!'
          : 'Costo estimado de envío: $ 4.850 (Llega en 2 a 4 días hábiles).'
      );
    }
  };

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.isActive)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-[#F28C28]">Inicio</Link>
        <ChevronRight size={14} />
        <Link to="/catalogo" className="hover:text-[#F28C28]">Catálogo</Link>
        {product.categoryName && (
          <>
            <ChevronRight size={14} />
            <Link to={`/catalogo?categoria=${product.categoryId}`} className="hover:text-[#F28C28]">
              {product.categoryName}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-[#17191D] font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2. MAIN PRODUCT HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (6 cols) */}
        <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[500px]">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border-2 p-1 flex-shrink-0 transition ${
                    activeImageIndex === idx
                      ? 'border-[#F28C28] ring-2 ring-[#F28C28]/20'
                      : 'border-[#ECEEF1] hover:border-gray-400'
                  }`}
                >
                  <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image */}
          <div className="flex-1 bg-white rounded-3xl border border-[#ECEEF1] p-6 flex items-center justify-center relative aspect-square shadow-sm">
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-[#F28C28] text-white text-xs font-black uppercase px-3 py-1 rounded shadow">
                NUEVO!
              </span>
            )}
            {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
              <span className="absolute top-4 right-4 bg-[#17191D] text-[#F28C28] border border-[#F28C28] text-xs font-black uppercase px-3 py-1 rounded shadow">
                {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
              </span>
            )}

            <img
              src={images[activeImageIndex]?.url}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>

        {/* Right: Buy Box & Specs (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              <span className="font-bold uppercase tracking-wider text-[#17191D] bg-[#ECEEF1] px-2.5 py-1 rounded-md">
                {product.brandName || 'BUNKER'}
              </span>
              <span>SKU: <strong className="font-mono text-gray-700">{selectedVariant?.sku || product.sku}</strong></span>
              {product.categoryName && (
                <>
                  <span>•</span>
                  <span>{product.categoryName}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#17191D] tracking-tight">
              {product.name}
            </h1>
          </div>

          {/* Price Box */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#ECEEF1] space-y-2">
            {effectivePrice === null ? (
              <div>
                <p className="text-2xl font-black text-[#17191D]">Consultar precio</p>
                <p className="text-xs text-gray-500 mt-1">
                  Este producto se cotiza a pedido según especificación o partida comercial.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#17191D]">
                    {formatPrice(effectivePrice)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > effectivePrice && (
                    <span className="text-base text-gray-400 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>

                {calculateInstallments(effectivePrice, 3) && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F28C28] mt-1">
                    <CreditCard size={15} />
                    <span>{calculateInstallments(effectivePrice, 3)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Stock indicator */}
            <div className="pt-2 flex items-center justify-between text-xs border-t border-[#ECEEF1]/80">
              <span
                className={`inline-flex items-center gap-2 font-bold ${
                  isOutOfStock ? 'text-red-500' : 'text-[#25D366]'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-[#25D366]'}`} />
                {isOutOfStock
                  ? 'Agotado actualmente'
                  : `En stock disponible (${effectiveStock} unidades)`}
              </span>

              {effectiveStock > 0 && effectiveStock <= (product.lowStockThreshold || 4) && (
                <span className="text-[11px] font-bold text-[#F28C28] animate-pulse">
                  ¡Últimas unidades disponibles!
                </span>
              )}
            </div>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-[#17191D]">
                Variante seleccionada: <span className="text-[#F28C28]">{selectedVariant?.name || 'Elige una opción'}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isVarOutOfStock = v.stock <= 0;

                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                        isSelected
                          ? 'border-[#F28C28] bg-white ring-2 ring-[#F28C28]/20 text-[#17191D] shadow-sm'
                          : isVarOutOfStock
                          ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-60'
                          : 'border-[#ECEEF1] bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {v.colorHex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300"
                          style={{ backgroundColor: v.colorHex }}
                        />
                      )}
                      <span>{v.name}</span>
                      {isVarOutOfStock ? (
                        <span className="text-[10px] text-red-500 font-normal">(Agotado)</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-normal">({v.stock})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity and Primary Actions */}
          <div className="space-y-4 pt-2">
            {!isOutOfStock && effectivePrice !== null && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#17191D]">Cantidad:</span>
                <div className="flex items-center border border-[#ECEEF1] rounded-xl bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-l-xl transition disabled:opacity-30"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="px-4 text-sm font-black text-[#17191D]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
                    disabled={quantity >= effectiveStock}
                    className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-r-xl transition disabled:opacity-30"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3">
              {effectivePrice === null ? (
                <button
                  onClick={handleWhatsAppInquiry}
                  className="flex-1 py-4 px-6 rounded-2xl bg-[#282C33] hover:bg-[#17191D] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle size={18} className="text-[#25D366]" />
                  <span>Consultar precio por WhatsApp</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-95 ${
                      isOutOfStock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isAddedFeedback
                        ? 'bg-[#25D366] text-white'
                        : 'bg-[#F28C28] hover:bg-[#d9771e] text-white hover:shadow-orange-glow'
                    }`}
                  >
                    {isOutOfStock ? (
                      'Sin stock disponible'
                    ) : isAddedFeedback ? (
                      <>
                        <Check size={18} />
                        <span>¡Agregado al carrito!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} />
                        <span>Agregar al Carrito</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleWhatsAppInquiry}
                    className="py-4 px-5 rounded-2xl bg-[#17191D] hover:bg-[#282C33] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                    title="Consultar al asesor comercial"
                  >
                    <MessageCircle size={18} className="text-[#25D366]" />
                    <span>Consultar</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Shipping Calculator */}
          <div className="bg-white p-4 rounded-2xl border border-[#ECEEF1] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#17191D]">
              <Truck size={16} className="text-[#F28C28]" />
              <span>Calcular costo de envío a tu localidad</span>
            </div>
            <form onSubmit={handleCalculateShipping} className="flex gap-2">
              <input
                type="text"
                placeholder="Código Postal (ej: 4400)"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="text-xs bg-[#FAFAF8] border border-[#ECEEF1] rounded-xl px-3 py-2 flex-1 focus:outline-none focus:border-[#F28C28]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#17191D] text-white rounded-xl text-xs font-bold hover:bg-[#282C33] transition"
              >
                Calcular
              </button>
            </form>
            {shippingCalcResult && (
              <p className="text-xs text-gray-600 font-medium pt-1">{shippingCalcResult}</p>
            )}
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 pt-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#25D366]" />
              <span>Garantía oficial directa</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-[#25D366]" />
              <span>30 días de cambio</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DESCRIPTION & SPECS TABS */}
      <div className="bg-white rounded-3xl border border-[#ECEEF1] p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-lg font-black uppercase tracking-tight text-[#17191D] border-b border-[#ECEEF1] pb-3">
          Descripción del Producto
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed max-w-4xl whitespace-pre-line">
          {product.description}
        </p>

        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="pt-4 border-t border-[#ECEEF1]">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#17191D] mb-4">
              Especificaciones Técnicas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between p-3 rounded-xl bg-[#FAFAF8] text-xs">
                  <span className="font-bold text-gray-600">{key}:</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6">
          <h3 className="text-xl font-black uppercase tracking-tight text-[#17191D]">
            Productos Relacionados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
