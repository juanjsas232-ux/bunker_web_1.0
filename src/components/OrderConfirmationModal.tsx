import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, buildWhatsAppMessage } from '../lib/utils';

export const OrderConfirmationModal: React.FC = () => {
  const { completedOrder, resetCompletedOrder } = useCart();
  const [copied, setCopied] = useState(false);

  if (!completedOrder) return null;

  const handleCopy = () => {
    const text = buildWhatsAppMessage(completedOrder);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#ECEEF1] animate-in fade-in zoom-in-95 duration-200">
        {/* TOP STATUS HEADER */}
        <div className="bg-[#17191D] p-6 text-center text-white relative">
          <div className="w-16 h-16 bg-[#25D366]/20 border border-[#25D366]/40 rounded-full flex items-center justify-center mx-auto mb-3 text-[#25D366]">
            <CheckCircle2 size={36} />
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase bg-[#282C33] text-[#F28C28] px-3 py-1 rounded-full border border-[#3F444E]">
            {completedOrder.reference}
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mt-2">
            ¡Pedido Registrado con Éxito!
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Guardado en nuestro sistema. Pendiente de confirmación comercial.
          </p>
        </div>

        {/* ORDER DETAILS */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
          <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#ECEEF1] space-y-2">
            <div className="flex justify-between text-gray-500">
              <span>Cliente:</span>
              <strong className="text-gray-900">{completedOrder.customerName}</strong>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Destino:</span>
              <strong className="text-gray-900">{completedOrder.customerCity}, {completedOrder.customerProvince}</strong>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Teléfono:</span>
              <strong className="text-gray-900">{completedOrder.customerPhone}</strong>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Estado inicial:</span>
              <span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded text-[10px]">
                Nuevo / Pendiente
              </span>
            </div>
          </div>

          {/* Items breakdown */}
          <div>
            <h4 className="font-bold text-[#17191D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Package size={14} className="text-[#F28C28]" />
              Artículos solicitados ({completedOrder.items.length})
            </h4>
            <div className="divide-y divide-[#ECEEF1] border border-[#ECEEF1] rounded-2xl overflow-hidden bg-white">
              {completedOrder.items.map((it, idx) => (
                <div key={idx} className="p-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-[#17191D]">{it.productName}</p>
                    <p className="text-[11px] text-gray-500">
                      SKU: {it.sku} {it.variantName ? `• ${it.variantName}` : ''}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {it.quantity} x {formatPrice(it.unitPrice)}
                    </p>
                  </div>
                  <span className="font-black text-[#17191D]">
                    {formatPrice(it.subtotal)}
                  </span>
                </div>
              ))}
              <div className="p-3 bg-[#FAF8F5] flex justify-between items-center font-black text-sm">
                <span>Total del pedido:</span>
                <span className="text-[#F28C28] text-base">{formatPrice(completedOrder.total)}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs leading-relaxed">
            <strong>¿Qué sigue ahora?</strong><br />
            Se abrió una ventana con nuestro WhatsApp comercial para enviar el resumen del pedido. Un asesor te responderá confirmando el stock y pasándote los datos de pago y envío.
          </div>
        </div>

        {/* ACTIONS */}
        <div className="p-6 bg-[#FAF8F5] border-t border-[#ECEEF1] space-y-2.5">
          {completedOrder.whatsappUrl && (
            <a
              href={completedOrder.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <MessageCircle size={18} />
              <span>Abrir chat de WhatsApp nuevamente</span>
            </a>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-[#ECEEF1] hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              {copied ? <Check size={14} className="text-[#25D366]" /> : <Copy size={14} />}
              <span>{copied ? '¡Copiado!' : 'Copiar mensaje'}</span>
            </button>

            <button
              onClick={resetCompletedOrder}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#17191D] hover:bg-[#282C33] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>Volver a la tienda</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
