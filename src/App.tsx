import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Product, Category, HeroBanner, StoreSettings, Order } from './types';
import { api } from './services/api';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Common Components
import { Header } from './components/common/Header';
import { AnnouncementBar } from './components/common/AnnouncementBar';
import { Footer } from './components/common/Footer';
import { MobileNav } from './components/common/MobileNav';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { SearchModal } from './components/common/SearchModal';
import { CartDrawer } from './components/cart/CartDrawer';

// Views
import { HomeView } from './views/HomeView';
import { CategoryView } from './views/CategoryView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { OrderConfirmationView } from './views/OrderConfirmationView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { FavoritesView } from './views/FavoritesView';
import { AccountView } from './views/AccountView';
import { AdminView } from './views/AdminView';

// Fallback initial data in case server is booting
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_SETTINGS,
} from './data/initialData';

function MainApp() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentCategorySlug, setCurrentCategorySlug] = useState<string>('todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('#LM10257');

  // UI Drawers
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // App Data
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [banners, setBanners] = useState<HeroBanner[]>(INITIAL_BANNERS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch initial data from server
  const refreshProducts = async () => {
    try {
      const res = await api.getProducts({ limit: 100 });
      if (res?.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.warn('Backend loading, using memory cache:', err);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const [catsRes, prodsRes, bannersRes, settsRes] = await Promise.allSettled([
          api.getCategories(),
          api.getProducts({ limit: 100 }),
          api.getBanners(),
          api.getSettings(),
        ]);

        if (catsRes.status === 'fulfilled') setCategories(catsRes.value);
        if (prodsRes.status === 'fulfilled') setProducts(prodsRes.value.products);
        if (bannersRes.status === 'fulfilled') setBanners(bannersRes.value);
        if (settsRes.status === 'fulfilled') setSettings(settsRes.value);
      } catch (err) {
        console.warn('Backend loading, using memory cache:', err);
      }
    }
    init();
  }, []);

  // Sync scroll on view change
  const navigateTo = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'category') {
      setCurrentCategorySlug(param || 'todos');
      setCurrentView('category');
    } else if (view === 'product') {
      const found = products.find(p => p.slug === param || p.id === param);
      if (found) {
        setSelectedProduct(found);
        setCurrentView('product');
      } else if (param) {
        api.getProduct(param).then(res => {
          if (res?.product) {
            setSelectedProduct(res.product);
            setCurrentView('product');
          }
        }).catch(() => {});
      }
    } else if (view === 'tracking') {
      if (param) setTrackingOrderId(param);
      setCurrentView('tracking');
    } else if (view === 'offers') {
      setCurrentCategorySlug('ofertas');
      setCurrentView('category');
    } else {
      setCurrentView(view);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (q: string) => {
    setCurrentCategorySlug('todos');
    setCurrentView('category');
  };

  // SEO Rich Schema Product Structured Data when on product page
  useEffect(() => {
    const existingScript = document.getElementById('lmen-product-schema');
    if (existingScript) existingScript.remove();

    if (currentView === 'product' && selectedProduct) {
      const script = document.createElement('script');
      script.id = 'lmen-product-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: selectedProduct.name,
        image: selectedProduct.images,
        description: selectedProduct.description,
        sku: selectedProduct.sku,
        brand: {
          '@type': 'Brand',
          name: selectedProduct.brand,
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'BRL',
          price: selectedProduct.price,
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: selectedProduct.rating,
          reviewCount: selectedProduct.reviewCount,
        },
      });
      document.head.appendChild(script);
    }
  }, [currentView, selectedProduct]);

  // Admin view is dedicated fullscreen layout
  if (currentView === 'admin') {
    return (
      <AdminView
        onBackToStore={async () => {
          await refreshProducts();
          try {
            const [updatedCats, updatedBans] = await Promise.all([
              api.getCategories(),
              api.getBanners(),
            ]);
            setCategories(updatedCats);
            setBanners(updatedBans);
          } catch {
            // keep existing
          }
          navigateTo('home');
        }}
        onProductsUpdated={(updated) => {
          setProducts(updated);
        }}
        onCategoriesUpdated={(updated) => {
          setCategories(updated);
        }}
        onBannersUpdated={(updated) => {
          setBanners(updated);
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-white selection:text-black transition-colors duration-200 ${
        isDark ? 'bg-[#0B0B0C] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Top Announcement Bar */}
      {settings.announcementBar.enabled && (
        <AnnouncementBar
          text={settings.announcementBar.text}
          link={settings.announcementBar.link}
          onLinkClick={() => navigateTo('offers')}
        />
      )}

      {/* Main Sticky Header */}
      <Header
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenMobileMenu={() => setIsMobileNavOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        {currentView === 'home' && (
          <HomeView
            banners={banners}
            categories={categories}
            products={products}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={slug => navigateTo('category', slug)}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'category' && (
          <CategoryView
            currentCategorySlug={currentCategorySlug}
            categories={categories}
            allProducts={products}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={slug => setCurrentCategorySlug(slug)}
          />
        )}

        {currentView === 'product' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            reviews={[]}
            relatedProducts={products
              .filter(p => p.id !== selectedProduct.id && p.categorySlug === selectedProduct.categorySlug)
              .slice(0, 4)}
            onSelectProduct={handleSelectProduct}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onOrderSuccess={order => {
              setCurrentOrder(order);
              setOrders(prev => [order, ...prev]);
              setCurrentView('order_confirmation');
            }}
            onBackToCart={() => navigateTo('home')}
          />
        )}

        {currentView === 'order_confirmation' && currentOrder && (
          <OrderConfirmationView
            order={currentOrder}
            onTrackOrder={orderId => navigateTo('tracking', orderId)}
            onContinueShopping={() => navigateTo('home')}
          />
        )}

        {currentView === 'tracking' && (
          <OrderTrackingView
            orderIdOrNumber={trackingOrderId}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            products={products}
            onSelectProduct={handleSelectProduct}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'account' && (
          <AccountView
            orders={orders}
            onTrackOrder={orderId => navigateTo('tracking', orderId)}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomBar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Slide-over Drawers & Modals */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onNavigate={navigateTo}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={handleSelectProduct}
        onSearchSubmit={handleSearchSubmit}
      />

      <CartDrawer
        onCheckout={() => navigateTo('checkout')}
        onContinueShopping={() => navigateTo('home')}
      />

      {/* Floating WhatsApp Action Button */}
      <a
        href="https://wa.me/5597984217475?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20LMEN%20SPORTS%20e%20gostaria%20de%20informa%C3%A7%C3%B5es."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-zinc-900 text-white border border-white/20 rounded-full shadow-2xl hover:bg-black hover:scale-105 active:scale-95 transition-all group cursor-pointer"
        aria-label="Atendimento WhatsApp LMEN SPORTS (97) 98421-7475"
        title="Falar no WhatsApp (97) 98421-7475"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 text-white" />
        <span className="text-xs font-black tracking-wider uppercase hidden sm:inline">
          (97) 98421-7475
        </span>
      </a>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
