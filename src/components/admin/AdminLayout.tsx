import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { BunkerLogo } from '../BunkerLogo';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  AlertTriangle,
  Database,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { products, orders } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Protected route check
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111315] flex items-center justify-center text-white">
        <p className="text-sm font-bold animate-pulse">Verificando autorización...</p>
      </div>
    );
  }

  // Stock alerts count
  const lowStockCount = products.filter((p) => p.stock <= (p.lowStockThreshold || 5)).length;
  const newOrdersCount = orders.filter((o) => o.status === 'nuevo').length;

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
      exact: true,
    },
    {
      label: 'Productos',
      icon: Package,
      path: '/admin/productos',
      badge: lowStockCount > 0 ? `${lowStockCount} alertas` : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
    },
    {
      label: 'Categorías y Marcas',
      icon: Layers,
      path: '/admin/categorias',
    },
    {
      label: 'Pedidos',
      icon: ShoppingBag,
      path: '/admin/pedidos',
      badge: newOrdersCount > 0 ? `${newOrdersCount} nuevos` : undefined,
      badgeColor: 'bg-[#F28C28]/20 text-[#F28C28] border border-[#F28C28]/30',
    },
    {
      label: 'Configuración & DB',
      icon: Settings,
      path: '/admin/configuracion',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#17191D] flex">
      {/* 1. SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#17191D] text-[#FAFAF8] border-r border-[#282C33] flex-shrink-0 min-h-screen">
        {/* Brand header */}
        <div className="p-6 border-b border-[#282C33]">
          <BunkerLogo variant="light" size="sm" showSubtitle />
          <div className="mt-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#282C33] text-[11px] text-gray-300">
            <span className="w-2 h-2 rounded-full bg-[#25D366]" />
            <span className="truncate">{user?.email}</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-[#F28C28] text-white shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-[#282C33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-gray-800 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer links */}
        <div className="p-4 border-t border-[#282C33] space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#282C33] transition"
          >
            <ExternalLink size={16} />
            <span>Ver Tienda Pública</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-[#17191D] text-white p-4 border-b border-[#282C33] flex items-center justify-between">
          <BunkerLogo variant="light" size="sm" />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {/* Mobile Dropdown Nav */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#17191D] text-white p-4 border-b border-[#282C33] space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold hover:bg-[#282C33]"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F28C28] text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="border-t border-[#282C33] pt-2 flex justify-between text-xs">
              <Link to="/" target="_blank" className="text-gray-300 flex items-center gap-1">
                <ExternalLink size={14} /> Tienda pública
              </Link>
              <button onClick={logout} className="text-red-400 font-bold">
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
