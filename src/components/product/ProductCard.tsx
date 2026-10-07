import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useTheme } from '../../context/ThemeContext';
import { handleImageError } from '../../utils/imageFallback';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onQuickAdd }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addItem } = useCart();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const favorited = isFavorite(product.id);

  // Price calculations
  const installments = 4;
  const installmentValue = (product.price / installments).toFixed(2).replace('.', ',');
  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800';
  const secondaryImage = product.images[1] || primaryImage;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(product);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 border cursor-pointer ${
        isDark
          ? 'bg-[#12141A] border-white/10 hover:border-white/40 hover:shadow-2xl hover:shadow-black/80'
          : 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-xl hover:shadow-zinc-200'
      }`}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden bg-black flex items-center justify-center">
        {/* Main image */}
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discountPercentage ? (
            <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-white text-black rounded-md shadow-md">
              -{product.discountPercentage}%
            </span>
          ) : null}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-zinc-900/90 text-white rounded backdrop-blur-sm border border-white/20">
              NOVO
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 cursor-pointer ${
            favorited
              ? 'bg-white text-black shadow-md'
              : 'bg-black/60 text-white hover:bg-black/80 hover:scale-110'
          }`}
          aria-label="Salvar favorito"
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-black stroke-black' : 'stroke-white'}`} />
        </button>

        {/* Hover Quick Action Buttons */}
        <div
          className={`absolute inset-x-3 bottom-3 flex items-center gap-2 transition-all duration-300 z-10 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <button
            onClick={handleQuickBuy}
            className="flex-1 py-2.5 px-3 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Escolher Tamanho & Cor
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-xl backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="flex flex-col flex-1 p-4 justify-between">
        <div>
          {/* Category & Brand Metadata + Gender */}
          <div className="flex items-center justify-between gap-1 text-[11px] text-zinc-400 font-semibold mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="uppercase tracking-wider font-bold text-zinc-300">{product.brand}</span>
              <span>·</span>
              <span className="truncate">{product.categoryName}</span>
            </div>
            {product.gender && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/15 shrink-0">
                {product.gender === 'Feminino' ? 'Fem' : product.gender === 'Infantil' ? 'Inf' : product.gender === 'Masculino' ? 'Masc' : 'Unissex'}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3
            className={`text-sm font-bold line-clamp-2 leading-snug transition-colors ${
              isDark ? 'text-white group-hover:text-zinc-300' : 'text-zinc-950 group-hover:text-zinc-700'
            }`}
          >
            {product.name}
          </h3>

          {/* Sizes preview */}
          {product.availableSizes && product.availableSizes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              <span className="text-[10px] text-zinc-400 font-bold uppercase self-center">Tam:</span>
              {product.availableSizes.slice(0, 5).map(s => (
                <span key={s} className="px-1 py-0.2 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">
                  {s}
                </span>
              ))}
              {product.availableSizes.length > 5 && (
                <span className="text-[10px] text-zinc-400 self-center">
                  +{product.availableSizes.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Star Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-zinc-300">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-zinc-300 text-zinc-300'
                      : 'text-zinc-600 fill-zinc-600/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-zinc-400">
              {product.rating} <span className="font-normal text-zinc-500">({product.reviewCount})</span>
            </span>
          </div>
        </div>

        {/* Pricing & Installments */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-baseline gap-2">
            <span className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-500 line-through">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
            ou {installments}x de <strong className={isDark ? 'text-zinc-200' : 'text-zinc-700'}>R$ {installmentValue}</strong> sem juros
          </p>

          <p className="text-[11px] text-zinc-300 font-bold mt-0.5">
            R$ {(product.price * 0.95).toFixed(2).replace('.', ',')} no PIX (5% OFF)
          </p>

          {/* Action button */}
          <button
            onClick={e => {
              e.stopPropagation();
              onSelect(product);
            }}
            className={`w-full mt-3 py-2 px-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
              isDark
                ? 'border-white/20 bg-zinc-900/60 hover:bg-white hover:text-black text-white'
                : 'border-zinc-300 bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-900'
            }`}
          >
            COMPRAR
          </button>
        </div>
      </div>
    </div>
  );
};
