import React from 'react';
import { X, ChevronRight, Zap, Phone, Heart, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { LmenLogo } from './LmenLogo';
import { useTheme } from '../../context/ThemeContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, param?: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { totalFavorites } = useFavorites();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const categories = [
    { label: '⚽ Futebol', param: 'futebol' },
    { label: '👟 Chuteiras (Campo)', param: 'chuteiras' },
    { label: '⚡ Society (TF)', param: 'society' },
    { label: '🏃 Tênis de Corrida', param: 'tenis' },
    { label: '👕 Camisas & Mantos', param: 'camisas' },
    { label: '👕 Camisas Oversized', param: 'oversized' },
    { label: '🩳 Shorts & Bermudas', param: 'shorts' },
    { label: '🧦 Meias de Treino', param: 'meias' },
    { label: '🛡️ Meiões Profissionais', param: 'meioes' },
    { label: '🧢 Bonés & Streetwear', param: 'bones' },
    { label: '🧥 Agasalhos & Corta-Ventos', param: 'agasalhos' },
    { label: '🎒 Mochilas & Acessórios', param: 'acessorios' },
  ];

  const handleItemClick = (view: string, param?: string) => {
    onNavigate(view, param);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 max-w-xs w-full flex flex-col shadow-2xl transition-transform duration-300 ${
          isDark ? 'bg-[#0E1015] text-zinc-100' : 'bg-white text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 dark:border-white/10">
          <LmenLogo variant="mobile" />
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Promo Highlights */}
        <div className="p-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Ofertas Especiais
            </span>
          </div>
          <button
            onClick={() => handleItemClick('offers')}
            className="text-xs font-extrabold text-white hover:underline cursor-pointer"
          >
            Ver todas →
          </button>
        </div>

        {/* Categories list */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-white/5">
          <div className="px-4 py-2">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
              Categorias Esportivas
            </p>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.param}
                  onClick={() => handleItemClick('category', cat.param)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left cursor-pointer ${
                    isDark
                      ? 'hover:bg-white/5 text-zinc-200 hover:text-white'
                      : 'hover:bg-zinc-100 text-zinc-800'
                  }`}
                >
                  <span>{cat.label}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="px-4 py-3 space-y-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
              Minha Conta & Atalhos
            </p>
            <button
              onClick={() => handleItemClick('account')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5 cursor-pointer"
            >
              <span>{user ? `Olá, ${user.name}` : 'Entrar / Cadastro'}</span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
            <button
              onClick={() => handleItemClick('favorites')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-zinc-300" />
                Meus Favoritos ({totalFavorites})
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
            <button
              onClick={() => handleItemClick('admin')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5 cursor-pointer text-zinc-300"
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Painel do Administrador
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Footer info & theme toggle */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-zinc-300" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/lmen_sports?stkn=enhmdDdsZ3RrNmlj"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-white font-bold"
              aria-label="Instagram"
            >
              Instagram
            </a>
            <a
              href="https://wa.me/5597984217475"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-zinc-300 hover:text-white font-bold hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
