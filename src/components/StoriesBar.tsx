import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Story } from '../types';
import { useAuth } from '../context/AuthContext';
import { StoryViewerModal } from './StoryViewerModal';

interface StoriesBarProps {
  stories: Story[];
  onAddStory?: () => void;
  onOpenStory?: (index: number) => void;
  onOpenAuthorProfile?: (authorUsername: string, authorName: string, authorAvatar: string) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  onAddStory,
  onOpenStory,
  onOpenAuthorProfile,
}) => {
  const { user, requireAuth } = useAuth();
  const [internalStoryIndex, setInternalStoryIndex] = useState<number | null>(null);

  const handleOpenStory = (index: number) => {
    if (onOpenStory) {
      onOpenStory(index);
    } else {
      setInternalStoryIndex(index);
    }
  };

  const handleAddMyStory = () => {
    requireAuth(() => {
      if (onAddStory) onAddStory();
    }, 'Inicia sesión para subir una historia de tu cielo.');
  };

  return (
    <div className="w-full py-4 border-b border-slate-100 dark:border-slate-800/80 bg-white/40 dark:bg-[#0B111E]/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
          {/* Tu Historia item */}
          <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group" onClick={handleAddMyStory}>
            <div className="relative p-0.5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2px] bg-slate-200 dark:bg-slate-700 group-hover:bg-[#B9DDF5] transition-colors">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                  }
                  alt="Tu historia"
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0B111E]"
                />
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-[#B9DDF5] to-[#DCD5F5] dark:from-indigo-500 dark:to-purple-500 border-2 border-white dark:border-[#0B111E] flex items-center justify-center text-[#263B54] dark:text-white shadow-xs">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
            <span className="text-xs font-medium text-[#71849A] dark:text-[#8EA5C0] mt-1.5 group-hover:text-[#263B54] dark:group-hover:text-white">
              Tu historia
            </span>
          </div>

          {/* Other Users Stories (Instagram Vibrant Ring) */}
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenStory(index)}
              className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              title={`Ver historia de @${story.username}`}
            >
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[2.5px] shadow-xs group-hover:shadow-md transition-shadow">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2px] bg-white dark:bg-[#0B111E]">
                  <img
                    src={story.userAvatar}
                    alt={story.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-[#263B54] dark:text-[#E2ECF8] mt-1.5 truncate max-w-[72px]">
                {story.username}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fallback Internal Story Viewer Modal (uses createPortal) */}
      {!onOpenStory && internalStoryIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={internalStoryIndex}
          onClose={() => setInternalStoryIndex(null)}
          onOpenAuthorProfile={(username, name, avatar) => {
            setInternalStoryIndex(null);
            if (onOpenAuthorProfile) {
              onOpenAuthorProfile(username, name, avatar);
            }
          }}
        />
      )}
    </div>
  );
};
