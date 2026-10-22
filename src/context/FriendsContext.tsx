import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected';

export interface FriendContact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  locationName: string;
  online: boolean;
  friendshipStatus: FriendshipStatus;
  requestMessage?: string;
  requestedAt?: string;
  acceptedAt?: string;
  // Geolocation sharing permission
  locationPermissionGranted: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  lastSeenLocation?: string;
  lastActiveTime?: string;
}

interface FriendsContextType {
  friends: FriendContact[];
  acceptedFriends: FriendContact[];
  pendingSentRequests: FriendContact[];
  pendingReceivedRequests: FriendContact[];
  friendsOnMap: FriendContact[];
  getFriendshipStatus: (usernameOrId: string) => FriendshipStatus;
  getFriend: (usernameOrId: string) => FriendContact | undefined;
  sendFriendInvitation: (
    target: { id?: string; username: string; name: string; avatar: string; bio?: string; location?: string },
    message?: string
  ) => boolean;
  acceptFriendInvitation: (friendIdOrUsername: string) => void;
  rejectFriendInvitation: (friendIdOrUsername: string) => void;
  toggleFriendLocationSharing: (friendId: string) => void;
  userSharesLocationWithFriends: boolean;
  setUserSharesLocationWithFriends: (enabled: boolean) => void;
  simulateIncomingInvitation?: (contact: Partial<FriendContact>) => void;
}

