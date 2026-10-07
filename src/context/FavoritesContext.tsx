import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favoriteIds: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  totalFavorites: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lmen_favorites');
      return saved ? JSON.parse(saved) : ['prod-01', 'prod-04'];
    } catch {
      return ['prod-01', 'prod-04'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lmen_favorites', JSON.stringify(favoriteIds));
    } catch (e) {
      console.error(e);
    }
  }, [favoriteIds]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const isFavorite = (id: string) => favoriteIds.includes(id);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        toggleFavorite,
        isFavorite,
        totalFavorites: favoriteIds.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
};
