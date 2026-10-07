import React, { useState } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Ruler,
  Plus,
  Minus,
  Share2,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { SizeGuideModal } from '../components/product/SizeGuideModal';
import { ShippingCalculator } from '../components/product/ShippingCalculator';
import { ProductReviews } from '../components/product/ProductReviews';
import { ProductCard } from '../components/product/ProductCard';
import { handleImageError } from '../utils/imageFallback';

interface ProductDetailViewProps {
  product: Product;
  reviews: ProductReview[];
  relatedProducts: Product[];
  onSelectProduct: (p: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  reviews,
  relatedProducts,
  onSelectProduct,
  onNavigate,
}) => {
  const { addItem, openCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.availableSizes?.length === 1 ? product.availableSizes[0] : ''
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.availableColors?.length === 1 ? product.availableColors[0].name : ''
  );
  const [validationError, setValidationError] = useState<string>('');
  const [addedNotice, setAddedNotice] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care' | 'shipping'>('desc');
  const [copiedLink, setCopiedLink] = useState(false);

  const favorited = isFavorite(product.id);

  // Variant matching
  const matchedVariant = product.variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  );
  const currentStock = matchedVariant ? matchedVariant.stock : 10;
  const isOutOfStock = currentStock <= 0 || product.status === 'out_of_stock';

  const pixPrice = product.price * 0.95;
  const installments = 6;
  const installmentValue = (product.price / installments).toFixed(2).replace('.', ',');

  const isFootwear =
    product.categorySlug === 'chuteiras' ||
    product.categorySlug === 'society' ||
    product.categorySlug === 'tenis';

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    if (!selectedSize) {
      setValidationError('Por favor, selecione o tamanho / numeração do produto para continuar.');
      return;
    }
    if (!selectedColor) {
      setValidationError('Por favor, selecione a cor do produto para continuar.');
      return;
    }

    setValidationError('');
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: matchedVariant ? matchedVariant.sku : product.sku,
      image: product.images[activeImageIdx] || product.images[0],
      price: product.price,
      originalPrice: product.originalPrice,
      size: selectedSize,
      color: selectedColor,
      quantity,
      maxStock: currentStock,
    });

    setAddedNotice(`Produto adicionado: Tamanho ${selectedSize} · Cor ${selectedColor}`);
    setTimeout(() => setAddedNotice(''), 4500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!selectedSize) {
      setValidationError('Por favor, selecione o tamanho / numeração do produto para comprar.');
      return;
    }
    if (!selectedColor) {
      setValidationError('Por favor, selecione a cor do produto para comprar.');
      return;
    }
    setValidationError('');
    handleAddToCart();
    onNavigate('checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-400">
        <button
          onClick={() => onNavigate('home')}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Início
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={() => onNavigate('category', product.categorySlug)}
          className="hover:text-white transition-colors cursor-pointer"
        >
          {product.categoryName}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className={`font-semibold truncate max-w-xs ${isDark ? 'text-white' : 'text-zinc-950'}`}>
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center group">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.name}
              onError={handleImageError}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Previous and Next arrows if more than 1 image */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all opacity-80 hover:opacity-100 hover:scale-110 z-10 cursor-pointer"
                  title="Foto anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all opacity-80 hover:opacity-100 hover:scale-110 z-10 cursor-pointer"
                  title="Próxima foto"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white z-10">
                  {activeImageIdx + 1} / {product.images.length} fotos
                </span>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.discountPercentage && (
                <span className="px-3 py-1 bg-white text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-lg">
                  -{product.discountPercentage}% OFF
                </span>
              )}
              {product.isFeatured && (
                <span className="px-3 py-1 bg-zinc-900/90 text-white font-bold text-xs uppercase tracking-wider rounded-lg backdrop-blur-md border border-white/20">
                  DESTAQUE
                </span>
              )}
            </div>

            {/* Favorite button */}
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all cursor-pointer z-10 ${
                favorited
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-black/60 text-white hover:bg-black/80 hover:scale-105'
              }`}
            >
              <Heart className={`w-5 h-5 ${favorited ? 'fill-black stroke-black' : 'stroke-white'}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-bold text-[11px] uppercase tracking-wider">
                  Fotos do Produto ({product.images.length})
                </span>
                <span className="text-[11px]">Clique para visualizar</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIdx === idx
                        ? 'border-white scale-105 shadow-lg ring-2 ring-white/50'
                        : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/40'
                    }`}
                  >
                    <img src={img} alt="" onError={handleImageError} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-black text-white text-center py-0.5 uppercase tracking-tighter">
                        Capa
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Purchase Configurator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                {product.brand} · {product.categoryName}
              </span>
              <button
                onClick={handleShare}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Compartilhar"
              >
                {copiedLink ? (
                  <span className="text-white flex items-center gap-1 font-bold">
                    <Check className="w-3.5 h-3.5" /> Link Copiado!
                  </span>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartilhar</span>
                  </>
                )}
              </button>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight leading-snug ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              {product.name}
            </h1>

            {/* Tags: Gender, Category, Sport */}
            <div className="flex flex-wrap items-center gap-2 mt-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20 flex items-center gap-1">
                <span>{product.gender === 'Feminino' ? '👩' : product.gender === 'Infantil' ? '🧒' : product.gender === 'Masculino' ? '👨' : '⚡'}</span>
                <span>Gênero: {product.gender}</span>
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-white/10">
                {product.sport}
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-white/10">
                {product.categoryName}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-zinc-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-zinc-300 text-zinc-300'
                        : 'text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-zinc-400">
                {product.rating} ({product.reviewCount} avaliações)
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400 font-mono">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
            <div className="flex items-baseline gap-3">
              <span className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-zinc-500 line-through">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400 mt-1">
              ou até <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>{installments}x de R$ {installmentValue}</strong> sem juros no cartão
            </p>

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-white" />
                  No PIX com 5% de desconto extra
                </span>
                <span className="text-lg font-black text-white">
                  R$ {pixPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-zinc-800 text-white border border-white/20 text-[10px] font-black uppercase">
                ECONOMIZE R$ {(product.price - pixPrice).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Selection Notice / Validation Error Box */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="flex-1 font-bold">
                {validationError}
              </div>
            </div>
          )}

          {/* Success Banner when Added to Cart */}
          {addedNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{addedNotice}</span>
              </div>
              <button
                type="button"
                onClick={openCart}
                className="py-1 px-3 bg-white text-black font-black text-[11px] uppercase rounded-lg hover:bg-zinc-200 cursor-pointer"
              >
                Ver Carrinho
              </button>
            </div>
          )}

          {/* Color Selection */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            !selectedColor && validationError
              ? 'border-amber-500/60 bg-amber-500/5'
              : 'border-white/10 bg-white/5'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <span>1. Escolha a Cor:</span>
                {selectedColor ? (
                  <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    {selectedColor}
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold text-[11px] animate-pulse">
                    * Seleção obrigatória
                  </span>
                )}
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.availableColors && product.availableColors.map(c => {
                const isSelected = selectedColor === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c.name);
                      if (validationError.includes('cor')) setValidationError('');
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-white bg-white text-black shadow-lg scale-105 font-black ring-2 ring-white/40'
                        : isDark
                        ? 'border-white/10 text-zinc-300 hover:border-white/40 hover:bg-white/10'
                        : 'border-zinc-300 text-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border ${
                        isSelected ? 'border-black/50 ring-1 ring-black' : 'border-black/40'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size / Numeração Selection */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            !selectedSize && validationError
              ? 'border-amber-500/60 bg-amber-500/5'
              : 'border-white/10 bg-white/5'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <span>2. Escolha o Tamanho / Numeração:</span>
                {selectedSize ? (
                  <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    {selectedSize}
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold text-[11px] animate-pulse">
                    * Seleção obrigatória
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-xs font-bold text-white hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" />
                Guia de Tamanhos
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.availableSizes && product.availableSizes.map(size => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      if (validationError.includes('tamanho') || validationError.includes('numeração')) {
                        setValidationError('');
                      }
                    }}
                    className={`min-w-[48px] h-11 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-lg scale-105 ring-2 ring-white/50'
                        : isDark
                        ? 'border-white/10 text-zinc-200 hover:border-white/40 hover:bg-white/10 bg-white/5'
                        : 'border-zinc-300 text-zinc-800 hover:border-zinc-500 bg-white'
                    }`}
                  >
                    <span>{size}</span>
                    {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {/* Stock indicator */}
            <p className="text-[11px] text-zinc-400 mt-2">
              {isOutOfStock ? (
                <span className="text-zinc-400 font-bold">Produto indisponível no momento</span>
              ) : currentStock < 5 ? (
                <span className="text-amber-300 font-bold">Apenas {currentStock} unidades restantes em estoque!</span>
              ) : (
                <span className="text-emerald-400 font-bold">✓ Em estoque para envio imediato para todo o Brasil</span>
              )}
            </p>
          </div>

          {/* Quantity & Buy Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity selector */}
              <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-black/40 h-12">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 h-full hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-bold min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="px-3.5 h-full hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 h-12 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black uppercase tracking-wider rounded-xl border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 hover:shadow-lg active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                ADICIONAR AO CARRINHO
              </button>
            </div>

            {/* Main Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full h-14 bg-white hover:bg-zinc-200 text-black text-sm font-black uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Zap className="w-5 h-5 fill-black" />
              COMPRAR AGORA
            </button>
          </div>

          {/* Shipping Calculator */}
          <ShippingCalculator subtotal={product.price * quantity} />
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="pt-8 border-t border-white/10">
        <div className="flex gap-2 border-b border-white/10 overflow-x-auto pb-px">
          {[
            { id: 'desc', label: 'Descrição' },
            { id: 'specs', label: 'Características & Composição' },
            { id: 'care', label: 'Cuidados com a Peça' },
            { id: 'shipping', label: 'Envio & Devoluções' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-6 text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-4xl space-y-4">
          {activeTab === 'desc' && (
            <div>
              <p>{product.description}</p>
              <p className="mt-3">{product.shortDescription}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Marca</span>
                  <p className="font-bold text-white mt-0.5">{product.brand}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Esporte Indicado</span>
                  <p className="font-bold text-white mt-0.5">{product.sport}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Gênero</span>
                  <p className="font-bold text-white mt-0.5">{product.gender}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Composição</span>
                  <p className="font-bold text-white mt-0.5">{product.composition || 'Poliéster esportivo de alta performance'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div>
              <p>{product.careInstructions || 'Lavar à mão ou máquina no ciclo delicado com água fria. Não utilizar alvejante à base de cloro. Secar à sombra.'}</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-400">
                <li>Não lavar a seco</li>
                <li>Não secar em tambor rotativo</li>
                <li>Passar a ferro em temperatura baixa (máx 110°C) pelo avesso</li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <p>
                Todos os pedidos são despachados em até 24 horas úteis após a confirmação do pagamento. O código de rastreamento é enviado automaticamente via e-mail e WhatsApp.
              </p>
              <div className="p-4 rounded-xl bg-zinc-800 border border-white/20 text-white text-xs">
                <strong>Garantia de Satisfação:</strong> 30 dias para trocas ou devoluções sem custos adicionais. A primeira troca é 100% por nossa conta!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-8 border-t border-white/10">
        <h3 className={`text-xl font-black uppercase tracking-tight mb-6 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
          Avaliações de Clientes ({reviews.length})
        </h3>
        <ProductReviews
          productId={product.id}
          initialReviews={reviews}
          averageRating={product.rating}
        />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-white/10">
          <h3 className={`text-xl font-black uppercase tracking-tight mb-6 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
            Quem comprou este produto também levou
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        type={isFootwear ? 'footwear' : 'clothing'}
      />
    </div>
  );
};
