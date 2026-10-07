import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onSearchSubmit: (query: string) => void;
  products: Product[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSearchSubmit,
  products,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Dynamic filter
  const matches = cleanQuery
    ? products
        .filter(
          p =>
            p.name.toLowerCase().includes(cleanQuery) ||
            p.categoryName.toLowerCase().includes(cleanQuery) ||
            p.brand.toLowerCase().includes(cleanQuery) ||
            p.sku.toLowerCase().includes(cleanQuery) ||
            p.tags.some(t => t.toLowerCase().includes(cleanQuery))
        )
        .slice(0, 6)
    : [];

  const popularTerms = [
    'Camisa Oficial Match',
    'Chuteira Campo Speed',
    'Camisa Oversized Street',
    'Society TF',
    'Tênis Nitro Cushion',
    'Meião Antiderrapante',
    'Agasalho Corta-Vento',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cleanQuery) {
      onSearchSubmit(cleanQuery);
      onClose();
    }
  };

  const handleSelectTerm = (term: string) => {
    onSearchSubmit(term);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative mx-auto max-w-2xl rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isDark
            ? 'bg-[#12141A] border-white/10 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Search input form */}
        <form onSubmit={handleSubmit} className={`relative border-b flex items-center px-4 ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
          <Search className="w-5 h-5 text-zinc-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Busque por produto, chuteira, camisa, marca ou SKU..."
            className={`w-full py-4 text-sm sm:text-base bg-transparent border-none outline-none focus:ring-0 font-medium ${
              isDark
                ? 'text-white placeholder:text-zinc-500'
                : 'text-zinc-950 placeholder:text-zinc-400'
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className={`p-1 rounded-full cursor-pointer mr-2 ${
                isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`px-2 py-1 rounded text-xs border cursor-pointer ${
              isDark ? 'text-zinc-400 hover:text-white border-white/10' : 'text-zinc-600 hover:text-black border-zinc-200'
            }`}
          >
            ESC
          </button>
        </form>

        {/* Results or trending terms */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {matches.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Produtos Encontrados ({matches.length})
              </p>
              {matches.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    onClose();
                  }}
                  className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-100'
                  }`}
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-12 h-12 object-cover rounded-lg bg-zinc-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{prod.name}</p>
                    <p className="text-[11px] text-zinc-400">
                      {prod.categoryName} · {prod.brand}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-white">
                      R$ {prod.price.toFixed(2).replace('.', ',')}
                    </span>
                    {prod.originalPrice && (
                      <p className="text-[10px] text-zinc-500 line-through">
                        R$ {prod.originalPrice.toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-2 text-center">
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline cursor-pointer"
                >
                  Ver todos os resultados para "{query}"
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : query ? (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold">Nenhum produto encontrado para "{query}"</p>
              <p className="text-xs text-zinc-400 mt-1">
                Tente buscar por termos como "camisa", "chuteira" ou "oversized".
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                <TrendingUp className="w-4 h-4 text-zinc-300" />
                Buscas Mais Populares
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTerms.map(term => (
                  <button
                    key={term}
                    onClick={() => handleSelectTerm(term)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                      isDark
                        ? 'bg-zinc-900 border-white/10 hover:border-white/40 hover:text-white'
                        : 'bg-zinc-100 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
