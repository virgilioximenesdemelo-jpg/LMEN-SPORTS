import React, { useState } from 'react';
import { Truck, Search, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { ShippingOption } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ShippingCalculatorProps {
  subtotal: number;
  onSelectOption?: (option: ShippingOption) => void;
}

export const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({
  subtotal,
  onSelectOption,
}) => {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [options, setOptions] = useState<ShippingOption[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatCep = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 8);
    if (raw.length > 5) {
      return `${raw.slice(0, 5)}-${raw.slice(5)}`;
    }
    return raw;
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setError('Por favor digite um CEP válido com 8 dígitos.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.calculateShipping(cleanCep, subtotal);
      setOptions(res.options);
      if (res.options.length > 0) {
        setSelectedId(res.options[0].id);
        if (onSelectOption) onSelectOption(res.options[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao calcular frete para este CEP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 rounded-2xl border transition-colors ${isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
      <div className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
        <Truck className={`w-4 h-4 ${isDark ? 'text-white' : 'text-zinc-900'}`} />
        <span>Calcule o Frete e Prazo de Entrega</span>
      </div>

      <form onSubmit={handleCalculate} className="flex gap-2">
        <input
          type="text"
          value={cep}
          onChange={e => setCep(formatCep(e.target.value))}
          placeholder="00000-000"
          maxLength={9}
          className={`w-36 py-2 px-3 text-xs font-mono font-bold rounded-xl focus:outline-none tracking-wider transition-colors ${
            isDark
              ? 'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white'
              : 'bg-white border border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:border-black shadow-sm'
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`py-2 px-4 text-xs font-black rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
            isDark
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-black text-white hover:bg-zinc-800'
          }`}
        >
          {loading ? 'Calculando...' : 'CALCULAR'}
        </button>
        <a
          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
          target="_blank"
          rel="noreferrer"
          className={`hidden sm:inline-flex items-center text-[11px] underline ml-auto ${
            isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'
          }`}
        >
          Não sei meu CEP
        </a>
      </form>

      {error && <p className="text-[11px] text-zinc-300 mt-2">{error}</p>}

      {options && options.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
          {options.map(opt => {
            const isSelected = selectedId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => {
                  setSelectedId(opt.id);
                  if (onSelectOption) onSelectOption(opt);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-white bg-white/10 text-white'
                    : isDark
                    ? 'border-white/5 hover:border-white/10 bg-black/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-white bg-white' : 'border-zinc-500'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                  </div>
                  <div>
                    <p className="text-xs font-black">{opt.name}</p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Entrega em {opt.daysMin} a {opt.daysMax} dias úteis ({opt.carrier})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {opt.price === 0 ? (
                    <span className="text-xs font-black text-white uppercase">GRÁTIS</span>
                  ) : (
                    <span className="text-xs font-bold">R$ {opt.price.toFixed(2).replace('.', ',')}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
