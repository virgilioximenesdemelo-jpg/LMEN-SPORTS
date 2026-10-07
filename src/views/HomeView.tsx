import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Zap, Trophy, Mail, CheckCircle2, Instagram, Sparkles } from 'lucide-react';
import { Product, Category, HeroBanner } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

interface HomeViewProps {
  banners: HeroBanner[];
  categories: Category[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (slug: string) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  banners,
  categories,
  products,
  onSelectProduct,
  onSelectCategory,
  onNavigate,
}) => {
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Carousel timer
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[activeBannerIdx] || banners[0];

  // Filter lists
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8);
  const bestSellerProducts = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 8);
  const newArrivalProducts = products.filter(p => p.isNewArrival).slice(0, 8);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;

    setNewsletterLoading(true);
    try {
      await api.subscribeNewsletter(newsletterEmail.trim());
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setNewsletterLoading(false);
    }
  };

  const instagramPosts = [
    { id: 1, img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop', tag: '@matheus_lmen' },
    { id: 2, img: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=600&auto=format&fit=crop', tag: '@speed_striker' },
    { id: 3, img: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop', tag: '@futebol_arte' },
    { id: 4, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', tag: '@running_lifestyle' },
    { id: 5, img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop', tag: '@street_lmen' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 8. HERO BANNERS */}
      {currentBanner && (
        <section className="relative w-full h-[520px] sm:h-[600px] md:h-[680px] overflow-hidden bg-black select-none">
          {/* Background image with athletic monochrome gradient masks */}
          <div className="absolute inset-0">
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover object-center transform transition-transform duration-1000 scale-100 animate-in fade-in"
            />
            {/* High-contrast black gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-black/50" />
          </div>

          {/* Banner content */}
          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <div className="max-w-xl space-y-4">
              {currentBanner.badge && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white text-black text-xs font-black tracking-widest uppercase shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  {currentBanner.badge}
                </div>
              )}

              <p className="text-xs sm:text-sm font-bold tracking-widest text-zinc-400 uppercase">
                {currentBanner.tagline}
              </p>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-[0.95]">
                {currentBanner.title}
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
                {currentBanner.subtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('category', 'camisas')}
                  className="py-3 px-7 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <span>{currentBanner.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {currentBanner.secondaryButtonText && (
                  <button
                    onClick={() => onNavigate('offers')}
                    className="py-3 px-6 bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider rounded-xl backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer"
                  >
                    {currentBanner.secondaryButtonText}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Carousel arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveBannerIdx(prev => (prev - 1 + banners.length) % banners.length)
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
                aria-label="Banner anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveBannerIdx(prev => (prev + 1) % banners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
                aria-label="Próximo banner"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIdx(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeBannerIdx ? 'w-8 bg-white' : 'w-2 bg-white/30'
                    }`}
                    aria-label={`Ir para banner ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* 9. COMPRE POR CATEGORIA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
              EXPLORE O CATÁLOGO
            </span>
            <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Compre por Categoria
            </h2>
          </div>
          <button
            onClick={() => onNavigate('category', 'todos')}
            className="text-xs font-bold text-zinc-300 hover:text-white hover:underline flex items-center gap-1 cursor-pointer"
          >
            Ver todas as categorias
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 12).map(cat => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`group relative h-48 rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                isDark
                  ? 'border-white/10 hover:border-white/40 hover:shadow-xl hover:shadow-black/80'
                  : 'border-zinc-200 hover:border-zinc-400 hover:shadow-lg'
              }`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 flex flex-col">
                <span className="text-white text-sm font-black uppercase tracking-tight group-hover:text-zinc-200 transition-colors">
                  {cat.name}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  {cat.itemCount} modelos
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. PRODUTOS EM DESTAQUE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
              <Zap className="w-4 h-4 text-white" />
              SELEÇÃO ESPECIAL
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Destaques da Temporada
            </h2>
          </div>
          <button
            onClick={() => onNavigate('category', 'todos')}
            className="text-xs font-bold text-zinc-300 hover:text-white hover:underline flex items-center gap-1 cursor-pointer"
          >
            Ver catálogo completo
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* PROMO ATHLETIC CALLOUT BANNER - MONOCHROME */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-8 sm:p-12 border border-white/10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded bg-white/10 text-[11px] font-black uppercase tracking-widest text-zinc-300 border border-white/20">
              PROMOÇÃO EXCLUSIVA
            </span>
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              PAGUE COM PIX E GANHE 5% OFF EXTRA
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Mais de 50 produtos originais a pronta entrega com frete grátis para todo o Brasil em compras acima de R$ 249.
            </p>
          </div>
          <button
            onClick={() => onNavigate('offers')}
            className="py-3.5 px-8 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-black uppercase tracking-wider shadow-lg transition-transform cursor-pointer active:scale-95 shrink-0"
          >
            APROVEITAR AGORA
          </button>
        </div>
      </section>

      {/* 32. MAIS VENDIDOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
              <Zap className="w-4 h-4 text-white" />
              OS FAVORITOS DOS ATLETAS
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Mais Vendidos
            </h2>
          </div>
          <button
            onClick={() => onNavigate('category', 'todos')}
            className="text-xs font-bold text-zinc-300 hover:text-white hover:underline flex items-center gap-1 cursor-pointer"
          >
            Ver mais
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellerProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 33. LANÇAMENTOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
              <Trophy className="w-4 h-4 text-white" />
              NOVIDADES 2026
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Lançamentos Recentes
            </h2>
          </div>
          <button
            onClick={() => onNavigate('category', 'todos')}
            className="text-xs font-bold text-zinc-300 hover:text-white hover:underline flex items-center gap-1 cursor-pointer"
          >
            Explorar todos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivalProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 35. INSTAGRAM COMMUNITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">
            <Instagram className="w-4 h-4 text-white" />
            COMUNIDADE LMEN SPORTS
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
            <a
              href="https://www.instagram.com/lmen_sports?stkn=enhmdDdsZ3RrNmlj"
              target="_blank"
              rel="noreferrer"
              className="hover:underline transition-opacity"
            >
              Siga @lmen_sports
            </a>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Marque <strong>#LMENSPORTS</strong> nas suas fotos de treino e futebol para aparecer no nosso perfil oficial!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {instagramPosts.map(post => (
            <a
              key={post.id}
              href="https://www.instagram.com/lmen_sports?stkn=enhmdDdsZ3RrNmlj"
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer block"
            >
              <img
                src={post.img}
                alt={post.tag}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col p-2 text-center">
                <Instagram className="w-6 h-6 text-white mb-1" />
                <span className="text-[11px] font-bold text-white">@lmen_sports</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 34. NEWSLETTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-12 rounded-3xl border text-center max-w-3xl mx-auto transition-colors ${isDark ? 'bg-zinc-900/60 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-white flex items-center justify-center mx-auto mb-3 border border-white/10">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
            RECEBA NOSSAS OFERTAS
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mt-2">
            Cadastre seu e-mail e receba em primeira mão lançamentos, cupons exclusivos e 10% de desconto no cupom <strong>LMEN10</strong>.
          </p>

          {newsletterSuccess ? (
            <div className="mt-6 p-4 rounded-xl bg-zinc-800 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              Inscrição confirmada! Use o cupom <strong>LMEN10</strong> no seu carrinho.
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="Digite seu melhor e-mail..."
                className="flex-1 py-3 px-4 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-zinc-100 placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="py-3 px-6 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {newsletterLoading ? 'CADASTRANDO...' : 'CADASTRAR'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
