import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, Brand, Order, OrderStatus, StoreSettings, FilterState } from '../types';
import { db } from '../lib/db';
import { initialStoreSettings } from '../lib/mockData';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  settings: StoreSettings;
  isLoading: boolean;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredProducts: Product[];
  refreshData: () => Promise<void>;
  saveProduct: (product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  saveCategory: (category: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  saveBrand: (brand: Partial<Brand>) => Promise<Brand>;
  deleteBrand: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<Order>;
  updateSettings: (settings: Partial<StoreSettings>) => Promise<StoreSettings>;
  resetToInitialData: () => Promise<void>;
  clearAllDemoData: () => Promise<void>;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  categoryId: null,
  subcategoryId: null,
  brandIds: [],
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  selectedColorHex: null,
  sortBy: 'relevance',
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(initialStoreSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const refreshData = useCallback(async () => {
    try {
      const [prods, cats, brs, ords, sets] = await Promise.all([
        db.getProducts(),
        db.getCategories(),
        db.getBrands(),
        db.getOrders(),
        db.getStoreSettings(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setBrands(brs);
      setOrders(ords);
      setSettings(sets);
    } catch (e) {
      console.error('Error cargando datos de tienda:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      // Must be active for public view unless searched by sku in admin
      if (!p.isActive) return false;

      // Search query (name, sku, brand, category)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        const matchesBrand = p.brandName?.toLowerCase().includes(query) || false;
        const matchesCategory = p.categoryName?.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesSku && !matchesBrand && !matchesCategory) {
          return false;
        }
      }

      // Category filter
      if (filters.categoryId && p.categoryId !== filters.categoryId) {
        return false;
      }

      // Brands filter
      if (filters.brandIds.length > 0 && (!p.brandId || !filters.brandIds.includes(p.brandId))) {
        return false;
      }

      // Price filter
      if (filters.minPrice !== null && p.price !== null && p.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== null && p.price !== null && p.price > filters.maxPrice) {
        return false;
      }

      // Stock filter
      if (filters.inStockOnly && p.stock <= 0) {
        return false;
      }

      // Color filter
      if (filters.selectedColorHex && p.variants) {
        const hasColor = p.variants.some((v) => v.colorHex?.toLowerCase() === filters.selectedColorHex?.toLowerCase());
        if (!hasColor) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') {
        const pa = a.price ?? 0;
        const pb = b.price ?? 0;
        return pa - pb;
      }
      if (filters.sortBy === 'price-desc') {
        const pa = a.price ?? 0;
        const pb = b.price ?? 0;
        return pb - pa;
      }
      if (filters.sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // 'relevance' - default featured, new, then created
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, filters]);

  const saveProduct = async (productData: Partial<Product>) => {
    const saved = await db.saveProduct(productData);
    await refreshData();
    return saved;
  };

  const deleteProduct = async (id: string) => {
    await db.deleteProduct(id);
    await refreshData();
  };

  const saveCategory = async (catData: Partial<Category>) => {
    const saved = await db.saveCategory(catData);
    await refreshData();
    return saved;
  };

  const deleteCategory = async (id: string) => {
    await db.deleteCategory(id);
    await refreshData();
  };

  const saveBrand = async (brandData: Partial<Brand>) => {
    const saved = await db.saveBrand(brandData);
    await refreshData();
    return saved;
  };

  const deleteBrand = async (id: string) => {
    await db.deleteBrand(id);
    await refreshData();
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updated = await db.updateOrderStatus(orderId, status);
    await refreshData();
    return updated;
  };

  const updateSettings = async (settingsData: Partial<StoreSettings>) => {
    const updated = await db.updateStoreSettings(settingsData);
    setSettings(updated);
    return updated;
  };

  const resetToInitialData = async () => {
    await db.resetToInitialData();
    await refreshData();
  };

  const clearAllDemoData = async () => {
    await db.clearAllDemoData();
    await refreshData();
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        brands,
        orders,
        settings,
        isLoading,
        filters,
        setFilters,
        resetFilters,
        filteredProducts,
        refreshData,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        saveBrand,
        deleteBrand,
        updateOrderStatus,
        updateSettings,
        resetToInitialData,
        clearAllDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
