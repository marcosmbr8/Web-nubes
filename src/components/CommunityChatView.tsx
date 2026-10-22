import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  Hash,
  Send,
  Users,
  ShieldCheck,
  Lock,
  Check,
  CheckCheck,
  Sparkles,
  User,
  Clock,
  Circle,
  Search,
  MapPin,
  Compass,
  UserCheck,
  UserPlus,
  Radio,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { CHANNELS, INITIAL_CHANNEL_MESSAGES } from '../data/mockData';
import { Channel, ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFriends, FriendContact } from '../context/FriendsContext';

const INITIAL_DIRECT_MESSAGES: Record<string, ChatMessage[]> = {
  'user-elena': [
    {
      id: 'dm-e-1',
      senderId: 'user-elena',
      senderName: 'Elena',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      text: '¡Hola! Vi que te gustó mi foto en Formentera. El mar estaba en calma total esa tarde.',
      timestamp: '12:35',
    },
    {
      id: 'dm-e-2',
      senderId: 'own',
      senderName: 'Tú',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      text: '¡Una luz mágica! ¿Usaste filtro polarizador o degradado?',
      timestamp: '12:38',
      isOwn: true,
    },
    {
      id: 'dm-e-3',
      senderId: 'user-elena',
      senderName: 'Elena',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      text: 'Solo un CPL suave para quitar el reflejo en el agua y resaltar los tonos anaranjados. Además tengo activado el permiso de ubicación en el mapa por si estás cerca.',
      timestamp: '12:40',
    },
  ],
  'user-carlos': [
    {
      id: 'dm-c-1',
      senderId: 'user-carlos',
      senderName: 'Carlos M. Varela',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      text: 'Revisa el pronóstico de viento foehn para el finde en Benasque. Habrá lenticulares seguro. Mi posición GPS está activa en el mapa de geolocalización.',
      timestamp: '11:15',
    },
  ],
  'user-lucia': [
    {
      id: 'dm-l-1',
      senderId: 'user-lucia',
      senderName: 'Lucía Santamaría',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      text: 'El seeing en Izaña esta noche será Bortle 1 perfecto. Si miras el mapa de geolocalización verás mi baliza en el Teide.',
      timestamp: 'Ayer',
    },
  ],
  'user-sofia': [
    {
      id: 'dm-s-1',
      senderId: 'user-sofia',
      senderName: 'Sofía',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      text: '¡Mañana subiré al mirador de Ordiales al alba! Esperamos mar de nubes a 1.400 metros.',
      timestamp: 'Ayer',
    },
  ],
};

interface CommunityChatViewProps {
  initialDirectUser?: { id: string; name: string; username: string; avatar: string } | null;
  onViewOnMap?: (friend: FriendContact) => void;
  onOpenAuthorProfile?: (username: string, name: string, avatar: string, id?: string) => void;
}