const INITIAL_FRIENDS: FriendContact[] = [
  {
    id: 'user-elena',
    name: 'Elena',
    username: 'elena_sky',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    locationName: 'Formentera, Baleares',
    bio: 'Cazadora de puestas de sol mediterráneas.',
    online: true,
    friendshipStatus: 'accepted',
    locationPermissionGranted: true,
    coordinates: { lat: 38.682, lng: 1.455 },
    lastSeenLocation: 'Mirador Far de la Mola',
    lastActiveTime: 'Conectada ahora',
  },
  {
    id: 'user-carlos',
    name: 'Carlos M. Varela',
    username: 'carlos_clouds',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    locationName: 'Valle de Benasque, Pirineos',
    bio: 'Especialista en nubes lenticulares y tormentas.',
    online: true,
    friendshipStatus: 'accepted',
    locationPermissionGranted: true,
    coordinates: { lat: 42.6053, lng: 0.5226 },
    lastSeenLocation: 'Refugio de la Renclusa (Aneto)',
    lastActiveTime: 'Conectado ahora',
  },
  {
    id: 'user-lucia',
    name: 'Lucía Santamaría',
    username: 'lucia_astro',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    locationName: 'Parque Nacional del Teide, Tenerife',
    bio: 'Astrofotografía de cielo profundo y Vía Láctea.',
    online: false,
    friendshipStatus: 'accepted',
    locationPermissionGranted: true,
    coordinates: { lat: 28.2723, lng: -16.6425 },
    lastSeenLocation: 'Observatorio Astrofísico de Izaña',
    lastActiveTime: 'Hace 35 min',
  },
  {
    id: 'user-sofia',
    name: 'Sofía',
    username: 'sofia_picos',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    locationName: 'Picos de Europa, Asturias',
    bio: 'Amaneceres sobre mares de nubes cántabros.',
    online: true,
    friendshipStatus: 'accepted',
    locationPermissionGranted: true,
    coordinates: { lat: 43.1956, lng: -4.8383 },
    lastSeenLocation: 'Mirador de Ordiales (Covadonga)',
    lastActiveTime: 'Conectada ahora',
  },
];

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [friends, setFriends] = useState<FriendContact[]>(() => {
    const saved = localStorage.getItem('onlycloud_friends_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        return INITIAL_FRIENDS;
      }
    }
    return INITIAL_FRIENDS;
  });

  const [userSharesLocationWithFriends, setUserSharesLocationWithFriends] = useState<boolean>(() => {
    const saved = localStorage.getItem('onlycloud_share_location_friends');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('onlycloud_friends_list', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem('onlycloud_share_location_friends', String(userSharesLocationWithFriends));
  }, [userSharesLocationWithFriends]);

  const acceptedFriends = friends.filter((f) => f.friendshipStatus === 'accepted');
  const pendingSentRequests = friends.filter((f) => f.friendshipStatus === 'pending_sent');
  const pendingReceivedRequests = friends.filter((f) => f.friendshipStatus === 'pending_received');
  const friendsOnMap = acceptedFriends.filter((f) => f.locationPermissionGranted && f.coordinates);

  const getFriend = useCallback(
    (usernameOrId: string) => {
      const query = usernameOrId.toLowerCase().trim();
      return friends.find(
        (f) =>
          f.id.toLowerCase() === query ||
          f.username.toLowerCase() === query ||
          f.username.toLowerCase() === query.replace('@', '')
      );
    },
    [friends]
  );

  const getFriendshipStatus = useCallback(
    (usernameOrId: string): FriendshipStatus => {
      const match = getFriend(usernameOrId);
      return match ? match.friendshipStatus : 'none';
    },
    [getFriend]
  );

  const sendFriendInvitation = useCallback(
    (
      target: { id?: string; username: string; name: string; avatar: string; bio?: string; location?: string },
      message?: string
    ): boolean => {
      const cleanUsername = target.username.replace('@', '').toLowerCase();
      const existing = friends.find(
        (f) => f.id === target.id || f.username.toLowerCase() === cleanUsername
      );

      const targetId = target.id || `user-${cleanUsername}`;
      const requestMsg = message?.trim() || `¡Hola ${target.name}! Me gustaría añadirte a mis amigos en OnlyCloud para hablar y compartir ubicaciones.`;

      if (existing) {
        if (existing.friendshipStatus === 'accepted') {
          return false;
        }
        // Update to pending_sent
        setFriends((prev) =>
          prev.map((f) =>
            f.id === existing.id
              ? {
                  ...f,
                  friendshipStatus: 'pending_sent',
                  requestMessage: requestMsg,
                  requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              : f
          )
        );
      } else {
        // Add new pending contact
        const newContact: FriendContact = {
          id: targetId,
          name: target.name,
          username: cleanUsername,
          avatar: target.avatar,
          bio: target.bio,
          locationName: target.location || 'Comunidad OnlyCloud',
          online: true,
          friendshipStatus: 'pending_sent',
          requestMessage: requestMsg,
          requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          locationPermissionGranted: true,
          coordinates: {
            lat: 40.4168 + (Math.random() - 0.5) * 3,
            lng: -3.7038 + (Math.random() - 0.5) * 3,
          },
          lastSeenLocation: target.location || 'Zona de observación',
          lastActiveTime: 'Conectado recientemente',
        };
        setFriends((prev) => [newContact, ...prev]);
      }
      return true;
    },
    [friends]
  );

  const acceptFriendInvitation = useCallback((friendIdOrUsername: string) => {
    const clean = friendIdOrUsername.toLowerCase().trim().replace('@', '');
    setFriends((prev) =>
      prev.map((f) => {
        if (f.id.toLowerCase() === clean || f.username.toLowerCase() === clean) {
          return {
            ...f,
            friendshipStatus: 'accepted',
            acceptedAt: 'Ahora',
            locationPermissionGranted: true,
          };
        }
        return f;
      })
    );
  }, []);

  const rejectFriendInvitation = useCallback((friendIdOrUsername: string) => {
    const clean = friendIdOrUsername.toLowerCase().trim().replace('@', '');
    setFriends((prev) =>
      prev.map((f) => {
        if (f.id.toLowerCase() === clean || f.username.toLowerCase() === clean) {
          return {
            ...f,
            friendshipStatus: 'rejected',
          };
        }
        return f;
      })
    );
  }, []);

  const toggleFriendLocationSharing = useCallback((friendId: string) => {
    setFriends((prev) =>
      prev.map((f) => {
        if (f.id === friendId) {
          return {
            ...f,
            locationPermissionGranted: !f.locationPermissionGranted,
          };
        }
        return f;
      })
    );
  }, []);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        acceptedFriends,
        pendingSentRequests,
        pendingReceivedRequests,
        friendsOnMap,
        getFriendshipStatus,
        getFriend,
        sendFriendInvitation,
        acceptFriendInvitation,
        rejectFriendInvitation,
        toggleFriendLocationSharing,
        userSharesLocationWithFriends,
        setUserSharesLocationWithFriends,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};
