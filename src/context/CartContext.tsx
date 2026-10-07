import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon, ShippingOption } from '../types';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  coupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  shipping: ShippingOption | null;
  setShipping: (option: ShippingOption | null) => void;
  total: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lmen_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('lmen_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [shipping, setShipping] = useState<ShippingOption | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('lmen_cart', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (coupon) {
        localStorage.setItem('lmen_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('lmen_coupon');
      }
    } catch (e) {
      console.error(e);
    }
  }, [coupon]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const existingIndex = items.findIndex(
      it => it.productId === item.productId && it.size === item.size && it.color === item.color
    );

    if (existingIndex > -1) {
      const updated = [...items];
      const newQty = Math.min(updated[existingIndex].quantity + item.quantity, item.maxStock || 99);
      updated[existingIndex].quantity = newQty;
      setItems(updated);
    } else {
      const newItem: CartItem = {
        ...item,
        id: `${item.productId}-${item.size}-${item.color}-${Date.now()}`,
      };
      setItems(prev => [newItem, ...prev]);
    }
    setIsOpen(true);
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(it => (it.id === id ? { ...it, quantity: Math.min(qty, it.maxStock || 99) } : it))
    );
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setShipping(null);
  };

  const applyCoupon = (newCoupon: Coupon) => {
    setCoupon(newCoupon);
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);

  let discount = 0;
  if (coupon) {
    if (coupon.type === 'percent') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, subtotal);
  }

  const shippingCost = shipping ? shipping.price : 0;
  const total = Math.max(0, subtotal - discount + shippingCost);
  const totalItemsCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        discount,
        coupon,
        applyCoupon,
        removeCoupon,
        shipping,
        setShipping,
        total,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
