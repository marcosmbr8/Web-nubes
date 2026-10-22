import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MapPin,
  Camera,
  Layers,
  Sparkles,
  Grid,
  ListFilter,
  Check,
} from 'lucide-react';
import { Post, Story } from '../types';
import { useAuth } from '../context/AuthContext';

interface FeedSectionProps {
  posts: Post[];
  stories?: Story[];
  onOpenLightbox: (post: Post) => void;
  onLikeToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  onOpenAuthorProfile?: (authorUsername: string, authorName: string, authorAvatar: string, authorId?: string) => void;
  onOpenStory?: (storyIndex: number) => void;
}

export const FeedSection: React.FC<FeedSectionProps> = ({
  posts,
  stories = [],
  onOpenLightbox,
  onLikeToggle,
  onSaveToggle,
  onOpenAuthorProfile,
  onOpenStory,
}) => {
  const { user, requireAuth, savedPostIds } = useAuth();
  const [likedAnimationId, setLikedAnimationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDoubleTap = (postId: string) => {
    requireAuth(() => {
      onLikeToggle(postId);
      setLikedAnimationId(postId);
      setTimeout(() => setLikedAnimationId(null), 800);
    }, 'Inicia sesión para dar Me gusta a esta fotografía.');
  };

  const handleShare = (postId: string) => {
    navigator.clipboard?.writeText(`${window.location.origin}/#post-${postId}`);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="w-full py-8 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header matching Feed layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#263B54] dark:text-white font-['Plus_Jakarta_Sans']">
            Feed de la Comunidad
          </h2>
          <p className="text-xs sm:text-sm text-[#71849A] dark:text-[#8EA5C0] mt-0.5">
            Cielos capturados en tiempo real por observadores de todo el mundo
          </p>
        </div>
      </div>

      {/* FEED VIEW (Instagram-style rich cards) */}
      <div className="space-y-8">
        {posts.map((post) => {
            const isSaved = savedPostIds.includes(post.id);
            const storyIndex = stories.findIndex(
              (s) =>
                s.userId === post.authorId ||
                s.username.toLowerCase() === post.authorUsername.toLowerCase() ||
                s.username.toLowerCase() === post.authorName.toLowerCase()
            );
            const hasStory = storyIndex !== -1;

            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-[#0E1626] rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_24px_rgba(38,59,84,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all hover:shadow-[0_8px_30px_rgba(38,59,84,0.1)]"
              >
                {/* Author Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar: if has story -> Instagram gradient ring, click opens story; if not -> click opens profile */}
                    <div
                      className={`relative cursor-pointer transition-transform hover:scale-105 ${
                        hasStory
                          ? 'p-[2.5px] rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-xs ring-1 ring-white dark:ring-black'
                          : 'p-0.5 rounded-full ring-2 ring-slate-200 dark:ring-slate-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasStory && onOpenStory) {
                          onOpenStory(storyIndex);
                        } else {
                          onOpenAuthorProfile?.(
                            post.authorUsername,
                            post.authorName,
                            post.authorAvatar,
                            post.authorId
                          );
                        }
                      }}
                      title={hasStory ? `Ver historia activa de @${post.authorUsername}` : `Ver perfil de @${post.authorUsername}`}
                    >
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-white dark:border-[#0E1626]"
                      />
                    </div>

                    {/* Author Name: click opens Instagram profile */}
                    <div
                      className="cursor-pointer group"
                      onClick={() =>
                        onOpenAuthorProfile?.(
                          post.authorUsername,
                          post.authorName,
                          post.authorAvatar,
                          post.authorId
                        )
                      }
                      title={`Ver perfil y publicaciones de @${post.authorUsername}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-[#263B54] dark:text-white leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:underline transition-colors">
                          {post.authorName}
                        </h3>
                        <span className="text-[11px] text-[#71849A]">@{post.authorUsername}</span>
                      </div>
                      <p className="text-xs text-[#71849A] dark:text-[#8EA5C0] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-sky-500" />
                        <span>{post.locationEnabled !== false ? post.location : 'Ubicación privada'}</span>
                        <span className="opacity-40">·</span>
                        <span>{post.date}</span>
                      </p>
                    </div>
                  </div>

                  {/* Atmospheric badge */}
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-[#B9DDF5]/20 dark:bg-slate-800 text-[#263B54] dark:text-[#B9DDF5] border border-[#B9DDF5]/40 dark:border-slate-700/60 flex items-center gap-1.5">
                    <Layers className="w-3 h-3" />
                    <span>{post.categoryLabel}</span>
                  </div>
                </div>

                {/* Main Photo Container with double tap heart */}
                <div
                  className="relative overflow-hidden cursor-pointer bg-slate-900 aspect-[4/3] sm:aspect-[16/10] select-none"
                  onDoubleClick={() => handleDoubleTap(post.id)}
                  onClick={() => onOpenLightbox(post)}
                >
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />

                  {/* Subtle top subtle shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />

                  {/* Big Animated Heart on Double Tap */}
                  <AnimatePresence>
                    {likedAnimationId === post.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-xl" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Engagement & Caption Bar */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Like Button */}
                      <motion.button
                        whileTap={{ scale: 0.82 }}
                        onClick={() =>
                          requireAuth(
                            () => onLikeToggle(post.id),
                            'Inicia sesión para dar Me gusta a esta fotografía.'
                          )
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                          post.isLiked
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                            : 'bg-slate-50 dark:bg-slate-800 text-[#263B54] dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likesCount}</span>
                      </motion.button>

                      {/* Comments Button */}
                      <button
                        onClick={() => onOpenLightbox(post)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-[#263B54] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 text-[#71849A]" />
                        <span>{post.commentsCount}</span>
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => handleShare(post.id)}
                        className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-[#71849A] hover:text-[#263B54] dark:hover:text-white transition-colors cursor-pointer"
                        title="Compartir fotografía"
                      >
                        {copiedId === post.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Bookmark / Save */}
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() =>
                        requireAuth(
                          () => onSaveToggle(post.id),
                          'Inicia sesión para guardar esta fotografía.'
                        )
                      }
                      className={`p-2 rounded-full transition-colors cursor-pointer ${
                        isSaved
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-slate-50 dark:bg-slate-800 text-[#71849A] hover:text-[#263B54] dark:hover:text-white'
                      }`}
                      title={isSaved ? 'Guardada en tus favoritos' : 'Guardar en favoritos'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </motion.button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-base font-bold text-[#263B54] dark:text-white font-['Plus_Jakarta_Sans']">
                      {post.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] mt-1 leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  {/* EXIF Mini Tags */}
                  {post.exif && (
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-[#71849A] dark:text-[#8EA5C0]">
                      {post.exif.altitude && (
                        <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
                          ⛰️ Altitud: {post.exif.altitude}
                        </span>
                      )}
                      {post.exif.camera && (
                        <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
                          <Camera className="w-3 h-3" /> {post.exif.camera}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quick comment link */}
                  <button
                    onClick={() => onOpenLightbox(post)}
                    className="text-xs font-medium text-[#71849A] hover:text-[#263B54] dark:hover:text-[#B9DDF5] pt-1 block cursor-pointer"
                  >
                    Ver los {post.commentsCount} comentarios y detalles técnicos...
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
    </section>
  );
};
