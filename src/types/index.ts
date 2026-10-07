export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex?: string;
  stock: number;
  price?: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  isVerified: boolean;
  date: string;
  helpfulCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  cost?: number;
  categorySlug: string;
  categoryName: string;
  brand: string;
  gender: 'Masculino' | 'Feminino' | 'Unissex' | 'Infantil';
  sport: 'Futebol' | 'Society' | 'Corrida' | 'Treino' | 'Casual' | 'Basquete';
  images: string[];
  variants: ProductVariant[];
  availableSizes: string[];
  availableColors: { name: string; hex: string }[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isOnSale?: boolean;
  salesCount: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  status: 'active' | 'draft' | 'out_of_stock';
  stock?: number;
  weightKg?: number;
  composition?: string;
  careInstructions?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  iconName: string;
  itemCount: number;
  isFeatured?: boolean;
  order: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  price: number;
  originalPrice?: number;
  size: string;
  color: string;
  quantity: number;
  maxStock: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  carrier: string;
  price: number;
  daysMin: number;
  daysMax: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minValue: number;
  maxDiscount?: number;
  description: string;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  cpf: string;
  phone: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string; // e.g. #LM10258
  createdAt: string;
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  shippingOption: ShippingOption;
  paymentMethod: 'pix' | 'credit_card' | 'debit_card';
  paymentDetails: {
    pixCode?: string;
    pixKey?: string;
    pixBeneficiary?: string;
    pixQrCodeUrl?: string;
    pixExpiresAt?: string;
    cardLast4?: string;
    cardBrand?: string;
    installments?: number;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    description: string;
  }[];
  trackingCode?: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  badge?: string;
  isActive: boolean;
  order: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  freeShippingThreshold: number;
  pixDiscountPercent: number;
  whatsappNumber: string;
  supportEmail: string;
  instagramHandle: string;
  instagramUrl?: string;
  themeDefault: 'dark' | 'light';
  address: string;
  cnpj: string;
  // Conta de Recebimento das Vendas:
  pixKey?: string;
  pixKeyType?: 'cnpj' | 'cpf' | 'email' | 'phone' | 'random';
  pixBeneficiaryName?: string;
  pixBeneficiaryCity?: string;
  bankName?: string;
}

export interface FilterState {
  category?: string;
  search?: string;
  brand?: string[];
  sizes?: string[];
  colors?: string[];
  priceRange?: [number, number];
  gender?: string;
  sport?: string;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  sortBy?: 'relevant' | 'best_seller' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
}
