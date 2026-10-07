import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquarePlus } from 'lucide-react';
import { ProductReview } from '../../types';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

interface ProductReviewsProps {
  productId: string;
  initialReviews: ProductReview[];
  averageRating: number;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  initialReviews,
  averageRating,
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      const newRev = await api.submitReview({
        productId,
        author: author.trim(),
        rating,
        title: title.trim() || 'Excelente experiência',
        comment: comment.trim(),
      });
      setReviews(prev => [newRev, ...prev]);
      setSuccessMsg('Avaliação publicada com sucesso! Obrigado pelo feedback.');
      setShowForm(false);
      setAuthor('');
      setTitle('');
      setComment('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${isDark ? 'bg-zinc-900/40 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-4xl font-black text-white">{averageRating.toFixed(1)}</span>
            <div className="flex items-center justify-center text-zinc-300 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(averageRating)
                      ? 'fill-zinc-300 text-zinc-300'
                      : 'text-zinc-600 fill-zinc-600/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">{reviews.length} avaliações</p>
          </div>

          <div className="hidden sm:block h-12 w-px bg-white/10" />

          <div className="text-xs space-y-1 text-zinc-400">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <CheckCircle className="w-4 h-4" />
              100% dos compradores recomendam este produto
            </div>
            <p>Avaliações auditadas com selo oficial de Compra Verificada LMEN SPORTS.</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="py-2.5 px-5 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-md shrink-0"
        >
          <MessageSquarePlus className="w-4 h-4" />
          {showForm ? 'Fechar Formulário' : 'Escrever Avaliação'}
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-zinc-800 border border-white/20 text-white text-xs rounded-xl font-bold">
          {successMsg}
        </div>
      )}

      {/* Review Form Drawer */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className={`p-6 rounded-2xl border space-y-4 animate-in slide-in-from-top-2 duration-200 ${
            isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'
          }`}
        >
          <h4 className="text-sm font-bold uppercase tracking-wider">Deixe sua avaliação</h4>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Sua Nota</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-white text-white'
                        : 'text-zinc-600'
                    }`}
                  />
                </button>
              ))}
              <span className={`text-xs font-bold ml-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {rating === 5 ? 'Excelente!' : rating === 4 ? 'Muito bom!' : `${rating} Estrelas`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>Seu Nome</label>
              <input
                type="text"
                required
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Ex: João da Silva"
                className={`w-full py-2 px-3 text-xs rounded-xl focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white'
                    : 'bg-white border border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:border-black shadow-sm'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                Título do Comentário (Opcional)
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Tecido espetacular e veste perfeito"
                className={`w-full py-2 px-3 text-xs rounded-xl focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white'
                    : 'bg-white border border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:border-black shadow-sm'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>Seu Comentário</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="O que achou do caimento, qualidade do material, respirabilidade e acabamento?"
              className={`w-full py-2 px-3 text-xs rounded-xl focus:outline-none transition-colors ${
                isDark
                  ? 'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white'
                  : 'bg-white border border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:border-black shadow-sm'
              }`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="py-2 px-4 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="py-2 px-5 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Publicar Avaliação'}
            </button>
          </div>
        </form>
      )}

      {/* Review list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-xs text-zinc-400 py-6 text-center">
            Seja o primeiro a avaliar este produto e ajude outros atletas a escolherem!
          </p>
        ) : (
          reviews.map(rev => (
            <div
              key={rev.id}
              className={`p-4 rounded-2xl border transition-colors ${
                isDark ? 'bg-zinc-900/30 border-white/10' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 text-white font-black text-xs flex items-center justify-center border border-white/10">
                    {rev.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">{rev.author}</span>
                      {rev.isVerified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-zinc-300 bg-zinc-800 px-1.5 py-0.2 rounded border border-white/10">
                          <CheckCircle className="w-2.5 h-2.5 text-white" />
                          Compra verificada
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-zinc-400">{rev.date}</span>
              </div>

              {/* Stars */}
              <div className="flex items-center text-zinc-300 mb-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < rev.rating ? 'fill-zinc-300 text-zinc-300' : 'text-zinc-700'
                    }`}
                  />
                ))}
              </div>

              <h5 className="text-xs font-bold mb-1">{rev.title}</h5>
              <p className="text-xs text-zinc-300 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
