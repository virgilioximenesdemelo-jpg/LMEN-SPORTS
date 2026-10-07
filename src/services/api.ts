import { Product, Category, HeroBanner, StoreSettings, Coupon, Order, ShippingOption, ProductReview } from '../types';

const API_BASE = '/api';

export const api = {
  // Products
  async getProducts(params: {
    category?: string;
    search?: string;
    brand?: string;
    gender?: string;
    sport?: string;
    minPrice?: number;
    maxPrice?: number;
    onSale?: boolean;
    featured?: boolean;
    bestSeller?: boolean;
    newArrival?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.brand) query.set('brand', params.brand);
    if (params.gender) query.set('gender', params.gender);
    if (params.sport) query.set('sport', params.sport);
    if (params.minPrice) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice) query.set('maxPrice', String(params.maxPrice));
    if (params.onSale) query.set('onSale', 'true');
    if (params.featured) query.set('featured', 'true');
    if (params.bestSeller) query.set('bestSeller', 'true');
    if (params.newArrival) query.set('newArrival', 'true');
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Falha ao buscar produtos');
    return res.json() as Promise<{
      products: Product[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>;
  },

  async getProduct(slugOrId: string) {
    const res = await fetch(`${API_BASE}/products/${slugOrId}`);
    if (!res.ok) throw new Error('Produto não encontrado');
    return res.json() as Promise<{ product: Product; reviews: ProductReview[]; related: Product[] }>;
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Falha ao buscar categorias');
    return res.json() as Promise<Category[]>;
  },

  // Banners
  async getBanners() {
    const res = await fetch(`${API_BASE}/banners`);
    if (!res.ok) throw new Error('Falha ao buscar banners');
    return res.json() as Promise<HeroBanner[]>;
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Falha ao buscar configurações');
    return res.json() as Promise<StoreSettings>;
  },

  // Shipping
  async calculateShipping(cep: string, subtotal: number) {
    const res = await fetch(`${API_BASE}/shipping/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cep, subtotal }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao calcular frete');
    }
    return res.json() as Promise<{
      cep: string;
      options: ShippingOption[];
      freeShippingThreshold: number;
      isFreeEligible: boolean;
    }>;
  },

  // Coupons
  async validateCoupon(code: string, subtotal: number) {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Cupom inválido');
    }
    return res.json() as Promise<{
      valid: boolean;
      code: string;
      type: 'percent' | 'fixed';
      discount: number;
      description: string;
    }>;
  },

  // Orders
  async createOrder(orderData: any) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao processar pedido');
    }
    return res.json() as Promise<Order>;
  },

  async getOrder(idOrNumber: string) {
    const res = await fetch(`${API_BASE}/orders/${idOrNumber}`);
    if (!res.ok) throw new Error('Pedido não encontrado');
    return res.json() as Promise<Order>;
  },

  async confirmPixPayment(orderId: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/confirm-payment`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Falha ao confirmar PIX');
    return res.json() as Promise<Order>;
  },

  // Reviews
  async submitReview(data: { productId: string; author: string; rating: number; title: string; comment: string }) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao salvar avaliação');
    return res.json() as Promise<ProductReview>;
  },

  // Newsletter
  async subscribeNewsletter(email: string) {
    const res = await fetch(`${API_BASE}/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  // Admin
  async adminLogin(email: string, pass: string) {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login não autorizado');
    }
    return res.json() as Promise<{ token: string; user: { name: string; email: string; role: string } }>;
  },

  async getAdminDashboard() {
    const res = await fetch(`${API_BASE}/admin/dashboard`);
    if (!res.ok) throw new Error('Falha ao carregar dashboard');
    return res.json();
  },

  async getAdminOrders() {
    const res = await fetch(`${API_BASE}/admin/orders`);
    return res.json() as Promise<Order[]>;
  },

  async updateOrderStatus(orderId: string, status: string, description?: string) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, description }),
    });
    return res.json() as Promise<Order>;
  },

  async saveAdminProduct(productData: Partial<Product>, isEditing: boolean) {
    const url = isEditing ? `${API_BASE}/admin/products/${productData.id}` : `${API_BASE}/admin/products`;
    const method = isEditing ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async deleteAdminProduct(productId: string) {
    const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async updateAdminSettings(settings: Partial<StoreSettings>) {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Admin Banners
  async getAdminBanners() {
    const res = await fetch(`${API_BASE}/admin/banners`);
    if (!res.ok) throw new Error('Falha ao buscar banners');
    return res.json() as Promise<HeroBanner[]>;
  },

  async updateBanners(banners: HeroBanner[]) {
    const res = await fetch(`${API_BASE}/admin/banners`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(banners),
    });
    if (!res.ok) throw new Error('Falha ao atualizar banners');
    return res.json() as Promise<HeroBanner[]>;
  },

  async updateBanner(id: string, bannerData: Partial<HeroBanner>) {
    const res = await fetch(`${API_BASE}/admin/banners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bannerData),
    });
    if (!res.ok) throw new Error('Falha ao atualizar banner');
    return res.json() as Promise<HeroBanner>;
  },

  // Admin Categories
  async getAdminCategories() {
    const res = await fetch(`${API_BASE}/admin/categories`);
    if (!res.ok) throw new Error('Falha ao buscar categorias');
    return res.json() as Promise<Category[]>;
  },

  async updateCategories(categories: Category[]) {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories),
    });
    if (!res.ok) throw new Error('Falha ao atualizar categorias');
    return res.json() as Promise<Category[]>;
  },

  async updateCategory(id: string, categoryData: Partial<Category>) {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    if (!res.ok) throw new Error('Falha ao atualizar categoria');
    return res.json() as Promise<Category>;
  },

  async uploadImage(base64OrDataUrl: string, name?: string): Promise<{ url: string }> {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64OrDataUrl, name }),
    });
    if (!res.ok) throw new Error('Falha no upload da imagem');
    return res.json();
  },
};
