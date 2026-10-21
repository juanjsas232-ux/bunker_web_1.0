import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Order } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Argentine Pesos (ARS): e.g. $ 129.999
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return 'Consultar precio';
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price).replace(/\s/, ' ');
}

/**
 * Calculate 3 or N installments without interest
 */
export function calculateInstallments(price: number | null | undefined, count: number = 3): string | null {
  if (price === null || price === undefined || price <= 0) return null;
  const installment = Math.round(price / count);
  return `${count} cuotas sin interés de ${formatPrice(installment)}`;
}

/**
 * Generates an order reference like BK-84920
 */
export function generateOrderReference(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BK-${code}`;
}

/**
 * Generates the pre-filled WhatsApp message as specified in prompt section 5
 */
export function buildWhatsAppMessage(order: Order): string {
  const itemsText = order.items
    .map(
      (item) =>
        `- Producto: ${item.productName}\n` +
        `- SKU: ${item.sku}\n` +
        `- Variante: ${item.variantName || 'Única'}\n` +
        `- Cantidad: ${item.quantity}\n` +
        `- Precio unitario: ${formatPrice(item.unitPrice)}\n` +
        `- Subtotal: ${formatPrice(item.subtotal)}`
    )
    .join('\n\n');

  const message = 
`Hola, BUNKER. Quiero realizar el siguiente pedido:

Pedido: ${order.reference}

${itemsText}

Total del pedido: ${formatPrice(order.total)}

Nombre: ${order.customerName}
Localidad: ${order.customerCity}${order.customerProvince ? `, ${order.customerProvince}` : ''}${order.customerAddress ? `\nDirección: ${order.customerAddress}` : ''}
${order.notes ? `Notas: ${order.notes}\n` : ''}
Quedo atento a la confirmación de disponibilidad y los medios de pago.`;

  return message;
}

/**
 * Generates the full WhatsApp URL with encoded message
 */
export function buildWhatsAppUrl(order: Order, rawPhone: string = '5493876447169'): string {
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const message = buildWhatsAppMessage(order);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Pre-filled product inquiry message via WhatsApp
 */
export function buildProductInquiryWhatsAppUrl(
  productName: string, 
  sku: string, 
  variantName?: string, 
  rawPhone: string = '5493876447169'
): string {
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const msg = `Hola, BUNKER! Quisiera consultar disponibilidad y precio sobre el siguiente producto:\n\n- Producto: ${productName}\n- SKU: ${sku}${variantName ? `\n- Variante: ${variantName}` : ''}\n\nMuchas gracias!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}
