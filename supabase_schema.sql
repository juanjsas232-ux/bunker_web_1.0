-- ==============================================================================
-- BUNKER E-COMMERCE — ESQUEMA DE BASE DE DATOS SUPABASE
-- ==============================================================================
-- Este script crea todas las tablas, índices, restricciones de integridad,
-- políticas de seguridad RLS (Row Level Security) y bucket de almacenamiento
-- para la tienda BUNKER.
--
-- CÓMO USARLO EN SUPABASE:
-- 1. Creá un nuevo proyecto en https://supabase.com
-- 2. Dirigite a "SQL Editor" en el menú lateral izquierdo.
-- 3. Pegá este archivo completo y hacé clic en "Run".
-- 4. Copiá tu Project URL y tu anon/public API Key desde Project Settings > API.
-- 5. Colocalas en el panel de administración (/admin -> Configuración -> Supabase)
--    o en el archivo .env.local de tu proyecto.
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: Categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: Subcategorías
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(category_id, slug)
);

-- 4. TABLA: Marcas
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: Productos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(80) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    price NUMERIC(12, 2) NULL, -- NULL indica "Consultar precio"
    compare_at_price NUMERIC(12, 2) NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    low_stock_threshold INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    is_promo BOOLEAN DEFAULT false,
    specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA: Variantes de Producto
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    sku VARCHAR(80) NOT NULL,
    price NUMERIC(12, 2) NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    color_hex VARCHAR(20) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, sku)
);

-- 7. TABLA: Imágenes de Producto
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABLA: Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(60) NOT NULL,
    customer_city VARCHAR(100) NOT NULL,
    customer_province VARCHAR(100) NOT NULL,
    customer_address TEXT,
    delivery_method VARCHAR(40) DEFAULT 'envio',
    notes TEXT,
    status VARCHAR(40) DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'pendiente', 'confirmado', 'preparando', 'entregado', 'cancelado')),
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLA: Artículos del Pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(80) NOT NULL,
    variant_name VARCHAR(120),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABLA: Movimientos de Stock
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity_change INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. TABLA: Configuración General de Tienda
CREATE TABLE IF NOT EXISTS public.store_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'current',
    store_name VARCHAR(120) DEFAULT 'BUNKER',
    whatsapp_number VARCHAR(40) DEFAULT '+5493876447169',
    support_hours VARCHAR(100) DEFAULT 'Lunes a Viernes 9:00 a 18:00hs',
    location VARCHAR(120) DEFAULT 'Salta, Argentina',
    instagram_handle VARCHAR(80) DEFAULT '@bunker.ok',
    announcement_text VARCHAR(255) DEFAULT 'ENVÍOS A TODO EL PAÍS | 3 CUOTAS SIN INTERÉS EN TODA LA TIENDA',
    hero_headline VARCHAR(200) DEFAULT 'ENERGÍA. DISEÑO. ACTITUD.',
    hero_subtitle TEXT DEFAULT 'Productos seleccionados para potenciar tu día a día.',
    hero_cta_text VARCHAR(60) DEFAULT 'VER NOVEDADES',
    hero_cta_link VARCHAR(200) DEFAULT '/catalogo',
    hero_image_url TEXT DEFAULT '',
    stock_alert_threshold INTEGER DEFAULT 5,
    currency_symbol VARCHAR(10) DEFAULT '$',
    free_shipping_min_amount NUMERIC(12, 2) DEFAULT 80000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ÍNDICES PARA OPTIMIZAR BÚSQUEDA Y FILTROS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Acceso Público de Lectura para Catálogo y Configuración
DROP POLICY IF EXISTS "Lectura pública de categorías" ON public.categories;
CREATE POLICY "Lectura pública de categorías" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Lectura pública de subcategorías" ON public.subcategories;
CREATE POLICY "Lectura pública de subcategorías" ON public.subcategories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Lectura pública de marcas" ON public.brands;
CREATE POLICY "Lectura pública de marcas" ON public.brands FOR SELECT USING (true);
DROP POLICY IF EXISTS "Lectura pública de productos activos" ON public.products;
CREATE POLICY "Lectura pública de productos activos" ON public.products FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Lectura pública de variantes" ON public.product_variants;
CREATE POLICY "Lectura pública de variantes" ON public.product_variants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Lectura pública de imágenes" ON public.product_images;
CREATE POLICY "Lectura pública de imágenes" ON public.product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Lectura pública de configuración" ON public.store_settings;
CREATE POLICY "Lectura pública de configuración" ON public.store_settings FOR SELECT USING (true);

-- Creación de Pedidos: Público puede insertar nuevos pedidos y sus items
DROP POLICY IF EXISTS "Público puede crear pedidos" ON public.orders;
CREATE POLICY "Público puede crear pedidos" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Público puede crear items de pedido" ON public.order_items;
CREATE POLICY "Público puede crear items de pedido" ON public.order_items FOR INSERT WITH CHECK (true);

-- Acceso Administrativo Completo: Solo usuarios autenticados
DROP POLICY IF EXISTS "Admin gestión de categorías" ON public.categories;
CREATE POLICY "Admin gestión de categorías" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin gestión de subcategorías" ON public.subcategories;
CREATE POLICY "Admin gestión de subcategorías" ON public.subcategories FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin gestión de marcas" ON public.brands;
CREATE POLICY "Admin gestión de marcas" ON public.brands FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin gestión de productos" ON public.products;
CREATE POLICY "Admin gestión de productos" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin gestión de variantes" ON public.product_variants;
CREATE POLICY "Admin gestión de variantes" ON public.product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin gestión de imágenes" ON public.product_images;
CREATE POLICY "Admin gestión de imágenes" ON public.product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin gestión de pedidos" ON public.orders;
CREATE POLICY "Admin gestión de pedidos" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin gestión de items pedidos" ON public.order_items;
CREATE POLICY "Admin gestión de items pedidos" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin gestión de movimientos" ON public.stock_movements;
CREATE POLICY "Admin gestión de movimientos" ON public.stock_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin gestión de configuración" ON public.store_settings;
CREATE POLICY "Admin gestión de configuración" ON public.store_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- BUCKET DE STORAGE PARA FOTOGRAFÍAS (Supabase Storage)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
DROP POLICY IF EXISTS "Imágenes de productos públicas" ON storage.objects;
CREATE POLICY "Imágenes de productos públicas" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin subida de imágenes" ON storage.objects;

CREATE POLICY "Admin subida de imágenes" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin eliminación de imágenes" ON storage.objects;

CREATE POLICY "Admin eliminación de imágenes" ON storage.objects 
FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- Configuración inicial por defecto
INSERT INTO public.store_settings (id, store_name, whatsapp_number)
VALUES ('current', 'BUNKER', '+5493876447169')
ON CONFLICT (id) DO NOTHING;
