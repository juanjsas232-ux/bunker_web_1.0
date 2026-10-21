import { Product, Category, Brand, Order, OrderStatus, StoreSettings } from '../types';
import { initialProducts, initialCategories, initialBrands, initialStoreSettings } from './mockData';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { generateOrderReference } from './utils';

const KEY_PRODUCTS = 'bunker_db_products';
const KEY_CATEGORIES = 'bunker_db_categories';
const KEY_BRANDS = 'bunker_db_brands';
const KEY_ORDERS = 'bunker_db_orders';
const KEY_SETTINGS = 'bunker_db_settings';

// Helper to initialize local persistence if empty
function initLocalDefaults() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(KEY_PRODUCTS)) {
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem(KEY_CATEGORIES)) {
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(initialCategories));
  }
  if (!localStorage.getItem(KEY_BRANDS)) {
    localStorage.setItem(KEY_BRANDS, JSON.stringify(initialBrands));
  }
  if (!localStorage.getItem(KEY_ORDERS)) {
    localStorage.setItem(KEY_ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEY_SETTINGS)) {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(initialStoreSettings));
  }
}

initLocalDefaults();

export const db = {
  // -------------------------------------------------------------
  // PRODUCTS
  // -------------------------------------------------------------
  async getProducts(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(name),
            brands(name),
            product_images(*),
            product_variants(*)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            sku: item.sku,
            description: item.description || '',
            price: item.price !== null ? Number(item.price) : null,
            compareAtPrice: item.compare_at_price ? Number(item.compare_at_price) : null,
            categoryId: item.category_id || '',
            categoryName: item.categories?.name || '',
            subcategoryId: item.subcategory_id || '',
            brandId: item.brand_id || '',
            brandName: item.brands?.name || '',
            stock: item.stock || 0,
            lowStockThreshold: item.low_stock_threshold || 5,
            isActive: item.is_active ?? true,
            isFeatured: item.is_featured ?? false,
            isNew: item.is_new ?? false,
            isPromo: item.is_promo ?? false,
            images: (item.product_images || []).map((img: any) => ({
              id: img.id,
              productId: img.product_id,
              url: img.url,
              alt: img.alt || '',
              isPrimary: img.is_primary || false,
              order: img.display_order || 0,
            })),
            variants: (item.product_variants || []).map((v: any) => ({
              id: v.id,
              productId: v.product_id,
              name: v.name,
              sku: v.sku,
              price: v.price ? Number(v.price) : undefined,
              stock: v.stock || 0,
              colorHex: v.color_hex || undefined,
            })),
            specs: item.specs || {},
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Fallo consulta a Supabase, usando almacenamiento local:', err);
      }
    }

    const raw = localStorage.getItem(KEY_PRODUCTS);
    return raw ? JSON.parse(raw) : initialProducts;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.slug === slug || p.id === slug) || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || null;
  },

  async saveProduct(productData: Partial<Product>): Promise<Product> {
    const products = await this.getProducts();
    const now = new Date().toISOString();

    let savedProduct: Product;

    if (productData.id) {
      // Update existing
      const index = products.findIndex((p) => p.id === productData.id);
      if (index === -1) throw new Error('Producto no encontrado');

      savedProduct = {
        ...products[index],
        ...productData,
        updatedAt: now,
      } as Product;
      products[index] = savedProduct;
    } else {
      // Create new
      const newId = `prod-${Date.now()}`;
      savedProduct = {
        id: newId,
        name: productData.name || 'Nuevo Producto',
        slug: productData.slug || `producto-${Date.now()}`,
        sku: productData.sku || `BK-SKU-${Date.now().toString().slice(-4)}`,
        description: productData.description || '',
        price: productData.price !== undefined ? productData.price : 0,
        compareAtPrice: productData.compareAtPrice || null,
        categoryId: productData.categoryId || '',
        categoryName: productData.categoryName || '',
        subcategoryId: productData.subcategoryId || '',
        brandId: productData.brandId || '',
        brandName: productData.brandName || '',
        stock: productData.stock !== undefined ? productData.stock : 0,
        lowStockThreshold: productData.lowStockThreshold || 5,
        isActive: productData.isActive ?? true,
        isFeatured: productData.isFeatured ?? false,
        isNew: productData.isNew ?? true,
        isPromo: productData.isPromo ?? false,
        images: productData.images || [
          {
            id: `img-${Date.now()}`,
            productId: newId,
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            alt: productData.name || 'Producto',
            isPrimary: true,
            order: 1,
          }
        ],
        variants: productData.variants || [],
        specs: productData.specs || {},
        createdAt: now,
        updatedAt: now,
      };
      products.unshift(savedProduct);
    }

    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(products));

    // Also attempt Supabase upsert if configured
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('products').upsert({
          id: savedProduct.id.includes('-') && savedProduct.id.length > 20 ? savedProduct.id : undefined,
          name: savedProduct.name,
          slug: savedProduct.slug,
          sku: savedProduct.sku,
          description: savedProduct.description,
          price: savedProduct.price,
          compare_at_price: savedProduct.compareAtPrice,
          category_id: savedProduct.categoryId || null,
          brand_id: savedProduct.brandId || null,
          stock: savedProduct.stock,
          low_stock_threshold: savedProduct.lowStockThreshold,
          is_active: savedProduct.isActive,
          is_featured: savedProduct.isFeatured,
          is_new: savedProduct.isNew,
          is_promo: savedProduct.isPromo,
          specs: savedProduct.specs,
          updated_at: now,
        });
      } catch (e) {
        console.warn('Aviso: no se pudo sincronizar producto con Supabase:', e);
      }
    }

    return savedProduct;
  },

  async deleteProduct(id: string): Promise<void> {
    const products = await this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(filtered));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (e) {
        console.warn('Error eliminando en Supabase:', e);
      }
    }
  },

  // -------------------------------------------------------------
  // CATEGORIES
  // -------------------------------------------------------------
  async getCategories(): Promise<Category[]> {
    const raw = localStorage.getItem(KEY_CATEGORIES);
    return raw ? JSON.parse(raw) : initialCategories;
  },

  async saveCategory(catData: Partial<Category>): Promise<Category> {
    const categories = await this.getCategories();
    let saved: Category;

    if (catData.id) {
      const idx = categories.findIndex((c) => c.id === catData.id);
      if (idx === -1) throw new Error('Categoría no encontrada');
      saved = { ...categories[idx], ...catData };
      categories[idx] = saved;
    } else {
      saved = {
        id: `cat-${Date.now()}`,
        name: catData.name || 'Nueva Categoría',
        slug: catData.slug || `cat-${Date.now()}`,
        description: catData.description || '',
        imageUrl: catData.imageUrl || '',
        productCount: 0,
        order: categories.length + 1,
      };
      categories.push(saved);
    }

    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(categories));
    return saved;
  },

  async deleteCategory(id: string): Promise<void> {
    const categories = await this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(filtered));
  },

  // -------------------------------------------------------------
  // BRANDS
  // -------------------------------------------------------------
  async getBrands(): Promise<Brand[]> {
    const raw = localStorage.getItem(KEY_BRANDS);
    return raw ? JSON.parse(raw) : initialBrands;
  },

  async saveBrand(brandData: Partial<Brand>): Promise<Brand> {
    const brands = await this.getBrands();
    let saved: Brand;

    if (brandData.id) {
      const idx = brands.findIndex((b) => b.id === brandData.id);
      if (idx === -1) throw new Error('Marca no encontrada');
      saved = { ...brands[idx], ...brandData };
      brands[idx] = saved;
    } else {
      saved = {
        id: `brand-${Date.now()}`,
        name: brandData.name || 'Nueva Marca',
        slug: brandData.slug || `brand-${Date.now()}`,
        logoUrl: brandData.logoUrl || '',
        productCount: 0,
      };
      brands.push(saved);
    }

    localStorage.setItem(KEY_BRANDS, JSON.stringify(brands));
    return saved;
  },

  async deleteBrand(id: string): Promise<void> {
    const brands = await this.getBrands();
    const filtered = brands.filter((b) => b.id !== id);
    localStorage.setItem(KEY_BRANDS, JSON.stringify(filtered));
  },

  // -------------------------------------------------------------
  // ORDERS
  // -------------------------------------------------------------
  async getOrders(): Promise<Order[]> {
    const raw = localStorage.getItem(KEY_ORDERS);
    return raw ? JSON.parse(raw) : [];
  },

  async createOrder(orderInput: Omit<Order, 'id' | 'reference' | 'createdAt' | 'updatedAt'> & { reference?: string }): Promise<Order> {
    const orders = await this.getOrders();
    const products = await this.getProducts();
    const now = new Date().toISOString();

    const reference = orderInput.reference || generateOrderReference();

    // Verify and decrement stock safely
    for (const item of orderInput.items) {
      const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
      if (prod) {
        if (item.variantName && prod.variants) {
          const variant = prod.variants.find((v) => v.name === item.variantName);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
          }
        }
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(products));

    const newOrder: Order = {
      ...orderInput,
      id: `ord-${Date.now()}`,
      reference,
      status: 'nuevo',
      createdAt: now,
      updatedAt: now,
    };

    orders.unshift(newOrder);
    localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));

    // Save to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: insertedOrder } = await supabase
          .from('orders')
          .insert({
            reference: newOrder.reference,
            customer_name: newOrder.customerName,
            customer_phone: newOrder.customerPhone,
            customer_city: newOrder.customerCity,
            customer_province: newOrder.customerProvince,
            customer_address: newOrder.customerAddress || null,
            delivery_method: newOrder.deliveryMethod,
            notes: newOrder.notes || null,
            status: newOrder.status,
            total: newOrder.total,
          })
          .select()
          .single();

        if (insertedOrder) {
          const itemsToInsert = newOrder.items.map((it) => ({
            order_id: insertedOrder.id,
            product_name: it.productName,
            sku: it.sku,
            variant_name: it.variantName || null,
            quantity: it.quantity,
            unit_price: it.unitPrice,
            subtotal: it.subtotal,
          }));
          await supabase.from('order_items').insert(itemsToInsert);
        }
      } catch (e) {
        console.warn('Error guardando pedido en Supabase:', e);
      }
    }

    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const orders = await this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.reference === orderId);
    if (idx === -1) throw new Error('Pedido no encontrado');

    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({ status, updated_at: orders[idx].updatedAt })
          .or(`id.eq.${orderId},reference.eq.${orderId}`);
      } catch (e) {
        console.warn('Error actualizando pedido en Supabase:', e);
      }
    }

    return orders[idx];
  },

  // -------------------------------------------------------------
  // STORE SETTINGS
  // -------------------------------------------------------------
  async getStoreSettings(): Promise<StoreSettings> {
    const raw = localStorage.getItem(KEY_SETTINGS);
    return raw ? JSON.parse(raw) : initialStoreSettings;
  },

  async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getStoreSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(updated));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase
          .from('store_settings')
          .upsert({
            id: 'current',
            store_name: updated.storeName,
            whatsapp_number: updated.whatsappNumber,
            support_hours: updated.supportHours,
            location: updated.location,
            instagram_handle: updated.instagramHandle,
            announcement_text: updated.announcementText,
            hero_headline: updated.heroHeadline,
            hero_subtitle: updated.heroSubtitle,
            hero_cta_text: updated.heroCtaText,
            hero_cta_link: updated.heroCtaLink,
            hero_image_url: updated.heroImageUrl,
            stock_alert_threshold: updated.stockAlertThreshold,
            free_shipping_min_amount: updated.freeShippingMinAmount,
            updated_at: new Date().toISOString(),
          });
      } catch (e) {
        console.warn('Error actualizando configuración en Supabase:', e);
      }
    }

    return updated;
  },

  // -------------------------------------------------------------
  // DEMO DATA MANAGEMENT (Section 11)
  // -------------------------------------------------------------
  async resetToInitialData(): Promise<void> {
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(initialProducts));
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(initialCategories));
    localStorage.setItem(KEY_BRANDS, JSON.stringify(initialBrands));
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(initialStoreSettings));
  },

  async clearAllDemoData(): Promise<void> {
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify([]));
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify([]));
    localStorage.setItem(KEY_BRANDS, JSON.stringify([]));
    localStorage.setItem(KEY_ORDERS, JSON.stringify([]));
  }
};
