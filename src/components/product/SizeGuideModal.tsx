import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'clothing' | 'footwear';
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  type = 'clothing',
}) => {
  const [tab, setTab] = useState<'clothing' | 'footwear'>(type);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border p-6 z-10 transition-all ${
          isDark ? 'bg-[#12141A] border-white/10 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-white" />
            <h3 className="text-base font-black uppercase tracking-wider">Guia de Tamanhos & Medidas</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex gap-2 my-4">
          <button
            onClick={() => setTab('clothing')}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              tab === 'clothing'
                ? 'bg-white text-black shadow-md'
                : isDark
                ? 'bg-zinc-800 text-zinc-400 hover:text-white'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Camisas, Shorts & Agasalhos
          </button>
          <button
            onClick={() => setTab('footwear')}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              tab === 'footwear'
                ? 'bg-white text-black shadow-md'
                : isDark
                ? 'bg-zinc-800 text-zinc-400 hover:text-white'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Chuteiras & Tênis (BR)
          </button>
        </div>

        {/* Table content */}
        {tab === 'clothing' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Tamanho</th>
                  <th className="py-2.5 px-3">Peito (Tórax)</th>
                  <th className="py-2.5 px-3">Comprimento</th>
                  <th className="py-2.5 px-3">Cintura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-white">P</td>
                  <td className="py-2.5 px-3">50 - 52 cm</td>
                  <td className="py-2.5 px-3">70 cm</td>
                  <td className="py-2.5 px-3">76 - 80 cm</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-white">M</td>
                  <td className="py-2.5 px-3">53 - 55 cm</td>
                  <td className="py-2.5 px-3">72 cm</td>
                  <td className="py-2.5 px-3">81 - 85 cm</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-white">G</td>
                  <td className="py-2.5 px-3">56 - 58 cm</td>
                  <td className="py-2.5 px-3">74 cm</td>
                  <td className="py-2.5 px-3">86 - 90 cm</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-white">GG</td>
                  <td className="py-2.5 px-3">59 - 61 cm</td>
                  <td className="py-2.5 px-3">76 cm</td>
                  <td className="py-2.5 px-3">91 - 96 cm</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-white">XG</td>
                  <td className="py-2.5 px-3">62 - 65 cm</td>
                  <td className="py-2.5 px-3">78 cm</td>
                  <td className="py-2.5 px-3">97 - 104 cm</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">BR</th>
                  <th className="py-2.5 px-3">Comprimento do Pé</th>
                  <th className="py-2.5 px-3">US</th>
                  <th className="py-2.5 px-3">EUR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { br: '38', cm: '25.0 cm', us: '7.0', eur: '40' },
                  { br: '39', cm: '25.5 cm', us: '7.5', eur: '40.5' },
                  { br: '40', cm: '26.5 cm', us: '8.5', eur: '42' },
                  { br: '41', cm: '27.5 cm', us: '9.5', eur: '43' },
                  { br: '42', cm: '28.0 cm', us: '10.0', eur: '44' },
                  { br: '43', cm: '29.0 cm', us: '11.0', eur: '45' },
                  { br: '44', cm: '29.5 cm', us: '11.5', eur: '45.5' },
                ].map(r => (
                  <tr key={r.br}>
                    <td className="py-2.5 px-3 font-bold text-white">{r.br}</td>
                    <td className="py-2.5 px-3">{r.cm}</td>
                    <td className="py-2.5 px-3">{r.us}</td>
                    <td className="py-2.5 px-3">{r.eur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>* Medidas aproximadas com margem de até 1.5 cm.</span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-white hover:underline cursor-pointer"
          >
            Entendi, fechar
          </button>
        </div>
      </div>
    </div>
  );
};
