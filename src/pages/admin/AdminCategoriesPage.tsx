import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Category, Brand } from '../../types';
import { uploadProductImage } from '../../lib/imageStorage';
import { Plus, Edit2, Trash2, Layers, Tag, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, brands, products, saveCategory, deleteCategory, saveBrand, deleteBrand } = useStore();

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [isUploadingCatImage, setIsUploadingCatImage] = useState(false);

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState('');

  // Category Actions
  const handleOpenCatModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatDesc(cat.description || '');
      setCatImage(cat.imageUrl || '');
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatDesc('');
      setCatImage('');
    }
    setIsCatModalOpen(true);
  };

  const handleCategoryFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingCatImage(true);
    try {
      const url = await uploadProductImage(files[0], 'categories');
      setCatImage(url);
    } catch (err: any) {
      alert(`Error al procesar la imagen: ${err.message}`);
    } finally {
      setIsUploadingCatImage(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const slug = catName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    await saveCategory({
      id: editingCategory?.id,
      name: catName.trim(),
      slug: editingCategory?.slug || slug,
      description: catDesc.trim(),
      imageUrl: catImage.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    });
    setIsCatModalOpen(false);
  };

  // Brand Actions
  const handleOpenBrandModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandName(brand.name);
    } else {
      setEditingBrand(null);
      setBrandName('');
    }
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    const slug = brandName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    await saveBrand({
      id: editingBrand?.id,
      name: brandName.trim(),
      slug: editingBrand?.slug || slug,
    });
    setIsBrandModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* 1. HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17191D]">
          Categorías y Marcas
        </h1>
        <p className="text-xs text-[#68707D] mt-0.5">
          Estructurá los departamentos y fabricantes de la tienda. Los cambios impactan en vivo.
        </p>
      </div>

      {/* 2. CATEGORIES SECTION */}
      <div className="bg-white rounded-3xl border border-[#ECEEF1] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#ECEEF1] pb-4">
          <div className="flex items-center gap-2.5">
            <Layers size={20} className="text-[#F28C28]" />
            <h3 className="font-black text-sm uppercase tracking-wide text-[#17191D]">
              Categorías de Productos ({categories.length})
            </h3>
          </div>
          <button
            onClick={() => handleOpenCatModal()}
            className="px-3.5 py-2 bg-[#F28C28] hover:bg-[#d9771e] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            <Plus size={15} />
            <span>Nueva Categoría</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;

            return (
              <div
                key={cat.id}
                className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#ECEEF1] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={cat.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80'}
                    alt={cat.name}
                    className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-[#ECEEF1]"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-[#17191D]">{cat.name}</h4>
                    <p className="text-[11px] text-gray-400 font-mono">
                      {count} {count === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenCatModal(cat)}
                    className="p-1.5 text-gray-500 hover:text-[#F28C28] rounded-lg"
                    title="Editar"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la categoría "${cat.name}"?`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BRANDS SECTION */}
      <div className="bg-white rounded-3xl border border-[#ECEEF1] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#ECEEF1] pb-4">
          <div className="flex items-center gap-2.5">
            <Tag size={20} className="text-[#17191D]" />
            <h3 className="font-black text-sm uppercase tracking-wide text-[#17191D]">
              Marcas Registradas ({brands.length})
            </h3>
          </div>
          <button
            onClick={() => handleOpenBrandModal()}
            className="px-3.5 py-2 bg-[#17191D] hover:bg-[#282C33] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            <Plus size={15} />
            <span>Nueva Marca</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {brands.map((brand) => {
            const count = products.filter((p) => p.brandId === brand.id || p.brandName === brand.name).length;

            return (
              <div
                key={brand.id}
                className="bg-[#FAFAF8] p-3.5 rounded-2xl border border-[#ECEEF1] flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-[#17191D]">{brand.name}</h4>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {count} {count === 1 ? 'artículo' : 'artículos'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenBrandModal(brand)}
                    className="p-1 text-gray-400 hover:text-black"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar marca "${brand.name}"?`)) {
                        deleteBrand(brand.id);
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm uppercase">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} className="p-1 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ej: Calzado Urbano"
                  className="w-full border rounded-xl p-2.5 bg-[#FAFAF8]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Descripción breve</label>
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Descripción para SEO y cabecera"
                  className="w-full border rounded-xl p-2.5 bg-[#FAFAF8]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Fotografía de la Categoría</label>
                
                {/* Upload from device */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="catPhotoInput"
                    className="hidden"
                    disabled={isUploadingCatImage}
                    onChange={(e) => handleCategoryFileUpload(e.target.files)}
                  />
                  <label
                    htmlFor="catPhotoInput"
                    className="px-3.5 py-2 bg-[#17191D] hover:bg-[#282C33] text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-sm transition"
                  >
                    {isUploadingCatImage ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Subir desde dispositivo</span>
                      </>
                    )}
                  </label>

                  {catImage && (
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#ECEEF1] p-0.5 bg-white flex-shrink-0">
                      <img src={catImage} alt="" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="O pegar URL: https://..."
                  className="w-full border rounded-xl p-2.5 bg-[#FAFAF8] text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F28C28] text-white font-bold rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm uppercase">
                {editingBrand ? 'Editar Marca' : 'Nueva Marca'}
              </h3>
              <button onClick={() => setIsBrandModalOpen(false)} className="p-1 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveBrand} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nombre de la Marca</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Ej: Sony, XTech, Bunker"
                  className="w-full border rounded-xl p-2.5 bg-[#FAFAF8]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#17191D] text-white font-bold rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
