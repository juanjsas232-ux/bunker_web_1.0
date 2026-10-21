
import type {
  Product,
  Category,
  Brand,
  Order,
  OrderStatus,
  StoreSettings,
} from '../types';
import {
  initialProducts,
  initialCategories,
  initialBrands,
  initialStoreSettings,
} from './mockData';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { generateOrderReference } from './utils';

const KEYS = {
  products: 'bunker_db_products',
  categories: 'bunker_db_categories',
  brands: 'bunker_db_brands',
  orders: 'bunker_db_orders',
  settings: 'bunker_db_settings',
};

const isUuid = (value?: string | null): boolean =>
  Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );

function localRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) as T : fallback;
}

function localWrite(key: string, value: unknown): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

function requireSupabase() {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado. Revisá la conexión en el administrador.');
  }
  return client;
}

function checkError(error: { message: string } | null, action: string): void {
  if (error) throw new Error(`${action}: ${error.message}`);
}

function mapImage(image: any) {
  return {
    id: image.id,
    productId: image.product_id,
    url: image.url,
    alt: image.alt || '',
    isPrimary: image.is_primary ?? false,
    order: image.display_order ?? 0,
  };
}

function mapVariant(variant: any) {
  return {
    id: variant.id,
    productId: variant.product_id,
    name: variant.name,
    sku: variant.sku,
    price: variant.price == null ? undefined : Number(variant.price),
    stock: variant.stock ?? 0,
    colorHex: variant.color_hex || undefined,
  };
}

function mapProduct(item: any): Product {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    sku: item.sku,
    description: item.description || '',
    price: item.price == null ? null : Number(item.price),
    compareAtPrice:
      item.compare_at_price == null ? null : Number(item.compare_at_price),
    categoryId: item.category_id || '',
    categoryName: item.categories?.name || '',
    subcategoryId: item.subcategory_id || '',
    brandId: item.brand_id || '',
    brandName: item.brands?.name || '',
    stock: item.stock ?? 0,
    lowStockThreshold: item.low_stock_threshold ?? 5,
    isActive: item.is_active ?? true,
    isFeatured: item.is_featured ?? false,
    isNew: item.is_new ?? false,
    isPromo: item.is_promo ?? false,
    images: (item.product_images || []).map(mapImage),
    variants: (item.product_variants || []).map(mapVariant),
    specs: item.specs || {},
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapCategory(item: any): Category {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description || '',
    imageUrl: item.image_url || '',
    productCount: item.products?.[0]?.count ?? 0,
    order: item.display_order ?? 0,
  };
}

function mapBrand(item: any): Brand {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    logoUrl: item.logo_url || '',
    productCount: item.products?.[0]?.count ?? 0,
  };
}

function mapOrderItem(item: any) {
  return {
    id: item.id,
    orderId: item.order_id,
    productId: item.product_id || '',
    productName: item.product_name,
    sku: item.sku,
    variantName: item.variant_name || undefined,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    subtotal: Number(item.subtotal),
  };
}

