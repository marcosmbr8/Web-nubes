import React from 'react';
import { motion } from 'motion/react';
import { Home, Video, Plus, Sparkles, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BottomDockProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPublish: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({ activeTab, setActiveTab, onOpenPublish }) => {
  const { requireAuth } = useAuth();

  const dockTabs = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'videos', label: 'Vídeos', icon: Video },
    { id: 'publish', label: '+', icon: Plus, isAction: true },
    { id: 'ia', label: 'Chat IA', icon: Sparkles },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  const handleTabClick = (item: (typeof dockTabs)[0]) => {
    if (item.isAction) {
      requireAuth(() => {
        onOpenPublish();
      }, 'Inicia sesión para subir una fotografía a OnlyCloud.');
    } else {
      setActiveTab(item.id);
      if (item.id === 'inicio') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] sm:w-auto">
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="backdrop-blur-2xl bg-white/85 dark:bg-[#0E1626]/85 border border-white/80 dark:border-slate-800/80 shadow-[0_12px_35px_rgba(38,59,84,0.12)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.4)] rounded-full px-3 py-2 flex items-center justify-around gap-1 sm:gap-3"
      >
        {dockTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isAction) {
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleTabClick(item)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#B9DDF5] to-[#DCD5F5] dark:from-[#385170] dark:to-[#6366F1] flex items-center justify-center text-[#263B54] dark:text-white shadow-md mx-1 cursor-pointer focus:outline-none"
                aria-label="Publicar cielo"
                title="Publicar fotografía"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </motion.button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={`relative flex flex-col items-center justify-center px-2.5 sm:px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                isActive
                  ? 'text-[#263B54] dark:text-[#B9DDF5] font-semibold'
                  : 'text-[#71849A] dark:text-[#8EA5C0] hover:text-[#263B54] dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
              <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="dockIndicator"
                  className="w-1.5 h-1.5 rounded-full bg-[#263B54] dark:bg-[#B9DDF5] mt-0.5"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};
