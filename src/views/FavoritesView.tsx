import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { ProductCard } from '../components/product/ProductCard';

interface FavoritesViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  products,
  onSelectProduct,
  onNavigate,
}) => {
  const { favoriteIds } = useFavorites();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const favoriteProducts = products.filter(p => favoriteIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
            SUA LISTA DE DESEJOS
          </span>
          <h1 className={`text-3xl font-black uppercase tracking-tight mt-1 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
            Meus Produtos Favoritos ({favoriteProducts.length})
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Itens que você salvou para comprar quando quiser.
          </p>
        </div>

        {favoriteProducts.length > 0 && (
          <button
            onClick={() => onNavigate('category', 'todos')}
            className="text-xs font-bold text-zinc-300 hover:text-white hover:underline flex items-center gap-1 cursor-pointer"
          >
            Continuar explorando a loja
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid or Empty state */}
      {favoriteProducts.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-500">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">Você ainda não tem favoritos salvos</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Ao navegar pelas chuteiras, camisas de time e equipamentos, clique no coração para salvar os itens que mais gostar.
          </p>
          <button
            onClick={() => onNavigate('category', 'todos')}
            className="py-3 px-8 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            EXPLORAR PRODUTOS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
