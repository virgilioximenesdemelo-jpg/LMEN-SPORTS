import React from 'react';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useTheme } from '../../context/ThemeContext';

interface MobileBottomBarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenSearch: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
}) => {
  const { totalItemsCount, openCart } = useCart();
  const { totalFavorites } = useFavorites();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const items = [
    {
      id: 'home',
      label: 'Início',
      icon: Home,
      action: () => onNavigate('home'),
      active: currentView === 'home',
    },
    {
      id: 'search',
      label: 'Buscar',
      icon: Search,
      action: onOpenSearch,
      active: false,
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: Heart,
      badge: totalFavorites > 0 ? totalFavorites : undefined,
      action: () => onNavigate('favorites'),
      active: currentView === 'favorites',
    },
    {
      id: 'cart',
      label: 'Carrinho',
      icon: ShoppingBag,
      badge: totalItemsCount > 0 ? totalItemsCount : undefined,
      action: openCart,
      active: currentView === 'cart',
      highlight: true,
    },
    {
      id: 'account',
      label: 'Conta',
      icon: User,
      action: () => onNavigate('account'),
      active: currentView === 'account',
    },
  ];

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 lg:hidden border-t safe-area-bottom shadow-lg transition-colors ${
        isDark
          ? 'bg-[#0B0B0C]/95 backdrop-blur-md border-white/10 text-zinc-400'
          : 'bg-white/95 backdrop-blur-md border-zinc-200 text-zinc-600'
      }`}
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
                item.active
                  ? isDark
                    ? 'text-white font-bold'
                    : 'text-zinc-950 font-bold'
                  : isDark
                  ? 'hover:text-white'
                  : 'hover:text-zinc-900'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${item.active ? 'stroke-[2.5px]' : 'stroke-2'} ${
                    item.id === 'favorites' && totalFavorites > 0 ? (isDark ? 'fill-white text-white' : 'fill-zinc-900 text-zinc-900') : ''
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-zinc-200 text-black text-[10px] font-black flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
