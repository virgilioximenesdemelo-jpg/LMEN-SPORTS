import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
} from './src/data/initialData';
import { Product, ProductVariant, Order, StoreSettings, Coupon, ProductReview, Category, HeroBanner } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory Database with JSON Persistence
interface DatabaseState {
  products: Product[];
  categories: Category[];
  banners: HeroBanner[];
  settings: StoreSettings;
  coupons: Coupon[];
  reviews: ProductReview[];
  orders: Order[];
  newsletter: { email: string; createdAt: string }[];
  customers: {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    createdAt: string;
    ordersCount: number;
    totalSpent: number;
  }[];
}

// Initial default seed orders
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-10257',
    orderNumber: '#LM10257',
    createdAt: '2026-03-01T14:22:00Z',
    customer: {
      name: 'Lucas Ferreira',
      email: 'lucas.ferreira@email.com',
      cpf: '345.987.123-09',
      phone: '(11) 98765-4321',
    },
    shippingAddress: {
      cep: '01310-100',
      street: 'Avenida Paulista',
      number: '1200',
      complement: 'Apt 42',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
    shippingOption: {
      id: 'sedex',
      name: 'SEDEX Expresso',
      carrier: 'Correios',
      price: 18.9,
      daysMin: 1,
      daysMax: 2,
    },
    paymentMethod: 'pix',
    paymentDetails: {
      pixCode: '00020126580014br.gov.bcb.pix0136lmensports-pix-key-fictitious5204000053039865406189.905802BR5911LMEN SPORTS6009SAO PAULO62070503***6304E8A2',
    },
    items: [
      {
        productId: 'prod-01',
        name: 'Camisa LMEN Pro Match Performance',
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop',
        size: 'G',
        color: 'Preto Carbono',
        price: 189.9,
        quantity: 1,
        subtotal: 189.9,
      },
    ],
    subtotal: 189.9,
    shippingCost: 18.9,
    discount: 18.99,
    couponCode: 'LMEN10',
    total: 189.81,
    status: 'in_transit',
    statusHistory: [
      { status: 'pending_payment', timestamp: '2026-03-01T14:22:00Z', description: 'Pedido realizado aguardando PIX' },
      { status: 'paid', timestamp: '2026-03-01T14:24:00Z', description: 'Pagamento PIX confirmado instantaneamente' },
      { status: 'preparing', timestamp: '2026-03-01T16:00:00Z', description: 'Separado e embalado no centro de distribuição LMEN' },
      { status: 'shipped', timestamp: '2026-03-02T09:30:00Z', description: 'Coletado pela transportadora' },
      { status: 'in_transit', timestamp: '2026-03-03T11:00:00Z', description: 'Objeto em transferência para a unidade de distribuição local' },
    ],
    trackingCode: 'LM982736412BR',
  },
];

const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@email.com',
    phone: '(11) 98765-4321',
    cpf: '345.987.123-09',
    createdAt: '2026-02-15T10:00:00Z',
    ordersCount: 3,
    totalSpent: 842.5,
  },
  {
    id: 'cust-2',
    name: 'Matheus Henrique',
    email: 'matheus.h@email.com',
    phone: '(21) 99881-2233',
    cpf: '219.876.543-11',
    createdAt: '2026-02-20T12:00:00Z',
    ordersCount: 2,
    totalSpent: 579.8,
  },
  {
    id: 'cust-3',
    name: 'Gabriel Fontana',
    email: 'fontana.gabriel@email.com',
    phone: '(31) 97722-1144',
    cpf: '109.876.332-90',
    createdAt: '2026-03-01T09:00:00Z',
    ordersCount: 1,
    totalSpent: 279.9,
  },
];

let db: DatabaseState = {
  products: INITIAL_PRODUCTS,
  categories: INITIAL_CATEGORIES,
  banners: INITIAL_BANNERS,
  settings: INITIAL_SETTINGS,
  coupons: INITIAL_COUPONS,
  reviews: INITIAL_REVIEWS,
  orders: INITIAL_ORDERS,
  newsletter: [],
  customers: INITIAL_CUSTOMERS,
};

