import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, ProductImage } from '../../types';
import { useStore } from '../../context/StoreContext';
import { uploadProductImage } from '../../lib/imageStorage';
import {
  X,
  Plus,
  Trash2,
  Image,
  Layers,
  Sparkles,
  Check,
  AlertCircle,
  Upload,
  Loader2,
  FileUp,
} from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { categories, brands, saveProduct } = useStore();

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    sku: '',
    description: '',
    price: 0,
    compareAtPrice: null,
    categoryId: '',
    brandId: '',
    stock: 10,
    lowStockThreshold: 5,
    isActive: true,
    isFeatured: false,
    isNew: true,
    isPromo: false,
    images: [],
    variants: [],
    specs: {},
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [newVarName, setNewVarName] = useState('');
  const [newVarSku, setNewVarSku] = useState('');
  const [newVarStock, setNewVarStock] = useState(5);
  const [newVarColor, setNewVarColor] = useState('#17191D');

  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        images: product.images ? [...product.images] : [],
        variants: product.variants ? [...product.variants] : [],
        specs: product.specs ? { ...product.specs } : {},
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        sku: `BK-${Date.now().toString().slice(-5)}`,
        description: '',
        price: 0,
        compareAtPrice: null,
        categoryId: categories[0]?.id || '',
        brandId: brands[0]?.id || '',
        stock: 10,
        lowStockThreshold: 4,
        isActive: true,
        isFeatured: false,
        isNew: true,
        isPromo: false,
        images: [
          {
            id: `img-${Date.now()}`,
            productId: '',
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
            alt: 'Producto',
            isPrimary: true,
            order: 1,
          }
        ],
        variants: [],
        specs: {},
      });
    }
  }, [product, categories, brands, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.id ? prev.slug : slug,
    }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      const newImg: ProductImage = {
        id: `img-${Date.now()}`,
        productId: formData.id || '',
        url: newImageUrl.trim(),
        alt: formData.name || 'Foto producto',
        isPrimary: (formData.images || []).length === 0,
        order: (formData.images || []).length + 1,
      };
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), newImg],
      }));
      setNewImageUrl('');
    }
  };

  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const newImages: ProductImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const savedUrl = await uploadProductImage(file);
        newImages.push({
          id: `img-${Date.now()}-${i}`,
          productId: formData.id || '',
          url: savedUrl,
          alt: formData.name || file.name,
          isPrimary: (formData.images || []).length === 0 && i === 0,
          order: (formData.images || []).length + i + 1,
        });
      }

      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
      }));
    } catch (err: any) {
      alert(`Error al procesar y guardar la imagen: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (imgId: string) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((img) => img.id !== imgId),
    }));
  };

  const handleSetPrimaryImage = (imgId: string) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).map((img) => ({
        ...img,
        isPrimary: img.id === imgId,
      })),
    }));
  };

  const handleAddVariant = () => {
    if (newVarName.trim() && newVarSku.trim()) {
      const newVariant: ProductVariant = {
        id: `var-${Date.now()}`,
        productId: formData.id || '',
        name: newVarName.trim(),
        sku: newVarSku.trim(),
        stock: Number(newVarStock) || 0,
        colorHex: newVarColor,
      };
      setFormData((prev) => ({
        ...prev,
        variants: [...(prev.variants || []), newVariant],
      }));
      setNewVarName('');
      setNewVarSku('');
      setNewVarStock(5);
    }
  };

  const handleRemoveVariant = (varId: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((v) => v.id !== varId),
    }));
  };

  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecVal.trim()) {
      setFormData((prev) => ({
        ...prev,
        specs: {
          ...(prev.specs || {}),
          [newSpecKey.trim()]: newSpecVal.trim(),
        },
      }));
      setNewSpecKey('');
      setNewSpecVal('');
    }
  };

  const handleRemoveSpec = (key: string) => {
    setFormData((prev) => {
      const copy = { ...(prev.specs || {}) };
      delete copy[key];
      return { ...prev, specs: copy };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name?.trim()) {
      setErrorMessage('El nombre del producto es obligatorio.');
      return;
    }
    if (!formData.sku?.trim()) {
      setErrorMessage('El SKU del producto es obligatorio.');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === formData.categoryId);
    const selectedBrand = brands.find((b) => b.id === formData.brandId);

    setIsSaving(true);
    try {
      await saveProduct({
        ...formData,
        categoryName: selectedCategory?.name || 'General',
        brandName: selectedBrand?.name || 'Bunker',
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error guardando producto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#ECEEF1] my-8">
        {/* Header */}
        <div className="bg-[#17191D] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#282C33]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F28C28]">
              {product ? `Editando: ${product.sku}` : 'Creación de Producto'}
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
              {product ? 'Modificar Producto' : 'Nuevo Producto para Catálogo'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#282C33]"
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* 1. Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-[#17191D] uppercase tracking-wider mb-1.5">
                Nombre del Producto <span className="text-[#F28C28]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Auriculares Bunker SoundMax"
                className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F28C28]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#17191D] uppercase tracking-wider mb-1.5">
                SKU (Código único) <span className="text-[#F28C28]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="BK-AUD-010"
                className="w-full text-sm font-mono bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F28C28]"
              />
            </div>
          </div>

          {/* 2. Category, Brand, Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-[#17191D] uppercase tracking-wider mb-1.5">
                Categoría
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F28C28]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#17191D] uppercase tracking-wider mb-1.5">
                Marca
              </label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F28C28]"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#17191D] uppercase tracking-wider mb-1.5">
                Slug URL
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full text-sm font-mono bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F28C28]"
              />
            </div>
          </div>

          {/* 3. Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-[#FAF8F5] rounded-2xl border border-[#ECEEF1]">
            <div>
              <label className="block font-bold text-[#17191D] uppercase tracking-wider mb-1.5">
                Precio (ARS)
              </label>
              <input
                type="number"
                min="0"
                value={formData.price ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                placeholder="Dejar vacío para 'Consultar'"
                className="w-full text-sm bg-white border border-[#E2E4E9] rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#F28C28]"
              />
              <span className="text-[10px] text-gray-400">Si es nulo: "Consultar precio"</span>
            </div>

            <div>
              <label className="block font-bold text-[#17191D] uppercase tracking-wider mb-1.5">
                Precio Anterior (Oferta)
              </label>
              <input
                type="number"
                min="0"
                value={formData.compareAtPrice ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    compareAtPrice: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                placeholder="Opcional tachado"
                className="w-full text-sm bg-white border border-[#E2E4E9] rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#F28C28]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#17191D] uppercase tracking-wider mb-1.5">
                Stock Total
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock ?? 0}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full text-sm bg-white border border-[#E2E4E9] rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#F28C28]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#17191D] uppercase tracking-wider mb-1.5">
                Umbral Alerta Stock
              </label>
              <input
                type="number"
                min="1"
                value={formData.lowStockThreshold ?? 5}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                className="w-full text-sm bg-white border border-[#E2E4E9] rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#F28C28]"
              />
            </div>
          </div>

          {/* 4. Description */}
          <div>
            <label className="block font-bold text-[#17191D] uppercase tracking-wider mb-1.5">
              Descripción del Producto
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalles sobre materiales, tecnología, rendimiento y garantía..."
              className="w-full text-sm bg-[#FAFAF8] border border-[#E2E4E9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F28C28]"
            />
          </div>

          {/* 5. Toggles (Active, Featured, New, Promo) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'isActive', label: 'Producto Activo' },
              { key: 'isFeatured', label: 'Destacado en Home' },
              { key: 'isNew', label: 'Etiqueta NUEVO!' },
              { key: 'isPromo', label: 'Etiqueta OFERTA' },
            ].map((t) => (
              <label
                key={t.key}
                className="flex items-center gap-2 p-3 rounded-xl border border-[#ECEEF1] bg-[#FAFAF8] cursor-pointer hover:bg-gray-100 transition"
              >
                <input
                  type="checkbox"
                  checked={(formData as any)[t.key]}
                  onChange={(e) => setFormData({ ...formData, [t.key]: e.target.checked })}
                  className="w-4 h-4 rounded text-[#F28C28] focus:ring-[#F28C28] accent-[#F28C28]"
                />
                <span className="font-bold text-gray-700">{t.label}</span>
              </label>
            ))}
          </div>

          {/* 6. Images Manager with Direct File Upload */}
          <div className="p-5 rounded-2xl border border-[#ECEEF1] bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold uppercase tracking-wider text-[#17191D] flex items-center gap-2">
                <Image size={18} className="text-[#F28C28]" />
                Fotografías del Producto (Se guardan en la web)
              </h4>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-[#F28C28] font-bold hover:underline"
              >
                {showUrlInput ? 'Ocultar entrada URL' : '+ Cargar vía URL externa'}
              </button>
            </div>

            {/* Direct Upload Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFilesUpload(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
                isDragging
                  ? 'border-[#F28C28] bg-orange-50'
                  : 'border-[#E2E4E9] bg-[#FAFAF8] hover:border-[#F28C28]'
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                id="productPhotoFileInput"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => handleFilesUpload(e.target.files)}
              />
              <label
                htmlFor="productPhotoFileInput"
                className="cursor-pointer block space-y-2 pointer-events-auto"
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 text-[#F28C28] flex items-center justify-center mx-auto shadow-sm">
                  {isUploading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Upload size={24} />
                  )}
                </div>
                <div>
                  <p className="font-black text-sm text-[#17191D]">
                    {isUploading
                      ? 'Optimizando y guardando fotos en la web...'
                      : 'Hacé clic para subir fotos desde tu computadora o celular'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Podés seleccionar una o varias fotos a la vez (JPG, PNG, WebP) o arrastrarlas aquí.
                  </p>
                </div>
                <span className="inline-block px-3 py-1 bg-white border border-[#E2E4E9] rounded-lg text-[10px] font-bold text-gray-600 shadow-xs">
                  📁 Explorar archivos del dispositivo
                </span>
              </label>
            </div>

            {/* Optional URL input fallback */}
            {showUrlInput && (
              <div className="flex gap-2 pt-1">
                <input
                  type="url"
                  placeholder="Pegar URL web de imagen (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 text-xs bg-[#FAFAF8] border border-[#ECEEF1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#F28C28]"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-[#17191D] text-white rounded-xl font-bold hover:bg-[#282C33]"
                >
                  Agregar URL
                </button>
              </div>
            )}

            {/* Images Grid preview */}
            {(formData.images || []).length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Fotos guardadas en este producto ({(formData.images || []).length}):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {(formData.images || []).map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 p-1.5 bg-[#FAFAF8] group transition shadow-sm ${
                        img.isPrimary ? 'border-[#F28C28] ring-2 ring-[#F28C28]/20' : 'border-[#ECEEF1]'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-2">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(img.id)}
                            className="p-1.5 bg-[#F28C28] hover:bg-[#d9771e] text-white rounded-lg text-[10px] font-bold"
                            title="Marcar como foto de portada"
                          >
                            Portada
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                          title="Eliminar foto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {img.isPrimary && (
                        <span className="absolute bottom-1.5 left-1.5 bg-[#F28C28] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                          Portada
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. Variants Manager */}
          <div className="p-4 rounded-2xl border border-[#ECEEF1] bg-white space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[#17191D] flex items-center gap-2">
              <Layers size={16} className="text-[#F28C28]" />
              Variantes de Producto (Colores, Talles, etc.)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <input
                type="text"
                placeholder="Nombre (ej: Negro Mate)"
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                className="sm:col-span-2 text-xs bg-[#FAFAF8] border border-[#ECEEF1] rounded-xl px-3 py-2"
              />
              <input
                type="text"
                placeholder="SKU Variante"
                value={newVarSku}
                onChange={(e) => setNewVarSku(e.target.value.toUpperCase())}
                className="text-xs font-mono bg-[#FAFAF8] border border-[#ECEEF1] rounded-xl px-3 py-2"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={newVarStock}
                  onChange={(e) => setNewVarStock(Number(e.target.value))}
                  className="w-16 text-xs bg-[#FAFAF8] border border-[#ECEEF1] rounded-xl px-2 py-2"
                />
                <input
                  type="color"
                  value={newVarColor}
                  onChange={(e) => setNewVarColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border"
                  title="Color representativo"
                />
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-2 bg-[#17191D] text-white rounded-xl font-bold hover:bg-[#282C33]"
              >
                + Añadir
              </button>
            </div>

            {(formData.variants || []).length > 0 && (
              <div className="space-y-1.5 pt-2">
                {formData.variants?.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#FAFAF8] border border-[#ECEEF1]"
                  >
                    <div className="flex items-center gap-2">
                      {v.colorHex && (
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: v.colorHex }}
                        />
                      )}
                      <strong className="text-gray-900">{v.name}</strong>
                      <span className="text-gray-400 font-mono text-[11px]">({v.sku})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-700">Stock: {v.stock}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 8. Technical Specs */}
          <div className="p-4 rounded-2xl border border-[#ECEEF1] bg-white space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[#17191D]">
              Ficha Técnica (Atributos clave)
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Característica (ej: Conectividad)"
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                className="w-1/3 text-xs bg-[#FAFAF8] border border-[#ECEEF1] rounded-xl px-3 py-2"
              />
              <input
                type="text"
                placeholder="Valor (ej: Bluetooth 5.3 + Jack 3.5mm)"
                value={newSpecVal}
                onChange={(e) => setNewSpecVal(e.target.value)}
                className="flex-1 text-xs bg-[#FAFAF8] border border-[#ECEEF1] rounded-xl px-3 py-2"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="px-3 py-2 bg-[#17191D] text-white rounded-xl font-bold hover:bg-[#282C33]"
              >
                +
              </button>
            </div>

            {formData.specs && Object.keys(formData.specs).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {Object.entries(formData.specs).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between items-center p-2 rounded-lg bg-[#FAFAF8] border border-[#ECEEF1]"
                  >
                    <span>
                      <strong>{k}:</strong> {v}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(k)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#ECEEF1]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#ECEEF1] font-bold text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-7 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d9771e] text-white font-black uppercase tracking-wider shadow-md transition disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
