import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AnnouncementBarProps {
  text?: string;
  link?: string;
  onLinkClick?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  text = '⚡ OFERTAS ESPECIAIS | ENVIO PARA TODO O BRASIL | FRETE GRÁTIS ACIMA DE R$ 249',
  link = '/ofertas',
  onLinkClick,
}) => {
  return (
    <div className="bg-zinc-950 text-zinc-200 border-b border-zinc-800 text-xs font-semibold py-2 px-4 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
        <span className="flex items-center gap-1.5 tracking-wide text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          {text}
        </span>
        {link && (
          <button
            onClick={onLinkClick}
            className="inline-flex items-center gap-1 text-white hover:text-zinc-300 underline underline-offset-2 transition-colors font-bold ml-1 cursor-pointer"
          >
            Aproveitar agora
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
