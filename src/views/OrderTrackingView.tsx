import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  ChevronLeft,
  Search,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

interface OrderTrackingViewProps {
  orderIdOrNumber?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orderIdOrNumber = '#LM10257',
  onNavigate,
}) => {
  const [query, setQuery] = useState(orderIdOrNumber);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const loadOrder = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getOrder(id);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Pedido não localizado');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderIdOrNumber) {
      loadOrder(orderIdOrNumber);
    }
  }, [orderIdOrNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      loadOrder(query.trim());
    }
  };

  const steps: { status: OrderStatus; label: string; icon: any; desc: string }[] = [
    {
      status: 'pending_payment',
      label: 'Pedido Realizado',
      icon: Clock,
      desc: 'Recebemos o seu pedido em nosso sistema.',
    },
    {
      status: 'paid',
      label: 'Pagamento Aprovado',
      icon: CheckCircle2,
      desc: 'Transação validada com sucesso.',
    },
    {
      status: 'preparing',
      label: 'Pedido Preparado',
      icon: Package,
      desc: 'Separado, embalado e pronto para coleta.',
    },
    {
      status: 'shipped',
      label: 'Pedido Enviado',
      icon: Truck,
      desc: 'Despachado para o centro de triagem.',
    },
    {
      status: 'in_transit',
      label: 'Em Trânsito',
      icon: Truck,
      desc: 'A caminho da sua região de entrega.',
    },
    {
      status: 'delivered',
      label: 'Entregue',
      icon: CheckCircle2,
      desc: 'Entregue com sucesso no endereço cadastrado.',
    },
  ];

  const getStepState = (targetStatus: OrderStatus, currentStatus?: OrderStatus) => {
    if (!currentStatus) return 'upcoming';
    const statusOrder: OrderStatus[] = [
      'pending_payment',
      'paid',
      'preparing',
      'shipped',
      'in_transit',
      'delivered',
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const targetIndex = statusOrder.indexOf(targetStatus);

    if (currentIndex > targetIndex) return 'completed';
    if (currentIndex === targetIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar à Loja
        </button>
        <span className="text-xs font-bold text-zinc-400">Rastreamento de Encomendas LMEN</span>
      </div>

      {/* Search Input for Tracking */}
      <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900/60 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
        <h2 className="text-sm font-black uppercase tracking-wider mb-2">
          Rastrear outro pedido
        </h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Digite o número do pedido (Ex: #LM10257 ou ord-...)"
            className={`flex-1 py-2.5 px-4 text-xs font-mono font-bold rounded-xl focus:outline-none uppercase transition-colors ${
              isDark
                ? 'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white'
                : 'bg-white border border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:border-black shadow-sm'
            }`}
          />
          <button
            type="submit"
            disabled={loading}
            className={`py-2.5 px-6 text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
              isDark
                ? 'bg-white hover:bg-zinc-200 text-black'
                : 'bg-black hover:bg-zinc-800 text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            {loading ? 'Buscando...' : 'RASTREAR'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-zinc-800 border border-white/20 text-white text-xs font-bold text-center">
          {error}
        </div>
      )}

      {order && (
        <div className="space-y-8">
          {/* Order Header info */}
          <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'bg-zinc-900/40 border-white/10' : 'bg-white border-zinc-200'}`}>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                STATUS ATUAL DO PEDIDO
              </span>
              <h1 className="text-2xl font-black uppercase tracking-tight mt-0.5">
                {order.orderNumber}
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Realizado em: {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold text-zinc-400 block uppercase">Código de Rastreamento</span>
              <span className="text-base font-mono font-black text-white bg-zinc-800 px-3 py-1 rounded-lg border border-white/20 inline-block mt-1">
                {order.trackingCode || 'LM982736412BR'}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className={`p-8 rounded-3xl border ${isDark ? 'bg-zinc-900/40 border-white/10' : 'bg-white border-zinc-200'}`}>
            <h3 className="text-sm font-black uppercase tracking-wider mb-8">Linha do Tempo</h3>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {steps.map((st, idx) => {
                const state = getStepState(st.status, order.status);
                const isCompleted = state === 'completed';
                const isCurrent = state === 'current';

                return (
                  <div key={st.status} className="relative flex items-start gap-4">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                        isCompleted
                          ? 'bg-white text-black'
                          : isCurrent
                          ? 'bg-zinc-700 text-white animate-pulse ring-4 ring-white/20'
                          : 'bg-zinc-900 text-zinc-500 border border-white/10'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-black uppercase tracking-tight ${
                            isCompleted || isCurrent ? (isDark ? 'text-white' : 'text-zinc-950') : 'text-zinc-500'
                          }`}
                        >
                          {st.label}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-white text-black rounded">
                            EM ANDAMENTO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping destination & order details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                <MapPin className="w-4 h-4 text-white" />
                Destino da Entrega
              </div>
              <p className="text-xs font-bold">{order.customer.name}</p>
              <p className="text-xs text-zinc-300 mt-1">
                {order.shippingAddress.street}, {order.shippingAddress.number}
              </p>
              <p className="text-xs text-zinc-400">
                {order.shippingAddress.neighborhood} · {order.shippingAddress.city} - {order.shippingAddress.state}
              </p>
            </div>

            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                <Truck className="w-4 h-4 text-white" />
                Transportadora & Modalidade
              </div>
              <p className="text-xs font-bold">{order.shippingOption.name}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{order.shippingOption.carrier}</p>
              <p className="text-xs text-zinc-300 font-semibold mt-2">
                Previsão de entrega no prazo contratado.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
