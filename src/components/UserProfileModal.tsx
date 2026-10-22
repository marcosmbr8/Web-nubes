import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  Camera,
  Calendar,
  Grid,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Check,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowLeft,
  UserPlus,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Send,
  Lock,
} from 'lucide-react';
import { Post, Story } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../context/FriendsContext';

export interface AuthorProfileInfo {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  location?: string;
  camera?: string;
  followersCount?: number;
  followingCount?: number;
}

interface UserProfileModalProps {
  author: AuthorProfileInfo;
  allPosts: Post[];
  stories?: Story[];
  onClose: () => void;
  onOpenLightbox: (post: Post) => void;
  onOpenStory?: (storyIndex: number) => void;
  onStartDirectChat?: (author: AuthorProfileInfo) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  author,
  allPosts,
  stories = [],
  onClose,
  onOpenLightbox,
  onOpenStory,
  onStartDirectChat,
}) => {
  const { user, requireAuth } = useAuth();
  const {
    getFriendshipStatus,
    getFriend,
    sendFriendInvitation,
    acceptFriendInvitation,
  } = useFriends();

  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  
  // Friend invitation dialog state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCustomText, setInviteCustomText] = useState(
    `¡Hola ${author.name}! Me apasionan tus fotografías del cielo en OnlyCloud. ¿Conectamos como amigos para chatear y compartir ubicaciones?`
  );
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  const friendshipStatus = getFriendshipStatus(author.username);
  const friendData = getFriend(author.username);

  // Filter posts created by this author
  const authorPosts = allPosts.filter(
    (p) =>
      p.authorId === author.id ||
      p.authorUsername.toLowerCase() === author.username.toLowerCase() ||
      p.authorName.toLowerCase() === author.name.toLowerCase()
  );

  // Total likes received across all posts
  const totalLikes = authorPosts.reduce((acc, p) => acc + p.likesCount, 0);

  // Check if author has an active story
  const authorStoryIndex = stories.findIndex(
    (s) =>
      s.userId === author.id ||
      s.username.toLowerCase() === author.username.toLowerCase() ||
      s.username.toLowerCase() === author.name.toLowerCase()
  );
  const hasStory = authorStoryIndex !== -1;

  const handleFollow = () => {
    requireAuth(() => {
      setIsFollowing((prev) => !prev);
    }, `Inicia sesión para seguir a ${author.name}.`);
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleMessageOrFriendClick = () => {
    requireAuth(() => {
      if (friendshipStatus === 'accepted') {
        // Already friends: can chat directly
        if (onStartDirectChat) {
          onStartDirectChat(author);
        }
      } else {
        // Enforce requirement: first interaction must be a friend & chat invitation
        setShowInviteModal(true);
      }
    }, 'Inicia sesión para enviar solicitudes de amistad y chatear.');
  };

  const handleSendInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sent = sendFriendInvitation(
      {
        id: author.id,
        username: author.username,
        name: author.name,
        avatar: author.avatar,
        bio: author.bio,
        location: author.location,
      },
      inviteCustomText
    );

    if (sent) {
      setInviteFeedback('¡Invitación de amistad y chat enviada con éxito! Esperando aceptación.');
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteFeedback(null);
      }, 1500);
    }
  };

  const handleSimulateAccept = () => {
    acceptFriendInvitation(author.username);
    setInviteFeedback('¡Invitación aceptada! Ahora sois amigos y podéis chatear libremente.');
    setTimeout(() => {
      setShowInviteModal(false);
      setInviteFeedback(null);
      if (onStartDirectChat) {
        onStartDirectChat(author);
      }
    }, 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      {/* Background click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Profile Card Container (Instagram Profile style) */}
      <div
        className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-[#0E1626] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200/80 dark:border-slate-800 z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header bar with username and actions */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#263B54] dark:text-white font-['Plus_Jakarta_Sans']">
              @{author.username}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span className="text-xs text-[#71849A] dark:text-[#8EA5C0]">Fotógrafo OnlyCloud</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareProfile}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#71849A] hover:text-[#263B54] dark:hover:text-white transition-colors cursor-pointer"
              title="Compartir perfil"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#71849A] hover:text-[#263B54] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar perfil"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Profile Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Main User Info Row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar with Story gradient border */}
            <div
              className={`relative cursor-pointer transition-transform hover:scale-105 ${
                hasStory
                  ? 'p-[3.5px] rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-md ring-2 ring-white dark:ring-[#0E1626]'
                  : 'p-0.5 rounded-full ring-2 ring-slate-200 dark:ring-slate-700'
              }`}
              onClick={() => {
                if (hasStory && onOpenStory) {
                  onOpenStory(authorStoryIndex);
                }
              }}
              title={hasStory ? 'Toca para ver historia activa en estilo Instagram' : 'Avatar del fotógrafo'}
            >
              <img
                src={author.avatar}
                alt={author.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white dark:border-[#0E1626]"
              />
              {hasStory && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm whitespace-nowrap">
                  Historia
                </span>
              )}
            </div>

            {/* User Meta & Action Buttons */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#263B54] dark:text-white leading-tight">
                    {author.name}
                  </h2>
                  <p className="text-xs text-[#71849A] dark:text-[#8EA5C0] mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3 h-3 text-sky-500" />
                    <span>{author.location || 'Comunidad OnlyCloud'}</span>
                  </p>
                </div>

                {/* Follow Button & Friend/Chat Button */}
                {user?.username !== author.username && (
                  <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                    <button
                      onClick={handleFollow}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                        isFollowing
                          ? 'bg-slate-100 dark:bg-slate-800 text-[#71849A] dark:text-slate-300 hover:bg-slate-200'
                          : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-[#263B54] dark:text-white'
                      }`}
                    >
                      {isFollowing ? 'Siguiendo' : '+ Seguir'}
                    </button>

                    {/* Friend & Chat Button: Enforces invitation requirement */}
                    {friendshipStatus === 'accepted' ? (
                      <button
                        onClick={handleMessageOrFriendClick}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                        title="Sois amigos. Pulsa para chatear en directo"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>✓ Amigos · Chatear</span>
                      </button>
                    ) : friendshipStatus === 'pending_sent' ? (
                      <button
                        onClick={handleMessageOrFriendClick}
                        className="px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs hover:bg-amber-100 transition-colors"
                        title="Invitación enviada. Pulsa para ver estado o simular aceptación"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        <span>⏳ Solicitud enviada</span>
                      </button>
                    ) : friendshipStatus === 'pending_received' ? (
                      <button
                        onClick={handleMessageOrFriendClick}
                        className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>📩 Aceptar solicitud</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleMessageOrFriendClick}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-95 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                        title="Para hablar se requiere enviar una invitación de amistad"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Amigos & Chatear</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Status Banner when friends / sharing location */}
              {friendshipStatus === 'accepted' && friendData?.locationPermissionGranted && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium">
                      Amigo conectado · Ubicación compartida en el mapa
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                    GPS Activo
                  </span>
                </div>
              )}

              {/* Bio & Details */}
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                {author.bio ||
                  'Observador activo y creador visual de la comunidad OnlyCloud. Documentando luces atmosféricas, nubes dinámicas y maravillas celestes.'}
              </p>

              {author.camera && (
                <div className="inline-flex items-center gap-1.5 text-xs text-[#71849A] dark:text-[#8EA5C0] bg-slate-50 dark:bg-slate-800/60 px-3 py-1 rounded-full">
                  <Camera className="w-3.5 h-3.5 text-sky-500" />
                  <span>{author.camera}</span>
                </div>
              )}

              {/* Stats Counters (Instagram standard) */}
              <div className="flex items-center justify-center sm:justify-start gap-6 pt-2 text-xs">
                <div>
                  <span className="font-bold text-[#263B54] dark:text-white text-sm sm:text-base">
                    {authorPosts.length}
                  </span>{' '}
                  <span className="text-[#71849A]">publicaciones</span>
                </div>
                <div>
                  <span className="font-bold text-[#263B54] dark:text-white text-sm sm:text-base">
                    {author.followersCount || 342}
                  </span>{' '}
                  <span className="text-[#71849A]">seguidores</span>
                </div>
                <div>
                  <span className="font-bold text-[#263B54] dark:text-white text-sm sm:text-base">
                    {totalLikes}
                  </span>{' '}
                  <span className="text-[#71849A]">me gusta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation: Grid of Publications vs About */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-center gap-8 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 py-2 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'posts'
                    ? 'border-[#263B54] dark:border-sky-400 text-[#263B54] dark:text-sky-400'
                    : 'border-transparent text-[#71849A] hover:text-[#263B54] dark:hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Publicaciones ({authorPosts.length})</span>
              </button>
            </div>
          </div>

          {/* Photos Grid (Instagram 3x3 layout) */}
          {activeTab === 'posts' && (
            <div>
              {authorPosts.length === 0 ? (
                <div className="text-center py-12 text-[#71849A]">
                  <p className="text-sm font-semibold">Aún no hay publicaciones para este autor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                  {authorPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onOpenLightbox(post)}
                      className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800 shadow-xs"
                    >
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Instagram Hover Overlay with Likes & Comments */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4 fill-white" />
                          {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 fill-white" />
                          {post.commentsCount}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FRIEND & CHAT INVITATION MODAL (Strict requirement enforcement) */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#0E1626] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#263B54] dark:text-white">
                      {friendshipStatus === 'pending_sent'
                        ? 'Invitación de Amistad Pendiente'
                        : 'Solicitud de Amistad & Chat'}
                    </h3>
                    <p className="text-xs text-[#71849A] dark:text-[#8EA5C0]">
                      Conectar con @{author.username}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#71849A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Requirement Rule Explanation */}
              <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60 text-xs text-sky-900 dark:text-sky-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Regla de Privacidad de OnlyCloud</span>
                </div>
                <p className="text-[11px] leading-relaxed text-sky-800/90 dark:text-sky-300/90">
                  Para hablar con cualquier persona con perfil, la primera interacción es obligatoriamente una invitación de chat y amistad. <strong>Si no se acepta, no se puede hablar</strong>. Una vez aceptada, podréis chatear en directo y veros en el mapa de geolocalización.
                </p>
              </div>

              {/* Feedback Alert */}
              {inviteFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{inviteFeedback}</span>
                </div>
              )}

              {friendshipStatus === 'none' && (
                <form onSubmit={handleSendInviteSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#263B54] dark:text-slate-200 mb-1.5">
                      Mensaje de presentación para @{author.username}
                    </label>
                    <textarea
                      rows={3}
                      value={inviteCustomText}
                      onChange={(e) => setInviteCustomText(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Escribe un mensaje amistoso..."
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#71849A] hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Invitación</span>
                    </button>
                  </div>
                </form>
              )}

              {friendshipStatus === 'pending_sent' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                    <div className="font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Esperando respuesta de @{author.username}</span>
                    </div>
                    <p className="mt-1 text-[11px]">
                      Has enviado la invitación de amistad y chat. La conversación privada permanecerá bloqueada hasta que @{author.username} la confirme.
                    </p>
                  </div>

                  {/* Simulator button so the user can test the acceptance immediately */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <button
                      onClick={handleSimulateAccept}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simular Aceptación de @{author.username} ahora</span>
                    </button>
                    <p className="text-[10px] text-center text-[#71849A]">
                      (Pulsa para desbloquear el chat de inmediato y probar la conexión)
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};
