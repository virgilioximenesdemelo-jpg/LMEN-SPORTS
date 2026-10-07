import React from 'react';
import { LmenLogo } from './LmenLogo';
import { Phone, Mail, Instagram, ShieldCheck, Truck, RefreshCw, Lock, ArrowUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className={`border-t transition-colors ${
        isDark ? 'bg-[#090A0D] border-white/10 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
      }`}
    >
      {/* Brand value propositions bar */}
      <div className={`border-b ${isDark ? 'border-white/5 bg-[#0C0D11]' : 'border-zinc-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center shrink-0 border border-white/10">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                Envio para todo o Brasil
              </p>
              <p className="text-[11px] text-zinc-400">Frete grátis acima de R$ 249</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center shrink-0 border border-white/10">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                Primeira Troca Grátis
              </p>
              <p className="text-[11px] text-zinc-400">Até 30 dias para devolução</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center shrink-0 border border-white/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                Produtos 100% Originais
              </p>
              <p className="text-[11px] text-zinc-400">Garantia oficial do fabricante</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center shrink-0 border border-white/10">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                Pagamento Seguro
              </p>
              <p className="text-[11px] text-zinc-400">PIX com desconto ou até 10x</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <LmenLogo variant="desktop" />
            <p className="text-xs leading-relaxed max-w-sm">
              A <strong className={isDark ? 'text-white' : 'text-zinc-950'}>LMEN SPORTS</strong> é
              especializada no universo do futebol, performance atlética, calçados de elite e moda
              street esportiva. Nascida para vestir a sua identidade dentro e fora dos gramados.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.instagram.com/lmen_sports?stkn=enhmdDdsZ3RrNmlj"
                target="_blank"
                rel="noreferrer"
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
                }`}
                aria-label="Instagram @lmen_sports"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/5597984217475"
                target="_blank"
                rel="noreferrer"
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                }`}
                aria-label="WhatsApp (97) 98421-7475"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="mailto:atendimento@lmensports.com.br"
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
                }`}
                aria-label="E-mail"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Institutional */}
          <div>
            <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Institucional
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Sobre Nós
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('account')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Meus Pedidos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Termos e Condições
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Trocas e Devoluções
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Categorias
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('category', 'camisas')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Camisas de Time
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('category', 'chuteiras')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Chuteiras Campo
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('category', 'society')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Society (TF)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('category', 'tenis')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tênis de Corrida
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('category', 'oversized')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Camisas Oversized
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('offers')}
                  className="font-bold text-white hover:underline cursor-pointer"
                >
                  Ofertas & Outlet
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Atendimento & Segurança */}
          <div>
            <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Atendimento
            </h4>
            <div className="space-y-3 text-xs">
              <p>
                <strong className={isDark ? 'text-white' : 'text-zinc-950'}>Segunda a Sexta:</strong>
                <br />08h às 18h
              </p>
              <p>
                <strong className={isDark ? 'text-white' : 'text-zinc-950'}>WhatsApp & Contato:</strong>
                <br />
                <a
                  href="https://wa.me/5597984217475"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline font-bold text-zinc-300"
                >
                  (97) 98421-7475
                </a>
              </p>
              <p>
                <strong className={isDark ? 'text-white' : 'text-zinc-950'}>Loja Física:</strong>
                <br />Rua Francisco Monteiro, nº 1796
                <br />Bairro Nova Humaitá
              </p>
              <p>
                <strong className={isDark ? 'text-white' : 'text-zinc-950'}>E-mail Oficial:</strong>
                <br />atendimento@lmensports.com.br
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 border border-white/10 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  Site 100% Blindado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment badges & bottom rights */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400 mr-2">Formas de Pagamento:</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-white border border-white/20 font-black text-[10px]">
              PIX (-5%)
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold text-[10px]">
              Mastercard
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold text-[10px]">
              Visa
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold text-[10px]">
              Elo
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold text-[10px]">
              Boleto
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>© 2026 LMEN SPORTS. Todos os direitos reservados.</span>
            <button
              onClick={scrollToTop}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
              }`}
              title="Voltar ao topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
