import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GeolocationProvider } from './context/GeolocationContext';
import { FriendsProvider } from './context/FriendsContext';
import { CookieConsentProvider, useCookieConsent } from './context/CookieConsentContext';
import { INITIAL_POSTS, STORIES } from './data/mockData';
import { Post } from './types';
import { Header } from './components/Header';
import { BottomDock } from './components/BottomDock';
import { Hero } from './components/Hero';
import { StoriesBar } from './components/StoriesBar';
import { FeedSection } from './components/FeedSection';
import { VideoReelsView } from './components/VideoReelsView';
import { AiAnalyzerView } from './components/AiAnalyzerView';
import { EventsView } from './components/EventsView';
import { CommunityChatView } from './components/CommunityChatView';
import { ProfileView } from './components/ProfileView';
import { AdminDatabaseDashboard } from './components/AdminDatabaseDashboard';
import { PhotoLightboxModal } from './components/PhotoLightboxModal';
import { PublishModal } from './components/PublishModal';
import { AuthModals } from './components/AuthModals';
import { UserProfileModal, AuthorProfileInfo } from './components/UserProfileModal';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { DataPoliciesModal } from './components/DataPoliciesModal';
import { Cloud, Heart, ShieldCheck } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { openAuthModal, toggleSavePost } = useAuth();
  const { openPoliciesModal } = useCookieConsent();
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorProfileInfo | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [directChatTarget, setDirectChatTarget] = useState<AuthorProfileInfo | null>(null);

  // Toggle Like on any post
  const handleLikeToggle = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );

    if (lightboxPost && lightboxPost.id === postId) {
      setLightboxPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likesCount: !prev.isLiked ? prev.likesCount + 1 : prev.likesCount - 1,
            }
          : null
      );
    }
  };

  // Toggle Save on any post
  const handleSaveToggle = (postId: string) => {
    const isNowSaved = toggleSavePost(postId);
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isSaved: isNowSaved,
            savesCount: isNowSaved ? p.savesCount + 1 : Math.max(0, p.savesCount - 1),
          };
        }
        return p;
      })
    );

    if (lightboxPost && lightboxPost.id === postId) {
      setLightboxPost((prev) =>
        prev
          ? {
              ...prev,
              isSaved: isNowSaved,
              savesCount: isNowSaved ? prev.savesCount + 1 : Math.max(0, prev.savesCount - 1),
            }
          : null
      );
    }
  };

  // Add Comment to post
  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      userId: 'own-user',
      username: 'tu_usuario',
      userAvatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      text,
      timestamp: 'Ahora',
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [newComment, ...(p.comments || [])],
          };
        }
        return p;
      })
    );

    if (lightboxPost && lightboxPost.id === postId) {
      setLightboxPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: prev.commentsCount + 1,
              comments: [newComment, ...(prev.comments || [])],
            }
          : null
      );
    }
  };

  // Post Created
  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setActiveTab('inicio');
    // Scroll down to feed
    setTimeout(() => {
      const feedElem = document.getElementById('community-feed');
      if (feedElem) {
        feedElem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  const scrollToFeed = () => {
    const feedElem = document.getElementById('community-feed');
    if (feedElem) {
      feedElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAuthorProfile = (
    authorUsername: string,
    authorName: string,
    authorAvatar: string,
    authorId?: string
  ) => {
    const authorPost = posts.find(
      (p) =>
        p.authorUsername.toLowerCase() === authorUsername.toLowerCase() ||
        p.authorName.toLowerCase() === authorName.toLowerCase()
    );

    setSelectedAuthor({
      id: authorId || authorPost?.authorId || `user-${authorUsername}`,
      name: authorName || authorPost?.authorName || authorUsername,
      username: authorUsername,
      avatar:
        authorAvatar ||
        authorPost?.authorAvatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      location: authorPost?.location,
      camera: authorPost?.exif?.camera,
      bio:
        authorPost?.description ||
        `Fotógrafo y observador activo en OnlyCloud. Compartiendo la belleza dinámica de la bóveda celeste.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F9FD] dark:bg-[#0B111E] text-[#263B54] dark:text-[#E2ECF8] font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300 flex flex-col justify-between">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPublish={() => setPublishModalOpen(true)}
      />

      {/* Main Views Container */}
      <main className="flex-1 pb-24">
        {/* VIEW 1: INICIO (Hero + Stories + Instagram Feed + Mosaic toggle) */}
        {activeTab === 'inicio' && (
          <div>
            <Hero
              onExploreClick={scrollToFeed}
              onOpenRegister={() => openAuthModal('register')}
              onOpenLogin={() => openAuthModal('login')}
            />

            {/* Stories Section immediately below Hero (Image 2) */}
            <div id="community-feed">
              <StoriesBar
                stories={STORIES}
                onAddStory={() => setPublishModalOpen(true)}
                onOpenStory={(index) => setSelectedStoryIndex(index)}
                onOpenAuthorProfile={handleOpenAuthorProfile}
              />

              {/* Feed de la Comunidad (Image 2) */}
              <FeedSection
                posts={posts}
                stories={STORIES}
                onOpenLightbox={(post) => setLightboxPost(post)}
                onLikeToggle={handleLikeToggle}
                onSaveToggle={handleSaveToggle}
                onOpenAuthorProfile={handleOpenAuthorProfile}
                onOpenStory={(index) => setSelectedStoryIndex(index)}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: CIELOS EN MOVIMIENTO (Timelapses & Reels) */}
        {activeTab === 'videos' && (
          <div className="pt-16">
            <VideoReelsView />
          </div>
        )}

        {/* VIEW 4: ANALIZADOR IA (Image 3 - Aura Atmospheric & Celestial AI) */}
        {activeTab === 'ia' && (
          <div className="pt-16">
            <AiAnalyzerView />
          </div>
        )}

        {/* VIEW 5: QUEDADAS & EVENTOS (Image 4 - Natural Phenomena & Community Meetups) */}
        {activeTab === 'eventos' && (
          <div className="pt-16">
            <EventsView
              onStartDirectChat={(friend) => {
                setDirectChatTarget({
                  id: friend.id,
                  name: friend.name,
                  username: friend.username,
                  avatar: friend.avatar,
                });
                setActiveTab('comunidad');
              }}
              onOpenAuthorProfile={handleOpenAuthorProfile}
            />
          </div>
        )}

        {/* VIEW 6: COMUNIDAD & CHAT */}
        {activeTab === 'comunidad' && (
          <div className="pt-16">
            <CommunityChatView
              initialDirectUser={directChatTarget}
              onViewOnMap={() => {
                setActiveTab('eventos');
              }}
              onOpenAuthorProfile={handleOpenAuthorProfile}
            />
          </div>
        )}

        {/* VIEW 7: PERFIL PERSONAL */}
        {activeTab === 'perfil' && (
          <div className="pt-16">
            <ProfileView
              posts={posts}
              onOpenLightbox={(post) => setLightboxPost(post)}
              onOpenPublish={() => setPublishModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 8: BASE DE DATOS Y CONSOLA ADMIN (Sólo para usuario privado ADMINCLOUD) */}
        {activeTab === 'admin_database' && (
          <div className="pt-16">
            <AdminDatabaseDashboard onNavigateToTab={setActiveTab} />
          </div>
        )}
      </main>

      {/* Floating Bottom Dock matching Image 1 & 3 */}
      <BottomDock
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPublish={() => setPublishModalOpen(true)}
      />

      {/* Minimal Footer */}
      <footer className="w-full py-8 border-t border-slate-200/60 dark:border-slate-800 text-center text-xs text-[#71849A] dark:text-[#8EA5C0] bg-white/40 dark:bg-[#0E1626]/40 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-[#263B54] dark:text-white">
            <Cloud className="w-4 h-4 text-[#B9DDF5]" />
            <span>ONLYCLOUD</span>
            <span className="font-normal text-[#71849A]">· «El cielo es de todos»</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button
              onClick={() => openPoliciesModal('cookies')}
              className="inline-flex items-center gap-1.5 font-semibold text-[#263B54] dark:text-[#CBD5E1] hover:underline cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              <span>Datos - Políticas & Cookies</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <p>
              Red social de fotografía y contemplación de nubes, atardeceres y astronomía.
            </p>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Photo Lightbox Modal */}
      {lightboxPost && (
        <PhotoLightboxModal
          post={lightboxPost}
          onClose={() => setLightboxPost(null)}
          onLikeToggle={handleLikeToggle}
          onSaveToggle={handleSaveToggle}
          onAddComment={handleAddComment}
          onOpenAuthorProfile={handleOpenAuthorProfile}
        />
      )}

      {/* 2. Publish Sky Photo Modal */}
      <PublishModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {/* 3. Authentication & Security Guard Modals */}
      <AuthModals />

      {/* 4. Instagram-style User Profile Modal */}
      {selectedAuthor && (
        <UserProfileModal
          author={selectedAuthor}
          allPosts={posts}
          stories={STORIES}
          onClose={() => setSelectedAuthor(null)}
          onOpenStory={(storyIndex) => {
            setSelectedStoryIndex(storyIndex);
          }}
          onOpenLightbox={(post) => {
            setLightboxPost(post);
          }}
          onStartDirectChat={(author) => {
            setSelectedAuthor(null);
            setDirectChatTarget(author);
            setActiveTab('comunidad');
          }}
        />
      )}

      {/* 5. Instagram-style Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewerModal
          stories={STORIES}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
          onOpenAuthorProfile={(username, name, avatar) => {
            setSelectedStoryIndex(null);
            handleOpenAuthorProfile(username, name, avatar);
          }}
        />
      )}

      {/* 6. Cookie Consent Banner (se muestra al entrar por primera vez) */}
      <CookieConsentBanner />

      {/* 7. Modal de Seguridad, Política de Privacidad, Cookies y Permisos (RGPD/AEPD) */}
      <DataPoliciesModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <GeolocationProvider>
        <FriendsProvider>
          <CookieConsentProvider>
            <MainAppContent />
          </CookieConsentProvider>
        </FriendsProvider>
      </GeolocationProvider>
    </AuthProvider>
  );
}