// Load database if exists
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(raw);
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
} catch (e) {
  console.error('Error loading db file, using default memory state', e);
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to persist database.json', err);
  }
}

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure public/uploads directory exists
const UPLOADS_DIR = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded images with exact MIME types and cross-origin headers for iframe previews
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const ext = path.extname(req.path).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.avif': 'image/avif',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.jfif': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  if (mimeTypes[ext]) {
    res.type(mimeTypes[ext]);
  }
  next();
}, express.static(UPLOADS_DIR));

// Image upload API (accepts base64 data URL and writes to public/uploads storage)
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    if (typeof image === 'string' && image.startsWith('data:image')) {
      const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches) {
        return res.json({ url: image });
      }
      let rawExt = matches[1].toLowerCase().replace('jpeg', 'jpg');
      if (rawExt.includes('svg')) rawExt = 'svg';
      const ext = ['jpg', 'png', 'webp', 'gif', 'avif', 'svg'].includes(rawExt) ? rawExt : 'jpg';
      const base64Data = matches[2];
      const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      return res.json({ url: `/uploads/${filename}` });
    }

    // Direct URL or already uploaded path
    return res.json({ url: image });
  } catch (err: any) {
    console.error('Error in /api/upload:', err);
    return res.status(500).json({ error: 'Erro ao processar imagem' });
  }
});

// API ROUTES
// 1. Products
app.get('/api/products', (req: Request, res: Response) => {
  const {
    category,
    search,
    brand,
    gender,
    sport,
    minPrice,
    maxPrice,
    onSale,
    featured,
    bestSeller,
    newArrival,
    sort,
    page = '1',
    limit = '24',
  } = req.query;

  let results = [...db.products].filter(p => p.status !== 'draft');

  if (category && typeof category === 'string' && category !== 'todos' && category !== 'todas') {
    results = results.filter(p => p.categorySlug === category || p.categorySlug.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    results = results.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (brand && typeof brand === 'string') {
    const brands = brand.split(',');
    results = results.filter(p => brands.includes(p.brand));
  }

  if (gender && typeof gender === 'string') {
    results = results.filter(p => p.gender.toLowerCase() === gender.toLowerCase());
  }

  if (sport && typeof sport === 'string') {
    results = results.filter(p => p.sport.toLowerCase() === sport.toLowerCase());
  }

  if (minPrice) {
    results = results.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    results = results.filter(p => p.price <= Number(maxPrice));
  }

  if (onSale === 'true') {
    results = results.filter(p => p.isOnSale || (p.discountPercentage && p.discountPercentage > 0));
  }

  if (featured === 'true') {
    results = results.filter(p => p.isFeatured);
  }

  if (bestSeller === 'true') {
    results = results.filter(p => p.isBestSeller);
  }

  if (newArrival === 'true') {
    results = results.filter(p => p.isNewArrival);
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'best_seller':
      results.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    default:
      // Relevant (featured first then sales)
      results.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || (b.salesCount || 0) - (a.salesCount || 0));
  }

  const total = results.length;
  const p = Math.max(1, Number(page));
  const l = Math.max(1, Number(limit));
  const startIndex = (p - 1) * l;
  const paginated = results.slice(startIndex, startIndex + l);

  res.json({
    products: paginated,
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
  });
});

app.get('/api/products/:slugOrId', (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const product = db.products.find(p => p.slug === slugOrId || p.id === slugOrId);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  const reviews = db.reviews.filter(r => r.productId === product.id);
  const related = db.products
    .filter(p => p.id !== product.id && (p.categorySlug === product.categorySlug || p.sport === product.sport))
    .slice(0, 4);

  res.json({ product, reviews, related });
});

// 2. Categories
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(db.categories);
});

// 3. Banners
app.get('/api/banners', (_req: Request, res: Response) => {
  res.json(db.banners.filter(b => b.isActive).sort((a, b) => a.order - b.order));
});

// 4. Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.settings);
});

