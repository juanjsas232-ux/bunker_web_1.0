import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';

// Public Pages
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAFAF8]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Store Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="catalogo" element={<CatalogPage />} />
                <Route path="producto/:slug" element={<ProductDetailPage />} />
                <Route path="carrito" element={<CartPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin Auth Route */}
              <Route path="/admin/login" element={<LoginPage />} />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <AdminLayout>
                    <AdminDashboardPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/productos"
                element={
                  <AdminLayout>
                    <AdminProductsPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/pedidos"
                element={
                  <AdminLayout>
                    <AdminOrdersPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/categorias"
                element={
                  <AdminLayout>
                    <AdminCategoriesPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/configuracion"
                element={
                  <AdminLayout>
                    <AdminSettingsPage />
                  </AdminLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;
