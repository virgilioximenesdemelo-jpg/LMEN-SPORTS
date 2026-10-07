import React, { useState, useMemo, useEffect } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  X,
  ArrowUpDown,
  Grid3X3,
  LayoutGrid,
} from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { useTheme } from '../context/ThemeContext';
import {
  CategoryFilterSidebar,
  FilterState,
} from '../components/category/CategoryFilterSidebar';

interface CategoryViewProps {
  currentCategorySlug: string;
  categories: Category[];
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (slug: string) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  currentCategorySlug,
  categories,
  allProducts,
  onSelectProduct,
  onSelectCategory,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calculate default price bounds
  const { globalMinPrice, globalMaxPrice } = useMemo(() => {
    if (allProducts.length === 0) return { globalMinPrice: 0, globalMaxPrice: 600 };
    const prices = allProducts.map(p => p.price);
    return {
      globalMinPrice: Math.floor(Math.min(...prices)),
      globalMaxPrice: Math.ceil(Math.max(...prices)),
    };
  }, [allProducts]);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    selectedBrands: [],
    selectedSizes: [],
    selectedGenders: [],
    selectedSports: [],
    minPrice: 0,
    maxPrice: 1000,
    inStockOnly: false,
    onSaleOnly: false,
  });

  // Search filter inside current category
  const [searchQuery, setSearchQuery] = useState('');

  // Layout view mode (grid 2/3 cols vs 3/4 cols)
  const [viewMode, setViewMode] = useState<'normal' | 'compact'>('normal');

  // Sorting
  const [sortBy, setSortBy] = useState<string>('relevant');

  // Mobile Filter Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Initialize or reset min/max price when allProducts load
  useEffect(() => {
    if (globalMaxPrice > 0) {
      setFilters(prev => {
        // If prices haven't been customized, adapt to data
        if (prev.maxPrice === 1000 || prev.maxPrice < globalMaxPrice) {
          return {
            ...prev,
            minPrice: globalMinPrice,
            maxPrice: globalMaxPrice,
          };
        }
        return prev;
      });
    }
  }, [globalMinPrice, globalMaxPrice]);

  // Current category metadata
  const currentCategory = categories.find(c => c.slug === currentCategorySlug);
  const isAll = !currentCategorySlug || currentCategorySlug === 'todos' || currentCategorySlug === 'todas';
  const isOffers = currentCategorySlug === 'ofertas';
  const categoryTitle = isAll
    ? 'Todos os Produtos'
    : isOffers
    ? 'Ofertas e Promoções'
    : currentCategory?.name || 'Coleção Esportiva';

  const clearAllFilters = () => {
    setFilters({
      selectedBrands: [],
      selectedSizes: [],
      selectedGenders: [],
      selectedSports: [],
      minPrice: globalMinPrice,
      maxPrice: globalMaxPrice,
      inStockOnly: false,
      onSaleOnly: false,
    });
    setSearchQuery('');
  };

  // Filtered Products computation
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // 1. Category Filter
    if (isOffers) {
      list = list.filter(
        p => (p.discountPercentage && p.discountPercentage > 0) || (p.originalPrice && p.originalPrice > p.price)
      );
    } else if (!isAll) {
      list = list.filter(p => p.categorySlug.toLowerCase() === currentCategorySlug.toLowerCase());
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.sport?.toLowerCase().includes(q) ||
          p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // 3. Brands filter
    if (filters.selectedBrands.length > 0) {
      list = list.filter(p => filters.selectedBrands.includes(p.brand));
    }

    // 4. Sizes filter
    if (filters.selectedSizes.length > 0) {
      list = list.filter(p => {
        const inAvailable = p.availableSizes?.some(s => filters.selectedSizes.includes(s));
        const inVariants = p.variants?.some(v => filters.selectedSizes.includes(v.size));
        return inAvailable || inVariants;
      });
    }

    // 5. Gender filter
    if (filters.selectedGenders.length > 0) {
      list = list.filter(p => filters.selectedGenders.includes(p.gender));
    }

    // 6. Sport filter
    if (filters.selectedSports.length > 0) {
      list = list.filter(p => filters.selectedSports.includes(p.sport));
    }

    // 7. Price filter
    list = list.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);

    // 8. In Stock filter
    if (filters.inStockOnly) {
      list = list.filter(p => p.status === 'active');
    }

    // 9. On Sale filter
    if (filters.onSaleOnly) {
      list = list.filter(
        p => (p.discountPercentage && p.discountPercentage > 0) || (p.originalPrice && p.originalPrice > p.price)
      );
    }

    // 10. Sorting
    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'best_seller':
        list.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'discount':
        list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
        break;
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.salesCount - a.salesCount);
    }

    return list;
  }, [
    allProducts,
    currentCategorySlug,
    isAll,
    isOffers,
    searchQuery,
    filters,
    sortBy,
  ]);

  // Active filter count
  const isPriceFiltered = filters.minPrice > globalMinPrice || filters.maxPrice < globalMaxPrice;
  const activeFilterCount =
    filters.selectedBrands.length +
    filters.selectedSizes.length +
    filters.selectedGenders.length +
    filters.selectedSports.length +
    (isPriceFiltered ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onSaleOnly ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category banner & header */}
      <div className="relative rounded-3xl overflow-hidden bg-black p-6 sm:p-10 border border-white/10 text-white shadow-xl">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
              COLEÇÃO LMEN SPORTS
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
              {categoryTitle}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            {categoryTitle}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-3 leading-relaxed max-w-lg">
            {currentCategory?.description ||
              'Tecnologia de elite, design de alta performance e artigos esportivos profissionais para quem busca o máximo rendimento.'}
          </p>

          {/* Quick Category Badges on mobile */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10 overflow-x-auto pb-1 scrollbar-none sm:hidden">
            <button
              onClick={() => onSelectCategory('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                isAll ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-300 border border-white/10'
              }`}
            >
              Todos ({allProducts.length})
            </button>
            {categories.slice(0, 5).map(cat => (
              <button
                key={cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  currentCategorySlug === cat.slug
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-300 border border-white/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none hidden sm:block">
          <img
            src={
              currentCategory?.image ||
              'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800'
            }
            alt=""
            className="w-full h-full object-cover grayscale"
          />
        </div>
      </div>

      {/* Sorting, Search & Filter Controls Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          {/* Left stats & mobile filter button */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 py-2 px-3.5 text-xs font-black uppercase tracking-wider rounded-xl border border-white/20 bg-zinc-900 hover:bg-zinc-800 cursor-pointer text-white shadow-sm transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 text-white" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <span className="text-xs text-zinc-400">
              Mostrando <strong className={isDark ? 'text-white' : 'text-zinc-950 font-black'}>{filteredProducts.length}</strong> de {allProducts.length} produtos
            </span>

            {activeFilterCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-200 border border-white/10 text-[11px] font-bold hidden sm:inline-flex items-center gap-1">
                <span>{activeFilterCount} filtro(s) ativo(s)</span>
              </span>
            )}
          </div>

          {/* Right quick search + sorting + grid mode */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            {/* Quick in-category search */}
            <div className="relative flex-1 sm:w-48 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar nesta coleção..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-7 py-2 text-xs rounded-xl border focus:outline-none focus:border-white ${
                  isDark
                    ? 'bg-zinc-900 border-white/10 text-white placeholder-zinc-500'
                    : 'bg-white border-zinc-300 text-black placeholder-zinc-400'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className={`text-xs font-bold py-2 pl-3 pr-8 rounded-xl border focus:outline-none focus:border-white cursor-pointer appearance-none ${
                    isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                >
                  <option value="relevant">Mais Relevantes</option>
                  <option value="best_seller">Mais Vendidos</option>
                  <option value="price_asc">Menor Preço</option>
                  <option value="price_desc">Maior Preço</option>
                  <option value="rating">Melhor Avaliados</option>
                  <option value="newest">Lançamentos</option>
                  <option value="discount">Maior Desconto</option>
                </select>
                <ArrowUpDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Grid density toggler (desktop) */}
            <div className="hidden md:flex items-center border border-white/10 rounded-xl p-0.5 bg-zinc-900">
              <button
                onClick={() => setViewMode('normal')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'normal' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização padrão"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'compact' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização compacta"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTER CHIPS / TAGS BAR */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 mr-1">
              Filtros:
            </span>

            {/* Search Query chip */}
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-semibold">
                <span>Busca: "{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-white text-zinc-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Price chip */}
            {isPriceFiltered && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-semibold">
                <span>
                  R$ {filters.minPrice} – R$ {filters.maxPrice}
                </span>
                <button
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      minPrice: globalMinPrice,
                      maxPrice: globalMaxPrice,
                    }))
                  }
                  className="hover:text-white text-zinc-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Brand chips */}
            {filters.selectedBrands.map(brand => (
              <span
                key={brand}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-semibold"
              >
                <span>Marca: {brand}</span>
                <button
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      selectedBrands: prev.selectedBrands.filter(b => b !== brand),
                    }))
                  }
                  className="hover:text-white text-zinc-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Size chips */}
            {filters.selectedSizes.map(size => (
              <span
                key={size}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-semibold"
              >
                <span>Tam: {size}</span>
                <button
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      selectedSizes: prev.selectedSizes.filter(s => s !== size),
                    }))
                  }
                  className="hover:text-white text-zinc-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Sport chips */}
            {filters.selectedSports.map(sport => (
              <span
                key={sport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-semibold"
              >
                <span>Esporte: {sport}</span>
                <button
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      selectedSports: prev.selectedSports.filter(s => s !== sport),
                    }))
                  }
                  className="hover:text-white text-zinc-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Gender chips */}
            {filters.selectedGenders.map(gender => (
              <span
                key={gender}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-semibold"
              >
                <span>Gênero: {gender}</span>
                <button
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      selectedGenders: prev.selectedGenders.filter(g => g !== gender),
                    }))
                  }
                  className="hover:text-white text-zinc-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* In stock chip */}
            {filters.inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-semibold">
                <span>Em Estoque</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, inStockOnly: false }))}
                  className="hover:text-white text-zinc-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* On sale chip */}
            {filters.onSaleOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-semibold">
                <span>Em Promoção</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, onSaleOnly: false }))}
                  className="hover:text-white text-zinc-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Clear all button */}
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-zinc-400 hover:text-white underline decoration-zinc-600 underline-offset-4 ml-1 cursor-pointer transition-colors"
            >
              Limpar todos
            </button>
          </div>
        )}
      </div>

      {/* Main Grid + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div
            className={`p-5 rounded-2xl border sticky top-24 ${
              isDark ? 'bg-[#0E1015] border-white/10 shadow-xl' : 'bg-zinc-50 border-zinc-200 shadow-sm'
            }`}
          >
            <CategoryFilterSidebar
              categories={categories}
              currentCategorySlug={currentCategorySlug}
              onSelectCategory={onSelectCategory}
              allProducts={allProducts}
              filters={filters}
              onUpdateFilters={setFilters}
              onClearAllFilters={clearAllFilters}
              filteredCount={filteredProducts.length}
            />
          </div>
        </aside>

        {/* Product Cards Grid */}
        <main className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-4 rounded-3xl border border-white/10 bg-zinc-900/30 p-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                Nenhum produto encontrado
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Não localizamos nenhum produto que corresponda à combinação de filtros selecionados (preço, marca ou tamanho).
              </p>
              <div className="pt-2">
                <button
                  onClick={clearAllFilters}
                  className="py-3 px-6 rounded-xl bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-zinc-200 cursor-pointer transition-colors shadow-lg"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`grid gap-4 sm:gap-6 ${
                viewMode === 'compact'
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3'
              }`}
            >
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Sliding sheet */}
          <div
            className={`fixed inset-y-0 right-0 max-w-sm w-full flex flex-col shadow-2xl p-5 overflow-y-auto ${
              isDark ? 'bg-[#0E1015] text-zinc-100 border-l border-white/10' : 'bg-white text-zinc-900 border-l border-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-white" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Filtros Avançados
                </h3>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-black text-[11px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar content in drawer */}
            <div className="flex-1 overflow-y-auto pr-1">
              <CategoryFilterSidebar
                categories={categories}
                currentCategorySlug={currentCategorySlug}
                onSelectCategory={slug => {
                  onSelectCategory(slug);
                  setIsMobileFilterOpen(false);
                }}
                allProducts={allProducts}
                filters={filters}
                onUpdateFilters={setFilters}
                onClearAllFilters={clearAllFilters}
                filteredCount={filteredProducts.length}
                onCloseMobile={() => setIsMobileFilterOpen(false)}
                isMobile={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