// 5. Shipping Calculation (CEP)
app.post('/api/shipping/calculate', (req: Request, res: Response) => {
  const { cep, subtotal = 0 } = req.body;
  if (!cep || typeof cep !== 'string') {
    return res.status(400).json({ error: 'CEP inválido' });
  }

  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) {
    return res.status(400).json({ error: 'CEP deve conter 8 dígitos' });
  }

  const isFreeEligible = Number(subtotal) >= (db.settings.freeShippingThreshold || 249.9);

  const options = [
    {
      id: 'pac',
      name: isFreeEligible ? 'PAC Econômico (Frete Grátis)' : 'PAC Econômico',
      carrier: 'Correios',
      price: isFreeEligible ? 0 : 19.9,
      daysMin: 4,
      daysMax: 7,
    },
    {
      id: 'sedex',
      name: 'SEDEX Expresso',
      carrier: 'Correios',
      price: isFreeEligible ? 12.9 : 29.9,
      daysMin: 1,
      daysMax: 3,
    },
    {
      id: 'express',
      name: 'LMEN Flash Entrega Rápida',
      carrier: 'Loggi / Jadlog',
      price: 34.9,
      daysMin: 1,
      daysMax: 2,
    },
  ];

  res.json({
    cep: cleanCep,
    options,
    freeShippingThreshold: db.settings.freeShippingThreshold,
    isFreeEligible,
  });
});

// 6. Validate Coupon
app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal = 0 } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Código de cupom obrigatório' });
  }

  const coupon = db.coupons.find(c => c.code.toUpperCase() === String(code).toUpperCase().trim() && c.isActive);

  if (!coupon) {
    return res.status(404).json({ error: 'Cupom inválido ou expirado' });
  }

  if (subtotal < coupon.minValue) {
    return res.status(400).json({
      error: `Cupom válido apenas para compras acima de R$ ${coupon.minValue.toFixed(2).replace('.', ',')}`,
    });
  }

  let discount = 0;
  if (coupon.type === 'percent') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.value;
  }

  discount = Math.min(discount, subtotal);

  res.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    discount: Number(discount.toFixed(2)),
    description: coupon.description,
  });
});

