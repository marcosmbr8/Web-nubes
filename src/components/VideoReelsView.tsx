import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { CLOUD_VIDEOS } from '../data/mockData';
import { CloudVideo } from '../types';
import { useAuth } from '../context/AuthContext';

export const VideoReelsView: React.FC = () => {
  const { requireAuth } = useAuth();
  const [videos, setVideos] = useState<CloudVideo[]>(CLOUD_VIDEOS);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(CLOUD_VIDEOS[0].id);
  const [isMuted, setIsMuted] = useState(true);
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>([]);

  const handleTogglePlay = (id: string) => {
    setPlayingVideoId((prev) => (prev === id ? null : id));
  };

  const handleLikeVideo = (id: string) => {
    requireAuth(() => {
      setLikedVideoIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((vId) => vId !== id);
        } else {
          return [...prev, id];
        }
      });
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, likes: v.likes + 1 } : v))
      );
    }, 'Inicia sesión para dar Me gusta a este timelapse.');
  };

  return (
    <div className="w-full py-12 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#71849A] dark:text-[#8EA5C0] block mb-1">
          Cielos en Movimiento
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#263B54] dark:text-white font-['Plus_Jakarta_Sans'] mb-2">
          Timelapses & Dinámica Atmosférica
        </h1>
        <p className="text-xs sm:text-sm text-[#71849A] dark:text-[#B4C6DA]">
          El paso del tiempo en el cielo: nubes en cascada, rotación estelar y atardeceres vivos.
        </p>
      </div>

      {/* Video Feed Cards */}
      <div className="space-y-12">
        {videos.map((vid) => {
          const isPlaying = playingVideoId === vid.id;
          const isLiked = likedVideoIds.includes(vid.id);

          return (
            <div
              key={vid.id}
              className="bg-black rounded-3xl overflow-hidden shadow-2xl relative max-w-lg mx-auto border border-white/10"
            >
              {/* Video Player */}
              <div
                className="relative aspect-[9/16] max-h-[720px] w-full overflow-hidden cursor-pointer"
                onClick={() => handleTogglePlay(vid.id)}
              >
                <video
                  src={vid.videoUrl}
                  poster={vid.posterUrl}
                  loop
                  autoPlay={isPlaying}
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Play/Pause Center Indicator */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Audio Mute Button Top Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted((prev) => !prev);
                  }}
                  className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors cursor-pointer"
                  title={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Right Side Social Actions */}
                <div className="absolute right-4 bottom-20 z-20 flex flex-col items-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeVideo(vid.id);
                    }}
                    className="flex flex-col items-center gap-1 text-white"
                  >
                    <div
                      className={`p-3 rounded-full backdrop-blur-md transition-colors ${
                        isLiked ? 'bg-rose-500' : 'bg-black/40 hover:bg-black/60'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                    </div>
                    <span className="text-[11px] font-bold drop-shadow-md">{vid.likes}</span>
                  </motion.button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requireAuth(
                        () => {},
                        'Inicia sesión para comentar en este timelapse.'
                      );
                    }}
                    className="flex flex-col items-center gap-1 text-white"
                  >
                    <div className="p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold drop-shadow-md">{vid.comments}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard?.writeText(window.location.href);
                    }}
                    className="p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white space-y-2 z-10">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={vid.authorAvatar}
                      alt={vid.authorName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-[#B9DDF5]"
                    />
                    <div>
                      <p className="text-sm font-bold leading-tight">{vid.authorName}</p>
                      <p className="text-[11px] text-[#B9DDF5] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{vid.location}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-medium leading-relaxed drop-shadow-md">
                    {vid.title}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-white/80">
                    <Volume2 className="w-3 h-3 text-[#B9DDF5]" />
                    <span className="truncate">{vid.soundTitle}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
