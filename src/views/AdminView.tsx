import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  AlertTriangle,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Check,
  Palette,
  Ruler,
  Star,
  Tag,
  ArrowUp,
  Camera,
  CreditCard,
  Landmark,
  Wallet,
  ShieldCheck,
  QrCode,
  Boxes,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Product, ProductVariant, Order, StoreSettings, Category, HeroBanner } from '../types';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { DEFAULT_FALLBACK_IMAGE, handleImageError } from '../utils/imageFallback';
import { processImageFile } from '../utils/imageProcessor';

const SPORTS_IMAGE_PRESETS = [
  { name: 'Tênis Running Preto', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' },
  { name: 'Tênis Basquete', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop' },
  { name: 'Tênis Casual Branco', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop' },
  { name: 'Chuteira Campo Pro', url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=800&auto=format&fit=crop' },
  { name: 'Chuteira Society', url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=800&auto=format&fit=crop' },
  { name: 'Camisa Futebol Preta', url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop' },
  { name: 'Camisa Treino', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop' },
  { name: 'Shorts Dry-Fit', url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop' },
  { name: 'Agasalho Esportivo', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop' },
  { name: 'Boné Esportivo', url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop' },
];

const STORE_CATEGORIES = [
  { slug: 'tenis', name: 'Tênis' },
  { slug: 'chuteiras', name: 'Chuteiras Campo' },
  { slug: 'society', name: 'Chuteiras Society' },
  { slug: 'camisas', name: 'Camisas' },
  { slug: 'shorts', name: 'Shorts & Bermudas' },
  { slug: 'agasalhos', name: 'Agasalhos & Corta-Vento' },
  { slug: 'acessorios', name: 'Acessórios' },
  { slug: 'futebol', name: 'Futebol' },
];

const GENDER_OPTIONS: Array<'Masculino' | 'Feminino' | 'Unissex' | 'Infantil'> = [
  'Masculino',
  'Feminino',
  'Unissex',
  'Infantil',
];

const SPORTS_OPTIONS = ['Futebol', 'Basquete', 'Corrida', 'Treino', 'Casual', 'Society'];

const POPULAR_COLORS = [
  { name: 'Preto', hex: '#000000' },
  { name: 'Branco', hex: '#FFFFFF' },
  { name: 'Cinza', hex: '#6B7280' },
  { name: 'Azul Royal', hex: '#1D4ED8' },
  { name: 'Azul Marinho', hex: '#0F172A' },
  { name: 'Vermelho', hex: '#DC2626' },
  { name: 'Verde', hex: '#16A34A' },
  { name: 'Amarelo', hex: '#EAB308' },
  { name: 'Laranja', hex: '#EA580C' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Dourado', hex: '#CA8A04' },
  { name: 'Grafite', hex: '#374151' },
];

const FOOTWEAR_SIZES = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
const APPAREL_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG'];

interface AdminViewProps {
  onBackToStore: () => void;
  onProductsUpdated?: (products: Product[]) => void;
  onCategoriesUpdated?: (categories: Category[]) => void;
  onBannersUpdated?: (banners: HeroBanner[]) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onBackToStore,
  onProductsUpdated,
  onCategoriesUpdated,
  onBannersUpdated,
}) => {
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'inventory' | 'categories' | 'banners' | 'settings'>('dashboard');

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);

  // Category & Banner editing state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [categoryImageInput, setCategoryImageInput] = useState('');
  const [bannerImageInput, setBannerImageInput] = useState('');
  const [isCategoryUploadLoading, setIsCategoryUploadLoading] = useState(false);
  const [isBannerUploadLoading, setIsBannerUploadLoading] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  // Product modal / edit state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Image editing helpers
  const [imageTab, setImageTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [imageLoadStatus, setImageLoadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [showImageGuide, setShowImageGuide] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Size and Color inputs
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');

  // Stock per size mapping & drag-drop state
  const [sizeStockMap, setSizeStockMap] = useState<Record<string, number>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Status update message
  const [actionNotice, setActionNotice] = useState('');

  // Custom Delete Confirmation Modal (avoids window.confirm iframe blocking)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, prods, ords, setts, cats, bans] = await Promise.all([
        api.getAdminDashboard(),
        api.getProducts({ limit: 100 }),
        api.getAdminOrders(),
        api.getSettings(),
        api.getAdminCategories().catch(() => api.getCategories()),
        api.getAdminBanners().catch(() => api.getBanners()),
      ]);
      setDashboardData(dash);
      setProducts(prods.products);
      setOrders(ords);
      setSettings(setts);
      setCategories(cats || []);
      setBanners(bans || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      showNotification(`Pedido ${updated.orderNumber} atualizado para ${newStatus}`);
    } catch (e) {
      console.error(e);
    }
  };

  const confirmProductDeletion = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteAdminProduct(productToDelete.id);
      const nextProducts = products.filter(p => p.id !== productToDelete.id);
      setProducts(nextProducts);
      if (onProductsUpdated) {
        onProductsUpdated(nextProducts);
      }
      showNotification(`Produto "${productToDelete.name}" excluído com sucesso.`);
      setProductToDelete(null);
    } catch (e) {
      console.error(e);
      showNotification('Erro ao excluir produto. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  // MULTIPLE IMAGE UPLOAD SYSTEM WITH PROCESSOR & STORAGE
  const processAndUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setImageUploadLoading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const optimizedDataUrl = await processImageFile(file);
          const res = await api.uploadImage(optimizedDataUrl, file.name);
          uploadedUrls.push(res.url || optimizedDataUrl);
        } catch (fileErr) {
          console.error('Error processing single file, using fallback reader:', fileErr);
          const fallbackDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve(DEFAULT_FALLBACK_IMAGE);
            reader.readAsDataURL(file);
          });
          uploadedUrls.push(fallbackDataUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setEditingProduct(prev => {
          if (!prev) return null;
          const currentImages = prev.images || [];
          return {
            ...prev,
            images: [...currentImages, ...uploadedUrls],
          };
        });
        setImageLoadStatus('success');
        showNotification(`${uploadedUrls.length} foto(s) enviada(s) e armazenadas com sucesso!`);
      }
    } catch (err) {
      console.error(err);
      showNotification('Erro ao processar fotos.');
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processAndUploadFiles(files);
    e.target.value = '';
  };

  const handleDropImages = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processAndUploadFiles(e.dataTransfer.files);
    }
  };

  // ADD IMAGE BY URL
  const handleAddImageLink = () => {
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    setEditingProduct(prev => {
      if (!prev) return null;
      const current = prev.images || [];
      return {
        ...prev,
        images: [...current, url],
      };
    });
    setImageUrlInput('');
    setImageLoadStatus('success');
    showNotification('Foto adicionada por link!');
  };

  // ADD PRESET IMAGE
  const handleAddPresetImage = (presetUrl: string, presetName: string) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      const current = prev.images || [];
      return {
        ...prev,
        images: [...current, presetUrl],
      };
    });
    showNotification(`Foto adicionada: ${presetName}`);
  };

  // REMOVE IMAGE
  const handleRemoveImage = (indexToRemove: number) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      const current = prev.images || [];
      return {
        ...prev,
        images: current.filter((_, idx) => idx !== indexToRemove),
      };
    });
    showNotification('Foto removida.');
  };

  // MOVE IMAGE (Reorder)
  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    setEditingProduct(prev => {
      if (!prev || !prev.images) return null;
      const imgs = [...prev.images];
      if (toIdx < 0 || toIdx >= imgs.length) return prev;
      const [moved] = imgs.splice(fromIdx, 1);
      imgs.splice(toIdx, 0, moved);
      return { ...prev, images: imgs };
    });
  };

  // SET PRIMARY IMAGE (move to position 0)
  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setEditingProduct(prev => {
      if (!prev || !prev.images) return null;
      const current = [...prev.images];
      const [selected] = current.splice(indexToPrimary, 1);
      return {
        ...prev,
        images: [selected, ...current],
      };
    });
    showNotification('Foto definida como Capa Principal!');
  };

  // CATEGORY & BANNER IMAGE HANDLERS
  const handleCategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCategory) return;
    setIsCategoryUploadLoading(true);
    try {
      const optimizedDataUrl = await processImageFile(file);
      const res = await api.uploadImage(optimizedDataUrl, file.name);
      const finalUrl = res.url || optimizedDataUrl;
      setEditingCategory(prev => (prev ? { ...prev, image: finalUrl } : null));
      setCategoryImageInput(finalUrl);
      showNotification('Foto da categoria carregada!');
    } catch (err) {
      console.error(err);
      showNotification('Erro ao processar imagem.');
    } finally {
      setIsCategoryUploadLoading(false);
      e.target.value = '';
    }
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    setIsSavingCategory(true);
    try {
      const finalImage = categoryImageInput.trim() || editingCategory.image;
      const updated = { ...editingCategory, image: finalImage };
      await api.updateCategory(editingCategory.id, updated);
      const newCats = categories.map(c => (c.id === editingCategory.id ? updated : c));
      setCategories(newCats);
      if (onCategoriesUpdated) onCategoriesUpdated(newCats);
      showNotification(`Imagem da categoria "${editingCategory.name}" atualizada com sucesso!`);
      setEditingCategory(null);
      setCategoryImageInput('');
    } catch (err) {
      console.error(err);
      showNotification('Erro ao salvar categoria.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBanner) return;
    setIsBannerUploadLoading(true);
    try {
      const optimizedDataUrl = await processImageFile(file);
      const res = await api.uploadImage(optimizedDataUrl, file.name);
      const finalUrl = res.url || optimizedDataUrl;
      setEditingBanner(prev => (prev ? { ...prev, imageUrl: finalUrl } : null));
      setBannerImageInput(finalUrl);
      showNotification('Foto do banner carregada com sucesso!');
    } catch (err) {
      console.error(err);
      showNotification('Erro ao processar imagem.');
    } finally {
      setIsBannerUploadLoading(false);
      e.target.value = '';
    }
  };

  const handleSaveBanner = async () => {
    if (!editingBanner) return;
    setIsSavingBanner(true);
    try {
      const finalImage = bannerImageInput.trim() || editingBanner.imageUrl;
      const updated = { ...editingBanner, imageUrl: finalImage };
      await api.updateBanner(editingBanner.id, updated);
      const newBans = banners.map(b => (b.id === editingBanner.id ? updated : b));
      setBanners(newBans);
      if (onBannersUpdated) onBannersUpdated(newBans);
      showNotification(`Banner "${editingBanner.title}" atualizado com sucesso!`);
      setEditingBanner(null);
      setBannerImageInput('');
    } catch (err) {
      console.error(err);
      showNotification('Erro ao salvar banner.');
    } finally {
      setIsSavingBanner(false);
    }
  };

  // STOCK PER SIZE HELPERS
  const updateSizeStock = (size: string, qty: number) => {
    const safeQty = Math.max(0, Math.floor(qty));
    setSizeStockMap(prev => {
      const updated = { ...prev, [size]: safeQty };
      const total = Object.values(updated).reduce((a, b) => a + b, 0);
      setEditingProduct(ep => (ep ? { ...ep, stock: total } : null));
      return updated;
    });
  };

  const distributeTotalStock = (total: number) => {
    const sizes = editingProduct?.availableSizes || [];
    if (sizes.length === 0) return;
    const safeTotal = Math.max(0, total);
    const each = Math.max(1, Math.round(safeTotal / sizes.length));
    const newMap: Record<string, number> = {};
    sizes.forEach(sz => { newMap[sz] = each; });
    setSizeStockMap(newMap);
    setEditingProduct(ep => (ep ? { ...ep, stock: each * sizes.length } : null));
    showNotification(`Distribuído: ${each} pares para cada um dos ${sizes.length} tamanhos.`);
  };

  const setAllSizesStock = (qtyEach: number) => {
    const sizes = editingProduct?.availableSizes || [];
    if (sizes.length === 0) return;
    const safe = Math.max(0, qtyEach);
    const newMap: Record<string, number> = {};
    sizes.forEach(sz => { newMap[sz] = safe; });
    setSizeStockMap(newMap);
    setEditingProduct(ep => (ep ? { ...ep, stock: safe * sizes.length } : null));
    showNotification(`Estoque ajustado: ${safe} pares para cada tamanho ativo.`);
  };

  // SIZES HELPERS
  const applySizePreset = (presetSizes: string[]) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      const current = prev.availableSizes || [];
      const merged = Array.from(new Set([...current, ...presetSizes]));
      return { ...prev, availableSizes: merged };
    });

    setSizeStockMap(prev => {
      const updated = { ...prev };
      presetSizes.forEach(sz => {
        if (updated[sz] === undefined) {
          updated[sz] = 10;
        }
      });
      const total = Object.values(updated).reduce((a, b) => a + b, 0);
      setEditingProduct(ep => (ep ? { ...ep, stock: total } : null));
      return updated;
    });

    showNotification(`Numerações adicionadas: ${presetSizes.join(', ')}`);
  };

  const toggleSize = (size: string) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      const current = prev.availableSizes || [];
      const exists = current.includes(size);
      const updated = exists ? current.filter(s => s !== size) : [...current, size];
      return { ...prev, availableSizes: updated };
    });

    setSizeStockMap(prev => {
      const updated = { ...prev };
      if (updated[size] !== undefined) {
        delete updated[size];
      } else {
        updated[size] = 10;
      }
      const total = Object.values(updated).reduce((a, b) => a + b, 0);
      setEditingProduct(ep => (ep ? { ...ep, stock: total } : null));
      return updated;
    });
  };

  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customSizeInput.trim()) return;
    const size = customSizeInput.trim().toUpperCase();
    setEditingProduct(prev => {
      if (!prev) return null;
      const current = prev.availableSizes || [];
      if (current.includes(size)) return prev;
      return { ...prev, availableSizes: [...current, size] };
    });

    setSizeStockMap(prev => {
      if (prev[size] !== undefined) return prev;
      const updated = { ...prev, [size]: 10 };
      const total = Object.values(updated).reduce((a, b) => a + b, 0);
      setEditingProduct(ep => (ep ? { ...ep, stock: total } : null));
      return updated;
    });

    setCustomSizeInput('');
    showNotification(`Tamanho adicionado: ${size}`);
  };

  const removeSize = (sizeToRemove: string) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      return {
        ...prev,
        availableSizes: (prev.availableSizes || []).filter(s => s !== sizeToRemove),
      };
    });

    setSizeStockMap(prev => {
      const updated = { ...prev };
      delete updated[sizeToRemove];
      const total = Object.values(updated).reduce((a, b) => a + b, 0);
      setEditingProduct(ep => (ep ? { ...ep, stock: total } : null));
      return updated;
    });
  };

  // COLORS HELPERS
  const addPresetColor = (name: string, hex: string) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      const current = prev.availableColors || [];
      if (current.some(c => c.name.toLowerCase() === name.toLowerCase())) return prev;
      return {
        ...prev,
        availableColors: [...current, { name, hex }],
      };
    });
    showNotification(`Cor adicionada: ${name}`);
  };

  const handleAddCustomColor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customColorName.trim()) return;
    const name = customColorName.trim();
    const hex = customColorHex || '#000000';
    setEditingProduct(prev => {
      if (!prev) return null;
      const current = prev.availableColors || [];
      if (current.some(c => c.name.toLowerCase() === name.toLowerCase())) return prev;
      return {
        ...prev,
        availableColors: [...current, { name, hex }],
      };
    });
    setCustomColorName('');
    showNotification(`Cor adicionada: ${name}`);
  };

  const removeColor = (nameToRemove: string) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      return {
        ...prev,
        availableColors: (prev.availableColors || []).filter(c => c.name !== nameToRemove),
      };
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    try {
      const isEditing = Boolean(editingProduct.id);
      
      // Ensure there is at least one valid image
      const validImages = (editingProduct.images || []).filter(img => Boolean(img && img.trim()));
      const finalImages = validImages.length > 0 ? validImages : [DEFAULT_FALLBACK_IMAGE];

      // Ensure sizes
      const finalSizes = (editingProduct.availableSizes && editingProduct.availableSizes.length > 0)
        ? editingProduct.availableSizes
        : ['38', '39', '40', '41', '42'];

      // Ensure colors
      const finalColors = (editingProduct.availableColors && editingProduct.availableColors.length > 0)
        ? editingProduct.availableColors
        : [
            { name: 'Preto', hex: '#000000' },
            { name: 'Branco', hex: '#FFFFFF' },
          ];

      const categoryMatch = STORE_CATEGORIES.find(c => c.slug === editingProduct.categorySlug);
      const categoryName = editingProduct.categoryName || categoryMatch?.name || 'Geral';

      // Build structured variants with specific size, color and stock
      const variants: ProductVariant[] = finalSizes.map((sz, idx) => ({
        id: `v-${Date.now()}-${idx}`,
        sku: `${editingProduct.sku || 'LMEN'}-${sz}`,
        size: sz,
        color: finalColors[0]?.name || 'Padrão',
        colorHex: finalColors[0]?.hex || '#000000',
        stock: sizeStockMap[sz] !== undefined ? Math.max(0, sizeStockMap[sz]) : 10,
        price: editingProduct.price,
      }));

      const sumVariantStock = variants.reduce((acc, v) => acc + v.stock, 0);
      const finalStock = typeof editingProduct.stock === 'number' && editingProduct.stock > 0
        ? editingProduct.stock
        : sumVariantStock;

      const productToSave: Partial<Product> = {
        ...editingProduct,
        categoryName,
        images: finalImages,
        availableSizes: finalSizes,
        availableColors: finalColors,
        variants,
        stock: finalStock,
        gender: editingProduct.gender || 'Masculino',
        sport: editingProduct.sport || 'Futebol',
        status: finalStock <= 0 ? 'out_of_stock' : (editingProduct.status || 'active'),
      };

      const saved = await api.saveAdminProduct(productToSave, isEditing);
      let nextProducts: Product[];
      if (isEditing) {
        nextProducts = products.map(p => (p.id === saved.id ? saved : p));
      } else {
        nextProducts = [saved, ...products];
      }
      setProducts(nextProducts);
      if (onProductsUpdated) {
        onProductsUpdated(nextProducts);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setImageLoadStatus('idle');
      showNotification('Produto esportivo salvo com sucesso!');
    } catch (e) {
      console.error(e);
      showNotification('Erro ao salvar produto. Tente novamente.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateAdminSettings(settings);
      showNotification('Configurações da loja salvas com sucesso.');
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090A0D] text-zinc-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="border-b border-white/10 bg-[#0E1015] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-white/20 flex items-center justify-center font-black text-white text-sm">
            LM
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white">
              LMEN SPORTS · PAINEL DO ADMINISTRADOR
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono">Paleta Preto, Cinza e Branco · Ativo</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {actionNotice && (
            <span className="text-xs bg-zinc-800 text-white border border-white/20 px-3 py-1 rounded-lg font-bold animate-in fade-in">
              {actionNotice}
            </span>
          )}
          <button
            onClick={onBackToStore}
            className="py-1.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors cursor-pointer border border-white/10"
          >
            ← Voltar para a Loja
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-[#0E1015] border-r border-white/10 p-4 space-y-1 shrink-0">
          {[
            { id: 'dashboard', label: 'Dashboard & Vendas', icon: LayoutDashboard },
            { id: 'products', label: 'Gerenciar Produtos', icon: Package, badge: products.length },
            { id: 'categories', label: 'Imagens das Categorias', icon: Boxes, badge: categories.length },
            { id: 'banners', label: 'Banners & Painel Inicial', icon: Sparkles, badge: banners.length },
            { id: 'orders', label: 'Pedidos de Clientes', icon: ShoppingBag, badge: orders.length },
            { id: 'inventory', label: 'Estoque & Alertas', icon: AlertTriangle },
            { id: 'settings', label: 'Configurações da Loja', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-md font-black'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300 border border-white/10'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Workspace Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && dashboardData && (
            <div className="space-y-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-white" /> Vendas Hoje
                  </span>
                  <p className="text-2xl font-black text-white">
                    R$ {dashboardData.metrics.totalSalesToday.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-semibold">+18% em relação a ontem</p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-zinc-300" /> Pedidos
                  </span>
                  <p className="text-2xl font-black text-white">{orders.length}</p>
                  <p className="text-[10px] text-zinc-400">Total acumulado</p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-zinc-300" /> Clientes
                  </span>
                  <p className="text-2xl font-black text-white">{dashboardData.metrics.totalCustomers || 1284}</p>
                  <p className="text-[10px] text-zinc-400 font-semibold">100% ativos</p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-zinc-300" /> Produtos
                  </span>
                  <p className="text-2xl font-black text-white">{products.length}</p>
                  <p className="text-[10px] text-zinc-400">Catálogo ativo</p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" /> Estoque Baixo
                  </span>
                  <p className="text-2xl font-black text-white">{dashboardData.metrics.lowStockCount || 18}</p>
                  <p className="text-[10px] text-zinc-400 font-semibold">Necessita reposição</p>
                </div>
              </div>

              {/* Charts & Categorias mais vendidas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                      Volume de Vendas por Dia da Semana
                    </h3>
                    <span className="text-xs font-bold text-white">
                      Ticket Médio: R$ {dashboardData.metrics.averageTicket || '214,80'}
                    </span>
                  </div>

                  {/* Monochrome Bar Chart */}
                  <div className="h-44 flex items-end gap-3 pt-6 px-2">
                    {[
                      { day: 'Seg', val: 65, total: 'R$ 1.840' },
                      { day: 'Ter', val: 78, total: 'R$ 2.450' },
                      { day: 'Qua', val: 92, total: 'R$ 3.120' },
                      { day: 'Qui', val: 85, total: 'R$ 2.890' },
                      { day: 'Sex', val: 100, total: 'R$ 3.840' },
                      { day: 'Sáb', val: 95, total: 'R$ 3.420' },
                      { day: 'Dom', val: 70, total: 'R$ 2.180' },
                    ].map(col => (
                      <div key={col.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[9px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {col.total}
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-zinc-700 to-white rounded-t-lg transition-all duration-300 hover:brightness-125"
                          style={{ height: `${col.val}%` }}
                        />
                        <span className="text-[10px] font-bold text-zinc-400">{col.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categorias mais vendidas */}
                <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 pb-3 border-b border-white/5">
                    Categorias Mais Vendidas
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Chuteiras Campo', share: 38, amount: 'R$ 18.420' },
                      { name: 'Camisas de Time', share: 29, amount: 'R$ 14.150' },
                      { name: 'Society (TF)', share: 18, amount: 'R$ 8.920' },
                      { name: 'Oversized Street', share: 10, amount: 'R$ 4.880' },
                      { name: 'Meiões Grip', share: 5, amount: 'R$ 2.430' },
                    ].map(item => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{item.name}</span>
                          <span className="text-white">{item.amount}</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-white h-full rounded-full" style={{ width: `${item.share}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders table preview */}
              <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                    Últimos Pedidos Recebidos
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-white hover:underline font-bold"
                  >
                    Ver todos ({orders.length}) →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px]">
                        <th className="py-2.5 px-3">Pedido</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Valor</th>
                        <th className="py-2.5 px-3">Pagamento</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id}>
                          <td className="py-3 px-3 font-bold text-white">{o.orderNumber}</td>
                          <td className="py-3 px-3">{o.customer.name}</td>
                          <td className="py-3 px-3 font-mono font-bold">
                            R$ {o.total.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-3 px-3 uppercase text-[11px]">{o.paymentMethod}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-white border border-white/20 text-[10px] font-bold uppercase">
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar produto por nome, SKU ou categoria..."
                    className="w-full py-2 pl-9 pr-3 bg-zinc-900 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-white text-white"
                  />
                </div>

                <button
                  onClick={() => {
                    const defaultSizes = ['38', '39', '40', '41', '42', '43', '44'];
                    const defaultMap: Record<string, number> = {};
                    defaultSizes.forEach(sz => { defaultMap[sz] = 10; });
                    setSizeStockMap(defaultMap);
                    setEditingProduct({
                      name: '',
                      sku: `LM-${Date.now().toString().slice(-4)}`,
                      price: 299.9,
                      originalPrice: 399.9,
                      categorySlug: 'tenis',
                      categoryName: 'Tênis',
                      brand: 'NIKE',
                      gender: 'Masculino',
                      sport: 'Corrida',
                      description: 'Tênis de alta performance esportiva com cabedal anatômico respirável e solado com máxima tração.',
                      shortDescription: 'Excelente amortecimento responsivo, leveza e durabilidade para todas as quadras e pistas.',
                      images: [],
                      stock: 70,
                      availableSizes: defaultSizes,
                      availableColors: [
                        { name: 'Preto', hex: '#000000' },
                        { name: 'Branco', hex: '#FFFFFF' },
                        { name: 'Cinza Metálico', hex: '#6B7280' },
                      ],
                      variants: [],
                      status: 'active',
                      salesCount: 0,
                      rating: 5.0,
                      reviewCount: 0,
                      tags: ['tênis', 'esporte', 'lmen'],
                    });
                    setImageLoadStatus('idle');
                    setIsProductModalOpen(true);
                  }}
                  className="py-2.5 px-4 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Novo Produto
                </button>
              </div>

              {/* Product Table */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Produto</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Gênero</th>
                      <th className="py-2.5 px-3">Numerações / Tamanhos</th>
                      <th className="py-2.5 px-3">Estoque (Pares)</th>
                      <th className="py-2.5 px-3">Fotos</th>
                      <th className="py-2.5 px-3">Preço</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {filteredProducts.map(p => {
                      const totalStock = typeof p.stock === 'number'
                        ? p.stock
                        : p.variants && p.variants.length > 0
                        ? p.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
                        : 30;
                      return (
                        <tr key={p.id} className="hover:bg-white/5">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={p.images?.[0] || DEFAULT_FALLBACK_IMAGE}
                                alt=""
                                onError={handleImageError}
                                className="w-10 h-10 object-cover rounded-lg bg-zinc-800 border border-white/10"
                              />
                              <div>
                                <span className="font-bold truncate max-w-[180px] block text-white">{p.name}</span>
                                <span className="text-[10px] text-zinc-400">{p.brand} · {p.categoryName}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-zinc-400">{p.sku}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20 whitespace-nowrap">
                              {p.gender === 'Feminino' ? '👩 Fem' : p.gender === 'Infantil' ? '🧒 Inf' : p.gender === 'Masculino' ? '👨 Masc' : '⚡ Unis'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {p.availableSizes?.slice(0, 5).map(s => (
                                <span key={s} className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">
                                  {s}
                                </span>
                              ))}
                              {(p.availableSizes?.length || 0) > 5 && (
                                <span className="text-[10px] text-zinc-400">
                                  +{(p.availableSizes?.length || 0) - 5}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border ${
                              totalStock > 10
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                : totalStock > 0
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                            }`}>
                              <Boxes className="w-3.5 h-3.5" />
                              <span>{totalStock} {totalStock === 1 ? 'par' : 'pares'}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1">
                              <Camera className="w-3 h-3 text-zinc-400" />
                              {p.images?.length || 0} foto(s)
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                            R$ {p.price.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-white border border-white/20 text-[10px] font-bold uppercase">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => {
                                  const stockMap: Record<string, number> = {};
                                  const sizes = p.availableSizes || [];
                                  if (p.variants && p.variants.length > 0) {
                                    p.variants.forEach(v => {
                                      stockMap[v.size] = (stockMap[v.size] || 0) + (Number(v.stock) || 0);
                                    });
                                  } else {
                                    const stockEach = Math.max(1, Math.round((p.stock || 40) / (sizes.length || 1)));
                                    sizes.forEach(sz => { stockMap[sz] = stockEach; });
                                  }
                                  setSizeStockMap(stockMap);
                                  setEditingProduct({
                                    ...p,
                                    gender: p.gender || 'Masculino',
                                    stock: p.stock ?? (p.variants?.reduce((sum, v) => sum + v.stock, 0) || 50),
                                  });
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                                title="Excluir Produto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-base font-black uppercase tracking-wider">
                Gerenciador de Pedidos ({orders.length})
              </h3>
              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Pedido</th>
                      <th className="py-2.5 px-3">Cliente & Contato</th>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Valor Total</th>
                      <th className="py-2.5 px-3">Status Atual</th>
                      <th className="py-2.5 px-3">Alterar Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-white/5">
                        <td className="py-3 px-3 font-bold text-white">{order.orderNumber}</td>
                        <td className="py-3 px-3">
                          <p className="font-bold">{order.customer.name}</p>
                          <p className="text-[10px] text-zinc-400">{order.customer.email}</p>
                        </td>
                        <td className="py-3 px-3 text-zinc-400">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 font-bold font-mono">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-white border border-white/20 text-[10px] font-bold uppercase">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={order.status}
                            onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-black border border-white/20 rounded-lg py-1 px-2 text-[11px] font-semibold text-white focus:outline-none focus:border-white cursor-pointer"
                          >
                            <option value="pending_payment">Aguardando Pagamento</option>
                            <option value="paid">Pago</option>
                            <option value="preparing">Preparando</option>
                            <option value="shipped">Enviado</option>
                            <option value="in_transit">Em Trânsito</option>
                            <option value="delivered">Entregue</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY ALERTS */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-white">
                <AlertTriangle className="w-5 h-5 text-zinc-400" />
                Produtos com Estoque Baixo ou Esgotado
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products
                  .filter(p => p.variants.reduce((sum, v) => sum + v.stock, 0) < 12)
                  .map(p => {
                    const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                    return (
                      <div key={p.id} className="p-4 rounded-xl bg-zinc-900 border border-white/10 flex gap-3 items-center">
                        <img src={p.images[0]} alt="" className="w-14 h-14 object-cover rounded-lg bg-zinc-800" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate text-white">{p.name}</p>
                          <p className="text-[10px] font-mono text-zinc-400">{p.sku}</p>
                          <p className="text-xs font-black text-white mt-1">
                            Apenas {totalStock} em estoque
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 5: STORE SETTINGS */}
          {activeTab === 'settings' && settings && (
            <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-zinc-900 border border-white/10 max-w-2xl space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider mb-2">
                Configurações da Loja LMEN SPORTS
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Nome da Loja</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Texto da Barra de Ofertas (Topo)
                </label>
                <input
                  type="text"
                  value={settings.announcementBar.text}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      announcementBar: { ...settings.announcementBar, text: e.target.value },
                    })
                  }
                  className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    Valor Mínimo para Frete Grátis (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.freeShippingThreshold}
                    onChange={e => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    Desconto PIX (%)
                  </label>
                  <input
                    type="number"
                    value={settings.pixDiscountPercent}
                    onChange={e => setSettings({ ...settings, pixDiscountPercent: Number(e.target.value) })}
                    className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Instagram (@)</label>
                  <input
                    type="text"
                    value={settings.instagramHandle}
                    onChange={e => setSettings({ ...settings, instagramHandle: e.target.value })}
                    className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Endereço da Loja Física</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                  placeholder="Rua Francisco Monteiro, nº 1796, Bairro Nova Humaitá"
                  className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                />
              </div>

              {/* SEÇÃO DA CONTA DE RECEBIMENTO DOS PAGAMENTOS */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-white">
                      Conta de Recebimento dos Pagamentos
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Configure a conta bancária e chave PIX para onde vai o dinheiro de todas as compras da loja.
                    </p>
                  </div>
                </div>

                {/* Caixa explicativa detalhada */}
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-zinc-300 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Para qual conta vai o dinheiro das compras?</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] list-disc list-inside text-zinc-300">
                    <li>
                      <strong className="text-white">Pagamentos via PIX:</strong> O cliente paga pelo QR Code ou Copia e Cola gerado na tela de pedido. O valor é creditado <span className="text-emerald-400 font-bold">diretamente na conta da Chave PIX configurada abaixo</span>.
                    </li>
                    <li>
                      <strong className="text-white">Pagamentos via Cartão de Crédito:</strong> As transações são processadas pela adquirente/gateway (ex: Mercado Pago, Asaas, PagSeguro, Stripe) e transferidas automaticamente para a sua conta bancária cadastrada.
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                      Chave PIX de Recebimento
                    </label>
                    <input
                      type="text"
                      value={settings.pixKey || ''}
                      onChange={e => setSettings({ ...settings, pixKey: e.target.value })}
                      placeholder="Ex: 48.912.340/0001-90 ou seu e-mail / telefone"
                      className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                      Tipo da Chave PIX
                    </label>
                    <select
                      value={settings.pixKeyType || 'cnpj'}
                      onChange={e => setSettings({ ...settings, pixKeyType: e.target.value as any })}
                      className="w-full py-2.5 px-3 text-xs bg-zinc-800 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white font-semibold cursor-pointer"
                    >
                      <option value="cnpj">CNPJ</option>
                      <option value="cpf">CPF</option>
                      <option value="email">E-mail</option>
                      <option value="phone">Telefone / Celular</option>
                      <option value="random">Chave Aleatória (EVP)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                      Nome do Titular / Beneficiário da Conta
                    </label>
                    <input
                      type="text"
                      value={settings.pixBeneficiaryName || ''}
                      onChange={e => setSettings({ ...settings, pixBeneficiaryName: e.target.value })}
                      placeholder="Ex: LMEN SPORTS ARTIGOS ESPORTIVOS LTDA"
                      className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white uppercase text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                      Banco / Instituição de Destino
                    </label>
                    <input
                      type="text"
                      value={settings.bankName || ''}
                      onChange={e => setSettings({ ...settings, bankName: e.target.value })}
                      placeholder="Ex: Nubank, Mercado Pago PJ, Banco do Brasil"
                      className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    Cidade do Titular da Conta
                  </label>
                  <input
                    type="text"
                    value={settings.pixBeneficiaryCity || ''}
                    onChange={e => setSettings({ ...settings, pixBeneficiaryCity: e.target.value })}
                    placeholder="Ex: HUMAITA"
                    className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white uppercase text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-3 px-6 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Salvar Configurações
              </button>
            </form>
          )}

          {/* TAB 6: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-white" />
                    Imagens das Categorias
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    Substitua a imagem de capa de cada categoria da loja. As imagens aparecem no menu de navegação, na página inicial e no cabeçalho das páginas de categoria.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 border border-white/10">
                  {categories.length} Categorias cadastradas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {categories.map(cat => (
                  <div
                    key={cat.id || cat.slug}
                    className="group rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-white/30 transition-all flex flex-col shadow-lg"
                  >
                    {/* Category Image Stage */}
                    <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
                      <img
                        src={cat.image || DEFAULT_FALLBACK_IMAGE}
                        alt={cat.name}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase bg-black/70 px-2 py-0.5 rounded text-zinc-300 backdrop-blur-sm border border-white/10">
                          /{cat.slug}
                        </span>
                        <span className="text-[10px] font-bold bg-white text-black px-2 py-0.5 rounded shadow">
                          {cat.itemCount || 0} produtos
                        </span>
                      </div>
                    </div>

                    {/* Category Meta & Action */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-sm font-black uppercase text-white tracking-wide">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {cat.description || 'Equipamentos esportivos e produtos de alta performance.'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryImageInput(cat.image || '');
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Substituir Imagem
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: BANNERS & PAINEL INICIAL */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-white" />
                    Banners do Painel Inicial
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    Substitua as fotos de fundo, títulos, subtítulos e botões dos banners rotativos da página inicial (Hero Carousel).
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 border border-white/10">
                  {banners.length} Banners cadastrados
                </span>
              </div>

              <div className="space-y-6">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 p-5 space-y-4 shadow-xl"
                  >
                    {/* Live Banner Preview Card */}
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-[21/9] sm:aspect-[24/9] border border-white/10 flex items-center p-6 sm:p-10 text-white shadow-inner">
                      <img
                        src={banner.imageUrl || DEFAULT_FALLBACK_IMAGE}
                        alt={banner.title}
                        onError={handleImageError}
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                      <div className="relative z-10 max-w-md space-y-2">
                        {banner.badge && (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white text-black shadow">
                            {banner.badge}
                          </span>
                        )}
                        <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                          {banner.title}
                        </h4>
                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                          {banner.subtitle}
                        </p>
                        {banner.buttonText && (
                          <div className="pt-1">
                            <span className="inline-block py-1.5 px-4 rounded-lg bg-white text-black text-[11px] font-black uppercase tracking-wider">
                              {banner.buttonText}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Banner Info Bar & Edit Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white uppercase">
                          Banner #{index + 1}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            banner.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {banner.isActive ? 'Ativo na Loja' : 'Inativo'}
                        </span>
                        <span className="text-xs text-zinc-400">
                          Link do botão: <strong className="text-zinc-200">{banner.buttonLink || '/'}</strong>
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setEditingBanner(banner);
                          setBannerImageInput(banner.imageUrl || '');
                        }}
                        className="py-2.5 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Editar Foto & Textos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Edit / Create Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative w-full max-w-3xl bg-zinc-900 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10 sticky top-0 bg-zinc-900 z-20">
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-wide">
                  {editingProduct.id ? 'Editar Produto' : 'Cadastrar Novo Produto Esportivo'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Preencha os dados, defina o gênero, adicione as numerações/tamanhos, cores e fotos do produto.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* 1. INFORMAÇÕES BÁSICAS */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-zinc-400" />
                  1. Informações Básicas
                </h4>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tênis Nike Giannis Immortality 4, Camisa Flamengo 2026..."
                    value={editingProduct.name || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full py-2.5 px-3.5 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Categoria *
                    </label>
                    <select
                      value={editingProduct.categorySlug || 'tenis'}
                      onChange={e => {
                        const slug = e.target.value;
                        const match = STORE_CATEGORIES.find(c => c.slug === slug);
                        setEditingProduct({
                          ...editingProduct,
                          categorySlug: slug,
                          categoryName: match ? match.name : 'Geral',
                        });
                      }}
                      className="w-full py-2.5 px-3 text-xs bg-zinc-800 border border-white/15 rounded-xl focus:outline-none focus:border-white text-white cursor-pointer"
                    >
                      {STORE_CATEGORIES.map(cat => (
                        <option key={cat.slug} value={cat.slug} className="bg-zinc-900 text-white">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Marca *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: NIKE, ADIDAS, LMEN PRO..."
                      value={editingProduct.brand || 'LMEN PRO'}
                      onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value.toUpperCase() })}
                      className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Esporte Indicado *
                    </label>
                    <select
                      value={editingProduct.sport || 'Futebol'}
                      onChange={e => setEditingProduct({ ...editingProduct, sport: e.target.value as any })}
                      className="w-full py-2.5 px-3 text-xs bg-zinc-800 border border-white/15 rounded-xl focus:outline-none focus:border-white text-white cursor-pointer"
                    >
                      {SPORTS_OPTIONS.map(sp => (
                        <option key={sp} value={sp} className="bg-zinc-900 text-white">
                          {sp}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Brand Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Sugestões de marca:</span>
                  {['NIKE', 'ADIDAS', 'PUMA', 'LMEN PRO', 'MIZUNO', 'UMBRO', 'UNDER ARMOUR'].map(br => (
                    <button
                      key={br}
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, brand: br })}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        editingProduct.brand === br
                          ? 'border-white bg-white text-black font-black'
                          : 'border-white/10 text-zinc-400 hover:text-white hover:border-white/30 bg-white/5'
                      }`}
                    >
                      {br}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. GÊNERO DO PRODUTO (CAMPO OBRIGATÓRIO) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                    <span>2. Gênero do Produto</span>
                    <span className="text-[10px] text-amber-400 font-bold">* Obrigatório</span>
                  </label>
                  <span className="text-xs text-white font-bold bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/15">
                    Gênero atual: <strong>{editingProduct.gender || 'Unissex'}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {GENDER_OPTIONS.map(g => {
                    const isSelected = (editingProduct.gender || 'Unissex') === g;
                    const icons: Record<string, string> = {
                      Masculino: '👨',
                      Feminino: '👩',
                      Unissex: '⚡',
                      Infantil: '🧒',
                    };
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setEditingProduct({ ...editingProduct, gender: g });
                          showNotification(`Gênero definido: ${g}`);
                        }}
                        className={`py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-lg font-black scale-102 ring-2 ring-white/50'
                            : 'bg-zinc-800/80 text-zinc-300 border-white/10 hover:border-white/30 hover:bg-zinc-800'
                        }`}
                      >
                        <span className="text-xl">{icons[g]}</span>
                        <span className="text-xs font-bold uppercase tracking-wide">{g}</span>
                        {isSelected && (
                          <span className="text-[10px] font-black uppercase text-black flex items-center gap-0.5">
                            <Check className="w-3 h-3 text-black stroke-[3]" /> Selecionado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. PREÇOS */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white font-mono text-white text-base font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Preço Original &quot;De&quot; (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Opcional para mostrar desconto"
                    value={editingProduct.originalPrice || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white font-mono text-white text-base"
                  />
                </div>
              </div>

              {/* 4. QUANTIDADE DE TÊNIS EM ESTOQUE (CAMPO PRINCIPAL DE ESTOQUE) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-zinc-400" />
                      <span>4. Quantidade de Tênis em Estoque</span>
                      <span className="text-[10px] text-amber-400 font-bold">* Importante</span>
                    </label>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Defina a quantidade de pares de tênis disponíveis para venda nesta numeração ou no estoque geral.
                    </p>
                  </div>
                  <span className={`text-xs font-black px-3 py-1 rounded-lg border self-start sm:self-auto ${
                    (editingProduct.stock || 0) > 10
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                      : (editingProduct.stock || 0) > 0
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                  }`}>
                    Estoque Total: {editingProduct.stock || 0} pares
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Quantidade Geral & Botões Rápidos */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1.5">
                      Quantidade Total de Tênis (Pares Físicos) *
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = editingProduct.stock || 0;
                            const next = Math.max(0, cur - 5);
                            setEditingProduct({ ...editingProduct, stock: next });
                            distributeTotalStock(next);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs cursor-pointer"
                        >
                          -5
                        </button>
                        <input
                          type="number"
                          min="0"
                          required
                          value={editingProduct.stock ?? 50}
                          onChange={e => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            setEditingProduct({ ...editingProduct, stock: val });
                            distributeTotalStock(val);
                          }}
                          className="w-28 text-center py-1 px-2 text-base font-mono font-black bg-transparent text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = editingProduct.stock || 0;
                            const next = cur + 5;
                            setEditingProduct({ ...editingProduct, stock: next });
                            distributeTotalStock(next);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs cursor-pointer"
                        >
                          +5
                        </button>
                        <span className="text-xs text-zinc-400 font-bold pr-2">pares</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Atalhos rápidos:</span>
                        {[10, 25, 50, 100, 200].map(qty => (
                          <button
                            key={qty}
                            type="button"
                            onClick={() => {
                              setEditingProduct({ ...editingProduct, stock: qty });
                              distributeTotalStock(qty);
                            }}
                            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                              editingProduct.stock === qty
                                ? 'bg-white text-black border-white shadow-sm font-black'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-white/10'
                            }`}
                          >
                            {qty} pares
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Distribuição por Tamanho / Numeração */}
                  {editingProduct.availableSizes && editingProduct.availableSizes.length > 0 && (
                    <div className="pt-3 border-t border-white/10 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="block text-[11px] font-bold uppercase text-zinc-300">
                            Distribuição Individual por Numeração / Tamanho:
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            Ajuste a quantidade exata de pares disponíveis para cada número de calçado.
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAllSizesStock(10)}
                            className="py-1 px-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-300 border border-white/10 cursor-pointer"
                          >
                            10 pares p/ cada
                          </button>
                          <button
                            type="button"
                            onClick={() => setAllSizesStock(20)}
                            className="py-1 px-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-300 border border-white/10 cursor-pointer"
                          >
                            20 pares p/ cada
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                        {editingProduct.availableSizes.map(sz => {
                          const qty = sizeStockMap[sz] !== undefined ? sizeStockMap[sz] : 10;
                          return (
                            <div
                              key={sz}
                              className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center gap-1.5 hover:border-white/20 transition-colors"
                            >
                              <span className="text-xs font-black text-white">
                                {sz}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => updateSizeStock(sz, Math.max(0, qty - 1))}
                                  className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={qty}
                                  onChange={e => updateSizeStock(sz, parseInt(e.target.value) || 0)}
                                  className="w-10 text-center py-0.5 text-xs font-mono font-bold bg-zinc-900 border border-white/15 rounded text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateSizeStock(sz, qty + 1)}
                                  className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-[9px] text-zinc-400 font-medium">pares</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. NUMERAÇÕES E TAMANHOS (CAMPO OBRIGATÓRIO) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-zinc-400" />
                      <span>5. Numerações e Tamanhos Disponíveis</span>
                    </label>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Adicione os tamanhos ou numerações que os clientes poderão escolher ao comprar.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-white bg-zinc-800 px-2.5 py-1 rounded-lg border border-white/10 self-start sm:self-auto">
                    {editingProduct.availableSizes?.length || 0} tamanho(s) ativo(s)
                  </span>
                </div>

                {/* Presets de 1 Clique */}
                <div>
                  <span className="block text-[10px] font-bold uppercase text-zinc-400 mb-1.5">
                    Preencher em 1 clique:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applySizePreset(['37', '38', '39', '40', '41', '42', '43', '44'])}
                      className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-white/15 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>👟 Tênis / Calçados: 37 a 44</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset(['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'])}
                      className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-white/15 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>👟 Tênis Completo: 34 a 45</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset(['P', 'M', 'G', 'GG'])}
                      className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-white/15 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>👕 Roupas: P a GG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset(['PP', 'P', 'M', 'G', 'GG', 'XG'])}
                      className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-white/15 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>👕 Roupas: PP a XG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset(['28', '30', '32', '34', '36'])}
                      className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-white/15 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>🧒 Infantil: 28 a 36</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset(['Único'])}
                      className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-white/15 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>🧢 Tamanho Único</span>
                    </button>
                  </div>
                </div>

                {/* Chips rápidos para ligar/desligar */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">
                    Clique nas numerações para ativar/desativar:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[...FOOTWEAR_SIZES, ...APPAREL_SIZES, 'Único'].map(sz => {
                      const isIncluded = (editingProduct.availableSizes || []).includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => toggleSize(sz)}
                          className={`min-w-[36px] h-8 px-2.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                            isIncluded
                              ? 'bg-white text-black border-white shadow-sm ring-1 ring-white'
                              : 'bg-zinc-900 text-zinc-400 border-white/10 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Campo para Adicionar Numeração Customizada */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar outro tamanho (ex: 39.5, 42.5, G1, Tam. Especial)..."
                    value={customSizeInput}
                    onChange={e => setCustomSizeInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSize();
                      }
                    }}
                    className="flex-1 py-2 px-3 text-xs bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomSize()}
                    className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {/* Lista de Tamanhos Ativos */}
                <div className="space-y-1.5 pt-1">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">
                    Tamanhos ativos para este produto ({editingProduct.availableSizes?.length || 0}):
                  </span>
                  {(!editingProduct.availableSizes || editingProduct.availableSizes.length === 0) ? (
                    <p className="text-xs text-amber-400 font-bold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                      ⚠️ Nenhum tamanho adicionado ainda. Escolha um dos botões de preenchimento rápido acima ou clique nos números.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {editingProduct.availableSizes.map(size => (
                        <span
                          key={size}
                          className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-zinc-800 border border-white/20 text-xs font-black text-white"
                        >
                          <span>{size}</span>
                          <button
                            type="button"
                            onClick={() => removeSize(size)}
                            className="text-zinc-400 hover:text-rose-400 cursor-pointer"
                            title="Remover tamanho"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 6. CORES DO PRODUTO (CAMPO OBRIGATÓRIO) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-zinc-400" />
                      <span>6. Cores do Produto</span>
                    </label>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Adicione as opções de cores que o cliente poderá escolher na loja.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-white bg-zinc-800 px-2.5 py-1 rounded-lg border border-white/10 self-start sm:self-auto">
                    {editingProduct.availableColors?.length || 0} cor(es) ativa(s)
                  </span>
                </div>

                {/* Paleta Rápida */}
                <div>
                  <span className="block text-[10px] font-bold uppercase text-zinc-400 mb-1.5">
                    Cores rápidas (clique para adicionar):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_COLORS.map(col => {
                      const isAdded = (editingProduct.availableColors || []).some(
                        c => c.name.toLowerCase() === col.name.toLowerCase()
                      );
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => {
                            if (isAdded) {
                              removeColor(col.name);
                            } else {
                              addPresetColor(col.name, col.hex);
                            }
                          }}
                          className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-white text-black border-white shadow-sm ring-1 ring-white font-black'
                              : 'bg-zinc-800/80 text-zinc-300 border-white/10 hover:border-white/30 hover:bg-zinc-800'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/40 shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name}</span>
                          {isAdded && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Criador de Cor Personalizada */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">
                    Ou adicione uma cor personalizada com tom exato:
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Nome da cor (ex: Preto / Dourado, Verde Fluorescente, Cinza Chumbo)..."
                      value={customColorName}
                      onChange={e => setCustomColorName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomColor();
                        }
                      }}
                      className="flex-1 py-2 px-3 text-xs bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase">Tom:</label>
                        <input
                          type="color"
                          value={customColorHex}
                          onChange={e => setCustomColorHex(e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                          title="Escolher tom exato da cor"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddCustomColor()}
                        className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Cor</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de Cores Ativas */}
                <div className="space-y-1.5 pt-1">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">
                    Cores ativas para este produto ({editingProduct.availableColors?.length || 0}):
                  </span>
                  {(!editingProduct.availableColors || editingProduct.availableColors.length === 0) ? (
                    <p className="text-xs text-amber-400 font-bold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                      ⚠️ Nenhuma cor adicionada ainda. Clique em uma das cores rápidas acima.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {editingProduct.availableColors.map(c => (
                        <span
                          key={c.name}
                          className="inline-flex items-center gap-2 py-1 px-3 rounded-xl bg-zinc-800 border border-white/15 text-xs font-bold text-white shadow-sm"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => removeColor(c.name)}
                            className="text-zinc-400 hover:text-rose-400 cursor-pointer ml-1"
                            title="Remover cor"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 7. FOTOS DO PRODUTO (MAIS DE UMA FOTO COM GALERIA COMPLETA) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-zinc-400" />
                      <span>7. Fotos do Produto (Galeria de Imagens)</span>
                    </label>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Adicione mais de uma foto (ângulos diferentes, solado, detalhes). A foto #1 será a capa principal da loja.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-zinc-800 px-2.5 py-1 rounded-lg border border-white/10">
                      {editingProduct.images?.length || 0} foto(s) cadastrada(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowImageGuide(!showImageGuide)}
                      className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Dicas de foto</span>
                    </button>
                  </div>
                </div>

                {/* Guia de Ajuda para Imagens */}
                {showImageGuide && (
                  <div className="p-3.5 rounded-xl bg-zinc-800/90 border border-white/15 text-xs text-zinc-300 space-y-2 animate-in fade-in">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-zinc-300" />
                      Como conseguir a imagem perfeita para o produto:
                    </p>
                    <div className="space-y-1.5 text-[11px] text-zinc-300">
                      <p>
                        <strong>1. Modo mais fácil (Recomendado):</strong> Salve as fotos no seu computador ou celular (do fornecedor, WhatsApp ou câmera) e envie na aba <strong>&quot;Enviar do Aparelho&quot;</strong>. Você pode selecionar várias fotos de uma só vez!
                      </p>
                      <p>
                        <strong>2. Se for pegar no Google / Internet:</strong> Não copie a barra de endereço da página. Clique com o <strong>botão direito em cima da foto</strong> e selecione <strong>&quot;Copiar endereço da imagem&quot;</strong> (no celular, pressione e segure na imagem &gt; &quot;Copiar link da imagem&quot;).
                      </p>
                      <p>
                        <strong>3. Múltiplas fotos:</strong> Recomendamos colocar de 2 a 4 fotos: foto de frente, de lado, do solado e com detalhes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Abas para Adicionar Fotos */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      imageTab === 'upload'
                        ? 'bg-white text-black shadow-sm font-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Enviar do Aparelho (PC ou Celular)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      imageTab === 'url'
                        ? 'bg-white text-black shadow-sm font-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Colar Link Web</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('presets')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      imageTab === 'presets'
                        ? 'bg-white text-black shadow-sm font-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Fotos Prontas</span>
                  </button>
                </div>

                {/* Aba 1: Enviar do Aparelho */}
                {imageTab === 'upload' && (
                  <div className="space-y-2">
                    <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all group">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform shadow-lg">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-white text-center">
                        {imageUploadLoading
                          ? 'Processando e enviando fotos...'
                          : 'Clique aqui para selecionar uma ou várias fotos do computador ou celular'}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Você pode selecionar múltiplos arquivos (JPG, PNG, WEBP, JFIF) simultaneamente.
                      </p>
                    </label>
                  </div>
                )}

                {/* Aba 2: Colar Link Web */}
                {imageTab === 'url' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Cole aqui o link direto da foto (ex: https://...imagem.jpg)"
                        value={imageUrlInput}
                        onChange={e => setImageUrlInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageLink();
                          }
                        }}
                        className="flex-1 py-2.5 px-3 text-xs bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageLink}
                        className="py-2.5 px-4 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase rounded-xl cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Foto</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Aba 3: Fotos Prontas */}
                {imageTab === 'presets' && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-400">
                      Clique em qualquer uma das fotos profissionais abaixo para adicioná-la à galeria do produto:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                      {SPORTS_IMAGE_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddPresetImage(preset.url, preset.name)}
                          className="flex flex-col items-center p-2 rounded-xl border border-white/10 hover:border-white/30 bg-zinc-800/50 hover:bg-zinc-800 transition-all cursor-pointer text-center group"
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-16 h-16 rounded-lg object-cover mb-1.5 group-hover:scale-105 transition-transform"
                          />
                          <span className="text-[10px] font-bold text-zinc-300 truncate w-full">
                            {preset.name}
                          </span>
                          <span className="text-[9px] text-zinc-400 mt-0.5">+ Adicionar</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* GALERIA VISUAL DE TODAS AS FOTOS ADICIONADAS */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                      Galeria de Fotos Cadastradas ({editingProduct.images?.length || 0}):
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      A primeira foto será a capa da loja
                    </span>
                  </div>

                  {(!editingProduct.images || editingProduct.images.length === 0) ? (
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
                      <Camera className="w-8 h-8 text-zinc-600 mx-auto" />
                      <p className="text-xs font-bold text-amber-300">
                        Nenhuma foto adicionada para este produto.
                      </p>
                      <p className="text-[11px] text-zinc-400 max-w-md mx-auto">
                        Selecione suas fotos na aba &quot;Enviar do Aparelho&quot; acima ou cole um link web para que os clientes possam ver o produto na loja.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {editingProduct.images.map((imgUrl, idx) => {
                        const isPrimary = idx === 0;
                        return (
                          <div
                            key={idx}
                            className={`relative rounded-2xl overflow-hidden border transition-all bg-black/60 flex flex-col ${
                              isPrimary
                                ? 'border-white ring-2 ring-white/50 shadow-lg'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            {/* Image Thumbnail */}
                            <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                              <img
                                src={imgUrl}
                                alt={`Foto ${idx + 1}`}
                                onError={handleImageError}
                                className="w-full h-full object-cover"
                              />

                              {/* Primary badge */}
                              {isPrimary ? (
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white text-black text-[9px] font-black uppercase tracking-wider shadow-md">
                                  ★ Capa Principal
                                </span>
                              ) : (
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-bold border border-white/20">
                                  Foto #{idx + 1}
                                </span>
                              )}

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-rose-900 text-white transition-colors cursor-pointer border border-white/20"
                                title="Remover esta foto"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-zinc-200" />
                              </button>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-2 bg-zinc-900/90 border-t border-white/5 flex items-center justify-between text-[10px]">
                              {isPrimary ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Foto Principal
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  className="w-full py-1 px-2 rounded-lg bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>Tornar Principal</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 8. DESCRIÇÃO DO PRODUTO */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  8. Descrição e Detalhes
                </h4>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Resumo Curto
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tênis esportivo com amortecimento responsivo e cabedal respirável..."
                    value={editingProduct.shortDescription || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                    className="w-full py-2 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Descrição Completa
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detalhes sobre a tecnologia, materiais, indicação de uso e benefícios..."
                    value={editingProduct.description || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full py-2 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                  />
                </div>
              </div>

              {/* BARRINHA DE BOTÕES DE AÇÃO */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 sticky bottom-0 bg-zinc-900 py-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="py-2.5 px-5 text-xs font-bold text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-3 px-8 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer hover:scale-102 active:scale-98"
                >
                  Salvar Produto no Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE PRODUTO */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl text-white space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirmar Exclusão</h3>
                <p className="text-xs text-zinc-400">Esta ação é irreversível e removerá o produto da loja.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <img
                src={productToDelete.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
                alt={productToDelete.name}
                className="w-12 h-12 rounded-lg object-cover bg-black/40 border border-white/10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">{productToDelete.name}</h4>
                <p className="text-[11px] text-zinc-400">
                  SKU: <span className="font-mono text-zinc-300">{productToDelete.sku}</span> • R$ {productToDelete.price.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase mt-0.5">
                  {productToDelete.gender} • {productToDelete.stock || 0} pares em estoque
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="py-2.5 px-4 text-xs font-bold text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmProductDeletion}
                disabled={isDeleting}
                className="py-2.5 px-5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Produto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Image Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setEditingCategory(null)} />
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-wide flex items-center gap-2">
                  <Camera className="w-4 h-4 text-white" />
                  Substituir Imagem da Categoria: {editingCategory.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Slug: <span className="font-mono text-zinc-200">/{editingCategory.slug}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Image Preview */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                Pré-visualização da Capa
              </label>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner">
                <img
                  src={categoryImageInput.trim() || editingCategory.image || DEFAULT_FALLBACK_IMAGE}
                  alt={editingCategory.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div className="text-white">
                    <span className="text-xs font-black uppercase tracking-wider block">
                      {editingCategory.name}
                    </span>
                    <span className="text-[11px] text-zinc-300">
                      {editingCategory.description}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Option 1: Direct File Upload */}
            <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-white" />
                Opção 1: Enviar Foto do seu Computador
              </span>
              <p className="text-[11px] text-zinc-400">
                Selecione uma imagem (.jpg, .jpeg, .png, .webp). Ela será comprimida e salva automaticamente.
              </p>
              <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold text-white">
                <Upload className="w-4 h-4" />
                <span>
                  {isCategoryUploadLoading ? 'Enviando imagem...' : 'Escolher Arquivo do Computador'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryFileUpload}
                  disabled={isCategoryUploadLoading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Option 2: Image URL input */}
            <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-white" />
                Opção 2: Inserir Link Direto da Imagem (URL)
              </span>
              <input
                type="text"
                placeholder="https://exemplo.com/minha-imagem.jpg"
                value={categoryImageInput}
                onChange={e => setCategoryImageInput(e.target.value)}
                className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white font-mono"
              />
            </div>

            {/* Option 3: Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Ou escolha uma foto de alta definição do acervo esportivo:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {SPORTS_IMAGE_PRESETS.map(preset => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setCategoryImageInput(preset.url)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-left transition-all cursor-pointer group"
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="py-2.5 px-4 text-xs font-bold text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                disabled={isSavingCategory}
                className="py-2.5 px-6 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isSavingCategory ? 'Salvando...' : 'Salvar Nova Imagem'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Edit Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setEditingBanner(null)} />
          <div className="relative w-full max-w-3xl bg-zinc-900 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  Editar Banner do Painel Inicial
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Altere a foto de fundo, chamada promocional, textos e links do banner.
                </p>
              </div>
              <button
                onClick={() => setEditingBanner(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Banner Preview */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                Pré-visualização do Banner
              </label>
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[21/9] sm:aspect-[24/9] border border-white/10 flex items-center p-6 sm:p-8 text-white shadow-inner">
                <img
                  src={bannerImageInput.trim() || editingBanner.imageUrl || DEFAULT_FALLBACK_IMAGE}
                  alt={editingBanner.title}
                  onError={handleImageError}
                  className="absolute inset-0 w-full h-full object-cover opacity-65"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                <div className="relative z-10 max-w-md space-y-2">
                  {editingBanner.badge && (
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white text-black shadow">
                      {editingBanner.badge}
                    </span>
                  )}
                  <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                    {editingBanner.title || 'Título do Banner'}
                  </h4>
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {editingBanner.subtitle || 'Subtítulo do banner promocional.'}
                  </p>
                  {editingBanner.buttonText && (
                    <div className="pt-1">
                      <span className="inline-block py-1.5 px-4 rounded-lg bg-white text-black text-[11px] font-black uppercase tracking-wider">
                        {editingBanner.buttonText}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Image Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-white" />
                  Enviar Foto do Computador
                </span>
                <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold text-white">
                  <Upload className="w-4 h-4" />
                  <span>
                    {isBannerUploadLoading ? 'Enviando...' : 'Escolher Arquivo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileUpload}
                    disabled={isBannerUploadLoading}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-white" />
                  Link Direto da Foto (URL)
                </span>
                <input
                  type="text"
                  placeholder="https://exemplo.com/banner.jpg"
                  value={bannerImageInput}
                  onChange={e => setBannerImageInput(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white font-mono"
                />
              </div>
            </div>

            {/* Banner Text Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Título Principal
                </label>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={e => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full py-2 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Tagline / Linha Superior
                </label>
                <input
                  type="text"
                  value={editingBanner.tagline || ''}
                  onChange={e => setEditingBanner({ ...editingBanner, tagline: e.target.value })}
                  placeholder="COLEÇÃO OFICIAL 2026"
                  className="w-full py-2 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Subtítulo / Descrição
                </label>
                <input
                  type="text"
                  value={editingBanner.subtitle || ''}
                  onChange={e => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full py-2 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Selo de Destaque (Badge)
                </label>
                <input
                  type="text"
                  value={editingBanner.badge || ''}
                  onChange={e => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                  placeholder="LANÇAMENTO EXCLUSIVO"
                  className="w-full py-2 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={editingBanner.buttonText || ''}
                  onChange={e => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                  placeholder="COMPRAR AGORA"
                  className="w-full py-2 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Link de Redirecionamento
                </label>
                <input
                  type="text"
                  value={editingBanner.buttonLink || ''}
                  onChange={e => setEditingBanner({ ...editingBanner, buttonLink: e.target.value })}
                  placeholder="/categoria/chuteiras"
                  className="w-full py-2 px-3 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBanner.isActive}
                    onChange={e => setEditingBanner({ ...editingBanner, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 accent-white cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white">Banner Ativo na Loja</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="py-2.5 px-4 text-xs font-bold text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveBanner}
                disabled={isSavingBanner}
                className="py-2.5 px-6 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isSavingBanner ? 'Salvando...' : 'Salvar Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
