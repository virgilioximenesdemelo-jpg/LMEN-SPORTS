import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

interface CartDrawerProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onContinueShopping }) => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    discount,
    coupon,
    applyCoupon,
    removeCoupon,
    total,
  } = useCart();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isOpen) return null;

  const freeShippingThreshold = 249.9;
  const freeShippingDiff = freeShippingThreshold - subtotal;
  const progressPercent = Math.min(100, Math.max(0, (subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.validateCoupon(couponInput.trim(), subtotal);
      applyCoupon({
        id: `c-${Date.now()}`,
        code: res.code,
        type: res.type,
        value: res.type === 'percent' ? 10 : 25,
        minValue: 100,
        description: res.description,
        validUntil: '2026-12-31',
        usedCount: 1,
        isActive: true,
      });
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Cupom inválido ou valor mínimo não atingido');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 right-0 max-w-md w-full flex flex-col shadow-2xl transition-transform duration-300 ${
          isDark ? 'bg-[#0E1015] text-zinc-100' : 'bg-white text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-white" />
            <h2 className="text-base font-black uppercase tracking-wider">
              Meu Carrinho ({items.reduce((sum, it) => sum + it.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Tracker */}
        <div className={`p-3 border-b ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold">
            <Truck className="w-4 h-4 text-zinc-300" />
            {freeShippingDiff > 0 ? (
              <span>
                Faltam <strong className="text-white">R$ {freeShippingDiff.toFixed(2).replace('.', ',')}</strong> para{' '}
                <strong className="text-white">FRETE GRÁTIS</strong>!
              </span>
            ) : (
              <span className="text-white font-bold">
                Parabéns! Você ganhou FRETE GRÁTIS para todo o Brasil!
              </span>
            )}
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-bold">Seu carrinho está vazio</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Explore nossas chuteiras, camisas de time e coleções esportivas!
                </p>
              </div>
              <button
                onClick={() => {
                  closeCart();
                  onContinueShopping();
                }}
                className="inline-block py-2.5 px-6 rounded-xl bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                COMEÇAR A COMPRAR
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className={`flex gap-3 p-3 rounded-2xl border transition-colors ${
                  isDark ? 'bg-zinc-900/60 border-white/10' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl bg-zinc-800 shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold leading-snug line-clamp-2">{item.name}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Tam: <span className="font-semibold text-zinc-300">{item.size}</span> · Cor:{' '}
                        <span className="font-semibold text-zinc-300">{item.color}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-black/20">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-center min-w-[24px]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <span className="text-xs font-black text-white">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions if items exist */}
        {items.length > 0 && (
          <div className={`p-4 border-t ${isDark ? 'border-white/10 bg-[#0B0B0C]' : 'border-zinc-200 bg-white'}`}>
            {/* Coupon input */}
            <div className="mb-4">
              {coupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800 border border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-white" />
                    <div>
                      <span className="font-extrabold text-white">{coupon.code}</span>
                      <p className="text-[10px] text-zinc-400">{coupon.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-zinc-400 hover:text-white font-bold cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Tem um cupom? (Ex: LMEN10)"
                      className={`flex-1 py-2 px-3 text-xs rounded-xl focus:outline-none uppercase font-semibold transition-colors ${
                        isDark
                          ? 'bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-white'
                          : 'bg-zinc-50 border border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:border-black shadow-sm'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className={`py-2 px-4 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 ${
                        isDark
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10'
                          : 'bg-black hover:bg-zinc-800 text-white'
                      }`}
                    >
                      {couponLoading ? 'Aplicando...' : 'Aplicar'}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-zinc-400">{couponError}</p>}
                </form>
              )}
            </div>

            {/* Financial summary */}
            <div className="space-y-1.5 text-xs mb-4">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-white font-semibold">
                  <span>Desconto Cupom</span>
                  <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Frete</span>
                <span>{subtotal >= freeShippingThreshold ? 'Grátis' : 'A calcular no checkout'}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-sm font-bold">Total</span>
                <span className="text-lg font-black text-white">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 text-right">
                ou até 6x de R$ {(total / 6).toFixed(2).replace('.', ',')} sem juros
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  closeCart();
                  onCheckout();
                }}
                className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>FINALIZAR COMPRA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  closeCart();
                  onContinueShopping();
                }}
                className="w-full py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer text-center"
              >
                CONTINUAR COMPRANDO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
