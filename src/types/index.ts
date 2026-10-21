export type OrderStatus = 
  | 'nuevo' 
  | 'pendiente' 
  | 'confirmado' 
  | 'preparando' 
  | 'entregado' 
  | 'cancelado';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
  order: number;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  productCount?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g. "Negro Carbón", "Talle L"
  sku: string;
  price?: number;
  stock: number;
  colorHex?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number | null; // null means "Consultar precio"
  compareAtPrice?: number | null; // Previous strikethrough price if discount
  categoryId: string;
  categoryName?: string;
  subcategoryId?: string;
  brandId?: string;
  brandName?: string;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isPromo: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  specs?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string; // unique item id = productId + (variantId || '')
  productId: string;
  variantId?: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  productName: string;
  sku: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  reference: string; // e.g. BK-78412
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerProvince: string;
  customerAddress?: string;
  deliveryMethod: 'envio' | 'sucursal' | 'retiro';
  notes?: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  whatsappUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string; // default '+5493876447169'
  supportHours: string;
  location: string;
  instagramHandle: string;
  announcementText: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroImageUrl: string;
  stockAlertThreshold: number;
  currencySymbol: string;
  freeShippingMinAmount: number;
}

export interface FilterState {
  searchQuery: string;
  categoryId: string | null;
  subcategoryId: string | null;
  brandIds: string[];
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  selectedColorHex: string | null;
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'newest';
}
