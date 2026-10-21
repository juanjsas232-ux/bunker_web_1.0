import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/utils';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    subtotal,
    setIsCheckoutOpen,
  } = useCart();
  const { settings } = useStore();

  if (!isOpen) return null;

  const freeShippingThreshold = settings.freeShippingMinAmount || 85000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAFAF8] text-[#17191D] flex flex-col shadow-2xl">
          {/* 1. DRAWER HEADER */}
          <div className="p-4 sm:p-5 bg-[#17191D] text-[#FAFAF8] flex items-center justify-between border-b border-[#282C33]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={20} className="text-[#F28C28]" />
              <h2 className="font-black text-base uppercase tracking-wide">
                Tu Carrito ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#282C33] transition"
              aria-label="Cerrar carrito"
            >
              <X size={20} />
            </button>
          </div>

          {/* 2. FREE SHIPPING BAR */}
          <div className="bg-[#ECEEF1] p-3 text-xs border-b border-[#E2E4E9]">
            <div className="flex items-center gap-2 mb-1.5 font-bold">
              <Truck size={16} className={isFreeShipping ? 'text-[#25D366]' : 'text-[#F28C28]'} />
              {isFreeShipping ? (
                <span className="text-[#25D366]">¡Felicitaciones! Tenés envío bonificado.</span>
              ) : (
                <span>
                  Agregá <strong className="text-[#17191D]">{formatPrice(missingForFreeShipping)}</strong> para envío gratis
                </span>
              )}
            </div>
            <div className="w-full bg-gray-300 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeShipping ? 'bg-[#25D366]' : 'bg-[#F28C28]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 3. ITEM LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <ShoppingBag size={32} />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#17191D]">Tu carrito está vacío</h3>
                  <p className="text-xs text-[#68707D] mt-1 max-w-xs">
                    Explorá nuestro catálogo de audio, tecnología y equipamiento y agregá los productos que te gusten.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#17191D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#282C33] transition"
                >
                  Explorar productos
                </button>
              </div>
            ) : (
              items.map((item) => {
                const maxStock = item.variant ? item.variant.stock : item.product.stock;

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3.5 bg-white p-3.5 rounded-2xl border border-[#ECEEF1] shadow-sm"
                  >
                    {/* Item Image */}
                    <img
                      src={
                        item.product.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120'
                      }
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-contain bg-[#F7F8FA] p-1 flex-shrink-0"
                    />

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-[#17191D] truncate">
                        {item.product.name}
                      </h4>
                      {item.variant && (
                        <p className="text-[11px] text-gray-500 font-medium">
                          Variante: <span className="text-gray-700">{item.variant.name}</span>
                        </p>
                      )}
                      <p className="text-xs font-mono text-gray-400 mt-0.5">
                        SKU: {item.variant?.sku || item.product.sku}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-[#ECEEF1] rounded-lg bg-[#FAFAF8]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 text-gray-600 rounded-l-lg transition"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-[#17191D]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= maxStock}
                            className={`p-1 hover:bg-gray-200 text-gray-600 rounded-r-lg transition ${
                              item.quantity >= maxStock ? 'opacity-40 cursor-not-allowed' : ''
                            }`}
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-xs font-black text-[#17191D]">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-gray-400">
                              {formatPrice(item.unitPrice)} c/u
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition"
                      title="Eliminar artículo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* 4. FOOTER CHECKOUT CALL TO ACTION */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-[#ECEEF1] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#68707D]">
                  <span>Subtotal productos</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[#68707D]">
                  <span>Envío estimado</span>
                  <span>{isFreeShipping ? 'Bonificado' : 'A coordinar por WhatsApp'}</span>
                </div>
                <div className="flex items-center justify-between text-base font-black text-[#17191D] pt-2 border-t border-[#ECEEF1]">
                  <span>Total estimado</span>
                  <span className="text-[#F28C28]">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Finalizar Pedido Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F28C28] hover:bg-[#d9771e] text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-glow transition active:scale-95"
              >
                <span>Finalizar Pedido por WhatsApp</span>
                <ArrowRight size={18} />
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={clearCart}
                  className="text-gray-400 hover:text-red-500 font-medium transition"
                >
                  Vaciar carrito
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-600 hover:text-[#17191D] font-bold transition"
                >
                  Continuar comprando
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
