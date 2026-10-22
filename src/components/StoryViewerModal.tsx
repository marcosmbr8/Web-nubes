import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  Send,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Story } from '../types';
import { useAuth } from '../context/AuthContext';

interface StoryViewerModalProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onOpenAuthorProfile?: (authorUsername: string, authorName: string, authorAvatar: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex,
  onClose,
  onOpenAuthorProfile,
}) => {
  const { requireAuth } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number }[]>([]);

  const currentStory = stories[currentIndex];
  const STORY_DURATION_MS = 5000;

  useEffect(() => {
    setProgress(0);
    setIsLiked(false);
    setReplyText('');
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  // Keyboard navigation (Escape to close, Arrows to navigate, Space to pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  // Story progress interval
  useEffect(() => {
    if (isPaused) return;

    const interval = 40; // 40ms tick
    const step = (interval / STORY_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, handleNext]);

  const triggerFloatingEmoji = (emoji: string) => {
    const id = Date.now() + Math.random();
    const x = Math.random() * 50 + 25; // 25% to 75%
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 1400);
  };

  const handleLike = () => {
    requireAuth(() => {
      setIsLiked((prev) => !prev);
      triggerFloatingEmoji('❤️');
    }, 'Inicia sesión para reaccionar a esta historia.');
  };

  const handleReaction = (emoji: string) => {
    requireAuth(() => {
      triggerFloatingEmoji(emoji);
      setSentNotice(`Reacción ${emoji} enviada`);
      setTimeout(() => setSentNotice(null), 1800);
    }, 'Inicia sesión para reaccionar.');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    requireAuth(() => {
      setSentNotice(`Mensaje enviado a @${currentStory.username}`);
      setReplyText('');
      setTimeout(() => setSentNotice(null), 2500);
    }, 'Inicia sesión para responder a las historias de la comunidad.');
  };

  if (!currentStory) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black select-none overflow-hidden animate-in fade-in duration-150">
      {/* 1. SOLID DEEP BLACK BACKDROP (Pure Instagram Black) */}
      <div className="absolute inset-0 bg-black cursor-pointer" onClick={onClose} />

      {/* 2. SUBTLE AMBIENT BLUR ON DESKTOP EDGES (Instagram Web style) */}
      <div
        className="hidden md:block absolute inset-0 opacity-20 filter blur-3xl scale-125 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: `url(${currentStory.mediaUrl})` }}
      />

      {/* Top right close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
        aria-label="Cerrar historias"
        title="Cerrar (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Desktop Prev Button (Left arrow) */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="hidden md:flex absolute left-6 lg:left-16 top-1/2 -translate-y-1/2 z-50 p-3.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-transform hover:scale-110 cursor-pointer shadow-2xl"
          aria-label="Historia anterior"
          title="Anterior (Flecha izquierda)"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* Desktop Next Button (Right arrow) */}
      {currentIndex < stories.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="hidden md:flex absolute right-6 lg:right-16 top-1/2 -translate-y-1/2 z-50 p-3.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-transform hover:scale-110 cursor-pointer shadow-2xl"
          aria-label="Historia siguiente"
          title="Siguiente (Flecha derecha)"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* STORY CONTAINER IN THE MIDDLE (Instagram Exact Aspect Ratio & Styling) */}
      <div
        className="relative z-30 w-full h-full sm:h-[92vh] sm:max-h-[820px] sm:max-w-[420px] sm:rounded-2xl overflow-hidden bg-black flex flex-col justify-between shadow-[0_0_60px_rgba(0,0,0,0.95)] sm:border sm:border-white/10"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Story Photo filling container */}
        <img
          src={currentStory.mediaUrl}
          alt={currentStory.title}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Floating Animated Emojis */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {floatingEmojis.map((item) => (
            <motion.div
              key={item.id}
              initial={{ y: 550, opacity: 1, scale: 0.5 }}
              animate={{ y: 60, opacity: 0, scale: 2 }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
              style={{ left: `${item.x}%` }}
              className="absolute text-4xl"
            >
              {item.emoji}
            </motion.div>
          ))}
        </div>

        {/* Top & Bottom dark gradients for text & control readability */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10" />

        {/* TOP: Segmented Progress Bars & Author Row */}
        <div className="relative z-20 p-3.5 space-y-2.5">
          {/* Progress Bars */}
          <div className="flex gap-1.5 w-full">
            {stories.map((st, i) => {
              let segProgress = 0;
              if (i < currentIndex) segProgress = 100;
              else if (i === currentIndex) segProgress = progress;

              return (
                <div key={st.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-75"
                    style={{ width: `${segProgress}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Author Header */}
          <div className="flex items-center justify-between text-white pt-1">
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenAuthorProfile) {
                  onOpenAuthorProfile(currentStory.username, currentStory.username, currentStory.userAvatar);
                }
              }}
              title="Ver perfil de usuario en Instagram style"
            >
              {/* Avatar with colorful Instagram story ring */}
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-sm">
                <img
                  src={currentStory.userAvatar}
                  alt={currentStory.username}
                  className="w-8 h-8 rounded-full object-cover border-2 border-black"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold leading-none group-hover:underline">
                    {currentStory.username}
                  </span>
                  <span className="text-[11px] text-white/70">· 3 h</span>
                </div>
                <p className="text-[10px] text-white/80 flex items-center gap-0.5 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-[#B9DDF5]" />
                  <span>{currentStory.location}</span>
                </p>
              </div>
            </div>

            {/* Play/Pause & Close icon on story */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused((p) => !p);
                }}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label={isPaused ? 'Reanudar' : 'Pausar'}
                title={isPaused ? 'Reanudar' : 'Pausar'}
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer sm:hidden"
                aria-label="Cerrar historia"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* TAP ZONES: Left 35% = Prev, Right 65% = Next */}
        <div className="absolute inset-y-20 inset-x-0 flex z-15">
          <div
            className="w-[35%] h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            title="Toca a la izquierda para retroceder"
          />
          <div
            className="w-[65%] h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            title="Toca a la derecha para avanzar"
          />
        </div>

        {/* BOTTOM: Caption, Quick Reactions & Reply Input */}
        <div className="relative z-20 p-3.5 space-y-2.5">
          {/* Caption */}
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{currentStory.title}</span>
            </span>
          </div>

          {/* Toast Notice */}
          <AnimatePresence>
            {sentNotice && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs bg-white text-[#263B54] font-bold px-3 py-1.5 rounded-full text-center shadow-lg"
              >
                {sentNotice}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Instagram Reaction Emojis */}
          <div className="flex items-center justify-between px-2 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/15">
            {['🔥', '❤️', '😍', '👏', '🌌', '💯'].map((emoji) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction(emoji);
                }}
                className="text-lg sm:text-xl hover:scale-125 active:scale-95 transition-transform p-1 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply Form */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSendReply} className="flex-1 relative">
              <input
                type="text"
                placeholder={`Responder a ${currentStory.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                className="w-full py-2.5 pl-4 pr-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 text-xs focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-white/80 hover:text-white cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={`p-2.5 rounded-full backdrop-blur-md border transition-colors cursor-pointer ${
                isLiked
                  ? 'bg-rose-500/90 border-rose-400 text-white'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
