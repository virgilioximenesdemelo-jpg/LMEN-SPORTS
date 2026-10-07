import React, { useState } from 'react';
import {
  User,
  Package,
  Heart,
  MapPin,
  Tag,
  LogOut,
  Truck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { Order } from '../types';

interface AccountViewProps {
  orders: Order[];
  onTrackOrder: (id: string) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ orders, onTrackOrder, onNavigate }) => {
  const { user, login, register, logout } = useAuth();
  const { totalFavorites } = useFavorites();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'coupons'>('orders');

  // Auth form states
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [cpfInput, setCpfInput] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      await login(emailInput, passwordInput);
    } else {
      await register(nameInput, emailInput, phoneInput, cpfInput);
    }
  };

  // If not logged in, render authentication screen
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className={`p-8 rounded-3xl border space-y-6 ${isDark ? 'bg-zinc-900/60 border-white/10' : 'bg-white border-zinc-200'}`}>
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
              ÁREA DO CLIENTE LMEN
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              {isLoginMode ? 'Acessar Minha Conta' : 'Criar Conta de Atleta'}
            </h2>
            <p className="text-xs text-zinc-400">
              {isLoginMode
                ? 'Acompanhe seus pedidos, fretes e histórico esportivo'
                : 'Cadastre-se para comprar mais rápido e acumular benefícios'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginMode && (
              <>
                <div>
                  <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="Seu nome"
                    className={`w-full py-2.5 px-3 text-xs rounded-xl focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white'
                        : 'bg-zinc-50 border border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:border-black shadow-sm'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      placeholder="(97) 98421-7475"
                      className={`w-full py-2.5 px-3 text-xs rounded-xl focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white'
                          : 'bg-zinc-50 border border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:border-black shadow-sm'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>CPF</label>
                    <input
                      type="text"
                      required
                      value={cpfInput}
                      onChange={e => setCpfInput(e.target.value)}
                      placeholder="000.000.000-00"
                      className={`w-full py-2.5 px-3 text-xs rounded-xl focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white'
                          : 'bg-zinc-50 border border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:border-black shadow-sm'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>E-mail</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className={`w-full py-2.5 px-3 text-xs rounded-xl focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white'
                    : 'bg-zinc-50 border border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:border-black shadow-sm'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>Senha</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className={`w-full py-2.5 px-3 text-xs rounded-xl focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white'
                    : 'bg-zinc-50 border border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:border-black shadow-sm'
                }`}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg ${
                isDark
                  ? 'bg-white hover:bg-zinc-200 text-black'
                  : 'bg-black hover:bg-zinc-800 text-white'
              }`}
            >
              {isLoginMode ? 'ENTRAR NA CONTA' : 'CRIAR CADASTRO'}
            </button>
          </form>

          <div className="pt-2 text-center text-xs">
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-white hover:underline font-bold cursor-pointer"
            >
              {isLoginMode ? 'Não tem uma conta? Cadastre-se grátis' : 'Já possui cadastro? Fazer login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header welcome banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'bg-zinc-900/60 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-white font-black text-xl flex items-center justify-center shadow-lg border border-white/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
              PAINEL DO ATLETA
            </span>
            <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Olá, {user.name}!
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 py-2 px-4 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-1.5">
          {[
            { id: 'orders', label: 'Meus Pedidos', icon: Package, badge: orders.length },
            { id: 'profile', label: 'Dados Pessoais', icon: User },
            { id: 'addresses', label: 'Endereços Salvos', icon: MapPin },
            { id: 'coupons', label: 'Cupons Disponíveis', icon: Tag, badge: '4' },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-lg font-black'
                    : isDark
                    ? 'hover:bg-white/5 text-zinc-300'
                    : 'hover:bg-zinc-100 text-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-200 border border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => onNavigate('favorites')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              isDark ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-zinc-300" />
              <span>Favoritos</span>
            </div>
            <span className="text-zinc-400 font-semibold">{totalFavorites}</span>
          </button>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider mb-4">
                Histórico de Pedidos ({orders.length})
              </h3>
              {orders.length === 0 ? (
                <div className={`p-12 rounded-3xl border text-center ${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
                  <Package className="w-10 h-10 text-zinc-500 mx-auto mb-2" />
                  <p className="text-sm font-bold">Nenhum pedido realizado ainda</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Suas compras aparecerão aqui com atualizações de envio em tempo real.
                  </p>
                </div>
              ) : (
                orders.map(order => (
                  <div
                    key={order.id}
                    className={`p-6 rounded-2xl border space-y-4 transition-colors ${
                      isDark ? 'bg-zinc-900/40 border-white/10' : 'bg-white border-zinc-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                      <div>
                        <span className="text-sm font-black text-white">{order.orderNumber}</span>
                        <p className="text-[11px] text-zinc-400">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')} · Total: R${' '}
                          {order.total.toFixed(2).replace('.', ',')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-zinc-800 text-zinc-200 border border-white/10">
                          {order.status === 'delivered'
                            ? 'Entregue'
                            : order.status === 'in_transit'
                            ? 'Em Trânsito'
                            : order.status === 'shipped'
                            ? 'Enviado'
                            : order.status === 'paid'
                            ? 'Pago'
                            : 'Aguardando Pagamento'}
                        </span>
                        <button
                          onClick={() => onTrackOrder(order.id)}
                          className="py-1.5 px-3 bg-white hover:bg-zinc-200 text-black text-[11px] font-black uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Rastrear
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <img src={it.image} alt={it.name} className="w-10 h-10 object-cover rounded-lg bg-zinc-800" />
                          <div>
                            <p className="text-xs font-bold truncate max-w-[200px]">{it.name}</p>
                            <p className="text-[10px] text-zinc-400">
                              {it.size} · {it.color} (Qtd: {it.quantity})
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-zinc-900/40 border-white/10' : 'bg-white border-zinc-200'}`}>
              <h3 className="text-base font-black uppercase tracking-wider mb-2">Dados do Perfil</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-bold">Nome</span>
                  <p className="text-sm font-bold mt-0.5">{user.name}</p>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-bold">E-mail</span>
                  <p className="text-sm font-bold mt-0.5">{user.email}</p>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-bold">Telefone / WhatsApp</span>
                  <p className="text-sm font-bold mt-0.5">{user.phone || '(97) 98421-7475'}</p>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-bold">CPF</span>
                  <p className="text-sm font-bold mt-0.5">{user.cpf || '123.456.789-00'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-zinc-900/40 border-white/10' : 'bg-white border-zinc-200'}`}>
              <h3 className="text-base font-black uppercase tracking-wider mb-2">Endereço Principal</h3>
              <p className="text-xs font-bold">Rua Francisco Monteiro, nº 1796</p>
              <p className="text-xs text-zinc-400">Bairro Nova Humaitá · Humaitá - AM</p>
              <p className="text-xs text-zinc-400 font-mono">CEP: 69800-000</p>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="space-y-3">
              <h3 className="text-base font-black uppercase tracking-wider mb-2">Seus Cupons de Desconto</h3>
              {[
                { code: 'LMEN10', desc: '10% de desconto em todo o site', min: 'R$ 100' },
                { code: 'PRIMEIRACOMPRA', desc: '15% de desconto no primeiro pedido', min: 'R$ 150' },
                { code: 'FRETEGRATIS', desc: 'Frete grátis para compras acima de R$ 199', min: 'R$ 199' },
                { code: 'FUTEBOL20', desc: '20% de desconto na linha de futebol', min: 'R$ 250' },
              ].map(c => (
                <div key={c.code} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-white font-mono">{c.code}</span>
                    <p className="text-xs text-zinc-300 mt-0.5">{c.desc}</p>
                    <p className="text-[10px] text-zinc-500">Válido a partir de {c.min}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 border border-white/10 text-[10px] font-black uppercase">
                    ATIVO
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
