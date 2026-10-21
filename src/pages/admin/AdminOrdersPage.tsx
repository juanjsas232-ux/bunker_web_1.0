import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { formatPrice } from '../../lib/utils';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import {
  ShoppingBag,
  Search,
  Eye,
  MessageCircle,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Calendar,
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = o.reference.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchCity = o.customerCity.toLowerCase().includes(q);
      if (!matchRef && !matchName && !matchCity) return false;
    }
    if (statusFilter !== 'todos' && o.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleQuickStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const statusColors: Record<string, string> = {
    nuevo: 'bg-blue-50 text-blue-700 border-blue-200',
    pendiente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmado: 'bg-green-50 text-green-700 border-green-200',
    preparando: 'bg-purple-50 text-purple-700 border-purple-200',
    entregado: 'bg-gray-100 text-gray-700 border-gray-300',
    cancelado: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17191D]">
            Gestión de Pedidos
          </h1>
          <p className="text-xs text-[#68707D] mt-0.5">
            Seguimiento de pedidos registrados a través del flujo de WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-[#FAF8F5] border border-[#ECEEF1] px-3 py-1.5 rounded-xl text-gray-700">
            {orders.length} pedidos registrados
          </span>
        </div>
      </div>

      {/* 2. FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECEEF1] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por referencia, cliente o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#F28C28]"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'nuevo', label: 'Nuevo' },
            { id: 'pendiente', label: 'Pendiente' },
            { id: 'confirmado', label: 'Confirmado' },
            { id: 'preparando', label: 'Preparando' },
            { id: 'entregado', label: 'Entregado' },
            { id: 'cancelado', label: 'Cancelado' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st.id
                  ? 'bg-[#17191D] text-white shadow-sm'
                  : 'bg-[#FAFAF8] text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. ORDERS TABLE */}
      <div className="bg-white rounded-3xl border border-[#ECEEF1] shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-gray-400 space-y-2">
            <ShoppingBag size={36} className="mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-700">No hay pedidos que coincidan</p>
            <p className="text-xs">Los pedidos generados por clientes aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#ECEEF1] text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Referencia</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Destino</th>
                  <th className="py-3.5 px-4">Artículos</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEF1]">
                {filteredOrders.map((ord) => {
                  const cleanCustomerPhone = ord.customerPhone.replace(/\D/g, '');

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4 font-mono font-black text-[#17191D]">
                        {ord.reference}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(ord.createdAt).toLocaleDateString('es-AR')}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#17191D]">{ord.customerName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{ord.customerPhone}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {ord.customerCity}, {ord.customerProvince}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {ord.items.length} {ord.items.length === 1 ? 'ítem' : 'ítems'}
                      </td>
                      <td className="py-3 px-4 font-black text-[#17191D]">
                        {formatPrice(ord.total)}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleQuickStatusChange(ord.id, e.target.value as OrderStatus)}
                          className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                            statusColors[ord.status] || 'bg-gray-100'
                          }`}
                        >
                          <option value="nuevo">Nuevo</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="preparando">Preparando</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(`Hola ${ord.customerName}! Me contacto desde BUNKER por tu pedido ${ord.reference}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition"
                            title="Abrir WhatsApp del comprador"
                          >
                            <MessageCircle size={16} />
                          </a>
                          <button
                            onClick={() => handleOpenDetails(ord)}
                            className="p-1.5 text-gray-500 hover:text-[#17191D] hover:bg-gray-100 rounded-lg transition"
                            title="Ver detalle del pedido"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </div>
  );
};
