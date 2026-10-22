import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  MapPin,
  Calendar,
  Camera,
  Layers,
  Heart,
  Bookmark,
  LogOut,
  Edit3,
  Check,
  Grid,
  Info,
  X,
} from 'lucide-react';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';

interface ProfileViewProps {
  posts: Post[];
  onOpenLightbox: (post: Post) => void;
  onOpenPublish: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  posts,
  onOpenLightbox,
  onOpenPublish,
}) => {
  const { user, isAuthenticated, logout, openAuthModal, updateUserProfile, savedPostIds } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'favorites' | 'info'>('posts');
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editCamera, setEditCamera] = useState(user?.cameraGear?.camera || '');
  const [editLenses, setEditLenses] = useState(user?.cameraGear?.lenses || '');

  if (!isAuthenticated || !user) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 rounded-full bg-[#B9DDF5]/30 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-[#71849A]">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-[#263B54] dark:text-white mb-2">
          Perfil de Observador
        </h2>
        <p className="text-xs text-[#71849A] dark:text-[#8EA5C0] mb-6 leading-relaxed">
          Inicia sesión para gestionar tus fotografías de nubes, ver tus publicaciones guardadas y
          conectar con la comunidad de OnlyCloud.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-full bg-[#263B54] dark:bg-white text-white dark:text-[#0B111E] text-xs font-semibold shadow-md cursor-pointer"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  // Filter posts
  const userPosts = posts.filter((p) => p.authorId === user.id || p.authorUsername === user.username);
  const favoritePosts = posts.filter((p) => savedPostIds.includes(p.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      displayName: editName,
      bio: editBio,
      cameraGear: {
        camera: editCamera,
        lenses: editLenses,
        filters: user.cameraGear?.filters,
        tripod: user.cameraGear?.tripod,
      },
    });
    setEditModalOpen(false);
  };

  return (
    <div className="w-full py-12 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-[#0E1626] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative group">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-[#B9DDF5]/80 dark:ring-indigo-500/50 shadow-md"
            />
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#263B54] dark:text-white font-['Plus_Jakarta_Sans']">
                  {user.displayName}
                </h1>
                <p className="text-xs text-[#71849A] dark:text-[#8EA5C0]">@{user.username}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => {
                    setEditName(user.displayName);
                    setEditBio(user.bio);
                    setEditCamera(user.cameraGear?.camera || '');
                    setEditLenses(user.cameraGear?.lenses || '');
                    setEditModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#263B54] dark:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar perfil</span>
                </button>

                <button
                  onClick={logout}
                  className="p-2 rounded-full border border-rose-100 dark:border-rose-900 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] max-w-xl leading-relaxed">
              {user.bio}
            </p>

            {/* Location & Join date */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[#71849A] dark:text-[#8EA5C0]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B9DDF5]" />
                {user.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#B9DDF5]" />
                Miembro desde {user.joinedDate}
              </span>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-center sm:justify-start gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="font-bold text-[#263B54] dark:text-white text-base">
                  {userPosts.length || user.postsCount}
                </span>{' '}
                <span className="text-[#71849A]">publicaciones</span>
              </div>
              <div>
                <span className="font-bold text-[#263B54] dark:text-white text-base">
                  {user.followersCount}
                </span>{' '}
                <span className="text-[#71849A]">seguidores</span>
              </div>
              <div>
                <span className="font-bold text-[#263B54] dark:text-white text-base">
                  {user.followingCount}
                </span>{' '}
                <span className="text-[#71849A]">siguiendo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('posts')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'posts'
              ? 'border-[#263B54] dark:border-white text-[#263B54] dark:text-white'
              : 'border-transparent text-[#71849A] hover:text-[#263B54] dark:hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Mis fotografías ({userPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'favorites'
              ? 'border-[#263B54] dark:border-white text-[#263B54] dark:text-white'
              : 'border-transparent text-[#71849A] hover:text-[#263B54] dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Favoritos ({favoritePosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'info'
              ? 'border-[#263B54] dark:border-white text-[#263B54] dark:text-white'
              : 'border-transparent text-[#71849A] hover:text-[#263B54] dark:hover:text-white'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Equipo Fotográfico</span>
        </button>
      </div>

      {/* Tab 1: Mis Fotografías */}
      {activeTab === 'posts' && (
        <div>
          {userPosts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => onOpenLightbox(post)}
                  className="aspect-square rounded-2xl overflow-hidden bg-slate-900 relative group cursor-pointer"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 fill-white" /> {post.likesCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <p className="text-xs text-[#71849A]">Aún no has compartido fotografías de cielo.</p>
              <button
                onClick={onOpenPublish}
                className="px-4 py-2 rounded-full bg-[#B9DDF5] text-[#263B54] text-xs font-semibold cursor-pointer"
              >
                + Publicar tu primera fotografía
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Favoritos */}
      {activeTab === 'favorites' && (
        <div>
          {favoritePosts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {favoritePosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => onOpenLightbox(post)}
                  className="aspect-square rounded-2xl overflow-hidden bg-slate-900 relative group cursor-pointer"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 fill-white" /> {post.likesCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-[#71849A]">
              No tienes fotografías guardadas en favoritos todavía.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Información & Equipo */}
      {activeTab === 'info' && (
        <div className="bg-white dark:bg-[#0E1626] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-[#263B54] dark:text-white mb-2">
            <Camera className="w-4 h-4 text-[#B9DDF5]" />
            <span>Configuración de Equipo Habitual</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[#71849A] block mb-1 font-medium">Cuerpo de cámara:</span>
              <p className="font-semibold text-[#263B54] dark:text-white">
                {user.cameraGear?.camera || 'No especificada'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[#71849A] block mb-1 font-medium">Ópticas & Objetivos:</span>
              <p className="font-semibold text-[#263B54] dark:text-white">
                {user.cameraGear?.lenses || 'No especificados'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[#71849A] block mb-1 font-medium">Filtros astronómicos/ópticos:</span>
              <p className="font-semibold text-[#263B54] dark:text-white">
                {user.cameraGear?.filters || 'ND1000, CPL Polarizador'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[#71849A] block mb-1 font-medium">Trípode / Montura:</span>
              <p className="font-semibold text-[#263B54] dark:text-white">
                {user.cameraGear?.tripod || 'Trípode carbono pesado'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#0E1626] rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-[#263B54] dark:text-white">
                  Editar Perfil de Observador
                </h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="p-1 rounded-full text-[#71849A] hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                    Nombre a mostrar
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                    Biografía
                  </label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                    Cámara
                  </label>
                  <input
                    type="text"
                    value={editCamera}
                    onChange={(e) => setEditCamera(e.target.value)}
                    placeholder="Ej: Sony A7 IV / Canon EOS R6"
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                    Objetivos habituales
                  </label>
                  <input
                    type="text"
                    value={editLenses}
                    onChange={(e) => setEditLenses(e.target.value)}
                    placeholder="Ej: 24-70mm f/2.8, 14mm f/1.8"
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 rounded-full text-[#71849A] hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#263B54] dark:bg-white text-white dark:text-[#0B111E] font-semibold"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
