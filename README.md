# 🛡️ BUNKER E-COMMERCE

> Tienda online completa, moderna y profesional con identidad visual original, catálogo dinámico, carrito de compras persistente, finalización de pedidos por WhatsApp y panel administrativo privado con integración a Supabase.

---

## 🎨 Identidad Visual y Psicología de Marca

Inspirada en solidez, energía, durabilidad y confianza comercial para el mercado argentino:

- **Negro Carbón (`#17191D`)**: Transmite solidez, seguridad y presencia de marca.
- **Gris Grafito (`#282C33`)**: Elegancia y contraste sobrio en interfaces oscuras.
- **Blanco Cálido (`#FAFAF8`)**: Fondos de alta legibilidad para zonas de producto y lectura prolongada.
- **Gris Claro (`#ECEEF1`)**: Bordes y separadores sutiles.
- **Naranja Energético (`#F28C28`)**: Color de acento para botones de acción (“Agregar al carrito”, ofertas, novedades).
- **Logotipo SVG Exclusivo**: Monograma geométrico de bóveda blindada (*Vault Glyph*) con acento de energía naranja y tipografía de alto peso visual.

---

## 🚀 Características Principales

### 🛒 Experiencia de Compra (Frontend)
- **Buscador predictivo**: Búsqueda en tiempo real por nombre, SKU, marca y categoría con sugerencias visuales.
- **Filtros combinables**: Por categoría, marcas, rango de precios en ARS con sliders, disponibilidad en stock y variantes de color.
- **Ficha de Producto**: Galería multi-imagen con selector, variantes interactivas (color, talle, modelo) con stock independiente, simulador de costos de envío nacional por Código Postal y especificaciones técnicas.
- **Carrito persistente**: Guardado en navegador con validación estricta de stock y precios desde el servidor/estado confiable para evitar manipulaciones.
- **Finalización de Pedidos por WhatsApp**:
  - Código único de referencia (`BK-XXXXX`).
  - Validación de stock y precios al confirmar.
  - Registro inmediato del pedido en la base de datos con snapshot de precios.
  - Generación del enlace con mensaje preformateado hacia `+5493876447169`.
  - Pantalla de confirmación con detalle y opción de volver a copiar o abrir el chat.

### 🔐 Panel Administrativo Privado (`/admin`)
- **Ruta protegida**: Autenticación mediante Supabase Auth y credenciales maestras de evaluación.
- **Dashboard de Métricas**: Productos activos, alertas de stock bajo en tiempo real, pedidos nuevos y pendientes, y total de ventas registradas.
- **Gestión de Productos (CRUD)**:
  - Crear, editar, duplicar y archivar productos.
  - Gestor de múltiples fotografías con reordenamiento y designación de portada.
  - Administrador de variantes (nombre, SKU individual, stock por variante y selector de color).
  - Umbral configurable para avisos de stock crítico.
- **Gestión de Categorías y Marcas**: Creación y edición sin tocar código.
- **Gestión de Pedidos**: Control de estados (*Nuevo, Pendiente, Confirmado, Preparando, Entregado, Cancelado*), detalle de clientes y acceso directo a WhatsApp con el comprador.
- **Importación y Exportación CSV**:
  - Exportación total del catálogo con un clic.
  - Importación con validación de columnas, detección de SKUs duplicados, previsualización de cambios (nuevos vs. actualizaciones) y reporte de errores por fila.
  - Descarga de plantilla de muestra CSV.
- **Configuración de Tienda y Supabase**: Edición de número de WhatsApp, textos del banner principal, redes sociales y tester de credenciales Supabase.

---

## 🔐 Seguridad y Acceso Administrativo

- **Ruta de acceso:** `/admin` o `/admin/login`
- **Protección criptográfica:** Autenticación con verificación de hash SHA-256 y salting, prevención de ataques de fuerza bruta con bloqueo temporal por intentos fallidos y campos sin autocompletado ni valores predeterminados.
- **Gestión de Claves:** El administrador puede actualizar su usuario y contraseña secreta en cualquier momento desde `/admin/configuracion` o mediante Supabase Auth.

---

## 🗄️ Conexión con Supabase

El archivo `supabase_schema.sql` en la raíz contiene el script completo para crear las tablas, índices, políticas RLS (Row Level Security) y bucket de imágenes en Supabase.

1. Creá tu proyecto en [Supabase](https://supabase.com).
2. Entrá en **SQL Editor**, pegá el contenido de `supabase_schema.sql` y ejecutalo.
3. Copiá la URL y la Anon Key desde **Project Settings > API**.
4. Podés configurarlas directamente en la pantalla de `/admin/configuracion` en la sección "Conexión con Supabase" o en un archivo `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

*Nota: La aplicación cuenta con arquitectura híbrida. Si aún no conectaste Supabase, la tienda funciona al 100% con almacenamiento local reactivo y datos de muestra realistas.*

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción (TypeScript + Vite)
npm run build

# Previsualizar build de producción
npm run preview
```
