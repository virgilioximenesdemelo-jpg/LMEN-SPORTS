import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  Clock,
  Truck,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Order } from '../types';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

interface OrderConfirmationViewProps {
  order: Order;
  onTrackOrder: (orderId: string) => void;
  onContinueShopping: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order: initialOrder,
  onTrackOrder,
  onContinueShopping,
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [copiedPix, setCopiedPix] = useState(false);
  const [confirmingPix, setConfirmingPix] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (order.status !== 'pending_payment') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [order.status]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const pixKey =
    order.paymentDetails.pixCode ||
    '00020126580014br.gov.bcb.pix0136lmensports-pix-chave@lmensports.com.br520400005303986540' +
      order.total.toFixed(2) +
      '5802BR5911LMEN SPORTS6009SAO PAULO62070503***6304';

  const handleCopyPix = () => {
    navigator.clipboard?.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleSimulatePixPaid = async () => {
    setConfirmingPix(true);
    try {
      const updated = await api.confirmPixPayment(order.id);
      setOrder(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmingPix(false);
    }
  };

  const isPaid = order.status !== 'paid' && order.status !== 'preparing' && order.status !== 'shipped' && order.status !== 'in_transit' && order.status !== 'delivered' ? false : true;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className={`p-8 rounded-3xl border text-center space-y-3 ${
        isPaid
          ? 'bg-zinc-900 border-white/20'
          : isDark
          ? 'bg-zinc-900/60 border-white/10'
          : 'bg-zinc-50 border-zinc-200'
      }`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
          isPaid ? 'bg-white text-black' : 'bg-zinc-800 text-white border border-white/20'
        }`}>
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          PEDIDO CONFIRMADO COM SUCESSO
        </span>

        <h1 className={`text-3xl sm:text-4xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
          {order.orderNumber}
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          {isPaid
            ? 'Pagamento aprovado com sucesso! Já estamos separando os seus itens em nosso centro de distribuição.'
            : 'Seu pedido foi registrado. Realize o pagamento via PIX para iniciarmos o envio imediatamente.'}
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onTrackOrder(order.id)}
            className="py-2.5 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            Rastrear Pedido
          </button>
          <button
            onClick={onContinueShopping}
            className="py-2.5 px-5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-zinc-300 cursor-pointer"
          >
            Continuar Comprando
          </button>
        </div>
      </div>

      {/* PIX Payment Box (if pending) */}
      {!isPaid && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${isDark ? 'bg-zinc-900/50 border-white/20' : 'bg-zinc-50 border-zinc-300'}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5 text-white">
              <QrCode className="w-6 h-6" />
              <div>
                <h3 className="text-base font-black uppercase">Pague via PIX</h3>
                <p className="text-xs text-zinc-400">Escaneie o QR Code ou copie o código abaixo</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-zinc-800 px-3 py-1.5 rounded-full border border-white/10">
              <Clock className="w-4 h-4" />
              <span>Expira em: {timeFormatted}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* SVG PIX QR Code representation */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl w-60 mx-auto">
              <svg viewBox="0 0 100 100" className="w-48 h-48">
                <rect width="100" height="100" fill="#FFFFFF" />
                <rect x="10" y="10" width="24" height="24" fill="#000000" />
                <rect x="14" y="14" width="16" height="16" fill="#FFFFFF" />
                <rect x="18" y="18" width="8" height="8" fill="#000000" />

                <rect x="66" y="10" width="24" height="24" fill="#000000" />
                <rect x="70" y="14" width="16" height="16" fill="#FFFFFF" />
                <rect x="74" y="18" width="8" height="8" fill="#000000" />

                <rect x="10" y="66" width="24" height="24" fill="#000000" />
                <rect x="14" y="70" width="16" height="16" fill="#FFFFFF" />
                <rect x="18" y="74" width="8" height="8" fill="#000000" />

                {/* Data blocks in black/charcoal */}
                <rect x="38" y="12" width="6" height="6" fill="#000000" />
                <rect x="48" y="18" width="8" height="6" fill="#000000" />
                <rect x="38" y="28" width="12" height="6" fill="#000000" />
                <rect x="12" y="38" width="6" height="8" fill="#000000" />
                <rect x="22" y="44" width="8" height="6" fill="#000000" />
                <rect x="36" y="38" width="8" height="8" fill="#18181B" />
                <rect x="48" y="42" width="12" height="6" fill="#000000" />
                <rect x="64" y="38" width="8" height="6" fill="#000000" />
                <rect x="76" y="44" width="14" height="6" fill="#000000" />
                <rect x="38" y="52" width="6" height="10" fill="#000000" />
                <rect x="52" y="54" width="10" height="8" fill="#000000" />
                <rect x="68" y="56" width="6" height="8" fill="#000000" />
                <rect x="80" y="58" width="10" height="6" fill="#000000" />
                <rect x="38" y="68" width="10" height="8" fill="#000000" />
                <rect x="54" y="70" width="8" height="8" fill="#000000" />
                <rect x="68" y="68" width="12" height="10" fill="#000000" />
                <rect x="44" y="82" width="14" height="6" fill="#000000" />
                <rect x="64" y="84" width="18" height="6" fill="#000000" />
              </svg>
              <span className="text-[10px] font-bold text-zinc-900 mt-2 uppercase tracking-wider">
                Valor: R$ {order.total.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Copy & Paste Code */}
            <div className="space-y-4">
              {/* Account Receiver Information */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Beneficiário / Titular:</span>
                  <span className="font-bold text-white text-right">
                    {order.paymentDetails.pixBeneficiary || 'LMEN SPORTS ARTIGOS ESPORTIVOS LTDA'}
                  </span>
                </div>
                {order.paymentDetails.pixKey && (
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Chave Cadastrada:</span>
                    <span className="font-mono text-zinc-300 font-bold">{order.paymentDetails.pixKey}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Instituição:</span>
                  <span className="text-zinc-300">Banco Central do Brasil / PIX Oficial</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Código Copia e Cola
                </label>
                <div className="relative">
                  <textarea
                    readOnly
                    rows={3}
                    value={pixKey}
                    className="w-full p-2.5 text-[11px] font-mono bg-black/60 border border-white/15 rounded-xl text-zinc-300 resize-none select-all"
                  />
                  <button
                    onClick={handleCopyPix}
                    className="mt-2 w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {copiedPix ? (
                      <>
                        <Check className="w-4 h-4" />
                        Código Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar Código PIX
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Demo Simulator button */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
                <span className="text-[11px] text-zinc-400">Ambiente de Demonstração / Homologação:</span>
                <button
                  onClick={handleSimulatePixPaid}
                  disabled={confirmingPix}
                  className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-white/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${confirmingPix ? 'animate-spin' : ''}`} />
                  {confirmingPix ? 'Aprovando...' : 'Simular Aprovação Instantânea de Pagamento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Destination Address */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">
            <MapPin className="w-4 h-4 text-white" />
            Endereço de Entrega
          </div>
          <p className="text-xs font-bold">{order.customer.name}</p>
          <p className="text-xs text-zinc-300 mt-1">
            {order.shippingAddress.street}, {order.shippingAddress.number}
            {order.shippingAddress.complement ? ` - ${order.shippingAddress.complement}` : ''}
          </p>
          <p className="text-xs text-zinc-400">
            {order.shippingAddress.neighborhood} · {order.shippingAddress.city} - {order.shippingAddress.state}
          </p>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">CEP: {order.shippingAddress.cep}</p>
        </div>

        {/* Shipping method & contact */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">
            <Truck className="w-4 h-4 text-white" />
            Método de Envio & Notificações
          </div>
          <p className="text-xs font-bold">{order.shippingOption.name}</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Prazo: {order.shippingOption.daysMin} a {order.shippingOption.daysMax} dias úteis
          </p>
          <p className="text-xs text-zinc-300 mt-2">
            Atualizações enviadas para: <strong className="text-white">{order.customer.email}</strong>
          </p>
        </div>
      </div>

      {/* Purchased items */}
      <div className={`p-6 rounded-2xl border space-y-3 ${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
          Itens Comprados
        </h4>
        {order.items.map((it, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-none">
            <div className="flex items-center gap-3">
              <img src={it.image} alt={it.name} className="w-12 h-12 object-cover rounded-lg bg-zinc-800" />
              <div>
                <p className="text-xs font-bold">{it.name}</p>
                <p className="text-[11px] text-zinc-400">
                  Tam: {it.size} · Cor: {it.color} · Qtd: {it.quantity}
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-white">
              R$ {it.subtotal.toFixed(2).replace('.', ',')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
