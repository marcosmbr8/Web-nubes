import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Upload,
  Send,
  CloudRain,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Camera,
  Layers,
  Bot,
  RotateCw,
} from 'lucide-react';
import { SAMPLE_ANALYSIS_PHOTOS } from '../data/mockData';
import { AuraAnalysis } from '../types';
import { useAuth } from '../context/AuthContext';

export const AiAnalyzerView: React.FC = () => {
  const { user, requireAuth } = useAuth();

  const [selectedSample, setSelectedSample] = useState(SAMPLE_ANALYSIS_PHOTOS[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string>('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AuraAnalysis>(
    SAMPLE_ANALYSIS_PHOTOS[0].initialAnalysis
  );

  // Aura Chat state
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: 'aura' | 'user'; text: string; time: string }[]
  >([
    {
      id: 'init-1',
      sender: 'aura',
      text: '¡Hola! Soy Aura, tu IA especialista en meteorología y astronomía de OnlyCloud. Sube una foto de tu cielo o selecciona una muestra, y la analizaré con precisión científica y tono divulgativo.',
      time: 'Ahora',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const activeImageUrl = customImage || selectedSample.url;
  const activeTitle = customImage ? customImageName : selectedSample.title;

  const handleSelectSample = (sample: (typeof SAMPLE_ANALYSIS_PHOTOS)[0]) => {
    setSelectedSample(sample);
    setCustomImage(null);
    setAnalysisResult(sample.initialAnalysis);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    requireAuth(() => {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImage(reader.result as string);
        setCustomImageName(file.name.replace(/\.[^/.]+$/, ''));
        // Trigger initial preview analysis
        setAnalysisResult({
          certeza_analisis: 'media',
          categoria: 'meteorologia',
          diagnostico_principal: 'Fotografía personalizada cargada',
          alternativas_estimadas: ['Inicia el análisis con Aura'],
          explicacion_sencilla:
            'Pulsa "Iniciar Análisis de IA" para que Aura examine los patrones convectivos, tipos de nubes o astros visibles.',
          consejo_observacion:
            'Las imágenes con buena definición y sin compresión excesiva ofrecen diagnósticos más exactos.',
        });
      };
      reader.readAsDataURL(file);
    }, 'Inicia sesión para subir fotografías al analizador.');
  };

  const handleRunAnalysis = async () => {
    requireAuth(async () => {
      setIsAnalyzing(true);
      try {
        const payload: any = {
          sampleId: customImage ? undefined : selectedSample.id,
          imageBase64: customImage || undefined,
        };

        const res = await fetch('/api/analyze-sky', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setAnalysisResult(data.data);
          // Add notification to chat
          setChatMessages((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              sender: 'aura',
              text: `He completado el análisis de "${activeTitle}": He identificado principalmente "${data.data.diagnostico_principal}" con certeza ${data.data.certeza_analisis}. ¿Quieres saber más sobre cómo se forma o cómo fotografiarlo?`,
              time: 'Ahora',
            },
          ]);
        }
      } catch (err) {
        console.error('Analysis error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 'Inicia sesión para analizar fotografías con la IA de OnlyCloud.');
  };

  const handleSendMessage = async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const textToSend = presetText || inputMessage;
    if (!textToSend.trim()) return;

    requireAuth(async () => {
      const userMsg = {
        id: `user-${Date.now()}`,
        sender: 'user' as const,
        text: textToSend,
        time: 'Ahora',
      };
      setChatMessages((prev) => [...prev, userMsg]);
      setInputMessage('');
      setIsChatLoading(true);

      try {
        const res = await fetch('/api/aura-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            history: chatMessages.slice(-6),
            currentAnalysis: analysisResult,
          }),
        });
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            id: `aura-${Date.now()}`,
            sender: 'aura',
            text: data.reply || 'El cielo siempre guarda misterios fascinantes. ¿Qué más deseas consultar?',
            time: 'Ahora',
          },
        ]);
      } catch (err) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `aura-${Date.now()}`,
            sender: 'aura',
            text: 'Disculpa, hubo un problema de conexión temporal con los modelos de observación. Por favor inténtalo de nuevo.',
            time: 'Ahora',
          },
        ]);
      } finally {
        setIsChatLoading(false);
      }
    }, 'Inicia sesión para conversar con Aura IA.');
  };

  return (
    <div className="w-full py-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header matching Image 3 */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Inteligencia Artificial Especializada</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#263B54] dark:text-white font-['Plus_Jakarta_Sans'] mb-3">
          Analizador Atmosférico & Celeste
        </h1>
        <p className="text-xs sm:text-sm text-[#71849A] dark:text-[#B4C6DA] max-w-2xl mx-auto leading-relaxed">
          Sube cualquier fotografía de nubes, fenómenos meteorológicos o astros. Aura identificará la
          especie de nube y constelaciones a través de la foto.
        </p>
      </div>

      {/* Main Grid: Left Photo & Samples, Right Aura Diagnostics & Live Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (lg:col-span-7): Photo Preview, Upload & Samples */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Card */}
          <div className="bg-white dark:bg-[#0E1626] rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="relative aspect-[16/10] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 group">
              <img
                src={activeImageUrl}
                alt={activeTitle}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Title Badge */}
              <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/20 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#B9DDF5]" />
                <span className="truncate max-w-[200px]">{activeTitle}</span>
              </div>

              {/* In-progress analysis overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3">
                  <RotateCw className="w-8 h-8 text-[#B9DDF5] animate-spin" />
                  <p className="text-xs font-semibold tracking-wide">
                    Aura examinando capas atmosféricas...
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons under preview */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* File upload input hidden, triggered by button */}
              <label className="w-full sm:w-1/2 py-2.5 px-4 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-[#263B54] dark:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-[#71849A]" />
                <span>Subir otra fotografía</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Iniciar Análisis Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-full bg-gradient-to-r from-[#B9DDF5] via-[#DCD5F5] to-[#B9DDF5] hover:opacity-95 text-[#263B54] text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#263B54]" />
                <span>{isAnalyzing ? 'Analizando...' : 'Iniciar Análisis de IA'}</span>
              </motion.button>
            </div>
          </div>

          {/* Sample photos selector matching Image 3 */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#71849A] dark:text-[#8EA5C0] uppercase tracking-wider">
              O prueba con estas fotografías de muestra:
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SAMPLE_ANALYSIS_PHOTOS.map((sample) => {
                const isSelected = !customImage && selectedSample.id === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`relative rounded-2xl overflow-hidden border-2 text-left transition-all cursor-pointer p-1.5 bg-white dark:bg-[#0E1626] ${
                      isSelected
                        ? 'border-indigo-500 shadow-sm'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 mb-1.5">
                      <img
                        src={sample.url}
                        alt={sample.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] font-bold text-[#263B54] dark:text-white truncate">
                      {sample.title}
                    </p>
                    <p className="text-[10px] text-[#71849A] dark:text-[#8EA5C0] truncate">
                      {sample.category}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-5): Diagnosis Card & Live Chat */}
        <div className="lg:col-span-5 space-y-6">
          {/* Aura Diagnosis Result Card */}
          <div className="bg-white dark:bg-[#0E1626] rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#263B54] dark:text-white uppercase tracking-wider">
                    Diagnóstico de Aura
                  </h3>
                  <span className="text-[10px] text-[#71849A] capitalize">
                    {analysisResult.categoria}
                  </span>
                </div>
              </div>

              {/* Certeza pill */}
              <div
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                  analysisResult.certeza_analisis === 'alta'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : analysisResult.certeza_analisis === 'media'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Certeza {analysisResult.certeza_analisis}</span>
              </div>
            </div>

            {/* Principal Diagnosis */}
            <div>
              <span className="text-[10px] font-semibold text-[#71849A] uppercase tracking-wide">
                Identificación Concreta:
              </span>
              <h4 className="text-base sm:text-lg font-bold text-[#263B54] dark:text-[#B9DDF5] mt-0.5">
                {analysisResult.diagnostico_principal}
              </h4>
            </div>

            {/* Alternativas estimadas */}
            {analysisResult.alternativas_estimadas?.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold text-[#71849A] uppercase tracking-wide">
                  Alternativas estimadas:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {analysisResult.alternativas_estimadas.map((alt, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-slate-50 dark:bg-slate-800/80 text-[#475569] dark:text-[#94A3B8] px-2.5 py-0.5 rounded-full border border-slate-200/50 dark:border-slate-700/50"
                    >
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Explicación didáctica */}
            <div className="p-3.5 rounded-2xl bg-[#F4F9FD] dark:bg-slate-800/40 border border-[#B9DDF5]/40 dark:border-slate-700/40 text-xs text-[#263B54] dark:text-[#CBD5E1] leading-relaxed">
              <p>{analysisResult.explicacion_sencilla}</p>
            </div>

            {/* Consejo de observación */}
            <div className="flex items-start gap-2.5 text-xs text-[#71849A] dark:text-[#8EA5C0] pt-1">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-[#263B54] dark:text-white">Consejo fotográfico:</strong>{' '}
                {analysisResult.consejo_observacion}
              </p>
            </div>
          </div>

          {/* Interactive Aura Live Chat */}
          <div className="bg-white dark:bg-[#0E1626] rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[340px]">
            {/* Chat header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-bold text-[#263B54] dark:text-white">
                  Pregunta a Aura sobre el cielo o tu cámara
                </h4>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#263B54] text-white rounded-tr-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-[#263B54] dark:text-[#E2ECF8] rounded-tl-xs border border-slate-100 dark:border-slate-700/60'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-2xl text-xs text-[#71849A] flex items-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Aura consultando efemérides y modelos...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 border-t border-slate-100 dark:border-slate-800 my-1">
              <button
                type="button"
                onClick={() => handleSendMessage(undefined, '¿Qué tiempo indica este tipo de nube?')}
                className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#B9DDF5]/40 text-[#475569] dark:text-[#CBD5E1] whitespace-nowrap cursor-pointer transition-colors"
              >
                🌦️ ¿Qué tiempo indica?
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage(undefined, '¿Cómo fotografiar estrellas con nitidez?')}
                className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#B9DDF5]/40 text-[#475569] dark:text-[#CBD5E1] whitespace-nowrap cursor-pointer transition-colors"
              >
                ⭐ Parámetros para estrellas
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage(undefined, '¿A qué altitud se forman estas nubes?')}
                className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#B9DDF5]/40 text-[#475569] dark:text-[#CBD5E1] whitespace-nowrap cursor-pointer transition-colors"
              >
                ⛰️ Altitud de formación
              </button>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe a Aura (ej: ¿Cómo calcular la hora dorada?)..."
                className="flex-1 py-2 px-3.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#263B54] dark:text-white placeholder-[#71849A] focus:outline-none focus:ring-2 focus:ring-[#B9DDF5]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isChatLoading}
                className="p-2 rounded-full bg-[#263B54] dark:bg-white text-white dark:text-[#0B111E] disabled:opacity-40 transition-opacity cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
