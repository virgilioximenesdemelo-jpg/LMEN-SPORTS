import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Check,
  CreditCard,
  QrCode,
  Truck,
  User,
  MapPin,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ShippingOption, Order } from '../types';
import { api } from '../services/api';

interface CheckoutViewProps {
  onOrderSuccess: (order: Order) => void;
  onBackToCart: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onOrderSuccess, onBackToCart }) => {
  const { items, subtotal, discount, coupon, clearCart } = useCart();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  // Step state (1 to 4)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cpf, setCpf] = useState(user?.cpf || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Address
  const [cep, setCep] = useState('01310-100');
  const [street, setStreet] = useState('Avenida Paulista');
  const [number, setNumber] = useState('1000');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('Bela Vista');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');

  // Shipping
  const [shippingOptions] = useState<ShippingOption[]>([
    { id: 'pac', name: 'PAC Econômico', carrier: 'Correios', price: subtotal >= 249.9 ? 0 : 19.9, daysMin: 4, daysMax: 7 },
    { id: 'sedex', name: 'SEDEX Expresso', carrier: 'Correios', price: 29.9, daysMin: 1, daysMax: 2 },
  ]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(shippingOptions[0]);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [installments, setInstallments] = useState(1);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const pixDiscount = paymentMethod === 'pix' ? subtotal * 0.05 : 0;
  const totalShipping = selectedShipping ? selectedShipping.price : 0;
  const total = Math.max(0, subtotal - discount - pixDiscount + totalShipping);

  // High-contrast, theme-aware styles so typed text is always 100% visible
  const inputClass = isDark
    ? 'w-full py-2.5 px-3.5 text-xs bg-zinc-900/90 border border-zinc-700 rounded-xl focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-white placeholder-zinc-500 font-medium transition-all'
    : 'w-full py-2.5 px-3.5 text-xs bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-zinc-950 placeholder-zinc-400 font-medium transition-all shadow-sm';

  const monoInputClass = isDark
    ? 'w-full py-2.5 px-3.5 text-xs bg-zinc-900/90 border border-zinc-700 rounded-xl focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-white placeholder-zinc-500 font-mono font-medium transition-all'
    : 'w-full py-2.5 px-3.5 text-xs bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-zinc-950 placeholder-zinc-400 font-mono font-medium transition-all shadow-sm';

  const labelClass = isDark
    ? 'block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5'
    : 'block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5';

  const stepCardClass = isDark
    ? 'p-6 rounded-2xl border space-y-4 animate-in fade-in bg-zinc-900/60 border-white/10'
    : 'p-6 rounded-2xl border space-y-4 animate-in fade-in bg-white border-zinc-200 shadow-sm text-zinc-900';

  const backBtnClass = isDark
    ? 'py-3 px-5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer'
    : 'py-3 px-5 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-all cursor-pointer';

  const nextBtnClass = isDark
    ? 'w-full py-3.5 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-white/10'
    : 'w-full py-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-black/10';

  // Address lookup by CEP
  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleFinishOrder = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        customer: { name, email, cpf, phone },
        shippingAddress: { cep, street, number, complement, neighborhood, city, state },
        shippingOption: selectedShipping,
        paymentMethod,
        installments: paymentMethod === 'credit_card' ? installments : undefined,
        items: items.map(it => ({
          productId: it.productId,
          name: it.name,
          image: it.image,
          size: it.size,
          color: it.color,
          price: it.price,
          quantity: it.quantity,
          subtotal: it.price * it.quantity,
        })),
        subtotal,
        shippingCost: totalShipping,
        discount: discount + pixDiscount,
        couponCode: coupon?.code,
      };

      const createdOrder = await api.createOrder(orderPayload);
      clearCart();
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar o pedido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Checkout Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
        <button
          onClick={onBackToCart}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar ao carrinho
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
          <ShieldCheck className="w-4 h-4 text-white" />
          Ambiente 100% Criptografado & Seguro
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { num: 1, label: 'Identificação', icon: User },
          { num: 2, label: 'Endereço', icon: MapPin },
          { num: 3, label: 'Envio', icon: Truck },
          { num: 4, label: 'Pagamento', icon: CreditCard },
        ].map(step => {
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          return (
            <div
              key={step.num}
              onClick={() => {
                if (isDone) setCurrentStep(step.num as any);
              }}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                isCurrent
                  ? 'border-white bg-white/10 text-white font-black shadow-md'
                  : isDone
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-300'
                  : 'border-white/5 text-zinc-500 opacity-60'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isCurrent
                    ? 'bg-white text-black'
                    : isDone
                    ? 'bg-zinc-700 text-white'
                    : 'bg-white/10 text-zinc-400'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
              </div>
              <span className="text-xs hidden md:inline truncate">{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: IDENTIFICAÇÃO */}
          {currentStep === 1 && (
            <div className={stepCardClass}>
              <div className="flex items-center gap-2 mb-2">
                <User className={`w-5 h-5 ${isDark ? 'text-white' : 'text-zinc-900'}`} />
                <h3 className={`text-base font-black uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>Etapa 1: Dados Pessoais</h3>
              </div>

              <div>
                <label className={labelClass}>Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>WhatsApp / Telefone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(97) 98421-7475"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>CPF (Para nota fiscal)</label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={e => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className={monoInputClass}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (name && email) setCurrentStep(2);
                }}
                className={nextBtnClass}
              >
                <span>Prosseguir para Endereço</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: ENDEREÇO */}
          {currentStep === 2 && (
            <div className={stepCardClass}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className={`w-5 h-5 ${isDark ? 'text-white' : 'text-zinc-900'}`} />
                <h3 className={`text-base font-black uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>Etapa 2: Endereço de Entrega</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>CEP</label>
                  <input
                    type="text"
                    required
                    value={cep}
                    onBlur={handleCepBlur}
                    onChange={e => setCep(e.target.value)}
                    placeholder="00000-000"
                    className={monoInputClass}
                  />
                </div>
                <div className="flex items-end">
                  <span className={`text-[11px] pb-2 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Preenchimento automático via Correios</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Rua / Logradouro</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Número</label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={e => setNumber(e.target.value)}
                    placeholder="123"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Complemento</label>
                  <input
                    type="text"
                    value={complement}
                    onChange={e => setComplement(e.target.value)}
                    placeholder="Apto 42"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Bairro</label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={e => setNeighborhood(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Cidade / UF</label>
                  <input
                    type="text"
                    required
                    value={`${city} - ${state}`}
                    onChange={e => setCity(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={backBtnClass}
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className={`flex-1 ${nextBtnClass}`}
                >
                  <span>Prosseguir para Entrega</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ENVIO */}
          {currentStep === 3 && (
            <div className={stepCardClass}>
              <div className="flex items-center gap-2 mb-2">
                <Truck className={`w-5 h-5 ${isDark ? 'text-white' : 'text-zinc-900'}`} />
                <h3 className={`text-base font-black uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>Etapa 3: Escolha a Entrega</h3>
              </div>

              <div className="space-y-3">
                {shippingOptions.map(opt => {
                  const isSelected = selectedShipping.id === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedShipping(opt)}
                      className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? isDark
                            ? 'border-white bg-white/10 shadow-md ring-1 ring-white/30'
                            : 'border-black bg-zinc-100 shadow-md ring-1 ring-black/20'
                          : isDark
                          ? 'border-white/5 hover:border-white/20 bg-zinc-900/60'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? isDark ? 'border-white bg-white' : 'border-black bg-black'
                              : 'border-zinc-400'
                          }`}
                        >
                          {isSelected && <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-black' : 'bg-white'}`} />}
                        </div>
                        <div>
                          <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>{opt.name}</p>
                          <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            Prazo estimado: {opt.daysMin} a {opt.daysMax} dias úteis
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {opt.price === 0 ? (
                          <span className={`text-xs font-black uppercase ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>GRÁTIS</span>
                        ) : (
                          <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>R$ {opt.price.toFixed(2).replace('.', ',')}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className={backBtnClass}
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className={`flex-1 ${nextBtnClass}`}
                >
                  <span>Prosseguir para Pagamento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAGAMENTO */}
          {currentStep === 4 && (
            <div className={stepCardClass}>
              <div className="flex items-center gap-2">
                <CreditCard className={`w-5 h-5 ${isDark ? 'text-white' : 'text-zinc-900'}`} />
                <h3 className={`text-base font-black uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>Etapa 4: Forma de Pagamento</h3>
              </div>

              {/* Method Tabs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'pix'
                      ? isDark
                        ? 'border-white bg-white/10 text-white font-bold ring-1 ring-white/30'
                        : 'border-black bg-zinc-100 text-black font-bold ring-1 ring-black/20 shadow-sm'
                      : isDark
                      ? 'border-white/10 text-zinc-400 hover:text-white bg-zinc-900/40'
                      : 'border-zinc-200 text-zinc-600 hover:text-black bg-white'
                  }`}
                >
                  <QrCode className="w-6 h-6" />
                  <span className="text-xs uppercase tracking-wider font-black">PIX (5% OFF)</span>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Aprovação Instantânea</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'credit_card'
                      ? isDark
                        ? 'border-white bg-white/10 text-white font-bold ring-1 ring-white/30'
                        : 'border-black bg-zinc-100 text-black font-bold ring-1 ring-black/20 shadow-sm'
                      : isDark
                      ? 'border-white/10 text-zinc-400 hover:text-white bg-zinc-900/40'
                      : 'border-zinc-200 text-zinc-600 hover:text-black bg-white'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs uppercase tracking-wider font-black">Cartão de Crédito</span>
                  <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Até 10x sem juros</span>
                </button>
              </div>

              {paymentMethod === 'pix' ? (
                <div className={`p-4 rounded-xl border text-xs space-y-2 ${isDark ? 'bg-zinc-800/80 border-white/15 text-zinc-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950'}`}>
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span>Você ganhou 5% de desconto extra pagando via PIX!</span>
                  </p>
                  <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    O QR Code oficial e a chave Copia e Cola serão gerados imediatamente na próxima tela com validade de 30 minutos.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Número do Cartão</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className={monoInputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Nome no Cartão</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      placeholder="NOME COMO IMPRESSO NO CARTÃO"
                      className={`${inputClass} uppercase`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Validade</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className={monoInputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        placeholder="123"
                        className={monoInputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Parcelamento</label>
                    <select
                      value={installments}
                      onChange={e => setInstallments(Number(e.target.value))}
                      className={isDark
                        ? 'w-full py-2.5 px-3.5 text-xs bg-zinc-900 border border-zinc-700 rounded-xl focus:outline-none focus:border-white text-white font-semibold cursor-pointer'
                        : 'w-full py-2.5 px-3.5 text-xs bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:border-black text-zinc-900 font-semibold cursor-pointer shadow-sm'
                      }
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                        <option key={n} value={n} className={isDark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>
                          {n}x de R$ {(total / n).toFixed(2).replace('.', ',')} sem juros
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {errorMsg && <p className="text-xs text-rose-500 font-bold">{errorMsg}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className={backBtnClass}
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinishOrder}
                  className={`flex-1 py-4 text-xs font-black uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-white hover:bg-zinc-200 text-black shadow-white/10'
                      : 'bg-black hover:bg-zinc-800 text-white shadow-black/10'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'PROCESSANDO PEDIDO...' : `FINALIZAR PEDIDO · R$ ${total.toFixed(2).replace('.', ',')}`}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5">
          <div className={`p-6 rounded-2xl border sticky top-24 space-y-4 ${isDark ? 'bg-zinc-900/60 border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'}`}>
            <h3 className={`text-sm font-black uppercase tracking-wider pb-3 border-b ${isDark ? 'border-white/10 text-white' : 'border-zinc-200 text-zinc-900'}`}>
              Resumo do Pedido ({items.length} itens)
            </h3>

            {/* Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(it => (
                <div key={it.id} className="flex gap-3 items-center">
                  <img src={it.image} alt={it.name} className="w-12 h-12 object-cover rounded-lg bg-zinc-800" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{it.name}</p>
                    <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {it.size} · {it.color} · Qtd: {it.quantity}
                    </p>
                  </div>
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    R$ {(it.price * it.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className={`pt-4 border-t space-y-2 text-xs ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
              <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <span>Subtotal</span>
                <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>

              {discount > 0 && (
                <div className={`flex justify-between font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  <span>Desconto ({coupon?.code})</span>
                  <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}

              {paymentMethod === 'pix' && pixDiscount > 0 && (
                <div className={`flex justify-between font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  <span>Desconto PIX (5%)</span>
                  <span>- R$ {pixDiscount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}

              <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <span>Frete ({selectedShipping.name})</span>
                <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{selectedShipping.price === 0 ? 'Grátis' : `R$ ${selectedShipping.price.toFixed(2).replace('.', ',')}`}</span>
              </div>

              <div className={`pt-3 border-t flex justify-between items-baseline ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
                <span className={`text-sm font-black ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Total</span>
                <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Assurance */}
            <div className={`pt-3 text-[11px] flex items-center gap-2 border-t ${isDark ? 'text-zinc-400 border-white/5' : 'text-zinc-500 border-zinc-100'}`}>
              <ShieldCheck className={`w-4 h-4 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <span>Garantia de entrega e devolução em até 30 dias.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
