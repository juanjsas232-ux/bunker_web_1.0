import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../lib/utils';
import { X, MessageCircle, MapPin, Phone, User, Package, Calendar, Check, AlertCircle } from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  const { updateOrderStatus } = useStore();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('nuevo');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState(false);

  React.useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      setUpdateFeedback(true);
      setTimeout(() => setUpdateFeedback(false), 2000);
    } catch (e: any) {
      alert(`Error actualizando estado: ${e.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const cleanCustomerPhone = order.customerPhone.replace(/\D/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#ECEEF1]">
        {/* Header */}
        <div className="bg-[#17191D] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#282C33]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F28C28]">
              Detalle de Solicitud Comercial
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
              Pedido {order.reference}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#282C33]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {/* Status Controls */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#ECEEF1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Estado del Pedido:
              </span>
              <p className="text-xs text-gray-400">
                Podés actualizar el estado a medida que avances con el cliente.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                disabled={isUpdating}
                className="text-xs font-bold bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-[#17191D] focus:outline-none focus:border-[#F28C28]"
              >
                <option value="nuevo">Nuevo</option>
                <option value="pendiente">Pendiente de confirmación</option>
                <option value="confirmado">Confirmado</option>
                <option value="preparando">Preparando</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>

              {updateFeedback && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#25D366]">
                  <Check size={14} /> Guardado
                </span>
              )}
            </div>
          </div>

          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-2xl border border-[#ECEEF1]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <User size={15} />
                <span className="font-bold text-[#17191D]">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Phone size={15} />
                <span>{order.customerPhone}</span>
              </div>
              <a
                href={`https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(`Hola ${order.customerName}! Me contacto desde BUNKER por tu pedido ${order.reference}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-xl font-bold transition text-[11px]"
              >
                <MessageCircle size={14} />
                <span>Escribir al cliente por WhatsApp</span>
              </a>
            </div>

            <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-[#ECEEF1] pt-3 sm:pt-0 sm:pl-4">
              <div className="flex items-start gap-2 text-gray-500">
                <MapPin size={15} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-[#17191D]">{order.customerCity}, {order.customerProvince}</p>
                  {order.customerAddress && (
                    <p className="text-gray-600 mt-0.5">{order.customerAddress}</p>
                  )}
                </div>
              </div>
              <p className="text-gray-500">
                Método: <strong className="capitalize text-gray-800">{order.deliveryMethod}</strong>
              </p>
              <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                <Calendar size={13} />
                <span>{new Date(order.createdAt).toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs">
              <strong className="text-gray-700">Notas del cliente:</strong>
              <p className="text-gray-600 mt-0.5">{order.notes}</p>
            </div>
          )}

          {/* Items breakdown */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#17191D] mb-3 flex items-center gap-2">
              <Package size={16} className="text-[#F28C28]" />
              Artículos del Pedido ({order.items.length})
            </h4>

            <div className="divide-y divide-[#ECEEF1] border border-[#ECEEF1] rounded-2xl overflow-hidden bg-white">
              {order.items.map((it, idx) => (
                <div key={idx} className="p-3.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#17191D] text-sm">{it.productName}</p>
                    <p className="text-[11px] text-gray-500 font-mono">
                      SKU: {it.sku} {it.variantName ? `• Variante: ${it.variantName}` : ''}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {it.quantity} x {formatPrice(it.unitPrice)}
                    </p>
                  </div>
                  <span className="font-black text-sm text-[#17191D]">
                    {formatPrice(it.subtotal)}
                  </span>
                </div>
              ))}

              <div className="p-4 bg-[#FAF8F5] flex justify-between items-center text-sm font-black">
                <span>Total Registrado:</span>
                <span className="text-base text-[#F28C28]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-[#ECEEF1] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#17191D] text-white rounded-xl font-bold text-xs hover:bg-[#282C33]"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};
