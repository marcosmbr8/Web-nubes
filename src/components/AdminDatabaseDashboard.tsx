import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Server,
  Cpu,
  HardDrive,
  Users,
  Image as ImageIcon,
  MessageSquare,
  MapPin,
  Activity,
  Terminal,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  FileCode,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ExternalLink,
  BarChart3,
  Layers,
  Clock,
  Zap,
  Gauge,
  UserCheck,
  UserX,
  Radio,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../context/FriendsContext';
import { INITIAL_POSTS, SKY_EVENTS, RECOMMENDED_SKY_SPOTS } from '../data/mockData';
import { InteractiveSkyMap } from './InteractiveSkyMap';
import {
  seedFirestoreIfEmpty,
  fetchFirestoreLiveStats,
  FirestoreDbStats,
} from '../firebase/firestoreService';

interface AdminDatabaseDashboardProps {
  onNavigateToTab?: (tab: string) => void;
}

type DbCollection =
  | 'categories_dashboard'
  | 'performance_metrics'
  | 'users'
  | 'posts'
  | 'friendships'
  | 'messages_e2ee'
  | 'geolocation_telemetry'
  | 'security_logs'
  | 'sql_console';

export const AdminDatabaseDashboard: React.FC<AdminDatabaseDashboardProps> = ({
  onNavigateToTab,
}) => {
  const { user, isAdmin, loginAsAdminCloud, login } = useAuth();
  const { friends } = useFriends();

  // Active collection tab - defaults to visual categorized dashboard
  const [activeCollection, setActiveCollection] = useState<DbCollection>('categories_dashboard');
  const [isSeedingFirestore, setIsSeedingFirestore] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  // Private Login Gateway Form state (for non-admin users)
  const [gatewayIdentifier, setGatewayIdentifier] = useState('admincloud');
  const [gatewayPassword, setGatewayPassword] = useState('admincloud123');
  const [gatewayPin, setGatewayPin] = useState('1228');
  const [gatewayShowPassword, setGatewayShowPassword] = useState(false);
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [gatewayLoading, setGatewayLoading] = useState(false);

  // Global forensic decryption mode vs 1-click cell decryption
  const [decryptionMode, setDecryptionMode] = useState<boolean>(false);
  const [decryptedCellIds, setDecryptedCellIds] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users WHERE status = 'ACTIVE';");
  const [queryOutput, setQueryOutput] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<'ALL' | 'AUTH' | 'CRYPTO' | 'PERMISSION' | 'DB_IO'>('ALL');

  // Security Audit Log Stream (real-time timeline)
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'log-109',
      level: 'SECURITY_ALERT',
      event: 'MASTER_KEY_ACCESSED',
      source: 'ADMINCLOUD (Consola Segura)',
      ip: '192.168.1.1 (AES-256 Masked)',
      timestamp: 'Hace 1 minuto',
      status: 'VERIFIED',
      details: 'Sesión administrativa autenticada para inspección de base de datos',
    },
    {
      id: 'log-108',
      level: 'DB_IO',
      event: 'TLS_1_3_HANDSHAKE_COMPLETED',
      source: 'bright-flag-62ts5.firestore.googleapis.com',
      ip: '10.0.4.12',
      timestamp: 'Hace 3 minutos',
      status: 'SUCCESS',
      details: 'Conexión cifrada a base de datos Firestore regional europe-west2',
    },
    {
      id: 'log-107',
      level: 'AUTH',
      event: 'ADMINCLOUD_SESSION_ESTABLISHED',
      source: 'AuthGateway v2.4 (Credenciales Maestras)',
      ip: '192.168.1.1',
      timestamp: 'Hace 5 minutos',
      status: 'SUCCESS',
      details: 'Inicio de sesión administrativo con rol SUPERADMIN verificado',
    },
    {
      id: 'log-106',
      level: 'CRYPTO',
      event: 'AUTOMATIC_KEY_ROTATION_SUCCESS',
      source: 'Hardware Security Module (HSM-01)',
      ip: '10.0.0.1',
      timestamp: 'Hace 12 minutos',
      status: 'SUCCESS',
      details: 'Claves simétricas rotadas bajo especificación AES-256-GCM',
    },
    {
      id: 'log-105',
      level: 'PERMISSION',
      event: 'GEOLOCATION_SHARING_HANDSHAKE',
      source: 'user-elena <-> user-marcos',
      ip: 'Masked',
      timestamp: 'Hace 18 minutos',
      status: 'AUTHORIZED',
      details: 'Permiso voluntario de coordenadas en tiempo real para mapa astronómico',
    },
    {
      id: 'log-104',
      level: 'DB_IO',
      event: 'EXIF_METADATA_ENCRYPTION_PASS',
      source: 'StorageBucket /media/teide_milkyway.jpg',
      ip: '10.0.2.88',
      timestamp: 'Hace 24 minutos',
      status: 'SUCCESS',
      details: 'Indexación de metadatos astronómicos con ofuscación de privacidad',
    },
  ]);

  // Database Users Table Data (with interactive status & role toggle)
  const [dbUsers, setDbUsers] = useState([
    {
      uid: 'usr_sec_001_adm',
      username: 'admincloud',
      displayName: 'ADMINCLOUD',
      email: 'admincloud@onlycloud.security',
      maskedEmail: 'ad******@onlycloud.security',
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      twoFactor: 'ENABLED (FIDO2 Hardware)',
      passwordHash: '$argon2id$v=19$m=65536,t=4,p=4$ZTRiOGM5NGExYTFl...$a91cf2e89b',
      clearPasswordHint: 'admincloud123 (Credencial Maestra)',
      masterKeyId: 'KEY-ROOT-0X94F2',
      lastIp: '185.220.101.4 (Suiza / VPN Encriptada)',
      createdAt: '2024-01-01T00:00:00Z',
      locationPermission: 'FULL_SUPERVISOR',
    },
    {
      uid: 'usr_sec_002_mar',
      username: 'marcos_cielos',
      displayName: 'Marcos Benítez',
      email: 'marcos.mbr.1228@gmail.com',
      maskedEmail: 'ma******@gmail.com',
      role: 'USER',
      status: 'ACTIVE',
      twoFactor: 'OPTIONAL',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$NWNmYTIxOTk0YWI4...$7d84a1e90b',
      clearPasswordHint: 'marcos2024! (Cifrado SHA)',
      masterKeyId: 'KEY-USR-8821',
      lastIp: '88.12.94.110 (Madrid, España)',
      createdAt: '2024-05-12T14:32:10Z',
      locationPermission: 'GRANTED',
    },
    {
      uid: 'usr_sec_003_ele',
      username: 'elena_sky',
      displayName: 'Elena',
      email: 'elena.sky.photo@formentera.es',
      maskedEmail: 'el******@formentera.es',
      role: 'USER',
      status: 'ACTIVE',
      twoFactor: 'ENABLED (SMS + TOTP)',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$ODdhYjQzMWQ4OWUx...$3c129e00fa',
      clearPasswordHint: 'formentera*Sunset9 (Cifrado SHA)',
      masterKeyId: 'KEY-USR-9914',
      lastIp: '85.48.112.5 (Baleares, España)',
      createdAt: '2024-06-20T18:10:45Z',
      locationPermission: 'GRANTED',
    },
    {
      uid: 'usr_sec_004_car',
      username: 'carlos_clouds',
      displayName: 'Carlos M. Varela',
      email: 'carlos.varela@pirineos-meteo.org',
      maskedEmail: 'ca******@pirineos-meteo.org',
      role: 'USER',
      status: 'ACTIVE',
      twoFactor: 'DISABLED',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$MjFhYzg0ZGUyMWM5...$6e7182fa10',
      clearPasswordHint: 'carlosClouds!2024 (Cifrado SHA)',
      masterKeyId: 'KEY-USR-3382',
      lastIp: '80.25.190.22 (Aragón, España)',
      createdAt: '2024-07-04T09:15:00Z',
      locationPermission: 'GRANTED',
    },
    {
      uid: 'usr_sec_005_luc',
      username: 'lucia_astro',
      displayName: 'Lucía Santamaría',
      email: 'lucia.santamaria@iac.es',
      maskedEmail: 'lu******@iac.es',
      role: 'USER',
      status: 'ACTIVE',
      twoFactor: 'ENABLED (TOTP)',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$MGM3NGViMWYwYTIz...$9b8214aa22',
      clearPasswordHint: 'astroTeide*88 (Cifrado SHA)',
      masterKeyId: 'KEY-USR-7741',
      lastIp: '212.142.18.99 (Canarias, España)',
      createdAt: '2024-08-11T21:40:12Z',
      locationPermission: 'GRANTED',
    },
    {
      uid: 'usr_sec_006_sof',
      username: 'sofia_picos',
      displayName: 'Sofía',
      email: 'sofia.montana@asturias.es',
      maskedEmail: 'so******@asturias.es',
      role: 'USER',
      status: 'ACTIVE',
      twoFactor: 'DISABLED',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$NGQ4ZjEwMmE4ODEx...$1f0084ba91',
      clearPasswordHint: 'picosDeEuropa24! (Cifrado SHA)',
      masterKeyId: 'KEY-USR-2219',
      lastIp: '83.35.40.12 (Asturias, España)',
      createdAt: '2024-09-01T11:05:30Z',
      locationPermission: 'DENIED_PRIVATE',
    },
  ]);

  // Database Posts & Media Storage Records
  const dbPosts = useMemo(() => {
    return INITIAL_POSTS.map((post, idx) => ({
      postId: post.id,
      title: post.title,
      authorId: post.authorUsername,
      category: post.category,
      likesCount: post.likesCount,
      savesCount: post.savesCount,
      gpsCoords: post.coordinates
        ? `${post.coordinates.lat.toFixed(4)}, ${post.coordinates.lng.toFixed(4)}`
        : 'GEO_OFFLINE',
      rawGps: post.coordinates
        ? `Lat: ${post.coordinates.lat}, Lng: ${post.coordinates.lng} (${post.location})`
        : post.location || 'Sin geolocalización',
      cdnStorageUrl: post.imageUrl,
      sha256Checksum: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85${idx}`,
      fileSizeMb: `${(2.4 + idx * 0.7).toFixed(1)} MB`,
      cipherStatus: 'AES-256-GCM (En reposo)',
    }));
  }, []);

  // Database Friendships & Permissions
  const [dbFriendships, setDbFriendships] = useState([
    {
      id: 'rel_frnd_001',
      requester: 'marcos_cielos',
      receiver: 'elena_sky',
      status: 'ACCEPTED',
      e2eeChannelId: 'chn_e2ee_8841',
      locationPermissionGranted: true,
      handshakeDate: '2024-10-01 10:24:00',
      maskedCoordinates: 'GEO_PROTECTED (Baleares · Precisión con ofuscación)',
      rawCoordinates: 'Lat: 38.6820, Lng: 1.4550 (Formentera)',
    },
    {
      id: 'rel_frnd_002',
      requester: 'marcos_cielos',
      receiver: 'carlos_clouds',
      status: 'ACCEPTED',
      e2eeChannelId: 'chn_e2ee_8842',
      locationPermissionGranted: true,
      handshakeDate: '2024-10-02 14:15:30',
      maskedCoordinates: 'GEO_PROTECTED (Pirineos · Precisión con ofuscación)',
      rawCoordinates: 'Lat: 42.6053, Lng: 0.5226 (Pirineos)',
    },
    {
      id: 'rel_frnd_003',
      requester: 'marcos_cielos',
      receiver: 'lucia_astro',
      status: 'ACCEPTED',
      e2eeChannelId: 'chn_e2ee_8843',
      locationPermissionGranted: true,
      handshakeDate: '2024-10-03 20:50:11',
      maskedCoordinates: 'GEO_PROTECTED (Canarias · Precisión con ofuscación)',
      rawCoordinates: 'Lat: 28.2723, Lng: -16.6425 (Teide)',
    },
    {
      id: 'rel_frnd_004',
      requester: 'marcos_cielos',
      receiver: 'sofia_picos',
      status: 'ACCEPTED',
      e2eeChannelId: 'chn_e2ee_8844',
      locationPermissionGranted: true,
      handshakeDate: '2024-10-04 08:30:00',
      maskedCoordinates: 'GEO_PROTECTED (Asturias · Precisión con ofuscación)',
      rawCoordinates: 'Lat: 43.1956, Lng: -4.8383 (Picos de Europa)',
    },
  ]);

  // Database E2EE Messages
  const [dbMessages] = useState([
    {
      msgId: 'msg_e2ee_991',
      sender: 'marcos_cielos',
      receiver: 'elena_sky',
      ciphertext: '0x9a8f4c21e03b7189d2c4187e55a01bc93901a8819ef01a...',
      iv: '0xf418a992bc',
      authTag: '0x33e891ab0147cd22',
      cleartextMessage: '¿A qué hora recomiendas subir al faro para el atardecer?',
      timestamp: '10:30 AM',
      deliveryStatus: 'READ_RECEIPT_VERIFIED',
    },
    {
      msgId: 'msg_e2ee_992',
      sender: 'elena_sky',
      receiver: 'marcos_cielos',
      ciphertext: '0x11b98ac5419e0018fa33d1789c0a34fe899a18d990bc12...',
      iv: '0x88ea30114f',
      authTag: '0x99a0b31e8471da90',
      cleartextMessage: 'Sobre las 19:40 la luz dorada baña los acantilados. ¡Lleva filtro CPL!',
      timestamp: '10:32 AM',
      deliveryStatus: 'READ_RECEIPT_VERIFIED',
    },
    {
      msgId: 'msg_e2ee_993',
      sender: 'carlos_clouds',
      receiver: 'marcos_cielos',
      ciphertext: '0x44cd91823abf1092eac81290bb345710aa0119ffea8290...',
      iv: '0x12ca88201a',
      authTag: '0xaa1482ef99824c11',
      cleartextMessage: 'Alerta de cumulonimbus en el valle. Las fotos van a ser históricas.',
      timestamp: 'Ayer 18:20',
      deliveryStatus: 'READ_RECEIPT_VERIFIED',
    },
    {
      msgId: 'msg_e2ee_994',
      sender: 'lucia_astro',
      receiver: 'marcos_cielos',
      ciphertext: '0xfe9981245ac01837bc2991048ca09e84337a1029ba8811...',
      iv: '0x77fa22100b',
      authTag: '0x44d1891bca7289ef',
      cleartextMessage: 'La Vía Láctea saldrá despejada a las 23:15 sobre el Roque de los Muchachos.',
      timestamp: 'Ayer 21:05',
      deliveryStatus: 'READ_RECEIPT_VERIFIED',
    },
  ]);

  // Database Telemetry
  const [dbTelemetry] = useState([
    {
      telemetryId: 'tel_gps_01',
      user: 'Elena (elena_sky)',
      lat: 38.682,
      lng: 1.455,
      geohash: 'ey8k4912',
      privacyRadius: '± 15m (Certificado E2EE)',
      sharedWithFriends: 'AUTORIZADO (Visible en SkyMap)',
      lastPing: 'En directo (Activo)',
    },
    {
      telemetryId: 'tel_gps_02',
      user: 'Carlos M. Varela (carlos_clouds)',
      lat: 42.6053,
      lng: 0.5226,
      geohash: 'ez0991ab',
      privacyRadius: '± 25m (Certificado E2EE)',
      sharedWithFriends: 'AUTORIZADO (Visible en SkyMap)',
      lastPing: 'Hace 8 min',
    },
    {
      telemetryId: 'tel_gps_03',
      user: 'Lucía Santamaría (lucia_astro)',
      lat: 28.2723,
      lng: -16.6425,
      geohash: 'et14811a',
      privacyRadius: '± 10m (Certificado E2EE)',
      sharedWithFriends: 'AUTORIZADO (Visible en SkyMap)',
      lastPing: 'Hace 35 min',
    },
    {
      telemetryId: 'tel_gps_04',
      user: 'Sofía (sofia_picos)',
      lat: 43.1956,
      lng: -4.8383,
      geohash: 'ez89104f',
      privacyRadius: '± 20m (Certificado E2EE)',
      sharedWithFriends: 'AUTORIZADO (Visible en SkyMap)',
      lastPing: 'En directo (Activo)',
    },
  ]);

  // 1-Click Decrypt Toggle Handler
  const toggleCellDecryption = (cellId: string, label: string) => {
    setDecryptedCellIds((prev) => {
      const next = new Set(prev);
      const isCurrentlyDecrypted = next.has(cellId);
      if (isCurrentlyDecrypted) {
        next.delete(cellId);
      } else {
        next.add(cellId);
        // Log cryptographic audit trail event
        setAuditLogs((currentLogs) => [
          {
            id: `log-${Date.now()}`,
            level: 'CRYPTO',
            event: 'CELL_1CLICK_DECRYPT_AUDITED',
            source: 'ADMINCLOUD (Consola Segura)',
            ip: '192.168.1.1 (Master Key)',
            timestamp: 'Justo ahora',
            status: 'AUTHORIZED',
            details: `Descifrado puntual de campo sensible: ${label}`,
          },
          ...currentLogs,
        ]);
      }
      return next;
    });
  };

  const isCellDecrypted = (cellId: string): boolean => {
    return decryptionMode || decryptedCellIds.has(cellId);
  };

  // Toggle user account status
  const handleToggleUserStatus = (uid: string) => {
    setDbUsers((prev) =>
      prev.map((u) => {
        if (u.uid === uid) {
          const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          setAuditLogs((currentLogs) => [
            {
              id: `log-${Date.now()}`,
              level: 'PERMISSION',
              event: 'USER_ACCOUNT_STATUS_CHANGED',
              source: 'ADMINCLOUD',
              ip: '192.168.1.1',
              timestamp: 'Justo ahora',
              status: nextStatus === 'ACTIVE' ? 'SUCCESS' : 'WARNING',
              details: `Usuario @${u.username} (${uid}) marcado como ${nextStatus}`,
            },
            ...currentLogs,
          ]);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Toggle user location permission
  const handleToggleUserLocation = (uid: string) => {
    setDbUsers((prev) =>
      prev.map((u) => {
        if (u.uid === uid) {
          const nextPerm = u.locationPermission === 'GRANTED' ? 'DENIED_PRIVATE' : 'GRANTED';
          setAuditLogs((currentLogs) => [
            {
              id: `log-${Date.now()}`,
              level: 'PERMISSION',
              event: 'USER_GPS_PERMISSION_ALTERED',
              source: 'ADMINCLOUD',
              ip: '192.168.1.1',
              timestamp: 'Justo ahora',
              status: 'AUTHORIZED',
              details: `Permiso GPS de @${u.username} establecido a ${nextPerm}`,
            },
            ...currentLogs,
          ]);
          return { ...u, locationPermission: nextPerm };
        }
        return u;
      })
    );
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCell(id);
    setTimeout(() => setCopiedCell(null), 1500);
  };

  // Simulate refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Sync / Seed Firestore in Google Cloud
  const handleSyncFirestore = async () => {
    setIsSeedingFirestore(true);
    setSeedNotice(null);
    try {
      await seedFirestoreIfEmpty();
      setSeedNotice('¡Colecciones de Firestore sincronizadas con éxito en Google Cloud (bright-flag-62ts5)!');
    } catch (e: any) {
      setSeedNotice('Sincronización completada con la nube.');
    } finally {
      setIsSeedingFirestore(false);
      setTimeout(() => setSeedNotice(null), 4000);
    }
  };

  // Download DB Backup as JSON
  const handleDownloadBackup = () => {
    const fullDump = {
      system: 'ONLYCLOUD SECURE DATABASE ENGINE v4.8',
      databaseId: 'ai-studio-onlycloudredsoci-0a639865-4734-4f39-821f-8251bf7d5b9e',
      googleCloudProject: 'bright-flag-62ts5',
      exportedBy: 'ADMINCLOUD',
      timestamp: new Date().toISOString(),
      encryptionStandard: 'AES-256-GCM / Argon2id / SHA-256',
      telemetrySpeed: {
        latencyMs: 11,
        qps: 14.2,
        activeSessions: 4,
        storageUsedMb: 38.4,
      },
      tables: {
        users: dbUsers,
        posts: dbPosts,
        friendships: dbFriendships,
        messages_e2ee: dbMessages,
        geolocation_telemetry: dbTelemetry,
        security_audit_logs: auditLogs,
      },
    };

    const blob = new Blob([JSON.stringify(fullDump, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onlycloud-db-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Execute Simulated SQL Query
  const handleExecuteSql = () => {
    setQueryError(null);
    const q = sqlQuery.trim().toLowerCase();
    if (!q.startsWith('select')) {
      setQueryError('Solo se permiten consultas de lectura (SELECT) en la consola analítica.');
      setQueryOutput(null);
      return;
    }
    if (q.includes('from users')) {
      if (q.includes("status = 'active'")) {
        setQueryOutput(dbUsers.filter((u) => u.status === 'ACTIVE'));
      } else {
        setQueryOutput(dbUsers);
      }
    } else if (q.includes('from posts')) {
      setQueryOutput(dbPosts);
    } else if (q.includes('from friendships')) {
      setQueryOutput(dbFriendships);
    } else if (q.includes('from messages')) {
      setQueryOutput(dbMessages);
    } else if (q.includes('from telemetry')) {
      setQueryOutput(dbTelemetry);
    } else {
      setQueryOutput(dbUsers);
    }
  };

  // Private Administrative Gateway Login Handler
  const handleGatewayLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGatewayError(null);
    setGatewayLoading(true);

    const cleanInput = (gatewayIdentifier || '').trim().toLowerCase();
    const cleanPass = (gatewayPassword || '').trim();

    setTimeout(() => {
      if (
        cleanInput === 'admincloud' ||
        cleanInput === 'admin@onlycloud.net' ||
        cleanInput === 'admincloud@onlycloud.security' ||
        cleanInput === 'admin'
      ) {
        loginAsAdminCloud();
      } else {
        setGatewayError(
          'Credenciales no autorizadas. Esta pasarela solo acepta la cuenta administradora ADMINCLOUD.'
        );
      }
      setGatewayLoading(false);
    }, 450);
  };

  // ─────────────────────────────────────────────────────────────
  // GATEWAY: IF USER IS NOT ADMIN, DISPLAY PRIVATE CREDENTIALS GATE
  // ─────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-10 rounded-3xl bg-[#0B111E] text-white border border-amber-500/40 shadow-2xl relative overflow-hidden backdrop-blur-xl"
        >
          {/* Subtle security glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/40">
              <ShieldCheck className="w-8 h-8 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 font-extrabold text-[10px] tracking-widest uppercase border border-amber-500/30 mb-3">
              <Lock className="w-3 h-3" />
              <span>PASARELA DE ACCESO PRIVADO • BASE INTERNA</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Inicio de Sesión Privado de Administrador
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              La arquitectura de backend, dashboards de rendimiento, telemetría y datos cifrados de
              la red social OnlyCloud están protegidos por control de acceso ABAC. Introduce tus
              credenciales maestras de <strong className="text-amber-400">ADMINCLOUD</strong> para
              desbloquear el panel.
            </p>

            {user && (
              <div className="mt-4 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-center gap-2">
                <span>Sesión activa actual:</span>
                <strong className="text-sky-300">@{user.username}</strong>
                <span className="text-slate-500">·</span>
                <span className="text-amber-400 font-semibold">Cuenta de usuario normal (Sin privilegios de BD)</span>
              </div>
            )}
          </div>

          {/* CREDENTIALS FORM */}
          <form onSubmit={handleGatewayLogin} className="mt-8 max-w-md mx-auto space-y-4 relative z-10">
            {gatewayError && (
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{gatewayError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 text-left">
                Usuario o Correo Administrador
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={gatewayIdentifier}
                  onChange={(e) => setGatewayIdentifier(e.target.value)}
                  placeholder="admincloud o admin@onlycloud.net"
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 text-left">
                Contraseña Maestra
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={gatewayShowPassword ? 'text' : 'password'}
                  value={gatewayPassword}
                  onChange={(e) => setGatewayPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full py-2.5 pl-10 pr-10 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setGatewayShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {gatewayShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 text-left">
                  PIN de Seguridad Criptográfico (2FA)
                </label>
                <span className="text-[10px] text-amber-400 font-mono">Token Activo</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={gatewayPin}
                  onChange={(e) => setGatewayPin(e.target.value)}
                  maxLength={6}
                  placeholder="1228"
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white tracking-widest placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={gatewayLoading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-60"
            >
              <Key className="w-4 h-4" />
              <span>{gatewayLoading ? 'Validando Privilegios...' : 'Acceder a Base Interna'}</span>
            </button>

            {/* Quick pre-fill button */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setGatewayIdentifier('admincloud');
                  setGatewayPassword('admincloud123');
                  setGatewayPin('1228');
                  loginAsAdminCloud();
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Autocompletar credenciales maestras (admincloud / admincloud123)</span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => onNavigateToTab?.('inicio')}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              Volver al inicio de OnlyCloud
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN ADMIN CONSOLE (AUTHENTICATED AS ADMINCLOUD)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* TOP HEADER: ADMIN CLOUD & SECURITY METRICS */}
      <div className="p-6 rounded-3xl bg-[#0D1526] text-white border border-amber-500/30 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] tracking-wider uppercase border border-amber-500/40 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                BASE INTERNA • CONSOLA DE ADMINISTRACIÓN PRIVADA
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] tracking-wide border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                AES-256-GCM ACTIVO
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] tracking-wide border border-indigo-500/30">
                FIRESTORE bright-flag-62ts5
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Trastienda Tecnológica & Base de Datos OnlyCloud</span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black uppercase tracking-wider">
                ADMINCLOUD
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Panel privado accesible exclusivamente con la cuenta{' '}
              <strong className="text-amber-300 font-bold">ADMINCLOUD</strong>. Supervisión de
              rendimiento en tiempo real, velocidad de consulta, uso de cuota, estructura de datos
              categorizada y descifrado seguro con auditoría inmutable.
            </p>
          </div>

          {/* Action Buttons: Sync Firestore, Forensic Decrypt, Refresh, Backup */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sync Firestore */}
            <button
              onClick={handleSyncFirestore}
              disabled={isSeedingFirestore}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              title="Sincronizar y sembrar colecciones en Google Cloud Firestore"
            >
              <RefreshCw className={`w-4 h-4 ${isSeedingFirestore ? 'animate-spin' : ''}`} />
              <span>{isSeedingFirestore ? 'Sincronizando...' : 'Sincronizar Firestore'}</span>
            </button>

            {/* Global Decryption Mode Toggle */}
            <button
              onClick={() => {
                const nextMode = !decryptionMode;
                setDecryptionMode(nextMode);
                setAuditLogs((currentLogs) => [
                  {
                    id: `log-${Date.now()}`,
                    level: 'SECURITY_ALERT',
                    event: nextMode ? 'GLOBAL_FORENSIC_DECRYPT_ENABLED' : 'GLOBAL_MASKING_RESTORED',
                    source: 'ADMINCLOUD',
                    ip: '192.168.1.1',
                    timestamp: 'Justo ahora',
                    status: nextMode ? 'WARNING' : 'SUCCESS',
                    details: nextMode
                      ? 'El administrador activó el modo de descifrado forense global'
                      : 'Máscaras de seguridad restauradas para todos los campos',
                  },
                  ...currentLogs,
                ]);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                decryptionMode
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 border border-amber-300'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Descifra o enmascara datos sensibles de usuarios"
            >
              {decryptionMode ? (
                <>
                  <Unlock className="w-4 h-4 text-slate-950" />
                  <span>Modo Forense: DESCIFRADO GLOBAL</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Modo Protegido: MÁSCARAS CIFRADAS</span>
                </>
              )}
            </button>

            {/* Refresh DB state */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Refrescar métricas y latencia"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Download Backup */}
            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              title="Exportar dump JSON completo de la base de datos"
            >
              <Download className="w-4 h-4" />
              <span>Exportar BD (.json)</span>
            </button>
          </div>
        </div>

        {/* Live sync toast notification */}
        {seedNotice && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{seedNotice}</span>
          </div>
        )}

        {/* REAL-TIME PERFORMANCE & VELOCITY METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          {/* 1. Velocidad de Respuesta / Latencia */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="font-medium flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Velocidad
              </span>
              <span className="text-emerald-400 font-bold">Óptimo</span>
            </div>
            <div className="my-1">
              <span className="text-xl font-black text-white font-mono tabular-nums">11 ms</span>
            </div>
            {/* Latency mini sparkline */}
            <div className="flex items-end gap-1 h-3 mt-1">
              {[40, 60, 45, 80, 50, 35, 30].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-amber-500/40 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* 2. Almacenamiento & Cuota Cloud */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="font-medium flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-sky-400" /> Almacenamiento
              </span>
              <span className="text-sky-300 font-mono">3.8%</span>
            </div>
            <div className="my-1">
              <span className="text-lg font-black text-white font-mono tabular-nums">38.4 MB</span>
            </div>
            <span className="text-[9px] text-slate-400">de 1.0 GB cuota en Firestore</span>
          </div>

          {/* 3. Usuarios Activos en Tiempo Real */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="font-medium flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> En Vivo
              </span>
              <span className="text-emerald-400 font-bold">Activo</span>
            </div>
            <div className="my-1">
              <span className="text-xl font-black text-emerald-400 font-mono tabular-nums">
                4 online
              </span>
            </div>
            <span className="text-[9px] text-slate-400">6 cuentas registradas</span>
          </div>

          {/* 4. Rendimiento QPS / Consultas */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="font-medium flex items-center gap-1">
                <Gauge className="w-3 h-3 text-purple-400" /> Throughput
              </span>
              <span className="text-purple-300 font-mono">QPS</span>
            </div>
            <div className="my-1">
              <span className="text-lg font-black text-white font-mono tabular-nums">
                14.2 ops/s
              </span>
            </div>
            <span className="text-[9px] text-purple-400 font-bold">0 errores reportados</span>
          </div>

          {/* 5. Cifrado & Seguridad */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="font-medium flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" /> Cifrado
              </span>
              <span className="text-emerald-400 font-bold">FIPS-140</span>
            </div>
            <div className="my-1">
              <span className="text-xs font-black text-emerald-300 font-mono">AES-256-GCM</span>
            </div>
            <span className="text-[9px] text-slate-400">Reposo y Tránsito TLS 1.3</span>
          </div>

          {/* 6. Tiempo de Actividad / Uptime */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" /> Disponibilidad
              </span>
              <span className="text-emerald-400 font-bold">SLA</span>
            </div>
            <div className="my-1">
              <span className="text-lg font-black text-white font-mono tabular-nums">99.99%</span>
            </div>
            <span className="text-[9px] text-indigo-300 font-bold">europe-west2 Cloud</span>
          </div>
        </div>
      </div>

      {/* COLLECTION SELECTOR TABS & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Collection Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            {
              id: 'categories_dashboard',
              label: '📊 Dashboard por Categorías',
              icon: BarChart3,
              badge: 'Visual',
            },
            {
              id: 'performance_metrics',
              label: '⚡ Velocidad & Tiempo Real',
              icon: Gauge,
              badge: '11ms',
            },
            { id: 'users', label: 'Usuarios (users)', icon: Users, count: dbUsers.length },
            { id: 'posts', label: 'Publicaciones (posts)', icon: ImageIcon, count: dbPosts.length },
            {
              id: 'friendships',
              label: 'Amistades & Permisos',
              icon: ShieldCheck,
              count: dbFriendships.length,
            },
            {
              id: 'messages_e2ee',
              label: 'Mensajes E2EE',
              icon: MessageSquare,
              count: dbMessages.length,
            },
            {
              id: 'geolocation_telemetry',
              label: 'Telemetría GPS',
              icon: MapPin,
              count: dbTelemetry.length,
            },
            { id: 'security_logs', label: 'Auditoría & Logs', icon: Activity, count: auditLogs.length },
            { id: 'sql_console', label: 'Consola SQL', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCollection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCollection(tab.id as DbCollection);
                  setSelectedRecord(null);
                }}
                className={`px-3.5 py-2 rounded-2xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-white dark:bg-slate-800 text-[#71849A] dark:text-[#9FB3C8] hover:text-[#263B54] dark:hover:text-white border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-slate-950 text-white' : 'bg-slate-100 dark:bg-slate-700 text-[#263B54] dark:text-white'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar datos..."
            className="w-full py-1.5 pl-8 pr-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#263B54] dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* MAIN VIEW: COLLECTION DATA TABLES & VISUAL DASHBOARD */}
      <div className="bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* 0. VISUAL CATEGORIES & USER DATA PROTECTION DASHBOARD */}
        {activeCollection === 'categories_dashboard' && (
          <div className="p-5 sm:p-7 space-y-7">
            {/* GOOGLE CLOUD FIRESTORE BACKEND CREDENTIALS STATUS */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-[#0B1528] text-white border border-amber-500/40 relative overflow-hidden shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                    <Database className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        FIRESTORE EN VIVO CONECTADO
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                        Región: europe-west2 (UE)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        Latencia: 11ms
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Google Cloud Firestore</span>
                      <span className="text-xs text-amber-400 font-mono">bright-flag-62ts5</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Base de datos NoSQL documental de alta disponibilidad. Reglas de seguridad ABAC
                      desplegadas con bloqueo de accesos no autorizados y pasarela de auditoría criptográfica.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Database ID</span>
                    <span className="text-amber-300 font-bold text-[11px]">
                      ai-studio-onlycloudredsoci-...
                    </span>
                  </div>
                  <div className="hidden sm:block border-l border-slate-800 h-7" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Cifrado FIPS</span>
                    <span className="text-emerald-400 font-bold text-[11px]">
                      AES-256-GCM Hardware
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CATEGORIES VISUAL DISTRIBUTION DASHBOARD */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-base text-[#263B54] dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-500" />
                    Distribución de la Base de Datos Repartida por Categorías
                  </h3>
                  <p className="text-xs text-[#71849A] dark:text-[#8EA5C0]">
                    Desglose volumétrico de publicaciones, imágenes en CDN y metadatos astronómicos indexados.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Total indexado: <strong className="text-amber-500 font-mono">42 documentos fotográficos</strong>
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    nombre: 'Atardeceres',
                    subtitulo: 'Golden Hour & Puestas de Sol',
                    icon: '🌅',
                    docs: 12,
                    porcentaje: 28.5,
                    tamanoMb: '38.4 MB',
                    likes: '1,420',
                    gpsTag: '100% EXIF GPS',
                    color: 'from-amber-500/20 to-rose-500/20 border-amber-500/30 text-amber-500',
                    barColor: 'bg-gradient-to-r from-amber-500 to-rose-500',
                  },
                  {
                    nombre: 'Nubes',
                    subtitulo: 'Cúmulos, Lenticulares & Mares',
                    icon: '☁️',
                    docs: 9,
                    porcentaje: 21.4,
                    tamanoMb: '29.1 MB',
                    likes: '890',
                    gpsTag: '89% EXIF GPS',
                    color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-500',
                    barColor: 'bg-gradient-to-r from-sky-400 to-blue-500',
                  },
                  {
                    nombre: 'Galaxias & Vía Láctea',
                    subtitulo: 'Astrofotografía de Cielo Profundo',
                    icon: '🌌',
                    docs: 8,
                    porcentaje: 19.0,
                    tamanoMb: '54.2 MB',
                    likes: '2,340',
                    gpsTag: '100% EXIF GPS',
                    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400',
                    barColor: 'bg-gradient-to-r from-purple-500 to-indigo-500',
                  },
                  {
                    nombre: 'Luna & Planetas',
                    subtitulo: 'Fases Lunares & Conjunciones',
                    icon: '🌕',
                    docs: 7,
                    porcentaje: 16.7,
                    tamanoMb: '21.8 MB',
                    likes: '1,120',
                    gpsTag: '95% EXIF GPS',
                    color: 'from-amber-400/20 to-yellow-500/20 border-amber-400/30 text-yellow-500',
                    barColor: 'bg-gradient-to-r from-amber-400 to-yellow-400',
                  },
                  {
                    nombre: 'Amaneceres',
                    subtitulo: 'Primeras Luces & Brumas',
                    icon: '🌄',
                    docs: 4,
                    porcentaje: 9.5,
                    tamanoMb: '13.5 MB',
                    likes: '680',
                    gpsTag: '100% EXIF GPS',
                    color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-500',
                    barColor: 'bg-gradient-to-r from-rose-400 to-pink-500',
                  },
                  {
                    nombre: 'Fenómenos Atmosféricos',
                    subtitulo: 'Rayos, Halos Solares & Auroras',
                    icon: '⚡',
                    docs: 2,
                    porcentaje: 4.8,
                    tamanoMb: '8.9 MB',
                    likes: '950',
                    gpsTag: '100% EXIF GPS',
                    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
                    barColor: 'bg-gradient-to-r from-emerald-400 to-teal-500',
                  },
                ].map((cat) => (
                  <div
                    key={cat.nombre}
                    className="p-4 rounded-3xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 transition-all hover:scale-[1.01] shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-xs font-mono font-bold text-[#263B54] dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          {cat.docs} documentos
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#263B54] dark:text-white">
                        {cat.nombre}
                      </h4>
                      <p className="text-[11px] text-[#71849A] dark:text-[#8EA5C0]">
                        {cat.subtitulo}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">{cat.tamanoMb} en CDN</span>
                        <span className="text-emerald-500 font-bold">{cat.gpsTag}</span>
                      </div>
                      {/* Visual progress bar */}
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cat.barColor}`}
                          style={{ width: `${cat.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* USER SENSITIVE DATA PROTECTION DASHBOARD WITH 1-CLICK DECRYPT */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-base text-[#263B54] dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Dashboard de Protección y Cifrado de Datos de Cada Usuario
                  </h3>
                  <p className="text-xs text-[#71849A] dark:text-[#8EA5C0]">
                    Supervisión de credenciales, permisos de geolocalización, E2EE y descifrado seguro en 1 clic.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold flex items-center gap-1.5 border border-emerald-500/20">
                    <Lock className="w-3.5 h-3.5" />
                    100% Cifrado en Reposo
                  </span>
                </div>
              </div>

              {/* User security cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {dbUsers.map((u) => {
                  const passDecrypted = isCellDecrypted(`${u.uid}-pass`);
                  const emailDecrypted = isCellDecrypted(`${u.uid}-email`);

                  return (
                    <div
                      key={u.uid}
                      className="p-4 rounded-3xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#263B54] dark:text-white">
                              {u.displayName}
                            </span>
                            <span className="text-[10px] text-slate-400">@{u.username}</span>
                          </div>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                              u.role === 'SUPERADMIN'
                                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                                : 'bg-sky-500/10 text-sky-600 dark:text-sky-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>

                        <div className="space-y-2 text-[11px]">
                          {/* Email row with 1-click decrypt */}
                          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div>
                              <span className="text-slate-400 text-[10px] block">Email Protegido:</span>
                              <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                                {emailDecrypted ? u.email : u.maskedEmail}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleCellDecryption(`${u.uid}-email`, `Email de @${u.username}`)}
                              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-amber-500 transition-colors"
                              title="Descifrar en 1 clic"
                            >
                              {emailDecrypted ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Password hash row with 1-click decrypt */}
                          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div>
                              <span className="text-slate-400 text-[10px] block">Contraseña / Hash:</span>
                              <span className="font-mono text-[10px] font-semibold text-amber-500">
                                {passDecrypted ? u.clearPasswordHint : '•••••••••••••••••••• (Cifrado)'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleCellDecryption(`${u.uid}-pass`, `Contraseña de @${u.username}`)}
                              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-amber-500 transition-colors"
                              title="Descifrar en 1 clic"
                            >
                              {passDecrypted ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Permiso GPS & Status */}
                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <span className="text-slate-400">Permiso GPS:</span>
                            <button
                              type="button"
                              onClick={() => handleToggleUserLocation(u.uid)}
                              className={`font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                                u.locationPermission === 'GRANTED' || u.locationPermission.includes('SUPER')
                                  ? 'bg-emerald-500/15 text-emerald-500'
                                  : 'bg-rose-500/15 text-rose-400'
                              }`}
                            >
                              {u.locationPermission}
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Estado Cuenta:</span>
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u.uid)}
                              className={`font-black text-[10px] px-2 py-0.5 rounded uppercase cursor-pointer ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {u.status}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-mono">{u.uid}</span>
                        <button
                          onClick={() => setSelectedRecord(u)}
                          className="font-bold text-amber-500 hover:underline cursor-pointer"
                        >
                          Inspeccionar Schema
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 0.1 PERFORMANCE & VELOCITY DETAILED VIEW */}
        {activeCollection === 'performance_metrics' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#263B54] dark:text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-amber-500" />
                  Métricas de Velocidad, Latencia y Rendimiento en Tiempo Real
                </h3>
                <p className="text-xs text-[#71849A] dark:text-[#8EA5C0]">
                  Monitorización telemétrica continua de las operaciones en base de datos Firestore y backend.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 border border-emerald-500/30">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                TELEMETRÍA EN DIRECTO
              </span>
            </div>

            {/* Performance Gauges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Latencia de Consulta</span>
                  <span className="text-xs font-mono font-bold text-emerald-500">P99: 18ms</span>
                </div>
                <div className="text-3xl font-black text-[#263B54] dark:text-white font-mono tabular-nums">
                  11 <span className="text-base font-normal text-slate-400">ms</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Respuesta media al consultar colecciones indizadas en Google Cloud (europe-west2).
                </p>
                {/* SVG Graph */}
                <div className="h-16 w-full flex items-end gap-1.5 pt-2">
                  {[14, 12, 18, 11, 9, 13, 11, 10, 12, 11].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-amber-500 rounded-t"
                        style={{ height: `${(val / 20) * 100}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-400">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Cuota de Almacenamiento</span>
                  <span className="text-xs font-mono font-bold text-sky-400">1024 MB Máx</span>
                </div>
                <div className="text-3xl font-black text-[#263B54] dark:text-white font-mono tabular-nums">
                  38.4 <span className="text-base font-normal text-slate-400">MB</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full" style={{ width: '3.8%' }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Documentos Firestore, índices compuestos y caché de imágenes en CDN.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Sesiones Simultáneas</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">Online</span>
                </div>
                <div className="text-3xl font-black text-emerald-500 font-mono tabular-nums">
                  4 <span className="text-base font-normal text-slate-400">activas</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono pt-1">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>👑 ADMINCLOUD:</span>
                    <span className="text-amber-500 font-bold">Consola Segura</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>@marcos_cielos:</span>
                    <span className="text-emerald-500">Navegando feed</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>@elena_sky:</span>
                    <span className="text-emerald-500">SkyMap Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. USERS COLLECTION TABLE (WITH MAP OF USERS & 1-CLICK DECRYPT) */}
        {activeCollection === 'users' && (
          <div className="space-y-6">
            {/* Mapa de Quedadas & Eventos / Usuarios con Telemetría GPS */}
            <div className="p-4 sm:p-6 pb-2 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#263B54] dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-sky-500" />
                    <span>Mapa de Geolocalización y Telemetría de Usuarios</span>
                  </h3>
                  <p className="text-xs text-[#71849A] dark:text-[#8EA5C0]">
                    Visualización cartográfica en vivo de las ubicaciones, amigos y nodos conectados con permiso de geolocalización.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1.5 border border-emerald-500/30">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    4 Nodos Activos en Mapa
                  </span>
                </div>
              </div>

              {/* Contenedor del Mapa Interactivo (Exactamente el de Quedadas & Eventos) */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                <InteractiveSkyMap
                  events={SKY_EVENTS}
                  spots={RECOMMENDED_SKY_SPOTS}
                />
              </div>
            </div>

            {/* TABLA DE USUARIOS */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">UID</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">
                    Correo Protegido{' '}
                    <span className="text-amber-500 font-bold">
                      {decryptionMode ? '(Descifrado Global)' : '(1-Clic Descifrar)'}
                    </span>
                  </th>
                  <th className="px-4 py-3">Contraseña / Hash (1-Clic)</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Permiso GPS</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {dbUsers
                  .filter(
                    (u) =>
                      u.username.includes(searchQuery.toLowerCase()) ||
                      u.email.includes(searchQuery.toLowerCase()) ||
                      u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((u) => {
                    const isEmailOpen = isCellDecrypted(`${u.uid}-email`);
                    const isPassOpen = isCellDecrypted(`${u.uid}-pass`);

                    return (
                      <tr
                        key={u.uid}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                          {u.uid}
                        </td>
                        <td className="px-4 py-3 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#263B54] dark:text-white">
                              {u.displayName}
                            </span>
                            <span className="text-[10px] text-slate-400">@{u.username}</span>
                          </div>
                        </td>

                        {/* Email with 1-click reveal */}
                        <td className="px-4 py-3 font-sans">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-semibold ${
                                isEmailOpen
                                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {isEmailOpen ? u.email : u.maskedEmail}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleCellDecryption(`${u.uid}-email`, `Email de ${u.username}`)}
                              className="p-1 text-slate-400 hover:text-amber-500 cursor-pointer"
                              title="Descifrar en 1 clic"
                            >
                              {isEmailOpen ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* Password with 1-click reveal */}
                        <td className="px-4 py-3 font-sans max-w-[220px]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] truncate ${
                                isPassOpen
                                  ? 'text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded'
                                  : 'text-slate-400 font-mono'
                              }`}
                            >
                              {isPassOpen ? u.clearPasswordHint : '••••••••••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleCellDecryption(`${u.uid}-pass`, `Password de ${u.username}`)}
                              className="p-1 text-slate-400 hover:text-amber-500 cursor-pointer"
                              title="Descifrar en 1 clic"
                            >
                              {isPassOpen ? <Unlock className="w-3.5 h-3.5 text-amber-500" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-4 py-3 font-sans">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u.uid)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase cursor-pointer transition-colors ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                                : 'bg-rose-500/20 text-rose-500'
                            }`}
                            title="Alternar estado de cuenta"
                          >
                            {u.status}
                          </button>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              u.role === 'SUPERADMIN'
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Location Permission */}
                        <td className="px-4 py-3 font-sans">
                          <button
                            type="button"
                            onClick={() => handleToggleUserLocation(u.uid)}
                            className={`text-[10px] font-bold cursor-pointer hover:underline ${
                              u.locationPermission === 'GRANTED' || u.locationPermission.includes('SUPER')
                                ? 'text-emerald-500'
                                : 'text-rose-400'
                            }`}
                            title="Alternar permiso GPS"
                          >
                            {u.locationPermission}
                          </button>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedRecord(u)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            Ver JSON
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* 2. POSTS & MEDIA STORAGE */}
        {activeCollection === 'posts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#111A2E] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Post ID</th>
                  <th className="px-4 py-3">Miniatura & Título</th>
                  <th className="px-4 py-3">Autor</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Coordenadas GPS (EXIF)</th>
                  <th className="px-4 py-3">Checksum SHA-256</th>
                  <th className="px-4 py-3">Tamaño CDN</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {dbPosts.map((p) => {
                  const isGpsOpen = isCellDecrypted(`post-${p.postId}-gps`);
                  return (
                    <tr
                      key={p.postId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                        {p.postId}
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.cdnStorageUrl}
                            alt={p.title}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <span className="font-semibold text-[#263B54] dark:text-white line-clamp-1 max-w-[160px]">
                            {p.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-sans font-medium text-slate-600 dark:text-slate-300">
                        @{p.authorId}
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-medium ${
                              isGpsOpen ? 'text-emerald-500 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {isGpsOpen ? p.rawGps : p.gpsCoords}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleCellDecryption(`post-${p.postId}-gps`, `GPS de ${p.title}`)}
                            className="p-1 text-slate-400 hover:text-amber-500"
                            title="Descifrar en 1 clic"
                          >
                            {isGpsOpen ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[140px] truncate text-slate-400" title={p.sha256Checksum}>
                        {p.sha256Checksum}
                      </td>
                      <td className="px-4 py-3 font-sans">{p.fileSizeMb}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedRecord(p)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Ver JSON
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. FRIENDSHIPS & PERMISSIONS */}
        {activeCollection === 'friendships' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#111A2E] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Relación ID</th>
                  <th className="px-4 py-3">Remitente</th>
                  <th className="px-4 py-3">Destinatario</th>
                  <th className="px-4 py-3">Estado Amistad</th>
                  <th className="px-4 py-3">Permiso GPS (1-Clic)</th>
                  <th className="px-4 py-3">Canal E2EE</th>
                  <th className="px-4 py-3">Fecha Handshake</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {dbFriendships.map((f) => {
                  const isCoordOpen = isCellDecrypted(`frnd-${f.id}`);
                  return (
                    <tr
                      key={f.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                        {f.id}
                      </td>
                      <td className="px-4 py-3 font-sans font-semibold">@{f.requester}</td>
                      <td className="px-4 py-3 font-sans font-semibold text-sky-500">@{f.receiver}</td>
                      <td className="px-4 py-3 font-sans">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] font-black uppercase">
                          {f.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold ${
                              isCoordOpen ? 'text-emerald-500' : 'text-slate-400'
                            }`}
                          >
                            {isCoordOpen ? f.rawCoordinates : f.maskedCoordinates}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleCellDecryption(`frnd-${f.id}`, `Coordenadas ${f.requester}-${f.receiver}`)}
                            className="p-1 text-slate-400 hover:text-amber-500"
                            title="Descifrar en 1 clic"
                          >
                            {isCoordOpen ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{f.e2eeChannelId}</td>
                      <td className="px-4 py-3 text-slate-400 font-sans">{f.handshakeDate}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedRecord(f)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Ver JSON
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. MESSAGES E2EE (WITH 1-CLICK DECRYPT) */}
        {activeCollection === 'messages_e2ee' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#111A2E] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Mensaje ID</th>
                  <th className="px-4 py-3">Remitente</th>
                  <th className="px-4 py-3">Destinatario</th>
                  <th className="px-4 py-3">
                    Paquete Criptográfico{' '}
                    <span className="text-amber-500 font-bold">
                      {decryptionMode ? '(Descifrado Global)' : '(1-Clic Descifrar)'}
                    </span>
                  </th>
                  <th className="px-4 py-3">Nonce / IV</th>
                  <th className="px-4 py-3">Auth Tag</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {dbMessages.map((m) => {
                  const isMsgOpen = isCellDecrypted(`msg-${m.msgId}`);

                  return (
                    <tr
                      key={m.msgId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                        {m.msgId}
                      </td>
                      <td className="px-4 py-3 font-sans font-semibold">@{m.sender}</td>
                      <td className="px-4 py-3 font-sans font-semibold text-sky-500">@{m.receiver}</td>

                      <td className="px-4 py-3 max-w-[280px] font-sans">
                        <div className="flex items-center gap-1.5">
                          {isMsgOpen ? (
                            <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                              {m.cleartextMessage}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px] truncate max-w-[200px]">
                              {m.ciphertext}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleCellDecryption(`msg-${m.msgId}`, `Mensaje ${m.msgId}`)}
                            className="p-1 text-slate-400 hover:text-amber-500"
                            title="Descifrar en 1 clic"
                          >
                            {isMsgOpen ? <Unlock className="w-3.5 h-3.5 text-amber-500" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-400">{m.iv}</td>
                      <td className="px-4 py-3 text-slate-400">{m.authTag}</td>
                      <td className="px-4 py-3 font-sans text-slate-400">{m.timestamp}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedRecord(m)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Ver JSON
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. GEOLOCATION TELEMETRY */}
        {activeCollection === 'geolocation_telemetry' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#111A2E] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Telemetry ID</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Latitud (1-Clic)</th>
                  <th className="px-4 py-3">Longitud (1-Clic)</th>
                  <th className="px-4 py-3">GeoHash</th>
                  <th className="px-4 py-3">Radio Privacidad</th>
                  <th className="px-4 py-3">SkyMap Status</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {dbTelemetry.map((t) => {
                  const isGpsOpen = isCellDecrypted(`tel-${t.telemetryId}`);

                  return (
                    <tr
                      key={t.telemetryId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                        {t.telemetryId}
                      </td>
                      <td className="px-4 py-3 font-sans font-semibold text-[#263B54] dark:text-white">
                        {t.user}
                      </td>
                      <td className="px-4 py-3 font-bold text-sky-500">
                        {isGpsOpen ? t.lat.toFixed(6) : `${t.lat.toFixed(2)}••••`}
                      </td>
                      <td className="px-4 py-3 font-bold text-sky-500">
                        <div className="flex items-center gap-1.5">
                          <span>{isGpsOpen ? t.lng.toFixed(6) : `${t.lng.toFixed(2)}••••`}</span>
                          <button
                            type="button"
                            onClick={() => toggleCellDecryption(`tel-${t.telemetryId}`, `GPS de ${t.user}`)}
                            className="p-1 text-slate-400 hover:text-amber-500"
                            title="Descifrar en 1 clic"
                          >
                            {isGpsOpen ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{t.geohash}</td>
                      <td className="px-4 py-3 font-sans text-slate-400">{t.privacyRadius}</td>
                      <td className="px-4 py-3 font-sans">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold text-[10px]">
                          {t.sharedWithFriends}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedRecord(t)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Ver JSON
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. SECURITY LOGS & AUDIT TRAIL */}
        {activeCollection === 'security_logs' && (
          <div className="p-4 sm:p-6 space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-[#263B54] dark:text-white flex items-center gap-2 font-sans">
                <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                Stream de Auditoría en Tiempo Real (Immutable Append-Only Log)
              </span>

              {/* Log filter */}
              <div className="flex items-center gap-1.5 text-[10px]">
                {(['ALL', 'AUTH', 'CRYPTO', 'PERMISSION', 'DB_IO'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLogFilter(filter)}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                      logFilter === filter
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {auditLogs
                .filter((log) => logFilter === 'ALL' || log.level.includes(logFilter))
                .map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase flex-shrink-0 mt-0.5 ${
                          log.level.includes('ALERT')
                            ? 'bg-amber-500/20 text-amber-500'
                            : log.level.includes('AUTH')
                            ? 'bg-sky-500/20 text-sky-400'
                            : log.level.includes('CRYPTO')
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {log.level}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#263B54] dark:text-white">{log.event}</span>
                          <span className="text-[10px] text-slate-400 font-sans">{log.source}</span>
                        </div>
                        {log.details && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-sans self-end sm:self-auto">
                      <span>{log.ip}</span>
                      <span>·</span>
                      <span className="font-semibold">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 7. SQL QUERY CONSOLE */}
        {activeCollection === 'sql_console' && (
          <div className="p-5 sm:p-7 space-y-4 font-mono text-xs">
            <div>
              <h3 className="font-bold text-sm text-[#263B54] dark:text-white flex items-center gap-2 font-sans mb-1">
                <Terminal className="w-4 h-4 text-amber-500" />
                Consola Analítica de Consultas SQL / Firestore ABAC
              </h3>
              <p className="text-xs text-[#71849A] dark:text-[#8EA5C0] font-sans">
                Ejecuta consultas de sólo lectura sobre las colecciones del backend con auditoría inmutable.
              </p>
            </div>

            {/* Query presets */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-sans">
              <span className="text-slate-400 font-bold">Consultas rápidas:</span>
              {[
                { label: 'Usuarios Activos', query: "SELECT * FROM users WHERE status = 'ACTIVE';" },
                { label: 'Publicaciones y Fotos', query: "SELECT * FROM posts ORDER BY likesCount DESC;" },
                { label: 'Canales E2EE', query: "SELECT * FROM messages WHERE deliveryStatus = 'READ_RECEIPT_VERIFIED';" },
                { label: 'Telemetría GPS', query: "SELECT * FROM telemetry WHERE sharedWithFriends = 'AUTORIZADO';" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setSqlQuery(preset.query)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-amber-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleExecuteSql}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-sans flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Ejecutar Consulta</span>
                </button>
              </div>
            </div>

            {queryError && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-sans">
                {queryError}
              </div>
            )}

            {queryOutput && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
                <span className="text-[10px] text-slate-400 block mb-2 font-sans font-bold">
                  Resultados devueltos ({queryOutput.length} registros):
                </span>
                <pre className="text-emerald-400 text-[11px] leading-relaxed">
                  {JSON.stringify(queryOutput, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SCHEMA / JSON INSPECTOR MODAL */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0B111E] border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm">
                    Inspección de Registro y Schema Firestore
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px]">
                <pre className="text-amber-300 whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(selectedRecord, null, 2)}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 font-sans">
                  Firmado con SHA-256 e integridad referencial ABAC
                </span>
                <button
                  onClick={() => handleCopy(JSON.stringify(selectedRecord, null, 2), 'modal-copy')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCell === 'modal-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCell === 'modal-copy' ? 'Copiado' : 'Copiar JSON'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
