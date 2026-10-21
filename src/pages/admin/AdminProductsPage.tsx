import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { exportProductsToCSV } from '../../lib/csv';
import { ProductModal } from '../../components/admin/ProductModal';
import { CSVImportModal } from '../../components/admin/CSVImportModal';
import {
  Plus,
  Upload,
  Download,
  Search,
  Edit2,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { products, categories, saveProduct, deleteProduct } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Auto-open modal if ?nuevo=1 in query params
  React.useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      setEditingProduct(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    if (categoryFilter && p.categoryId !== categoryFilter) {
      return false;
    }
    if (stockFilter === 'low' && p.stock > (p.lowStockThreshold || 5)) {
      return false;
    }
    if (stockFilter === 'out' && p.stock > 0) {
      return false;
    }
    return true;
  });

  const handleCreateNew = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDuplicate = async (product: Product) => {
    const copySku = `${product.sku}-COPY-${Math.floor(Math.random() * 900 + 100)}`;
    const copyName = `${product.name} (Copia)`;
    await saveProduct({
      ...product,
      id: undefined,
      name: copyName,
      sku: copySku,
      slug: `${product.slug}-copia-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleActive = async (product: Product) => {
    await saveProduct({
      id: product.id,
      isActive: !product.isActive,
    });
  };

  const handleConfirmDelete = async () => {
    if (deletingProductId) {
      await deleteProduct(deletingProductId);
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17191D]">
            Gestión de Productos
          </h1>
          <p className="text-xs text-[#68707D] mt-0.5">
            Administrá precios, inventario, variantes y fotografías sin editar código.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportProductsToCSV(products)}
            className="px-3.5 py-2.5 bg-white border border-[#E2E4E9] rounded-xl text-xs font-bold text-gray-700 hover:text-[#17191D] flex items-center gap-1.5 shadow-sm transition"
            title="Exportar catálogo completo a CSV"
          >
            <Download size={15} />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setCsvModalOpen(true)}
            className="px-3.5 py-2.5 bg-white border border-[#E2E4E9] rounded-xl text-xs font-bold text-gray-700 hover:text-[#17191D] flex items-center gap-1.5 shadow-sm transition"
            title="Importar productos masivamente desde CSV"
          >
            <Upload size={15} />
            <span>Importar CSV</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2.5 bg-[#F28C28] hover:bg-[#d9771e] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition"
          >
            <Plus size={16} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* 2. FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECEEF1] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#F28C28]"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3 py-2 text-gray-700 font-semibold focus:outline-none focus:border-[#F28C28]"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="text-xs bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3 py-2 text-gray-700 font-semibold focus:outline-none focus:border-[#F28C28]"
          >
            <option value="all">Todo el stock</option>
            <option value="low">Stock crítico (≤ 5)</option>
            <option value="out">Sin stock (0)</option>
          </select>

          <span className="text-xs font-mono text-gray-400">
            {filteredProducts.length} productos
          </span>
        </div>
      </div>

      {/* 3. PRODUCTS TABLE */}
      <div className="bg-white rounded-3xl border border-[#ECEEF1] shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-gray-400 space-y-2">
            <Package size={36} className="mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-700">No se encontraron productos coincidentes</p>
            <p className="text-xs">Modificá los criterios de búsqueda o creá un nuevo producto.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#ECEEF1] text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Precio</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEF1]">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= (p.lowStockThreshold || 5);

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition">
                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80'}
                            alt={p.name}
                            className="w-10 h-10 object-contain rounded-lg bg-[#FAFAF8] p-1 border border-[#ECEEF1] flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-[#17191D] hover:text-[#F28C28] line-clamp-1 max-w-xs">
                              {p.name}
                            </p>
                            <span className="text-[10px] text-gray-400">{p.brandName}</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4 font-mono font-bold text-gray-700">
                        {p.sku}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-gray-600">
                        {p.categoryName || 'General'}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-[#17191D]">
                        {formatPrice(p.price)}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            p.stock <= 0
                              ? 'bg-red-50 text-red-600'
                              : isLow
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-green-50 text-[#25D366]'
                          }`}
                        >
                          {isLow && <AlertTriangle size={12} />}
                          {p.stock} unid.
                        </span>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                            p.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                          title="Hacé clic para cambiar estado público"
                        >
                          {p.isActive ? (
                            <>
                              <CheckCircle size={12} />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              <span>Inactivo</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1.5 text-gray-500 hover:text-[#F28C28] hover:bg-orange-50 rounded-lg transition"
                            title="Editar producto"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(p)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Duplicar producto"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar producto"
                          >
                            <Trash2 size={15} />
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

      {/* Safety Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="font-bold text-base text-[#17191D]">¿Eliminar este producto?</h3>
            <p className="text-xs text-gray-500">
              Esta acción quitará el producto del catálogo de la tienda. Los pedidos anteriores conservarán sus datos históricos.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={modalOpen}
        product={editingProduct}
        onClose={() => setModalOpen(false)}
      />

      <CSVImportModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
      />
    </div>
  );
};
