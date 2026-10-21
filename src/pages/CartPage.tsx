import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/utils';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, ChevronRight } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems, setIsCheckoutOpen } = useCart();
  const { settings } = useStore();

  const freeShippingThreshold = settings.freeShippingMinAmount || 85000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-black text-[#17191D]">Tu carrito de compras está vacío</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          No tenés productos seleccionados aún. Descubrí las novedades y ofertas en nuestro catálogo.
        </p>
        <Link
          to="/catalogo"
          className="inline-block mt-4 px-6 py-3 bg-[#F28C28] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#d9771e] transition"
        >
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-[#F28C28]">Inicio</Link>
        <ChevronRight size={14} />
        <span className="text-[#17191D] font-bold">Carrito de Compras</span>
      </nav>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#ECEEF1] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17191D]">
            Tu Carrito de Compras
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Revisá tus artículos antes de iniciar la solicitud por WhatsApp
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-gray-400 hover:text-red-500 transition"
        >
          Vaciar todo el carrito
        </button>
      </div>

      {/* Free Shipping Strip */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECEEF1] shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold">
          <Truck size={18} className={isFreeShipping ? 'text-[#25D366]' : 'text-[#F28C28]'} />
          {isFreeShipping ? (
            <span className="text-[#25D366]">¡Tenés envío bonificado a cualquier punto del país!</span>
          ) : (
            <span>
              Agregá <strong className="text-[#17191D]">{formatPrice(missingForFreeShipping)}</strong> más para envío gratuito.
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${isFreeShipping ? 'bg-[#25D366]' : 'bg-[#F28C28]'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grid: Items Table + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const maxStock = item.variant ? item.variant.stock : item.product.stock;

            return (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECEEF1] shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                    alt={item.product.name}
                    className="w-20 h-20 object-contain rounded-xl bg-[#FAFAF8] p-2 border border-[#ECEEF1] flex-shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase">
                      SKU: {item.variant?.sku || item.product.sku}
                    </span>
                    <h3 className="font-bold text-sm text-[#17191D] hover:text-[#F28C28]">
                      <Link to={`/producto/${item.product.slug}`}>{item.product.name}</Link>
                    </h3>
                    {item.variant && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Variante: <strong>{item.variant.name}</strong>
                      </p>
                    )}
                    <p className="text-xs font-bold text-[#F28C28] mt-1">
                      {formatPrice(item.unitPrice)} c/u
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#ECEEF1]">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#ECEEF1] rounded-xl bg-[#FAFAF8]">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-gray-500 hover:text-black rounded-l-xl"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-xs font-black">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= maxStock}
                      className="p-2 text-gray-500 hover:text-black rounded-r-xl disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[90px]">
                    <p className="text-sm font-black text-[#17191D]">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                    title="Eliminar artículo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#ECEEF1] p-6 shadow-md space-y-4 sticky top-36">
          <h3 className="font-black text-sm uppercase tracking-wider text-[#17191D] border-b border-[#ECEEF1] pb-3">
            Resumen del Pedido
          </h3>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Productos ({totalItems}):</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío nacional:</span>
              <span className="text-[#25D366] font-bold">
                {isFreeShipping ? 'Bonificado' : 'A convenir con vendedor'}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#ECEEF1] text-base font-black text-[#17191D]">
              <span>Total Estimado:</span>
              <span className="text-[#F28C28]">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full py-4 px-6 rounded-2xl bg-[#F28C28] hover:bg-[#d9771e] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-glow transition active:scale-95"
          >
            <span>Finalizar por WhatsApp</span>
            <ArrowRight size={16} />
          </button>

          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            Sin pagos automáticos con tarjeta. Tu solicitud se confirma directamente con nuestro asesor de ventas.
          </p>
        </div>
      </div>
    </div>
  );
};
