import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  Bookmark,
  Share2,
  Send,
  MapPin,
  Camera,
  Calendar,
  Layers,
  Check,
  Compass,
  Info,
} from 'lucide-react';
import { Comment, Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../context/GeolocationContext';
import { MiniLocationMap } from './MiniLocationMap';
import { Navigation, Map } from 'lucide-react';

interface PhotoLightboxModalProps {
  post: Post;
  onClose: () => void;
  onLikeToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenAuthorProfile?: (authorUsername: string, authorName: string, authorAvatar: string, authorId?: string) => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  post,
  onClose,
  onLikeToggle,
  onSaveToggle,
  onAddComment,
  onOpenAuthorProfile,
}) => {
  const { user, requireAuth, savedPostIds } = useAuth();
  const { calculateDistance } = useGeolocation();
  const [commentText, setCommentText] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showExif, setShowExif] = useState(true);
  const [showLocationMap, setShowLocationMap] = useState(false);

  const isLocationEnabled = post.locationEnabled !== false;
  const postCoords = post.coordinates || { lat: 40.4168, lng: -3.7038 };
  const distanceKm = post.coordinates ? calculateDistance(post.coordinates.lat, post.coordinates.lng) : null;

  const isSaved = savedPostIds.includes(post.id);

  const handleLike = () => {
    requireAuth(() => {
      onLikeToggle(post.id);
    }, 'Inicia sesión para dar Me gusta a esta fotografía.');
  };

  const handleSave = () => {
    requireAuth(() => {
      onSaveToggle(post.id);
    }, 'Inicia sesión para guardar esta fotografía en tus favoritos.');
  };

  const handleFollow = () => {
    requireAuth(() => {
      setIsFollowing((prev) => !prev);
    }, `Inicia sesión para seguir a ${post.authorName}.`);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    requireAuth(() => {
      onAddComment(post.id, commentText);
      setCommentText('');
    }, 'Inicia sesión para comentar en esta publicación.');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
        aria-label="Cerrar vista ampliada"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Container */}
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-white dark:bg-[#0E1626] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-white/20 dark:border-slate-800">
        {/* Left: Huge photo display */}
        <div className="lg:w-3/5 bg-black flex items-center justify-center relative min-h-[320px] lg:min-h-[580px] overflow-hidden group">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full max-h-[85vh] object-contain transition-transform duration-500 group-hover:scale-[1.01]"
          />

          {/* Quick overlay tag in photo */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-medium border border-white/20 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#B9DDF5]" />
            <span>{post.categoryLabel}</span>
          </div>
        </div>

        {/* Right: Author info, description, EXIF and comments */}
        <div className="lg:w-2/5 flex flex-col justify-between max-h-[50vh] lg:max-h-[92vh] bg-white dark:bg-[#0E1626] overflow-y-auto">
          {/* Header: Author & Follow */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-sm z-10">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                if (onOpenAuthorProfile) {
                  onClose();
                  onOpenAuthorProfile(
                    post.authorUsername,
                    post.authorName,
                    post.authorAvatar,
                    post.authorId
                  );
                }
              }}
              title="Ver perfil de Instagram de este usuario"
            >
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-[#B9DDF5] group-hover:ring-sky-500 dark:ring-indigo-500/60 transition-all"
              />
              <div>
                <h3 className="text-sm font-bold text-[#263B54] dark:text-white leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {post.authorName}
                </h3>
                {isLocationEnabled ? (
                  <p className="text-xs text-[#71849A] dark:text-[#8EA5C0] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-500" />
                    <span className="truncate max-w-[140px] sm:max-w-none">{post.location}</span>
                    {distanceKm !== null && (
                      <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold whitespace-nowrap">
                        · {distanceKm} km
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-[11px] text-[#71849A] flex items-center gap-1 italic">
                    <span>📍 Ubicación privada</span>
                  </p>
                )}
              </div>
            </div>

            {user?.id !== post.authorId && (
              <button
                onClick={handleFollow}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isFollowing
                    ? 'bg-slate-100 dark:bg-slate-800 text-[#71849A] dark:text-slate-300'
                    : 'bg-[#B9DDF5]/40 hover:bg-[#B9DDF5]/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#263B54] dark:text-white'
                }`}
              >
                {isFollowing ? 'Siguiendo' : '+ Seguir'}
              </button>
            )}
          </div>

          {/* Middle Body: Description, EXIF, and Comments */}
          <div className="p-4 sm:p-5 space-y-4 flex-1">
            <div>
              <h2 className="text-lg font-bold text-[#263B54] dark:text-white font-['Plus_Jakarta_Sans'] mb-1.5">
                {post.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                {post.description}
              </p>
              <p className="text-[11px] text-[#71849A] dark:text-[#8EA5C0] mt-2">
                Publicado {post.date}
              </p>
            </div>

            {/* Photo Capture Geolocation & Mini-Map */}
            {isLocationEnabled && (
              <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-slate-850/80 border border-sky-100 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-[#263B54] dark:text-[#B9DDF5]">
                  <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                    <span className="truncate">{post.location}</span>
                  </span>
                  <button
                    onClick={() => setShowLocationMap((prev) => !prev)}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1 font-bold whitespace-nowrap"
                  >
                    <Map className="w-3 h-3" />
                    <span>{showLocationMap ? 'Ocultar mapa' : 'Ver mapa del lugar'}</span>
                  </button>
                </div>

                {distanceKm !== null && (
                  <div className="text-[11px] text-[#71849A] flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-sky-500" />
                    <span>Aproximadamente a <strong>{distanceKm} km</strong> de tu ubicación actual.</span>
                  </div>
                )}

                {showLocationMap && (
                  <div className="pt-1 animate-in fade-in duration-200">
                    <MiniLocationMap
                      lat={postCoords.lat}
                      lng={postCoords.lng}
                      locationName={post.location}
                      distanceKm={distanceKm}
                    />
                  </div>
                )}
              </div>
            )}

            {/* EXIF Technical Data Accordion */}
            {post.exif && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between font-semibold text-[#263B54] dark:text-[#B9DDF5] mb-2">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    Parámetros Atmosféricos & Fotográficos
                  </span>
                  <button
                    onClick={() => setShowExif((prev) => !prev)}
                    className="text-[11px] text-[#71849A] hover:underline cursor-pointer"
                  >
                    {showExif ? 'Ocultar' : 'Ver'}
                  </button>
                </div>

                {showExif && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    {post.exif.camera && (
                      <div>
                        <span className="text-[#71849A] dark:text-[#64748B]">Cámara:</span>{' '}
                        {post.exif.camera}
                      </div>
                    )}
                    {post.exif.lens && (
                      <div>
                        <span className="text-[#71849A] dark:text-[#64748B]">Objetivo:</span>{' '}
                        {post.exif.lens}
                      </div>
                    )}
                    {post.exif.focalLength && (
                      <div>
                        <span className="text-[#71849A] dark:text-[#64748B]">Focal:</span>{' '}
                        {post.exif.focalLength}
                      </div>
                    )}
                    {post.exif.aperture && (
                      <div>
                        <span className="text-[#71849A] dark:text-[#64748B]">Apertura:</span>{' '}
                        {post.exif.aperture}
                      </div>
                    )}
                    {post.exif.shutter && (
                      <div>
                        <span className="text-[#71849A] dark:text-[#64748B]">Velocidad:</span>{' '}
                        {post.exif.shutter}
                      </div>
                    )}
                    {post.exif.iso && (
                      <div>
                        <span className="text-[#71849A] dark:text-[#64748B]">ISO:</span> {post.exif.iso}
                      </div>
                    )}
                    {post.exif.altitude && (
                      <div className="col-span-2">
                        <span className="text-[#71849A] dark:text-[#64748B]">Altitud:</span>{' '}
                        {post.exif.altitude}
                      </div>
                    )}
                    {post.exif.cloudClassification && (
                      <div className="col-span-2 text-indigo-600 dark:text-indigo-400 font-medium">
                        <span className="text-[#71849A] dark:text-[#64748B]">Clasificación:</span>{' '}
                        {post.exif.cloudClassification}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#71849A] dark:text-[#8EA5C0] uppercase tracking-wider">
                Comentarios ({post.comments?.length || 0})
              </h4>

              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5 text-xs">
                      <img
                        src={comment.userAvatar}
                        alt={comment.username}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[#263B54] dark:text-white">
                            @{comment.username}
                          </span>
                          <span className="text-[10px] text-[#71849A]">{comment.timestamp}</span>
                        </div>
                        <p className="text-[#475569] dark:text-[#CBD5E1]">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#71849A] italic">
                  Aún no hay comentarios. ¡Sé el primero en compartir tu perspectiva!
                </p>
              )}
            </div>
          </div>

          {/* Bottom Actions & Comment Input */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            {/* Engagement buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    post.isLiked
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      : 'bg-white dark:bg-slate-800 text-[#263B54] dark:text-white hover:bg-slate-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{post.likesCount}</span>
                </motion.button>

                <button
                  onClick={handleSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'bg-white dark:bg-slate-800 text-[#263B54] dark:text-white hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white dark:bg-slate-800 text-[#71849A] hover:text-[#263B54] dark:hover:text-white transition-colors cursor-pointer"
                  title="Compartir enlace"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

              {copiedLink && (
                <span className="text-[11px] text-emerald-600 font-medium">¡Enlace copiado!</span>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Añadir una reflexión o pregunta..."
                className="flex-1 py-2 px-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#263B54] dark:text-white placeholder-[#71849A] focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 rounded-full bg-[#263B54] dark:bg-white text-white dark:text-[#0B111E] text-xs font-semibold disabled:opacity-40 transition-opacity cursor-pointer flex items-center gap-1"
              >
                <span>Enviar</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
