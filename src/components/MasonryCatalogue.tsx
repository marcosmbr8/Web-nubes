import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  Heart,
  Bookmark,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Compass,
  MapPin,
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { CategoryType, Post } from '../types';
import { useAuth } from '../context/AuthContext';

interface MasonryCatalogueProps {
  posts: Post[];
  onOpenLightbox: (post: Post) => void;
  onLikeToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  onOpenAuthorProfile?: (authorUsername: string, authorName: string, authorAvatar: string, authorId?: string) => void;
}

export const MasonryCatalogue: React.FC<MasonryCatalogueProps> = ({
  posts,
  onOpenLightbox,
  onLikeToggle,
  onSaveToggle,
  onOpenAuthorProfile,
}) => {
  const { requireAuth, savedPostIds } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'comments' | 'featured'>('recent');

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        // Category filter
        if (selectedCategory !== 'todas' && post.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = post.title.toLowerCase().includes(query);
          const matchDesc = post.description.toLowerCase().includes(query);
          const matchAuthor = post.authorName.toLowerCase().includes(query);
          const matchLoc = post.location.toLowerCase().includes(query);
          const matchCat = post.categoryLabel.toLowerCase().includes(query);
          return matchTitle || matchDesc || matchAuthor || matchLoc || matchCat;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.likesCount - a.likesCount;
        if (sortBy === 'comments') return b.commentsCount - a.commentsCount;
        if (sortBy === 'featured') return b.savesCount - a.savesCount;
        return 0; // recent (default)
      });
  }, [posts, selectedCategory, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('todas');
    setSearchQuery('');
    setSortBy('recent');
  };

  return (
    <section className="w-full py-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Title & Description */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#71849A] dark:text-[#8EA5C0] block mb-2">
          Colección Visual Abierta
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#263B54] dark:text-white font-['Plus_Jakarta_Sans'] mb-4">
          Descubre el cielo a través de otros ojos
        </h1>
        <p className="text-sm sm:text-base text-[#71849A] dark:text-[#B4C6DA] leading-relaxed">
          Explora la mayor galería comunitaria de nubes, atardeceres, fenómenos ópticos y astronomía
          profunda. Una ventana infinita al firmamento.
        </p>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#71849A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nube, autor, cometa, ubicación..."
            className="w-full py-2.5 pl-11 pr-4 rounded-full bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-slate-800 text-xs text-[#263B54] dark:text-white placeholder-[#71849A] focus:outline-none focus:ring-2 focus:ring-[#B9DDF5] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#71849A] hover:text-[#263B54] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Options and Reset */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-slate-800 rounded-full px-3 py-1.5 shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#71849A]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-medium text-[#263B54] dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="recent">Más recientes</option>
              <option value="popular">Más populares</option>
              <option value="comments">Más comentadas</option>
              <option value="featured">Fotografías destacadas</option>
            </select>
          </div>

          {(selectedCategory !== 'todas' || searchQuery || sortBy !== 'recent') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#71849A] hover:text-[#263B54] dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#263B54] dark:bg-white text-white dark:text-[#0B111E] shadow-sm font-semibold'
                  : 'bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-slate-800 text-[#71849A] dark:text-[#8EA5C0] hover:text-[#263B54] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Masonry Photo Grid */}
      {filteredPosts.length > 0 ? (
        <div className="masonry-grid">
          {filteredPosts.map((post) => {
            const isSaved = savedPostIds.includes(post.id);

            return (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="masonry-item group relative rounded-3xl overflow-hidden cursor-pointer bg-white dark:bg-[#0E1626] border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(38,59,84,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:shadow-[0_12px_32px_rgba(38,59,84,0.12)]"
              >
                {/* Photo */}
                <div
                  className="relative overflow-hidden bg-slate-900"
                  onClick={() => onOpenLightbox(post)}
                >
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Translucent overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
                    {/* Top right quick actions */}
                    <div className="flex justify-end gap-2">
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          requireAuth(
                            () => onSaveToggle(post.id),
                            'Inicia sesión para guardar en favoritos.'
                          );
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                          isSaved
                            ? 'bg-amber-500 text-white'
                            : 'bg-black/40 hover:bg-black/60 text-white'
                        }`}
                        title="Guardar en favoritos"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          requireAuth(
                            () => onLikeToggle(post.id),
                            'Inicia sesión para dar Me gusta.'
                          );
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                          post.isLiked
                            ? 'bg-rose-500 text-white'
                            : 'bg-black/40 hover:bg-black/60 text-white'
                        }`}
                        title="Me gusta"
                      >
                        <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-white' : ''}`} />
                      </motion.button>
                    </div>

                    {/* Bottom overlay info */}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#B9DDF5]">
                        {post.categoryLabel}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      {post.locationEnabled !== false && (
                        <div className="flex items-center gap-1 text-[11px] text-[#B9DDF5] mt-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{post.location}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-xs">
                        <span className="text-white/90 font-medium">@{post.authorUsername}</span>
                        <div className="flex items-center gap-2.5 text-white/80 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-rose-400 text-rose-400" /> {post.likesCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quiet Card Footer (Always visible underneath image for clean browsing) */}
                <div className="p-3.5 flex items-center justify-between">
                  <div
                    className="flex items-center gap-2 overflow-hidden cursor-pointer group/author"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAuthorProfile?.(
                        post.authorUsername,
                        post.authorName,
                        post.authorAvatar,
                        post.authorId
                      );
                    }}
                    title="Ver perfil de usuario estilo Instagram"
                  >
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0 group-hover/author:ring-2 group-hover/author:ring-sky-500 transition-all"
                    />
                    <span className="text-xs font-semibold text-[#263B54] dark:text-white truncate group-hover/author:text-sky-600 dark:group-hover/author:text-sky-400 transition-colors">
                      {post.authorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() =>
                        requireAuth(
                          () => onLikeToggle(post.id),
                          'Inicia sesión para dar Me gusta.'
                        )
                      }
                      className="p-1 text-[#71849A] hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                    <span className="text-xs text-[#71849A] font-medium">{post.likesCount}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#B9DDF5]/30 dark:bg-slate-800 flex items-center justify-center mx-auto text-[#71849A]">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#263B54] dark:text-white">
            No se han encontrado fotografías
          </h3>
          <p className="text-xs text-[#71849A] max-w-sm mx-auto">
            No hay publicaciones que coincidan con los criterios seleccionados. Prueba a buscar con otros términos.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#263B54] dark:bg-white text-white dark:text-[#0B111E] shadow-sm cursor-pointer"
          >
            Ver todas las fotografías
          </button>
        </div>
      )}
    </section>
  );
};