function mapOrder(item: any): Order {
  return {
    id: item.id,
    reference: item.reference,
    customerName: item.customer_name,
    customerPhone: item.customer_phone,
    customerCity: item.customer_city,
    customerProvince: item.customer_province,
    customerAddress: item.customer_address || '',
    deliveryMethod: item.delivery_method,
    notes: item.notes || '',
    status: item.status,
    total: Number(item.total),
    items: (item.order_items || []).map(mapOrderItem),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapSettings(item: any): StoreSettings {
  return {
    ...initialStoreSettings,
    storeName: item.store_name ?? initialStoreSettings.storeName,
    whatsappNumber: item.whatsapp_number ?? initialStoreSettings.whatsappNumber,
    supportHours: item.support_hours ?? initialStoreSettings.supportHours,
    location: item.location ?? initialStoreSettings.location,
    instagramHandle: item.instagram_handle ?? initialStoreSettings.instagramHandle,
    announcementText: item.announcement_text ?? initialStoreSettings.announcementText,
    heroHeadline: item.hero_headline ?? initialStoreSettings.heroHeadline,
    heroSubtitle: item.hero_subtitle ?? initialStoreSettings.heroSubtitle,
    heroCtaText: item.hero_cta_text ?? initialStoreSettings.heroCtaText,
    heroCtaLink: item.hero_cta_link ?? initialStoreSettings.heroCtaLink,
    heroImageUrl: item.hero_image_url ?? initialStoreSettings.heroImageUrl,
    stockAlertThreshold: item.stock_alert_threshold ?? initialStoreSettings.stockAlertThreshold,
    currencySymbol: item.currency_symbol ?? initialStoreSettings.currencySymbol,
    freeShippingMinAmount:
      item.free_shipping_min_amount == null
        ? initialStoreSettings.freeShippingMinAmount
        : Number(item.free_shipping_min_amount),
  };
}

async function saveProductRelations(product: Product): Promise<void> {
  const supabase = requireSupabase();

  const { data: oldImages, error: imageReadError } = await supabase
    .from('product_images')
    .select('id')
    .eq('product_id', product.id);

  checkError(imageReadError, 'No se pudieron consultar las fotos');

  const images = product.images || [];
  const imageIdsToKeep = new Set(images.filter((i) => isUuid(i.id)).map((i) => i.id));

  for (const old of oldImages || []) {
    if (!imageIdsToKeep.has(old.id)) {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', old.id);
      checkError(error, 'No se pudo eliminar una foto anterior');
    }
  }

  if (images.length) {
    const rows = images.map((image) => ({
      ...(isUuid(image.id) ? { id: image.id } : {}),
      product_id: product.id,
      url: image.url,
      alt: image.alt || '',
      is_primary: image.isPrimary ?? false,
      display_order: image.order ?? 0,
    }));

    const { error } = await supabase.from('product_images').upsert(rows);
    checkError(error, 'No se pudieron guardar las fotos');
  }

  const { data: oldVariants, error: variantReadError } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', product.id);

  checkError(variantReadError, 'No se pudieron consultar las variantes');

  const variants = product.variants || [];
  const variantIdsToKeep = new Set(
    variants.filter((v) => isUuid(v.id)).map((v) => v.id)
  );

  for (const old of oldVariants || []) {
    if (!variantIdsToKeep.has(old.id)) {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', old.id);
      checkError(error, 'No se pudo eliminar una variante anterior');
    }
  }

  if (variants.length) {
    const rows = variants.map((variant) => ({
      ...(isUuid(variant.id) ? { id: variant.id } : {}),
      product_id: product.id,
      name: variant.name,
      sku: variant.sku,
      price: variant.price ?? null,
      stock: variant.stock ?? 0,
      color_hex: variant.colorHex || null,
    }));

    const { error } = await supabase.from('product_variants').upsert(rows);
    checkError(error, 'No se pudieron guardar las variantes');
  }
}

export const db = {
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured()) {
      return localRead(KEYS.products, initialProducts);
    }

    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), brands(name), product_images(*), product_variants(*)')
      .order('created_at', { ascending: false });

    checkError(error, 'No se pudieron cargar los productos');
    return (data || []).map(mapProduct);
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
    if (!isSupabaseConfigured()) {
      const products = localRead(KEYS.products, initialProducts);
      const now = new Date().toISOString();
      let saved: Product;

      if (productData.id) {
        const index = products.findIndex((p) => p.id === productData.id);
        if (index < 0) throw new Error('Producto no encontrado');
        saved = { ...products[index], ...productData, updatedAt: now } as Product;
        products[index] = saved;
      } else {
        const id = `prod-${Date.now()}`;
        saved = {
          ...productData,
          id,
          name: productData.name || 'Nuevo Producto',
          slug: productData.slug || `producto-${Date.now()}`,
          sku: productData.sku || `BK-${Date.now()}`,
          description: productData.description || '',
          price: productData.price ?? 0,
          categoryId: productData.categoryId || '',
          brandId: productData.brandId || '',
          stock: productData.stock ?? 0,
          lowStockThreshold: productData.lowStockThreshold ?? 5,
          isActive: productData.isActive ?? true,
          isFeatured: productData.isFeatured ?? false,
          isNew: productData.isNew ?? true,
          isPromo: productData.isPromo ?? false,
          images: productData.images || [],
          variants: productData.variants || [],
          specs: productData.specs || {},
          createdAt: now,
          updatedAt: now,
        } as Product;
        products.unshift(saved);
      }

      localWrite(KEYS.products, products);
      return saved;
    }

    const supabase = requireSupabase();
    const now = new Date().toISOString();
    const existingId = isUuid(productData.id) ? productData.id : undefined;

    const payload = {
      name: productData.name || 'Nuevo Producto',
      slug: productData.slug || `producto-${Date.now()}`,
      sku: productData.sku || `BK-${Date.now()}`,
      description: productData.description || '',
      price: productData.price ?? 0,
      compare_at_price: productData.compareAtPrice ?? null,
      category_id: isUuid(productData.categoryId) ? productData.categoryId : null,
      subcategory_id: isUuid(productData.subcategoryId) ? productData.subcategoryId : null,
      brand_id: isUuid(productData.brandId) ? productData.brandId : null,
      stock: productData.stock ?? 0,
      low_stock_threshold: productData.lowStockThreshold ?? 5,
      is_active: productData.isActive ?? true,
      is_featured: productData.isFeatured ?? false,
      is_new: productData.isNew ?? false,
      is_promo: productData.isPromo ?? false,
      specs: productData.specs || {},
      updated_at: now,
    };

    let savedRow: any;

    if (existingId) {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', existingId)
        .select('id')
        .single();

      checkError(error, 'No se pudo actualizar el producto');
      savedRow = data;
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select('id')
        .single();

      checkError(error, 'No se pudo crear el producto');
      savedRow = data;
    }

    const productId = savedRow.id;

    const { data: fullRow, error: readError } = await supabase
      .from('products')
      .select('*, categories(name), brands(name), product_images(*), product_variants(*)')
      .eq('id', productId)
      .single();

    checkError(readError, 'El producto se guardó, pero no se pudo volver a leer');

    const mapped = mapProduct(fullRow);
    const productWithRelations: Product = {
      ...mapped,
      images: productData.images || mapped.images,
      variants: productData.variants || mapped.variants,
    };

    await saveProductRelations(productWithRelations);

    const { data: finalRow, error: finalError } = await supabase
      .from('products')
      .select('*, categories(name), brands(name), product_images(*), product_variants(*)')
      .eq('id', productId)
      .single();

    checkError(finalError, 'El producto se guardó, pero no se pudieron cargar sus fotos y variantes');
    return mapProduct(finalRow);
  },

  async deleteProduct(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      localWrite(
        KEYS.products,
        localRead(KEYS.products, initialProducts).filter((p) => p.id !== id)
      );
      return;
    }

    if (!isUuid(id)) throw new Error('El producto no tiene un identificador válido de Supabase');

    const { error } = await requireSupabase().from('products').delete().eq('id', id);
    checkError(error, 'No se pudo eliminar el producto');
  },

  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured()) {
      return localRead(KEYS.categories, initialCategories);
    }

    const { data, error } = await requireSupabase()
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    checkError(error, 'No se pudieron cargar las categorías');
    return (data || []).map(mapCategory);
  },

  async saveCategory(catData: Partial<Category>): Promise<Category> {
    if (!isSupabaseConfigured()) {
      const categories = localRead(KEYS.categories, initialCategories);
      let saved: Category;

      if (catData.id) {
        const idx = categories.findIndex((c) => c.id === catData.id);
        if (idx < 0) throw new Error('Categoría no encontrada');
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

      localWrite(KEYS.categories, categories);
      return saved;
    }

    const supabase = requireSupabase();
    const payload = {
      name: catData.name || 'Nueva Categoría',
      slug: catData.slug || `cat-${Date.now()}`,
      description: catData.description || '',
      image_url: catData.imageUrl || '',
      display_order: catData.order ?? 1,
      updated_at: new Date().toISOString(),
    };

    const query = isUuid(catData.id)
      ? supabase.from('categories').update(payload).eq('id', catData.id)
      : supabase.from('categories').insert(payload);

    const { data, error } = await query.select('*').single();
    checkError(error, 'No se pudo guardar la categoría');
    return mapCategory(data);
  },

  async deleteCategory(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      localWrite(
        KEYS.categories,
        localRead(KEYS.categories, initialCategories).filter((c) => c.id !== id)
      );
      return;
    }

    if (!isUuid(id)) throw new Error('La categoría no tiene un identificador válido de Supabase');

    const { error } = await requireSupabase().from('categories').delete().eq('id', id);
    checkError(error, 'No se pudo eliminar la categoría');
  },

  async getBrands(): Promise<Brand[]> {
    if (!isSupabaseConfigured()) {
      return localRead(KEYS.brands, initialBrands);
    }

    const { data, error } = await requireSupabase()
      .from('brands')
      .select('*')
      .order('name', { ascending: true });

    checkError(error, 'No se pudieron cargar las marcas');
    return (data || []).map(mapBrand);
  },

  async saveBrand(brandData: Partial<Brand>): Promise<Brand> {
    if (!isSupabaseConfigured()) {
      const brands = localRead(KEYS.brands, initialBrands);
      let saved: Brand;

      if (brandData.id) {
        const idx = brands.findIndex((b) => b.id === brandData.id);
        if (idx < 0) throw new Error('Marca no encontrada');
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

      localWrite(KEYS.brands, brands);
      return saved;
    }

    const supabase = requireSupabase();
    const payload = {
      name: brandData.name || 'Nueva Marca',
      slug: brandData.slug || `brand-${Date.now()}`,
      logo_url: brandData.logoUrl || '',
    };

    const query = isUuid(brandData.id)
      ? supabase.from('brands').update(payload).eq('id', brandData.id)
      : supabase.from('brands').insert(payload);

    const { data, error } = await query.select('*').single();
    checkError(error, 'No se pudo guardar la marca');
    return mapBrand(data);
  },

  async deleteBrand(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      localWrite(
        KEYS.brands,
        localRead(KEYS.brands, initialBrands).filter((b) => b.id !== id)
      );
      return;
    }

    if (!isUuid(id)) throw new Error('La marca no tiene un identificador válido de Supabase');

    const { error } = await requireSupabase().from('brands').delete().eq('id', id);
    checkError(error, 'No se pudo eliminar la marca');
  },

  async getOrders(): Promise<Order[]> {
    if (!isSupabaseConfigured()) {
      return localRead<Order[]>(KEYS.orders, []);
    }

    const { data, error } = await requireSupabase()
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    checkError(error, 'No se pudieron cargar los pedidos');
    return (data || []).map(mapOrder);
  },

  async createOrder(
    orderInput: Omit<Order, 'id' | 'reference' | 'createdAt' | 'updatedAt'> & {
      reference?: string;
    }
  ): Promise<Order> {
    const now = new Date().toISOString();
    const reference = orderInput.reference || generateOrderReference();

    if (!isSupabaseConfigured()) {
      const orders = localRead<Order[]>(KEYS.orders, []);
      const order: Order = {
        ...orderInput,
        id: `ord-${Date.now()}`,
        reference,
        status: 'nuevo',
        createdAt: now,
        updatedAt: now,
      };
      orders.unshift(order);
      localWrite(KEYS.orders, orders);
      return order;
    }

    const supabase = requireSupabase();

    const { data: inserted, error } = await supabase
      .from('orders')
      .insert({
        reference,
        customer_name: orderInput.customerName,
        customer_phone: orderInput.customerPhone,
        customer_city: orderInput.customerCity,
        customer_province: orderInput.customerProvince,
        customer_address: orderInput.customerAddress || null,
        delivery_method: orderInput.deliveryMethod,
        notes: orderInput.notes || null,
        status: 'nuevo',
        total: orderInput.total,
      })
      .select('*')
      .single();

    checkError(error, 'No se pudo registrar el pedido');

    if (orderInput.items.length) {
      const items = orderInput.items.map((item) => ({
        order_id: inserted.id,
        product_id: isUuid(item.productId) ? item.productId : null,
        product_name: item.productName,
        sku: item.sku,
        variant_name: item.variantName || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(items);
      checkError(itemsError, 'El pedido se creó, pero hubo un error guardando sus artículos');
    }

    const { data: completeOrder, error: readError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', inserted.id)
      .single();

    checkError(readError, 'El pedido se creó, pero no se pudo volver a leer');
    return mapOrder(completeOrder);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    if (!isSupabaseConfigured()) {
      const orders = localRead<Order[]>(KEYS.orders, []);
      const idx = orders.findIndex((o) => o.id === orderId || o.reference === orderId);
      if (idx < 0) throw new Error('Pedido no encontrado');

      orders[idx] = { ...orders[idx], status, updatedAt: new Date().toISOString() };
      localWrite(KEYS.orders, orders);
      return orders[idx];
    }

    const supabase = requireSupabase();
    const query = isUuid(orderId)
      ? supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId)
      : supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('reference', orderId);

    const { data, error } = await query.select('*, order_items(*)').single();
    checkError(error, 'No se pudo actualizar el estado del pedido');
    return mapOrder(data);
  },

  async getStoreSettings(): Promise<StoreSettings> {
    if (!isSupabaseConfigured()) {
      return localRead(KEYS.settings, initialStoreSettings);
    }

    const { data, error } = await requireSupabase()
      .from('store_settings')
      .select('*')
      .eq('id', 'current')
      .maybeSingle();

    checkError(error, 'No se pudo cargar la configuración de la tienda');
    return data ? mapSettings(data) : initialStoreSettings;
  },

  async updateStoreSettings(
    settings: Partial<StoreSettings>
  ): Promise<StoreSettings> {
    if (!isSupabaseConfigured()) {
      const current = localRead(KEYS.settings, initialStoreSettings);
      const updated = { ...current, ...settings };
      localWrite(KEYS.settings, updated);
      return updated;
    }

    const current = await this.getStoreSettings();
    const updated = { ...current, ...settings };

    const { data, error } = await requireSupabase()
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
        currency_symbol: updated.currencySymbol,
        free_shipping_min_amount: updated.freeShippingMinAmount,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    checkError(error, 'No se pudo guardar la configuración');
    return mapSettings(data);
  },

  async resetToInitialData(): Promise<void> {
    if (isSupabaseConfigured()) {
      throw new Error(
        'El reinicio de datos de demostración solo está disponible cuando Supabase no está configurado.'
      );
    }

    localWrite(KEYS.products, initialProducts);
    localWrite(KEYS.categories, initialCategories);
    localWrite(KEYS.brands, initialBrands);
    localWrite(KEYS.settings, initialStoreSettings);
  },

  async clearAllDemoData(): Promise<void> {
    if (isSupabaseConfigured()) {
      throw new Error(
        'La limpieza de datos de demostración solo está disponible cuando Supabase no está configurado.'
      );
    }

    localWrite(KEYS.products, []);
    localWrite(KEYS.categories, []);
    localWrite(KEYS.brands, []);
    localWrite(KEYS.orders, []);
  },
};
