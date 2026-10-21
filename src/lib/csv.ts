import Papa from 'papaparse';
import { Product } from '../types';

export interface CSVRow {
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: string;
  compareAtPrice?: string;
  stock: string;
  description?: string;
  imageUrl?: string;
  isActive?: string;
}

export interface CSVValidationResult {
  validRows: Partial<Product>[];
  errors: { row: number; sku: string; error: string }[];
  totalRows: number;
  newCount: number;
  updateCount: number;
}

export function exportProductsToCSV(products: Product[]): void {
  const data = products.map((p) => ({
    sku: p.sku,
    name: p.name,
    category: p.categoryName || '',
    brand: p.brandName || '',
    price: p.price ?? '',
    compareAtPrice: p.compareAtPrice ?? '',
    stock: p.stock,
    description: p.description || '',
    imageUrl: p.images?.[0]?.url || '',
    isActive: p.isActive ? 'SI' : 'NO',
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `bunker-catalogo-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadSampleCSVTemplate(): void {
  const template = [
    {
      sku: 'BK-AUD-999',
      name: 'Auriculares Bunker Bass Pro',
      category: 'Audio',
      brand: 'Bunker',
      price: '74999',
      compareAtPrice: '89999',
      stock: '20',
      description: 'Auriculares de diadema con cancelación pasiva y cable desmontable reforzado.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      isActive: 'SI',
    },
    {
      sku: 'BK-TEC-888',
      name: 'Smartband Bunker Fit',
      category: 'Tecnología',
      brand: 'Bunker',
      price: '34999',
      compareAtPrice: '',
      stock: '15',
      description: 'Pulsera deportiva resistente al agua con podómetro y ritmo cardíaco.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      isActive: 'SI',
    }
  ];

  const csv = Papa.unparse(template);
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'plantilla-productos-bunker.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseAndValidateCSV(file: File, existingProducts: Product[]): Promise<CSVValidationResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: { row: number; sku: string; error: string }[] = [];
        const validRows: Partial<Product>[] = [];
        const seenSkus = new Set<string>();
        const existingSkuMap = new Map(existingProducts.map((p) => [p.sku.toUpperCase(), p]));

        let newCount = 0;
        let updateCount = 0;

        results.data.forEach((row, index) => {
          const rowNumber = index + 2; // +1 for header, +1 for 1-based index
          const sku = (row.sku || row.SKU || '').trim();
          const name = (row.name || row.nombre || row.Nombre || '').trim();
          const rawPrice = (row.price || row.precio || row.Precio || '').trim();
          const rawCompare = (row.compareAtPrice || row.precio_anterior || '').trim();
          const rawStock = (row.stock || row.Stock || '').trim();
          const category = (row.category || row.categoria || row.Categoria || '').trim();
          const brand = (row.brand || row.marca || row.Marca || '').trim();
          const description = (row.description || row.descripcion || '').trim();
          const imageUrl = (row.imageUrl || row.imagen || row.foto || '').trim();
          const isActiveStr = (row.isActive || row.activo || 'SI').trim().toUpperCase();

          if (!sku) {
            errors.push({ row: rowNumber, sku: '(Vacío)', error: 'Falta la columna obligatoria SKU.' });
            return;
          }

          if (seenSkus.has(sku.toUpperCase())) {
            errors.push({ row: rowNumber, sku, error: `SKU duplicado en el mismo archivo CSV.` });
            return;
          }
          seenSkus.add(sku.toUpperCase());

          if (!name) {
            errors.push({ row: rowNumber, sku, error: 'Falta el nombre del producto.' });
            return;
          }

          const price = rawPrice !== '' ? Number(rawPrice.replace('$', '').replace(/\./g, '').replace(',', '.')) : null;
          if (rawPrice !== '' && isNaN(price as number)) {
            errors.push({ row: rowNumber, sku, error: `Precio inválido: "${rawPrice}".` });
            return;
          }

          const comparePrice = rawCompare !== '' ? Number(rawCompare.replace('$', '').replace(/\./g, '').replace(',', '.')) : null;

          const stock = rawStock !== '' ? parseInt(rawStock, 10) : 0;
          if (isNaN(stock) || stock < 0) {
            errors.push({ row: rowNumber, sku, error: `Stock inválido: "${rawStock}". Debe ser un número entero >= 0.` });
            return;
          }

          const existing = existingSkuMap.get(sku.toUpperCase());
          if (existing) {
            updateCount++;
          } else {
            newCount++;
          }

          validRows.push({
            id: existing?.id,
            sku,
            name,
            slug: existing?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            price,
            compareAtPrice: comparePrice,
            stock,
            categoryName: category || existing?.categoryName || 'General',
            brandName: brand || existing?.brandName || 'Bunker',
            description: description || existing?.description || '',
            isActive: isActiveStr === 'SI' || isActiveStr === 'TRUE' || isActiveStr === '1',
            images: imageUrl
              ? [{ id: `img-${Date.now()}-${index}`, productId: existing?.id || '', url: imageUrl, isPrimary: true, order: 1 }]
              : existing?.images || [],
          });
        });

        resolve({
          validRows,
          errors,
          totalRows: results.data.length,
          newCount,
          updateCount,
        });
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}