// 7. Orders
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, shippingAddress, shippingOption, paymentMethod, items, subtotal, shippingCost, discount, couponCode } = req.body;

  if (!customer || !shippingAddress || !items || !items.length) {
    return res.status(400).json({ error: 'Dados incompletos do pedido' });
  }

  const orderNumInt = 10258 + db.orders.length;
  const orderNumber = `#LM${orderNumInt}`;
  const total = Math.max(0, Number(subtotal) + Number(shippingCost) - Number(discount || 0));

  // Generate real dynamic PIX string linked to store settings receiver account
  const rawKey = db.settings.pixKey || '48.912.340/0001-90';
  const cleanPixKey = (db.settings.pixKeyType === 'cnpj' || db.settings.pixKeyType === 'cpf' || db.settings.pixKeyType === 'phone')
    ? rawKey.replace(/\D/g, '')
    : rawKey.trim();
  const beneficiaryName = (db.settings.pixBeneficiaryName || db.settings.storeName || 'LMEN SPORTS').toUpperCase().slice(0, 25);
  const beneficiaryCity = (db.settings.pixBeneficiaryCity || 'HUMAITA').toUpperCase().slice(0, 15);

  const keyField = `01${String(cleanPixKey.length).padStart(2, '0')}${cleanPixKey}`;
  const merchantAccountInfo = `0014br.gov.bcb.pix${keyField}`;
  const merchantAccountField = `26${String(merchantAccountInfo.length).padStart(2, '0')}${merchantAccountInfo}`;
  const nameField = `59${String(beneficiaryName.length).padStart(2, '0')}${beneficiaryName}`;
  const cityField = `60${String(beneficiaryCity.length).padStart(2, '0')}${beneficiaryCity}`;
  const txId = `ORDER${orderNumInt}`;
  const additionalData = `05${String(txId.length).padStart(2, '0')}${txId}`;
  const additionalField = `62${String(additionalData.length).padStart(2, '0')}${additionalData}`;
  const amountStr = total.toFixed(2);
  const amountField = `54${String(amountStr.length).padStart(2, '0')}${amountStr}`;

  const pixPayloadWithoutCrc = `000201${merchantAccountField}520400005303986${amountField}5802BR${nameField}${cityField}${additionalField}6304`;
  let crc = 0xFFFF;
  for (let i = 0; i < pixPayloadWithoutCrc.length; i++) {
    crc ^= pixPayloadWithoutCrc.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
  const pixCode = `${pixPayloadWithoutCrc}${crcHex}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    createdAt: new Date().toISOString(),
    customer,
    shippingAddress,
    shippingOption,
    paymentMethod,
    paymentDetails: {
      pixCode,
      pixKey: rawKey,
      pixBeneficiary: beneficiaryName,
      pixExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      cardLast4: paymentMethod === 'credit_card' ? '4242' : undefined,
      cardBrand: paymentMethod === 'credit_card' ? 'Mastercard' : undefined,
      installments: paymentMethod === 'credit_card' ? req.body.installments || 1 : undefined,
    },
    items,
    subtotal: Number(subtotal),
    shippingCost: Number(shippingCost),
    discount: Number(discount || 0),
    couponCode,
    total: Number(total.toFixed(2)),
    status: paymentMethod === 'pix' ? 'pending_payment' : 'paid',
    statusHistory: [
      {
        status: 'pending_payment',
        timestamp: new Date().toISOString(),
        description: 'Pedido gerado com sucesso.',
      },
    ],
    trackingCode: `LM${Math.floor(100000000 + Math.random() * 900000000)}BR`,
  };

  if (paymentMethod !== 'pix') {
    newOrder.statusHistory.push({
      status: 'paid',
      timestamp: new Date().toISOString(),
      description: 'Pagamento aprovado pela operadora de cartão.',
    });
  }

  db.orders.unshift(newOrder);

  // Update customer record
  let existingCust = db.customers.find(c => c.email.toLowerCase() === customer.email.toLowerCase());
  if (existingCust) {
    existingCust.ordersCount += 1;
    existingCust.totalSpent += total;
  } else {
    db.customers.push({
      id: `cust-${Date.now()}`,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      cpf: customer.cpf,
      createdAt: new Date().toISOString(),
      ordersCount: 1,
      totalSpent: total,
    });
  }

  // Update product sales & inventory
  for (const it of items) {
    const prod = db.products.find(p => p.id === it.productId);
    if (prod) {
      prod.salesCount = (prod.salesCount || 0) + it.quantity;
      const variant = prod.variants.find(v => v.size === it.size && v.color === it.color);
      if (variant) {
        variant.stock = Math.max(0, variant.stock - it.quantity);
      }
    }
  }

  saveDb();
  res.status(201).json(newOrder);
});

app.get('/api/orders/:idOrNumber', (req: Request, res: Response) => {
  const { idOrNumber } = req.params;
  const order = db.orders.find(
    o =>
      o.id === idOrNumber ||
      o.orderNumber.toLowerCase() === idOrNumber.toLowerCase() ||
      o.orderNumber.replace('#', '').toLowerCase() === idOrNumber.toLowerCase()
  );
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }
  res.json(order);
});

// Update order status (simulate instant PIX payment or admin transition)
app.post('/api/orders/:id/confirm-payment', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  if (order.status === 'pending_payment') {
    order.status = 'paid';
    order.statusHistory.push({
      status: 'paid',
      timestamp: new Date().toISOString(),
      description: 'Pagamento PIX confirmado com sucesso!',
    });
    saveDb();
  }
  res.json(order);
});

// 8. Reviews
app.post('/api/reviews', (req: Request, res: Response) => {
  const { productId, author, rating, title, comment } = req.body;
  if (!productId || !author || !rating || !comment) {
    return res.status(400).json({ error: 'Campos incompletos para avaliação' });
  }

  const newReview: ProductReview = {
    id: `rev-${Date.now()}`,
    productId,
    author,
    rating: Math.min(5, Math.max(1, Number(rating))),
    title: title || 'Excelente produto!',
    comment,
    isVerified: true,
    date: new Date().toISOString().split('T')[0],
    helpfulCount: 0,
  };

  db.reviews.unshift(newReview);

  // Update product rating
  const prod = db.products.find(p => p.id === productId);
  if (prod) {
    const allProdReviews = db.reviews.filter(r => r.productId === productId);
    const avg = allProdReviews.reduce((sum, r) => sum + r.rating, 0) / allProdReviews.length;
    prod.rating = Number(avg.toFixed(1));
    prod.reviewCount = allProdReviews.length;
  }

  saveDb();
  res.status(201).json(newReview);
});

// 9. Newsletter
app.post('/api/newsletter', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'E-mail inválido' });
  }

  if (!db.newsletter.some(n => n.email.toLowerCase() === email.toLowerCase())) {
    db.newsletter.push({ email, createdAt: new Date().toISOString() });
    saveDb();
  }
  res.json({ success: true, message: 'Inscrito com sucesso com 10% OFF no cupom LMEN10!' });
});

// 10. Admin Authentication
app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lmensports.com.br';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin_lmen_2026_sports';

  // Demo allows default admin credentials or simplified check
  if (
    (email === adminEmail && password === adminPass) ||
    (email === 'admin@lmensports.com.br' && password === 'admin') ||
    (email === 'admin' && password === 'admin')
  ) {
    return res.json({
      token: 'jwt-admin-token-authenticated-lmen-sports-pro',
      user: {
        id: 'usr-admin-1',
        name: 'Administrador LMEN',
        email: 'admin@lmensports.com.br',
        role: 'admin',
      },
    });
  }

  res.status(401).json({ error: 'Credenciais de administrador incorretas' });
});

// 11. Admin Dashboard Stats
app.get('/api/admin/dashboard', (_req: Request, res: Response) => {
  const totalSales = db.orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalOrders = db.orders.length;
  const totalCustomers = db.customers.length;
  const totalProducts = db.products.length;

  let lowStockCount = 0;
  db.products.forEach(p => {
    const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
    if (totalStock < 8) lowStockCount++;
  });

  // Sales by Category
  const catSalesMap: Record<string, number> = {};
  db.orders.forEach(o => {
    o.items.forEach(it => {
      const prod = db.products.find(p => p.id === it.productId);
      const cat = prod?.categoryName || 'Outros';
      catSalesMap[cat] = (catSalesMap[cat] || 0) + it.subtotal;
    });
  });

  const categoryBreakdown = Object.entries(catSalesMap).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  res.json({
    metrics: {
      totalSalesToday: 3240.5,
      totalSalesMonth: totalSales,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount,
      averageTicket: totalOrders ? Number((totalSales / totalOrders).toFixed(2)) : 0,
    },
    categoryBreakdown,
    recentOrders: db.orders.slice(0, 8),
    lowStockProducts: db.products
      .filter(p => p.variants.reduce((acc, v) => acc + v.stock, 0) < 10)
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        totalStock: p.variants.reduce((acc, v) => acc + v.stock, 0),
        status: p.status,
      })),
  });
});

// 12. Admin Products CRUD
app.get('/api/admin/products', (_req: Request, res: Response) => {
  res.json(db.products);
});

app.post('/api/admin/products', (req: Request, res: Response) => {
  const productData = req.body;
  const sizes: string[] = productData.availableSizes || ['38', '39', '40', '41', '42'];
  const colors: { name: string; hex: string }[] = productData.availableColors || [{ name: 'Preto', hex: '#000000' }];
  const requestedStock: number = typeof productData.stock === 'number' ? Math.max(0, productData.stock) : 50;

  // Build variants if not provided or empty
  let variants: ProductVariant[] = Array.isArray(productData.variants) && productData.variants.length > 0
    ? productData.variants
    : [];

  if (variants.length === 0) {
    const stockPerSize = sizes.length > 0 ? Math.max(1, Math.round(requestedStock / sizes.length)) : 10;
    variants = sizes.map((sz, idx) => ({
      id: `v-${Date.now()}-${idx}`,
      sku: `${productData.sku || 'SKU'}-${sz}`,
      size: sz,
      color: colors[0]?.name || 'Padrão',
      colorHex: colors[0]?.hex || '#000000',
      stock: stockPerSize,
      price: productData.price,
    }));
  }

  const calculatedStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);

  const newProduct: Product = {
    ...productData,
    id: `prod-${Date.now()}`,
    slug: productData.slug || (productData.name || 'produto').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    salesCount: 0,
    rating: 5.0,
    reviewCount: 0,
    variants,
    stock: requestedStock || calculatedStock,
    createdAt: new Date().toISOString(),
  };

  db.products.unshift(newProduct);
  saveDb();
  res.status(201).json(newProduct);
});

app.put('/api/admin/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  const updatedData = req.body;
  const existing = db.products[index];

  let variants = Array.isArray(updatedData.variants) && updatedData.variants.length > 0
    ? updatedData.variants
    : existing.variants || [];

  if ((!variants || variants.length === 0) && updatedData.availableSizes && updatedData.availableSizes.length > 0) {
    const targetStock = typeof updatedData.stock === 'number' ? updatedData.stock : 30;
    const stockPerSize = Math.max(1, Math.round(targetStock / updatedData.availableSizes.length));
    variants = updatedData.availableSizes.map((sz: string, idx: number) => ({
      id: `v-${Date.now()}-${idx}`,
      sku: `${updatedData.sku || existing.sku || 'SKU'}-${sz}`,
      size: sz,
      color: (updatedData.availableColors && updatedData.availableColors[0]?.name) || 'Padrão',
      colorHex: (updatedData.availableColors && updatedData.availableColors[0]?.hex) || '#000000',
      stock: stockPerSize,
      price: updatedData.price || existing.price,
    }));
  }

  db.products[index] = {
    ...existing,
    ...updatedData,
    variants,
  };
  saveDb();
  res.json(db.products[index]);
});

app.delete('/api/admin/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.products = db.products.filter(p => p.id !== id);
  saveDb();
  res.json({ success: true, message: 'Produto removido com sucesso' });
});

// 13. Admin Orders Management
app.get('/api/admin/orders', (_req: Request, res: Response) => {
  res.json(db.orders);
});

app.put('/api/admin/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, description } = req.body;
  const order = db.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    description: description || `Status atualizado para ${status}`,
  });

  saveDb();
  res.json(order);
});

// 14. Admin Customers
app.get('/api/admin/customers', (_req: Request, res: Response) => {
  res.json(db.customers);
});

// 15. Admin Coupons CRUD
app.get('/api/admin/coupons', (_req: Request, res: Response) => {
  res.json(db.coupons);
});

app.post('/api/admin/coupons', (req: Request, res: Response) => {
  const couponData = req.body;
  const newCoupon: Coupon = {
    ...couponData,
    id: `coup-${Date.now()}`,
    code: couponData.code.toUpperCase(),
    usedCount: 0,
    isActive: true,
  };
  db.coupons.push(newCoupon);
  saveDb();
  res.status(201).json(newCoupon);
});

app.delete('/api/admin/coupons/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.coupons = db.coupons.filter(c => c.id !== id);
  saveDb();
  res.json({ success: true });
});

// 16. Admin Banners CRUD
app.get('/api/admin/banners', (_req: Request, res: Response) => {
  res.json(db.banners);
});

app.put('/api/admin/banners', (req: Request, res: Response) => {
  if (Array.isArray(req.body)) {
    db.banners = req.body;
    saveDb();
  }
  res.json(db.banners);
});

app.put('/api/admin/banners/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.banners.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Banner não encontrado' });
  }
  db.banners[index] = { ...db.banners[index], ...req.body };
  saveDb();
  res.json(db.banners[index]);
});

// 16.1 Admin Categories CRUD
app.get('/api/admin/categories', (_req: Request, res: Response) => {
  res.json(db.categories);
});

app.put('/api/admin/categories', (req: Request, res: Response) => {
  if (Array.isArray(req.body)) {
    db.categories = req.body;
    saveDb();
  }
  res.json(db.categories);
});

app.put('/api/admin/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.categories.findIndex(c => c.id === id || c.slug === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Categoria não encontrada' });
  }
  db.categories[index] = { ...db.categories[index], ...req.body };
  saveDb();
  res.json(db.categories[index]);
});

// 17. Admin Settings
app.put('/api/admin/settings', (req: Request, res: Response) => {
  db.settings = { ...db.settings, ...req.body };
  saveDb();
  res.json(db.settings);
});

// Production static assets & Vite dev server middleware
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LMEN SPORTS server is running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch(err => {
  console.error('Failed to start server:', err);
});
