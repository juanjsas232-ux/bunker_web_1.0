import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Order, OrderItem } from '../types';
import { useStore } from './StoreContext';
import { db } from '../lib/db';
import { buildWhatsAppUrl, generateOrderReference } from '../lib/utils';
import confetti from 'canvas-confetti';

interface CheckoutCustomerData {
  name: string;
  phone: string;
  city: string;
  province: string;
  address?: string;
  deliveryMethod: 'envio' | 'sucursal' | 'retiro';
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => boolean;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  completedOrder: Order | null;
  isSubmittingOrder: boolean;
  submitOrderViaWhatsApp: (customerData: CheckoutCustomerData) => Promise<{ success: boolean; order?: Order; error?: string }>;
  resetCompletedOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_KEY = 'bunker_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products, settings, refreshData } = useStore();
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(LOCAL_CART_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, variant?: ProductVariant, quantity: number = 1): boolean => {
    // If product has no price or stock <= 0, prevent adding
    if (product.price === null || product.price === undefined) {
      return false;
    }

    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock <= 0) {
      return false;
    }

    const itemId = variant ? `${product.id}-${variant.id}` : product.id;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === itemId);
      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = Math.min(existing.quantity + quantity, availableStock);
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
        };
        return updated;
      } else {
        const unitPrice = variant?.price ?? product.price ?? 0;
        return [
          ...prev,
          {
            id: itemId,
            productId: product.id,
            variantId: variant?.id,
            product,
            variant,
            quantity: Math.min(quantity, availableStock),
            unitPrice,
          },
        ];
      }
    });

    setIsOpen(true);
    return true;
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const maxStock = item.variant ? item.variant.stock : item.product.stock;
          return {
            ...item,
            quantity: Math.min(newQuantity, maxStock),
          };
        }
        return item;
      })
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Security: Re-verify unit prices from fresh product catalog state, preventing tampering!
  const subtotal = items.reduce((acc, item) => {
    const freshProduct = products.find((p) => p.id === item.productId) || item.product;
    const freshPrice = item.variant?.price ?? freshProduct.price ?? 0;
    return acc + freshPrice * item.quantity;
  }, 0);

  const submitOrderViaWhatsApp = async (
    customer: CheckoutCustomerData
  ): Promise<{ success: boolean; order?: Order; error?: string }> => {
    if (items.length === 0) {
      return { success: false, error: 'El carrito está vacío.' };
    }

    if (isSubmittingOrder) {
      return { success: false, error: 'El pedido ya se está procesando.' };
    }

    setIsSubmittingOrder(true);

    try {
      // 1. Re-validate prices and stock against database
      const freshProducts = await db.getProducts();
      const orderItems: OrderItem[] = [];
      let calculatedTotal = 0;

      for (const item of items) {
        const dbProduct = freshProducts.find((p) => p.id === item.productId);
        if (!dbProduct || !dbProduct.isActive) {
          throw new Error(`El producto "${item.product.name}" ya no está disponible.`);
        }

        const dbVariant = item.variantId
          ? dbProduct.variants?.find((v) => v.id === item.variantId)
          : undefined;

        const realStock = dbVariant ? dbVariant.stock : dbProduct.stock;
        if (realStock < item.quantity) {
          throw new Error(
            `Stock insuficiente para "${dbProduct.name}" (${dbVariant ? dbVariant.name : 'estándar'}). Quedan ${realStock} unidades.`
          );
        }

        const validUnitPrice = dbVariant?.price ?? dbProduct.price ?? 0;
        const itemSubtotal = validUnitPrice * item.quantity;
        calculatedTotal += itemSubtotal;

        orderItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: dbProduct.id,
          productName: dbProduct.name,
          sku: dbVariant?.sku || dbProduct.sku,
          variantName: dbVariant?.name,
          quantity: item.quantity,
          unitPrice: validUnitPrice,
          subtotal: itemSubtotal,
        });
      }

      // 2. Generate unique reference BK-XXXXX
      const reference = generateOrderReference();

      // 3. Save order into database
      const newOrder = await db.createOrder({
        reference,
        customerName: customer.name.trim(),
        customerPhone: customer.phone.trim(),
        customerCity: customer.city.trim(),
        customerProvince: customer.province.trim(),
        customerAddress: customer.address?.trim() || undefined,
        deliveryMethod: customer.deliveryMethod,
        notes: customer.notes?.trim() || undefined,
        status: 'nuevo',
        total: calculatedTotal,
        items: orderItems,
      });

      // 4. Build WhatsApp link
      const whatsappUrl = buildWhatsAppUrl(newOrder, settings.whatsappNumber);
      newOrder.whatsappUrl = whatsappUrl;

      // 5. Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F28C28', '#17191D', '#FAFAF8', '#25D366'],
        });
      } catch (e) {}

      // 6. Set completed order state and clear cart
      setCompletedOrder(newOrder);
      clearCart();
      setIsCheckoutOpen(false);
      setIsOpen(false);

      // 7. Refresh database state
      await refreshData();

      // 8. Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      return { success: true, order: newOrder };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error procesando el pedido.' };
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const resetCompletedOrder = () => {
    setCompletedOrder(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
        completedOrder,
        isSubmittingOrder,
        submitOrderViaWhatsApp,
        resetCompletedOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
