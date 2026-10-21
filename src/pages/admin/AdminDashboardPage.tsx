import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../lib/utils';
import {
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Plus,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { products, orders, settings } = useStore();

  const activeProducts = products.filter((p) => p.isActive);
  const lowStockThreshold = settings.stockAlertThreshold || 5;
  const lowStockProducts = products.filter((p) => p.stock <= lowStockThreshold);

  const newOrders = orders.filter((o) => o.status === 'nuevo');
  const pendingOrders = orders.filter((o) => o.status === 'pendiente');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmado' || o.status === 'preparando' || o.status === 'entregado');

  // Sales totals
  const totalRegisteredVolume = orders.reduce((sum, o) => sum + (o.status !== 'cancelado' ? o.total : 0), 0);
  const totalConfirmedSales = confirmedOrders.reduce((sum, o) => sum + o.total, 0);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17191D]">
            Dashboard Comercial
          </h1>
          <p className="text-xs text-[#68707D] mt-0.5">
            Métricas clave, inventario y solicitudes recibidas por WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/productos?nuevo=1"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d9771e] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition"
          >
            <Plus size={16} />
            <span>Nuevo Producto</span>
          </Link>

          <Link
            to="/admin/pedidos"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#17191D] hover:bg-[#282C33] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition"
          >
            <ShoppingBag size={16} />
            <span>Ver Pedidos</span>
          </Link>
        </div>
      </div>

      {/* 2. STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Productos Activos */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECEEF1] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Productos Activos</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-[#17191D] mt-2">{activeProducts.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">de {products.length} productos en catálogo</p>
        </div>

        {/* Card 2: Alertas de Stock Bajo */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECEEF1] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Bajo (≤ {lowStockThreshold})</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lowStockProducts.length > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-[#17191D] mt-2">{lowStockProducts.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            {lowStockProducts.length > 0 ? 'Requieren reposición urgente' : 'Niveles de stock óptimos'}
          </p>
        </div>

        {/* Card 3: Pedidos Nuevos & Pendientes */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECEEF1] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pedidos Nuevos</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F28C28] flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-[#F28C28] mt-2">{newOrders.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            + {pendingOrders.length} en espera de confirmación
          </p>
        </div>

        {/* Card 4: Ventas Registradas */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECEEF1] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Confirmado</span>
            <div className="w-10 h-10 rounded-xl bg-green-50 text-[#25D366] flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#17191D] mt-2">{formatPrice(totalConfirmedSales)}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            {formatPrice(totalRegisteredVolume)} solicitados en total
          </p>
        </div>
      </div>

      {/* 3. LOW STOCK WARNING BANNER (If any) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle size={16} className="text-amber-600" />
              <span>Atención: Productos con Stock Crítico</span>
            </div>
            <Link to="/admin/productos" className="text-xs font-bold text-amber-800 hover:underline">
              Gestionar inventario →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 3).map((p) => (
              <div key={p.id} className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#17191D] truncate max-w-[180px]">{p.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</p>
                </div>
                <span className="font-black text-red-600 px-2 py-0.5 bg-red-50 rounded">
                  {p.stock} unid.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. RECENT ORDERS TABLE */}
      <div className="bg-white rounded-3xl border border-[#ECEEF1] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#ECEEF1]">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-[#17191D]">
              Últimos Pedidos Registrados
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Pedidos recibidos desde la tienda web mediante WhatsApp
            </p>
          </div>
          <Link
            to="/admin/pedidos"
            className="text-xs font-bold text-[#F28C28] hover:underline flex items-center gap-1"
          >
            <span>Ver todos los pedidos ({orders.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            Aún no se han registrado pedidos en la tienda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ECEEF1] text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Referencia</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Destino</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEF1]">
                {recentOrders.map((ord) => {
                  const statusColors: Record<string, string> = {
                    nuevo: 'bg-blue-50 text-blue-700 border-blue-200',
                    pendiente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    confirmado: 'bg-green-50 text-green-700 border-green-200',
                    preparando: 'bg-purple-50 text-purple-700 border-purple-200',
                    entregado: 'bg-gray-100 text-gray-700 border-gray-300',
                    cancelado: 'bg-red-50 text-red-700 border-red-200',
                  };

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-[#17191D]">
                        {ord.reference}
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-900">
                        {ord.customerName}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {ord.customerCity}, {ord.customerProvince}
                      </td>
                      <td className="py-3 px-3 font-black text-[#17191D]">
                        {formatPrice(ord.total)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            statusColors[ord.status] || 'bg-gray-100'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-400">
                        {new Date(ord.createdAt).toLocaleDateString('es-AR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
