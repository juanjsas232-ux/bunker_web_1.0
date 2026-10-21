import React, { useState } from 'react';
import { X, MessageCircle, ShieldCheck, MapPin, Phone, User, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/utils';

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, items, subtotal, submitOrderViaWhatsApp, isSubmittingOrder } = useCart();
  const { settings } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    province: 'Salta',
    address: '',
    deliveryMethod: 'envio' as 'envio' | 'sucursal' | 'retiro',
    notes: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.name.trim()) {
      setErrorMessage('Por favor ingresá tu nombre y apellido.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setErrorMessage('Por favor ingresá un teléfono o WhatsApp de contacto válido.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('Por favor ingresá tu localidad o ciudad.');
      return;
    }

    const res = await submitOrderViaWhatsApp({
      name: formData.name,
      phone: formData.phone,
      city: formData.city,
      province: formData.province,
      address: formData.address,
      deliveryMethod: formData.deliveryMethod,
      notes: formData.notes,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Ocurrió un error al generar el pedido.');
    }
  };

  const provinces = [
    'Salta', 'Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán',
    'Entre Ríos', 'Misiones', 'Chaco', 'Corrientes', 'Santiago del Estero', 'San Juan',
    'Jujuy', 'Río Negro', 'Neuquén', 'Formosa', 'Chubut', 'San Luis', 'Catamarca',
    'La Rioja', 'La Pampa', 'Santa Cruz', 'Tierra del Fuego'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#ECEEF1]">
        {/* MODAL HEADER */}
        <div className="bg-[#17191D] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#282C33]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#F28C28] tracking-widest">
              Paso Final • Compra Segura
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
              Confirmar pedido por WhatsApp
            </h3>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#282C33] transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* ORDER RECAP BANNER */}
        <div className="bg-[#FAF8F5] p-4 border-b border-[#ECEEF1] flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-gray-600">
              Resumen: <strong>{items.length} {items.length === 1 ? 'artículo' : 'artículos'}</strong>
            </p>
            <p className="text-[11px] text-gray-400">Precios y stock validados</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-gray-500">Total a coordinar:</span>
            <p className="text-base font-black text-[#F28C28]">{formatPrice(subtotal)}</p>
          </div>
        </div>

        {/* ERROR ALERT */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-[#17191D] mb-1.5 uppercase tracking-wider">
                Nombre y Apellido <span className="text-[#F28C28]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5 pl-10 focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                />
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Teléfono / WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-[#17191D] mb-1.5 uppercase tracking-wider">
                Teléfono / WhatsApp <span className="text-[#F28C28]">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="Ej: 387 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5 pl-10 focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                />
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Localidad / Ciudad */}
            <div>
              <label className="block text-xs font-bold text-[#17191D] mb-1.5 uppercase tracking-wider">
                Ciudad / Localidad <span className="text-[#F28C28]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ej: Salta Capital"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5 pl-10 focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                />
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Provincia */}
            <div>
              <label className="block text-xs font-bold text-[#17191D] mb-1.5 uppercase tracking-wider">
                Provincia <span className="text-[#F28C28]">*</span>
              </label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F28C28]"
              >
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs font-bold text-[#17191D] mb-1.5 uppercase tracking-wider">
              Dirección de entrega <span className="text-gray-400 text-[10px] font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Calle, número, piso o depto (si solicitás envío a domicilio)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F28C28]"
            />
          </div>

          {/* Método de Entrega */}
          <div>
            <label className="block text-xs font-bold text-[#17191D] mb-1.5 uppercase tracking-wider">
              Preferencia de Entrega
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'envio', label: 'Envío Domicilio' },
                { id: 'sucursal', label: 'Sucursal Correo' },
                { id: 'retiro', label: 'Retiro en Salta' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, deliveryMethod: m.id as any })}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    formData.deliveryMethod === m.id
                      ? 'bg-[#17191D] text-white border-[#17191D]'
                      : 'bg-white text-gray-600 border-[#ECEEF1] hover:bg-gray-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold text-[#17191D] mb-1.5 uppercase tracking-wider">
              Observaciones o Aclaraciones <span className="text-gray-400 text-[10px] font-normal">(Opcional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Horario de preferencia de llamada o entrega, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#F28C28]"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmittingOrder}
              className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingOrder ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Generando pedido seguro...</span>
                </>
              ) : (
                <>
                  <MessageCircle size={20} />
                  <span>Enviar Pedido por WhatsApp</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-center text-[11px] text-[#68707D] pt-1">
            <ShieldCheck size={14} className="text-[#25D366] flex-shrink-0" />
            <span>
              Al pulsar el botón se abrirá WhatsApp con el detalle completo de tu pedido para coordinar pago y entrega.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
