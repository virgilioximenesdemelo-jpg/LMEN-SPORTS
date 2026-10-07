import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Category, Product } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export interface FilterState {
  selectedBrands: string[];
  selectedSizes: string[];
  selectedGenders: string[];
  selectedSports: string[];
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
}

interface CategoryFilterSidebarProps {
  categories: Category[];
  currentCategorySlug: string;
  onSelectCategory: (slug: string) => void;
  allProducts: Product[];
  filters: FilterState;
  onUpdateFilters: (updater: (prev: FilterState) => FilterState) => void;
  onClearAllFilters: () => void;
  filteredCount: number;
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

export const CategoryFilterSidebar: React.FC<CategoryFilterSidebarProps> = ({
  categories,
  currentCategorySlug,
  onSelectCategory,
  allProducts,
  filters,
  onUpdateFilters,
  onClearAllFilters,
  filteredCount,
  onCloseMobile,
  isMobile = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Section collapse state (default open)
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    brands: true,
    sizes: true,
    sports: false,
    gender: false,
    status: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Brand search within filter
  const [brandSearch, setBrandSearch] = useState('');

  // Calculate dynamic min and max price from products
  const { globalMinPrice, globalMaxPrice } = useMemo(() => {
    if (allProducts.length === 0) return { globalMinPrice: 0, globalMaxPrice: 600 };
    const prices = allProducts.map(p => p.price);
    return {
      globalMinPrice: Math.floor(Math.min(...prices)),
      globalMaxPrice: Math.ceil(Math.max(...prices)),
    };
  }, [allProducts]);

  // Dynamic brand list with product counts in the current category
  const brandCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const baseProducts =
      currentCategorySlug && currentCategorySlug !== 'todos' && currentCategorySlug !== 'todas'
        ? allProducts.filter(p => p.categorySlug.toLowerCase() === currentCategorySlug.toLowerCase())
        : allProducts;

    baseProducts.forEach(p => {
      counts.set(p.brand, (counts.get(p.brand) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand));
  }, [allProducts, currentCategorySlug]);

  const filteredBrandList = useMemo(() => {
    if (!brandSearch.trim()) return brandCounts;
    return brandCounts.filter(b =>
      b.brand.toLowerCase().includes(brandSearch.trim().toLowerCase())
    );
  }, [brandCounts, brandSearch]);

  // Dynamic sizes with counts
  const { footwearSizes, apparelSizes, otherSizes } = useMemo(() => {
    const counts = new Map<string, number>();
    const baseProducts =
      currentCategorySlug && currentCategorySlug !== 'todos' && currentCategorySlug !== 'todas'
        ? allProducts.filter(p => p.categorySlug.toLowerCase() === currentCategorySlug.toLowerCase())
        : allProducts;

    baseProducts.forEach(p => {
      p.availableSizes.forEach(s => {
        counts.set(s, (counts.get(s) || 0) + 1);
      });
    });

    const isNum = (s: string) => /^\d+$/.test(s);
    const isClothes = (s: string) => ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG', '2XG', '3XG'].includes(s.toUpperCase());

    const footwear: { size: string; count: number }[] = [];
    const apparel: { size: string; count: number }[] = [];
    const other: { size: string; count: number }[] = [];

    counts.forEach((count, size) => {
      if (isNum(size)) {
        footwear.push({ size, count });
      } else if (isClothes(size)) {
        apparel.push({ size, count });
      } else {
        other.push({ size, count });
      }
    });

    footwear.sort((a, b) => Number(a.size) - Number(b.size));

    const clothesOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG', '2XG'];
    apparel.sort((a, b) => {
      const idxA = clothesOrder.indexOf(a.size.toUpperCase());
      const idxB = clothesOrder.indexOf(b.size.toUpperCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.size.localeCompare(b.size);
    });

    return { footwearSizes: footwear, apparelSizes: apparel, otherSizes: other };
  }, [allProducts, currentCategorySlug]);

  // Dynamic sports with counts
  const sportCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allProducts.forEach(p => {
      if (p.sport) {
        counts.set(p.sport, (counts.get(p.sport) || 0) + 1);
      }
    });
    return Array.from(counts.entries()).map(([sport, count]) => ({ sport, count }));
  }, [allProducts]);

  // Dynamic genders with counts
  const genderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allProducts.forEach(p => {
      if (p.gender) {
        counts.set(p.gender, (counts.get(p.gender) || 0) + 1);
      }
    });
    return Array.from(counts.entries()).map(([gender, count]) => ({ gender, count }));
  }, [allProducts]);

  // Handlers
  const toggleBrand = (brand: string) => {
    onUpdateFilters(prev => ({
      ...prev,
      selectedBrands: prev.selectedBrands.includes(brand)
        ? prev.selectedBrands.filter(b => b !== brand)
        : [...prev.selectedBrands, brand],
    }));
  };

  const toggleSize = (size: string) => {
    onUpdateFilters(prev => ({
      ...prev,
      selectedSizes: prev.selectedSizes.includes(size)
        ? prev.selectedSizes.filter(s => s !== size)
        : [...prev.selectedSizes, size],
    }));
  };

  const toggleGender = (gender: string) => {
    onUpdateFilters(prev => ({
      ...prev,
      selectedGenders: prev.selectedGenders.includes(gender)
        ? prev.selectedGenders.filter(g => g !== gender)
        : [...prev.selectedGenders, gender],
    }));
  };

  const toggleSport = (sport: string) => {
    onUpdateFilters(prev => ({
      ...prev,
      selectedSports: prev.selectedSports.includes(sport)
        ? prev.selectedSports.filter(s => s !== sport)
        : [...prev.selectedSports, sport],
    }));
  };

  const setPriceRange = (min: number, max: number) => {
    onUpdateFilters(prev => ({
      ...prev,
      minPrice: Math.max(0, min),
      maxPrice: Math.max(min, max),
    }));
  };

  // Price presets
  const pricePresets = [
    { label: 'Todos os valores', min: globalMinPrice, max: globalMaxPrice },
    { label: 'Até R$ 150', min: globalMinPrice, max: 150 },
    { label: 'R$ 150 a R$ 250', min: 150, max: 250 },
    { label: 'R$ 250 a R$ 350', min: 250, max: 350 },
    { label: 'Acima de R$ 350', min: 350, max: globalMaxPrice },
  ];

  const isPresetActive = (min: number, max: number) => {
    return filters.minPrice === min && filters.maxPrice === max;
  };

  // Total active filters count
  const activeCount =
    filters.selectedBrands.length +
    filters.selectedSizes.length +
    filters.selectedGenders.length +
    filters.selectedSports.length +
    (filters.minPrice > globalMinPrice || filters.maxPrice < globalMaxPrice ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onSaleOnly ? 1 : 0);

  return (
    <div className="space-y-6 text-sm">
      {/* Top Header / Quick Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-white" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            Filtros Avançados
          </span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-black text-[11px] font-black flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClearAllFilters}
            className="text-[11px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            title="Limpar todos os filtros"
          >
            <RotateCcw className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      {/* 1. CATEGORIAS */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between py-1 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            Categorias
          </span>
          {openSections.categories ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {openSections.categories && (
          <div className="space-y-1 pt-1 max-h-52 overflow-y-auto pr-1">
            <button
              onClick={() => onSelectCategory('todos')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentCategorySlug === 'todos' || !currentCategorySlug
                  ? 'bg-white text-black shadow-sm font-black'
                  : isDark
                  ? 'text-zinc-300 hover:bg-white/5'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <span>Todos os Produtos</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  currentCategorySlug === 'todos' || !currentCategorySlug
                    ? 'bg-black/10 text-black'
                    : 'text-zinc-500'
                }`}
              >
                {allProducts.length}
              </span>
            </button>
            {categories.map(cat => {
              const isSelected = currentCategorySlug === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black shadow-sm font-black'
                      : isDark
                      ? 'text-zinc-300 hover:bg-white/5'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span className="truncate text-left">{cat.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-black/10 text-black' : 'text-zinc-500'
                    }`}
                  >
                    {cat.itemCount || 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. PREÇO (PRICE FILTER) */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between py-1 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
            Faixa de Preço
          </span>
          <div className="flex items-center gap-1.5">
            {(filters.minPrice > globalMinPrice || filters.maxPrice < globalMaxPrice) && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
            {openSections.price ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        </button>

        {openSections.price && (
          <div className="space-y-3 pt-1">
            {/* Price Presets */}
            <div className="grid grid-cols-1 gap-1">
              {pricePresets.map(preset => {
                const active = isPresetActive(preset.min, preset.max);
                return (
                  <button
                    key={preset.label}
                    onClick={() => setPriceRange(preset.min, preset.max)}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                      active
                        ? 'bg-white text-black font-black'
                        : isDark
                        ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {active && <Check className="w-3 h-3 text-black" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max Inputs */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                Valores Personalizados
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Mínimo</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-500 font-mono">
                      R$
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={filters.maxPrice}
                      value={filters.minPrice}
                      onChange={e => {
                        const val = Number(e.target.value);
                        onUpdateFilters(prev => ({
                          ...prev,
                          minPrice: val,
                        }));
                      }}
                      className={`w-full pl-8 pr-2 py-1.5 text-xs font-mono font-bold rounded-lg border focus:outline-none focus:border-white ${
                        isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-zinc-300 text-black'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Máximo</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-500 font-mono">
                      R$
                    </span>
                    <input
                      type="number"
                      min={filters.minPrice}
                      max={1000}
                      value={filters.maxPrice}
                      onChange={e => {
                        const val = Number(e.target.value);
                        onUpdateFilters(prev => ({
                          ...prev,
                          maxPrice: val,
                        }));
                      }}
                      className={`w-full pl-8 pr-2 py-1.5 text-xs font-mono font-bold rounded-lg border focus:outline-none focus:border-white ${
                        isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-zinc-300 text-black'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="pt-1">
              <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400 mb-1">
                <span>R$ {filters.minPrice.toFixed(0)}</span>
                <span className="font-bold text-white">R$ {filters.maxPrice.toFixed(0)}</span>
              </div>
              <input
                type="range"
                min={globalMinPrice}
                max={globalMaxPrice > 500 ? globalMaxPrice : 500}
                step={10}
                value={filters.maxPrice}
                onChange={e => {
                  const val = Number(e.target.value);
                  onUpdateFilters(prev => ({ ...prev, maxPrice: val }));
                }}
                className="w-full accent-white cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. MARCAS (BRANDS FILTER) */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <button
          onClick={() => toggleSection('brands')}
          className="w-full flex items-center justify-between py-1 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-zinc-400" />
            Marcas
          </span>
          <div className="flex items-center gap-1.5">
            {filters.selectedBrands.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-black text-[10px] font-black">
                {filters.selectedBrands.length}
              </span>
            )}
            {openSections.brands ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        </button>

        {openSections.brands && (
          <div className="space-y-2 pt-1">
            {/* Brand Search Input if > 4 brands */}
            {brandCounts.length > 4 && (
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar marca..."
                  value={brandSearch}
                  onChange={e => setBrandSearch(e.target.value)}
                  className={`w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-white ${
                    isDark
                      ? 'bg-zinc-900 border-white/10 text-white placeholder-zinc-500'
                      : 'bg-white border-zinc-300 text-black placeholder-zinc-400'
                  }`}
                />
              </div>
            )}

            {/* Brand Checkbox List */}
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {filteredBrandList.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">Nenhuma marca encontrada.</p>
              ) : (
                filteredBrandList.map(({ brand, count }) => {
                  const isChecked = filters.selectedBrands.includes(brand);
                  return (
                    <label
                      key={brand}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs font-medium ${
                        isChecked
                          ? isDark
                            ? 'bg-white/10 text-white font-bold'
                            : 'bg-zinc-200 text-zinc-900 font-bold'
                          : isDark
                          ? 'text-zinc-300 hover:bg-white/5 hover:text-white'
                          : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-white border-white text-black'
                              : isDark
                              ? 'border-zinc-700 bg-zinc-900'
                              : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrand(brand)}
                          className="sr-only"
                        />
                        <span>{brand}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">({count})</span>
                    </label>
                  );
                })
              )}
            </div>

            {/* Quick Brand Actions */}
            {filters.selectedBrands.length > 0 && (
              <button
                onClick={() => onUpdateFilters(prev => ({ ...prev, selectedBrands: [] }))}
                className="text-[10px] font-bold text-zinc-400 hover:text-white pt-1 block cursor-pointer"
              >
                Limpar seleção de marcas
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. TAMANHOS (SIZES FILTER) */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <button
          onClick={() => toggleSection('sizes')}
          className="w-full flex items-center justify-between py-1 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-zinc-400" />
            Tamanhos
          </span>
          <div className="flex items-center gap-1.5">
            {filters.selectedSizes.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-black text-[10px] font-black">
                {filters.selectedSizes.length}
              </span>
            )}
            {openSections.sizes ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        </button>

        {openSections.sizes && (
          <div className="space-y-3 pt-1">
            {/* Footwear Sizes */}
            {footwearSizes.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                  Calçados & Chuteiras (Numeração)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {footwearSizes.map(({ size, count }) => {
                    const isSelected = filters.selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-sm font-black'
                            : isDark
                            ? 'border-white/10 text-zinc-300 hover:border-white/40 hover:bg-white/5'
                            : 'border-zinc-300 text-zinc-700 hover:border-zinc-500 hover:bg-zinc-50'
                        }`}
                        title={`${count} produto(s)`}
                      >
                        <span>{size}</span>
                        <span className={`text-[9px] ${isSelected ? 'text-black/60' : 'text-zinc-500'}`}>
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Apparel Sizes */}
            {apparelSizes.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                  Vestuário & Roupas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {apparelSizes.map(({ size, count }) => {
                    const isSelected = filters.selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-sm font-black'
                            : isDark
                            ? 'border-white/10 text-zinc-300 hover:border-white/40 hover:bg-white/5'
                            : 'border-zinc-300 text-zinc-700 hover:border-zinc-500 hover:bg-zinc-50'
                        }`}
                        title={`${count} produto(s)`}
                      >
                        <span>{size}</span>
                        <span className={`text-[9px] ${isSelected ? 'text-black/60' : 'text-zinc-500'}`}>
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other / Special Sizes */}
            {otherSizes.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                  Acessórios & Outros
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {otherSizes.map(({ size, count }) => {
                    const isSelected = filters.selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`h-8 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-sm font-black'
                            : isDark
                            ? 'border-white/10 text-zinc-300 hover:border-white/40 hover:bg-white/5'
                            : 'border-zinc-300 text-zinc-700 hover:border-zinc-500 hover:bg-zinc-50'
                        }`}
                      >
                        <span>{size}</span>
                        <span className={`text-[9px] ${isSelected ? 'text-black/60' : 'text-zinc-500'}`}>
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clear size selection */}
            {filters.selectedSizes.length > 0 && (
              <button
                onClick={() => onUpdateFilters(prev => ({ ...prev, selectedSizes: [] }))}
                className="text-[10px] font-bold text-zinc-400 hover:text-white pt-1 block cursor-pointer"
              >
                Limpar seleção de tamanhos
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5. ESPORTE / MODALIDADE */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <button
          onClick={() => toggleSection('sports')}
          className="w-full flex items-center justify-between py-1 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            Modalidade / Esporte
          </span>
          <div className="flex items-center gap-1.5">
            {filters.selectedSports.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-black text-[10px] font-black">
                {filters.selectedSports.length}
              </span>
            )}
            {openSections.sports ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        </button>

        {openSections.sports && (
          <div className="space-y-1 pt-1">
            {sportCounts.map(({ sport, count }) => {
              const isChecked = filters.selectedSports.includes(sport);
              return (
                <label
                  key={sport}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs font-medium ${
                    isChecked
                      ? isDark
                        ? 'bg-white/10 text-white font-bold'
                        : 'bg-zinc-200 text-zinc-900 font-bold'
                      : isDark
                      ? 'text-zinc-300 hover:bg-white/5 hover:text-white'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-white border-white text-black'
                          : isDark
                          ? 'border-zinc-700 bg-zinc-900'
                          : 'border-zinc-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSport(sport)}
                      className="sr-only"
                    />
                    <span>{sport}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">({count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. GÊNERO */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <button
          onClick={() => toggleSection('gender')}
          className="w-full flex items-center justify-between py-1 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
        >
          <span>Gênero</span>
          <div className="flex items-center gap-1.5">
            {filters.selectedGenders.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-black text-[10px] font-black">
                {filters.selectedGenders.length}
              </span>
            )}
            {openSections.gender ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        </button>

        {openSections.gender && (
          <div className="space-y-1 pt-1">
            {genderCounts.map(({ gender, count }) => {
              const isChecked = filters.selectedGenders.includes(gender);
              return (
                <label
                  key={gender}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs font-medium ${
                    isChecked
                      ? isDark
                        ? 'bg-white/10 text-white font-bold'
                        : 'bg-zinc-200 text-zinc-900 font-bold'
                      : isDark
                      ? 'text-zinc-300 hover:bg-white/5 hover:text-white'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-white border-white text-black'
                          : isDark
                          ? 'border-zinc-700 bg-zinc-900'
                          : 'border-zinc-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleGender(gender)}
                      className="sr-only"
                    />
                    <span>{gender}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">({count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. STATUS & OFERTAS */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={e =>
              onUpdateFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))
            }
            className="rounded border-zinc-700 accent-white w-4 h-4 cursor-pointer"
          />
          <span className="text-xs font-semibold text-zinc-300">
            Apenas produtos em estoque
          </span>
        </label>

        <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={e =>
              onUpdateFilters(prev => ({ ...prev, onSaleOnly: e.target.checked }))
            }
            className="rounded border-zinc-700 accent-white w-4 h-4 cursor-pointer"
          />
          <span className="text-xs font-semibold text-zinc-300">
            Apenas em oferta / promoção
          </span>
        </label>
      </div>

      {/* Footer in mobile drawer */}
      {isMobile && onCloseMobile && (
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={onCloseMobile}
            className="w-full py-3 bg-white text-black text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer hover:bg-zinc-200 transition-colors shadow-lg"
          >
            Ver {filteredCount} produto{filteredCount !== 1 ? 's' : ''}
          </button>
          {activeCount > 0 && (
            <button
              onClick={onClearAllFilters}
              className="w-full py-2.5 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};
