import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User, Menu, Sun, Moon, Shield } from 'lucide-react';
import { LmenLogo } from './LmenLogo';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenMobileMenu,
  onOpenSearch,
}) => {
  const { totalItemsCount, openCart } = useCart();
  const { totalFavorites } = useFavorites();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'INÍCIO', view: 'home' },
    { label: 'FUTEBOL', view: 'category', param: 'futebol' },
    { label: 'CHUTEIRAS', view: 'category', param: 'chuteiras' },
    { label: 'TÊNIS', view: 'category', param: 'tenis' },
    { label: 'CAMISAS', view: 'category', param: 'camisas' },
    { label: 'OVERSIZED', view: 'category', param: 'oversized' },
    { label: 'SHORTS', view: 'category', param: 'shorts' },
    { label: 'ACESSÓRIOS', view: 'category', param: 'acessorios' },
    { label: 'OFERTAS', view: 'offers', badge: 'OUTLET' },
  ];

  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? isDark
            ? 'bg-[#0B0B0C]/95 backdrop-blur-md shadow-lg shadow-black/60 border-b border-white/10'
            : 'bg-white/95 backdrop-blur-md shadow-md border-b border-zinc-200'
          : isDark
          ? 'bg-[#0B0B0C] border-b border-white/5'
          : 'bg-white border-b border-zinc-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile hamburger menu */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={onOpenMobileMenu}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-zinc-200 hover:bg-white/10' : 'text-zinc-800 hover:bg-zinc-100'
              }`}
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={onOpenSearch}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-zinc-200 hover:bg-white/10' : 'text-zinc-800 hover:bg-zinc-100'
              }`}
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Official Logo */}
          <div onClick={() => onNavigate('home')} className="cursor-pointer">
            <LmenLogo variant="desktop" className="hidden sm:flex" />
            <LmenLogo variant="mobile" className="flex sm:hidden" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map(item => {
              const isActive =
                item.view === currentView ||
                (item.view === 'category' && currentView.includes(item.param || ''));

              return (
                <button
                  key={item.label}
                  onClick={() => onNavigate(item.view, item.param)}
                  className={`relative px-3 py-2 text-xs font-bold tracking-wider transition-colors cursor-pointer rounded-md ${
                    isActive
                      ? isDark
                        ? 'text-white font-extrabold'
                        : 'text-zinc-950 font-extrabold'
                      : isDark
                      ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {item.badge && (
                      <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-200 border border-zinc-700 text-[9px] font-black rounded uppercase tracking-tighter">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-white dark:bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Search Trigger (Desktop) */}
            <button
              onClick={onOpenSearch}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer border ${
                isDark
                  ? 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-zinc-950 hover:border-zinc-400'
              }`}
              title="Buscar produtos (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-zinc-400" />
              <span className="hidden md:inline">Buscar...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/10 dark:bg-black/40 rounded border border-white/10 text-zinc-400">
                /
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                isDark ? 'text-zinc-300 hover:bg-white/10' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
              title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Favorites Icon */}
            <button
              onClick={() => onNavigate('favorites')}
              className={`relative p-2.5 rounded-full transition-colors cursor-pointer ${
                isDark ? 'text-zinc-300 hover:text-white hover:bg-white/10' : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
              title="Meus Favoritos"
            >
              <Heart className={`w-5 h-5 ${totalFavorites > 0 ? (isDark ? 'fill-white text-white' : 'fill-zinc-900 text-zinc-900') : ''}`} />
              {totalFavorites > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-zinc-200 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                  {totalFavorites}
                </span>
              )}
            </button>

            {/* Shopping Cart Icon */}
            <button
              onClick={openCart}
              className={`relative p-2.5 rounded-full transition-all duration-200 cursor-pointer shadow-md active:scale-95 ${
                isDark
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
              title="Carrinho de Compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-700 text-white border border-white/30 text-[11px] font-black rounded-full flex items-center justify-center shadow-md">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Account Icon */}
            <button
              onClick={() => onNavigate('account')}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                isDark ? 'text-zinc-300 hover:text-white hover:bg-white/10' : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
              title={user ? `Minha Conta (${user.name})` : 'Entrar / Minha Conta'}
            >
              <User className="w-5 h-5" />
            </button>

            {/* Admin shortcut button */}
            <button
              onClick={() => onNavigate('admin')}
              className="hidden xl:inline-flex items-center gap-1 ml-2 px-2.5 py-1 text-[11px] font-bold rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Painel Administrativo LMEN"
            >
              <Shield className="w-3 h-3 text-zinc-300" />
              ADMIN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