export const CommunityChatView: React.FC<CommunityChatViewProps> = ({
  initialDirectUser,
  onViewOnMap,
  onOpenAuthorProfile,
}) => {
  const { user, requireAuth } = useAuth();
  const {
    friends,
    acceptedFriends,
    pendingSentRequests,
    pendingReceivedRequests,
    acceptFriendInvitation,
    rejectFriendInvitation,
    toggleFriendLocationSharing,
  } = useFriends();

  const [activeTab, setActiveTab] = useState<'channels' | 'direct'>('channels');
  const [directSubTab, setDirectSubTab] = useState<'friends' | 'pending'>('friends');

  // Channel State
  const [selectedChannel, setSelectedChannel] = useState<Channel>(CHANNELS[0]);
  const [channelMessages, setChannelMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHANNEL_MESSAGES);

  // Direct Chat State
  const [selectedContactId, setSelectedContactId] = useState<string>(
    friends[0]?.id || 'user-elena'
  );

  const selectedContact =
    friends.find((f) => f.id === selectedContactId) || friends[0];

  const [directMessages, setDirectMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('onlycloud_direct_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DIRECT_MESSAGES;
      }
    }
    return INITIAL_DIRECT_MESSAGES;
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // If initialDirectUser is provided from a profile or feed, select contact
  useEffect(() => {
    if (!initialDirectUser) return;

    setActiveTab('direct');
    const existing = friends.find(
      (c) =>
        c.id === initialDirectUser.id ||
        c.username.toLowerCase() === initialDirectUser.username.toLowerCase()
    );

    if (existing) {
      setSelectedContactId(existing.id);
      if (existing.friendshipStatus !== 'accepted') {
        setDirectSubTab('pending');
      } else {
        setDirectSubTab('friends');
      }
    }
  }, [initialDirectUser, friends]);

  // Persist direct messages
  useEffect(() => {
    localStorage.setItem('onlycloud_direct_messages', JSON.stringify(directMessages));
  }, [directMessages]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [channelMessages, directMessages, selectedChannel, selectedContactId, activeTab]);

  const canChatWithSelected = selectedContact?.friendshipStatus === 'accepted';

  // Handle Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Enforce friend acceptance rule
    if (activeTab === 'direct' && !canChatWithSelected) {
      return;
    }

    requireAuth(() => {
      const text = inputText.trim();
      const currentSenderId = user?.id || 'own';
      const currentSenderName = user?.displayName || user?.username || 'Tú';
      const currentSenderAvatar =
        user?.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (activeTab === 'channels') {
        // Post to public community channel
        const newMsg: ChatMessage = {
          id: `ch-msg-${Date.now()}`,
          senderId: currentSenderId,
          senderName: currentSenderName,
          senderAvatar: currentSenderAvatar,
          text,
          timestamp: nowTime,
          isOwn: true,
        };

        setChannelMessages((prev) => ({
          ...prev,
          [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newMsg],
        }));
        setInputText('');

        // Simulated channel reaction after 1.5s
        setTimeout(() => {
          const replyMsg: ChatMessage = {
            id: `reply-${Date.now()}`,
            senderId: 'sim-carlos',
            senderName: 'Carlos M. Varela',
            senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
            text: '¡Muy buena observación! Siempre aporta revisar las cartas sinópticas a 500hPa.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setChannelMessages((prev) => ({
            ...prev,
            [selectedChannel.id]: [...(prev[selectedChannel.id] || []), replyMsg],
          }));
        }, 1500);
      } else {
        // Direct Private Message 1-on-1
        const newMsg: ChatMessage = {
          id: `dm-msg-${Date.now()}`,
          senderId: currentSenderId,
          senderName: currentSenderName,
          senderAvatar: currentSenderAvatar,
          text,
          timestamp: nowTime,
          isOwn: true,
        };

        setDirectMessages((prev) => ({
          ...prev,
          [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
        }));

        setInputText('');
        setIsTyping(true);

        // Realistic Simulated Reply from that specific friend
        setTimeout(() => {
          setIsTyping(false);
          let replyContent = '¡Genial! Me parece estupendo.';

          const lower = text.toLowerCase();
          if (lower.includes('hola') || lower.includes('buenas')) {
            replyContent = `¡Hola ${currentSenderName}! Qué alegría saludarte.`;
          } else if (lower.includes('mapa') || lower.includes('donde') || lower.includes('ubicacion')) {
            replyContent = `Tengo mi baliza activa en el mapa de geolocalización. Si vas a la sección de Quedadas & Eventos me verás en directo en ${selectedContact.locationName}.`;
          } else if (lower.includes('camara') || lower.includes('foto') || lower.includes('lente')) {
            replyContent = 'Suelo trabajar con objetivos luminosos (f/1.8 o f/2.8) y trípode robusto.';
          } else if (lower.includes('tiempo') || lower.includes('nubes')) {
            replyContent = 'El pronóstico indica cielo despejado en cotas altas para el atardecer.';
          } else {
            replyContent = `Totalmente de acuerdo, ${selectedContact.name} aquí. ¡Nos vemos en el mapa o en la próxima salida!`;
          }

          const replyMsg: ChatMessage = {
            id: `dm-reply-${Date.now()}`,
            senderId: selectedContact.id,
            senderName: selectedContact.name,
            senderAvatar: selectedContact.avatar,
            text: replyContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: false,
          };

          setDirectMessages((prev) => ({
            ...prev,
            [selectedContact.id]: [...(prev[selectedContact.id] || []), replyMsg],
          }));
        }, 1500);
      }
    }, 'Inicia sesión para enviar mensajes en OnlyCloud.');
  };

  const currentMessages =
    activeTab === 'channels'
      ? channelMessages[selectedChannel.id] || []
      : directMessages[selectedContact?.id || ''] || [];

  return (
    <div className="w-full py-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#71849A] dark:text-[#8EA5C0] block mb-1">
            Mensajería Privada & Salas Comunitarias
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#263B54] dark:text-white font-['Plus_Jakarta_Sans']">
            Mensajes & Chats en Directo
          </h1>
          <p className="text-xs sm:text-sm text-[#71849A] dark:text-[#8EA5C0] mt-1">
            Habla en privado con tus amigos aceptados o participa en las salas públicas temáticas.
          </p>
        </div>

        {/* Tab Switcher: Canales vs Mensajes Privados */}
        <div className="inline-flex p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'channels'
                ? 'bg-white dark:bg-[#1E293B] text-[#263B54] dark:text-white shadow-xs'
                : 'text-[#71849A] dark:text-[#94A3B8] hover:text-[#263B54] dark:hover:text-white'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Salas Públicas ({CHANNELS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'direct'
                ? 'bg-white dark:bg-[#1E293B] text-[#263B54] dark:text-white shadow-xs'
                : 'text-[#71849A] dark:text-[#94A3B8] hover:text-[#263B54] dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-500" />
            <span>Amigos & Directos ({acceptedFriends.length})</span>
          </button>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12 min-h-[620px]">
        {/* Left Sidebar List (4 cols) */}
        <div className="md:col-span-4 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-[#090F1B]/60">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71849A] dark:text-[#8EA5C0]">
              {activeTab === 'channels' ? 'Canales Temáticos' : 'Contactos de Amigos'}
            </span>

            {activeTab === 'direct' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDirectSubTab('friends')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    directSubTab === 'friends'
                      ? 'bg-sky-500 text-white'
                      : 'text-[#71849A] hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  Amigos ({acceptedFriends.length})
                </button>
                {(pendingSentRequests.length > 0 || pendingReceivedRequests.length > 0) && (
                  <button
                    onClick={() => setDirectSubTab('pending')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors relative ${
                      directSubTab === 'pending'
                        ? 'bg-amber-500 text-white'
                        : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                    }`}
                  >
                    <span>Solicitudes</span>
                    <span className="ml-1 px-1 rounded-full bg-rose-500 text-white text-[9px]">
                      {pendingSentRequests.length + pendingReceivedRequests.length}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {activeTab === 'channels' ? (
              // CHANNEL LIST
              CHANNELS.map((ch) => {
                const isSelected = selectedChannel.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChannel(ch)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-white dark:bg-[#1E293B] shadow-xs border border-slate-200/60 dark:border-slate-700'
                        : 'hover:bg-white/60 dark:hover:bg-slate-800/40 text-[#71849A]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSelected
                          ? 'bg-[#B9DDF5] text-[#263B54] dark:bg-sky-600 dark:text-white'
                          : 'bg-slate-200/60 dark:bg-slate-800 text-[#71849A]'
                      }`}
                    >
                      <Hash className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#263B54] dark:text-white truncate">
                          #{ch.name}
                        </span>
                        <span className="text-[10px] text-[#71849A]">
                          {ch.membersCount} miembros
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71849A] dark:text-[#8EA5C0] truncate mt-0.5">
                        {ch.description}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              // DIRECT FRIENDS LIST
              <>
                {(directSubTab === 'friends' ? acceptedFriends : friends).map((contact) => {
                  const isSelected = selectedContact?.id === contact.id;
                  const isAccepted = contact.friendshipStatus === 'accepted';
                  const isPendingSent = contact.friendshipStatus === 'pending_sent';
                  const isPendingReceived = contact.friendshipStatus === 'pending_received';

                  return (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContactId(contact.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-white dark:bg-[#1E293B] shadow-xs border border-slate-200/60 dark:border-slate-700'
                          : 'hover:bg-white/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className={`w-10 h-10 rounded-full object-cover border-2 ${
                            isAccepted
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                              : 'border-amber-400'
                          }`}
                        />
                        {contact.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0E1626]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#263B54] dark:text-white truncate">
                            {contact.name}
                          </span>
                          {isAccepted ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Amigo
                            </span>
                          ) : isPendingSent ? (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> Pendiente
                            </span>
                          ) : (
                            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
                              Recibida
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#71849A] mt-0.5">
                          <span className="truncate">@{contact.username}</span>
                          {contact.locationPermissionGranted && isAccepted && (
                            <span className="text-[10px] text-sky-500 flex items-center gap-0.5" title="Ubicación compartida en el mapa">
                              <MapPin className="w-2.5 h-2.5" /> GPS
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Right Conversation Thread (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between h-[620px] bg-white dark:bg-[#0E1626]">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-md">
            {activeTab === 'channels' ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#B9DDF5]/40 dark:bg-slate-800 flex items-center justify-center text-[#263B54] dark:text-[#B9DDF5]">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#263B54] dark:text-white">
                    #{selectedChannel.name}
                  </h3>
                  <p className="text-xs text-[#71849A] dark:text-[#8EA5C0]">
                    {selectedChannel.description}
                  </p>
                </div>
              </div>
            ) : selectedContact ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedContact.avatar}
                      alt={selectedContact.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                    />
                    {selectedContact.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0E1626]" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#263B54] dark:text-white">
                        {selectedContact.name}
                      </h3>
                      {selectedContact.friendshipStatus === 'accepted' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                          <UserCheck className="w-2.5 h-2.5" />
                          <span>Amigo Conectado</span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Invitación Pendiente</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#71849A] dark:text-[#8EA5C0] flex items-center gap-1.5 mt-0.5">
                      <span>@{selectedContact.username}</span>
                      <span>·</span>
                      <span className={selectedContact.online ? 'text-emerald-500 font-semibold' : ''}>
                        {selectedContact.online ? 'En línea' : 'Desconectado'}
                      </span>
                      <span>·</span>
                      <span>{selectedContact.locationName}</span>
                    </p>
                  </div>
                </div>

                {/* Friend location toggle and map action */}
                <div className="flex items-center gap-2">
                  {selectedContact.friendshipStatus === 'accepted' && (
                    <button
                      onClick={() => toggleFriendLocationSharing(selectedContact.id)}
                      className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1.5 cursor-pointer transition-all ${
                        selectedContact.locationPermissionGranted
                          ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[#71849A]'
                      }`}
                      title={
                        selectedContact.locationPermissionGranted
                          ? 'Localización activa en el mapa. Haz clic para desactivar.'
                          : 'Localización apagada. Haz clic para activar.'
                      }
                    >
                      <MapPin className="w-3.5 h-3.5 text-sky-500" />
                      <span className="hidden sm:inline">
                        {selectedContact.locationPermissionGranted ? 'GPS en Mapa: ON' : 'GPS: OFF'}
                      </span>
                    </button>
                  )}

                  {onViewOnMap && selectedContact.locationPermissionGranted && selectedContact.friendshipStatus === 'accepted' && (
                    <button
                      onClick={() => onViewOnMap(selectedContact)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      title="Ver posición de este amigo en el mapa de geolocalización"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ver en Mapa</span>
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Locked State if friend invitation not accepted */}
          {activeTab === 'direct' && selectedContact && !canChatWithSelected ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-slate-50/60 dark:bg-[#0B111E]/40 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8" />
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold text-[#263B54] dark:text-white">
                  {selectedContact.friendshipStatus === 'pending_sent'
                    ? 'Invitación de Amistad Pendiente'
                    : 'Invitación de Amistad Recibida'}
                </h3>
                <p className="text-xs text-[#71849A] dark:text-[#8EA5C0] leading-relaxed">
                  {selectedContact.friendshipStatus === 'pending_sent' ? (
                    <>
                      Para poder hablar en privado con <strong>@{selectedContact.username}</strong>, la primera interacción debe ser aceptada como amistad. <strong>Si no se acepta, no se puede hablar</strong> ni ver su geolocalización en el mapa.
                    </>
                  ) : (
                    <>
                      <strong>@{selectedContact.username}</strong> te ha invitado a conectar como amigos y chatear en OnlyCloud.
                    </>
                  )}
                </p>
              </div>

              {selectedContact.friendshipStatus === 'pending_sent' ? (
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => acceptFriendInvitation(selectedContact.username)}
                    className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-105"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simular que @{selectedContact.username} acepta tu solicitud</span>
                  </button>
                  <p className="text-[11px] text-[#71849A]">
                    (Desbloqueará el chat directo y su posición en el mapa inmediatamente)
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => rejectFriendInvitation(selectedContact.username)}
                    className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold text-[#71849A] hover:bg-slate-100 cursor-pointer"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => acceptFriendInvitation(selectedContact.username)}
                    className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aceptar Solicitud de Amistad</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Messages Container */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-[#0B111E]/30">
                {activeTab === 'direct' && selectedContact?.locationPermissionGranted && (
                  <div className="p-3 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/60 text-xs flex items-center justify-between text-sky-800 dark:text-sky-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                      <span>
                        📍 <strong>{selectedContact.name}</strong> tiene concedido el permiso de localización en <em>{selectedContact.locationName}</em>
                      </span>
                    </div>
                    {onViewOnMap && (
                      <button
                        onClick={() => onViewOnMap(selectedContact)}
                        className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Localizar en el mapa</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {currentMessages.length > 0 ? (
                  currentMessages.map((msg) => {
                    const isOwn = msg.isOwn || msg.senderId === user?.id || msg.senderId === 'own';

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className={`max-w-[80%] space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 text-[10px] text-[#71849A]">
                            <span className="font-semibold text-[#263B54] dark:text-slate-300">
                              {msg.senderName}
                            </span>
                            <span>{msg.timestamp}</span>
                            {isOwn && <CheckCheck className="w-3 h-3 text-sky-500 inline" />}
                          </div>
                          <div
                            className={`p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                              isOwn
                                ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-tr-xs'
                                : 'bg-white dark:bg-slate-800 text-[#263B54] dark:text-slate-100 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center text-xs text-[#71849A]">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No hay mensajes en esta conversación aún.</p>
                    <p className="text-[11px] mt-1">¡Sois amigos, sé el primero en escribir!</p>
                  </div>
                )}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-[#71849A] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                    <span>{selectedContact.name} está escribiendo...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions for DMs */}
              {activeTab === 'direct' && (
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0E1626] flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-semibold text-[#71849A] uppercase flex-shrink-0">
                    Sugerencias:
                  </span>
                  {[
                    '¿Estás en tu punto del mapa ahora?',
                    '¿Qué lente usaste en tu foto?',
                    '¡Increíble captura de cielo!',
                    '¿Qué hora recomiendas para el atardecer?',
                  ].map((sug) => (
                    <button
                      key={sug}
                      onClick={() => setInputText(sug)}
                      className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-[11px] text-[#263B54] dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Bar */}
              <div className="p-3 sm:p-4 bg-white dark:bg-[#0E1626] border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      activeTab === 'channels'
                        ? `Escribir en #${selectedChannel.name}...`
                        : `Mensaje directo para ${selectedContact.name}...`
                    }
                    className="flex-1 py-2.5 px-4 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-[#263B54] dark:text-white placeholder-[#71849A] focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white disabled:opacity-40 transition-opacity cursor-pointer flex-shrink-0 shadow-xs"
                    title="Enviar mensaje"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
