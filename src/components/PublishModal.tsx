import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  X,
  Camera,
  Layers,
  MapPin,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { CategoryType, Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../context/GeolocationContext';
import { Navigation, Compass } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (newPost: Post) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const { user } = useAuth();
  const { userLocation, userLocationName, requestGeoPermission, isLocating } = useGeolocation();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('nubes');
  const [location, setLocation] = useState(userLocationName || 'España');
  const [altitude, setAltitude] = useState('1.250 m');
  const [camera, setCamera] = useState('Sony A7 IV');
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(userLocation);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview || !title.trim()) return;

    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setIsSuccess(true);

          const catObj = CATEGORIES.find((c) => c.id === category);

          const newPost: Post = {
            id: `post-${Date.now()}`,
            authorId: user?.id || 'guest',
            authorName: user?.displayName || 'Observador OnlyCloud',
            authorUsername: user?.username || 'usuario',
            authorAvatar:
              user?.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            title,
            description,
            imageUrl: imagePreview,
            category,
            categoryLabel: catObj ? catObj.label : 'Nubes',
            date: 'Hace un momento',
            location,
            locationEnabled,
            coordinates: locationEnabled ? coordinates || userLocation : undefined,
            likesCount: 1,
            commentsCount: 0,
            savesCount: 0,
            isLiked: false,
            isSaved: false,
            exif: {
              camera,
              altitude,
              cloudClassification: 'Observación Comunitaria',
            },
            comments: [],
          };

          setTimeout(() => {
            onPostCreated(newPost);
            onClose();
            setIsSuccess(false);
            setImagePreview(null);
            setTitle('');
            setDescription('');
          }, 1200);

          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-[#0E1626] rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B9DDF5] to-[#DCD5F5] flex items-center justify-center text-[#263B54]">
              <UploadCloud className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#263B54] dark:text-white">
              Comparte tu cielo con el mundo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#71849A] hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {isSuccess ? (
            <div className="py-16 text-center space-y-3">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-[#263B54] dark:text-white">
                ¡Fotografía publicada con éxito!
              </h3>
              <p className="text-xs text-[#71849A]">
                Ya está disponible en la galería y en tu perfil de OnlyCloud.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Dropzone or Image Preview */}
              {!imagePreview ? (
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#B9DDF5] dark:hover:border-indigo-400 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-850/40"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#B9DDF5]/30 dark:bg-slate-800 flex items-center justify-center text-[#263B54] dark:text-[#B9DDF5] mb-3">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <p className="font-bold text-sm text-[#263B54] dark:text-white">
                    Arrastra aquí tu fotografía del cielo
                  </p>
                  <p className="text-xs text-[#71849A] mt-1">
                    o haz clic para seleccionarla desde tu dispositivo (JPG, PNG, WebP)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 group">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    title="Cambiar imagen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                  Título de la fotografía *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Cúmulos en floración sobre la meseta al atardecer"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white placeholder-[#71849A] focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                  Categoría celestial *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.filter((c) => c.id !== 'todas').map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-2 px-3 rounded-xl border text-left flex items-center gap-1.5 transition-colors cursor-pointer ${
                        category === cat.id
                          ? 'border-indigo-500 bg-[#B9DDF5]/20 dark:bg-slate-800 font-bold text-[#263B54] dark:text-white'
                          : 'border-slate-200 dark:border-slate-700 text-[#71849A] hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                  Descripción & Perspectiva de observación
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Cuenta qué sentías, cómo era la luz, la dirección del viento o qué te inspiró..."
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white placeholder-[#71849A] focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
                />
              </div>

              {/* Location & Altitude */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                    Ubicación del disparo
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej: Sierra de Guadarrama, Madrid"
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#263B54] dark:text-white block mb-1">
                    Altitud aproximada (msnm)
                  </label>
                  <input
                    type="text"
                    value={altitude}
                    onChange={(e) => setAltitude(e.target.value)}
                    placeholder="Ej: 1.840 m"
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#263B54] dark:text-white"
                  />
                </div>
              </div>

              {/* Geolocation Activation Toggle & GPS Detection */}
              <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-500 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-[#263B54] dark:text-white block">
                        Activar geolocalización en esta fotografía
                      </span>
                      <span className="text-[10px] text-[#71849A]">
                        Permite que la comunidad vea el lugar en el mapa interactivo al abrir la foto
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={locationEnabled}
                    onChange={(e) => setLocationEnabled(e.target.checked)}
                    className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                  />
                </div>

                {locationEnabled && (
                  <div className="flex items-center justify-between pt-1 border-t border-sky-100/60 dark:border-slate-700/60 text-xs">
                    <span className="text-[11px] text-[#71849A]">
                      {coordinates
                        ? `GPS: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
                        : 'Coordenadas del mapa activas'}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        const success = await requestGeoPermission();
                        if (success) {
                          setLocation(userLocationName);
                          setCoordinates(userLocation);
                        }
                      }}
                      disabled={isLocating}
                      className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-semibold text-sky-600 dark:text-sky-300 flex items-center gap-1 cursor-pointer hover:opacity-90 disabled:opacity-50"
                    >
                      <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>Detectar mi GPS</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] font-semibold text-[#71849A]">
                    <span>Optimizando y publicando en la nube...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#B9DDF5] to-[#DCD5F5] transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-[#71849A] hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!imagePreview || !title.trim() || isUploading}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-[#B9DDF5] to-[#DCD5F5] hover:opacity-95 text-[#263B54] font-bold shadow-xs disabled:opacity-40 cursor-pointer transition-opacity"
                >
                  {isUploading ? 'Subiendo...' : 'Publicar fotografía'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
