export type CategoryType =
  | 'todas'
  | 'nubes'
  | 'atardeceres'
  | 'amaneceres'
  | 'luna'
  | 'estrellas'
  | 'galaxias'
  | 'planetas'
  | 'fenomenos_atmosfericos';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedDate: string;
  cameraGear?: {
    camera: string;
    lenses: string;
    filters?: string;
    tripod?: string;
  };
  twoFactorEnabled?: boolean;
  role?: 'admin' | 'user';
  isAdmin?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  title: string;
  description: string;
  imageUrl: string;
  category: CategoryType;
  categoryLabel: string;
  date: string;
  location: string;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'tall';
  locationEnabled?: boolean;
  coordinates?: { lat: number; lng: number };
  exif?: {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutter?: string;
    iso?: string;
    altitude?: string;
    cloudClassification?: string;
  };
  comments?: Comment[];
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  title: string;
  location: string;
  mediaUrl: string;
  isVideo?: boolean;
  seen?: boolean;
  duration?: number;
}

export interface CloudVideo {
  id: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  location: string;
  videoUrl: string;
  posterUrl: string;
  likes: number;
  comments: number;
  soundTitle: string;
}

export interface SkyEvent {
  id: string;
  tipo_evento: 'acontecimiento_natural' | 'actividad_comunidad';
  categoria_especifica: 'astronomia' | 'meteorologia' | 'quedada_usuarios' | 'taller_educativo';
  noticia_global?: boolean;
  titulo: string;
  fecha: string;
  horario_aproximado: string;
  ubicacion_coordenadas_o_texto: string;
  coordenadas?: { lat: number; lng: number };
  distancia_km?: number;
  descripcion: string;
  imagen: string;
  asistentes_count: number;
  isAsistiendo?: boolean;
  capa_localizacion_usuario: {
    visible_desde_zona_usuario: boolean;
    nota_visibilidad: string;
  };
  meteorologia_y_entorno: {
    condiciones_ideales: string;
    tips_de_observacion_y_lugares: string;
  };
}

export interface AuraAnalysis {
  certeza_analisis: 'alta' | 'media' | 'baja';
  categoria: 'meteorologia' | 'astronomia' | 'mixto' | 'desconocido';
  diagnostico_principal: string;
  alternativas_estimadas: string[];
  explicacion_sencilla: string;
  consejo_observacion: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isOwn?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  iconName: string;
  membersCount: number;
}

export interface SkySpot {
  id: string;
  nombre: string;
  tipo: 'atardecer' | 'cielo_oscuro' | 'mar_de_nubes' | 'amanecer' | 'mirador';
  tipoLabel: string;
  descripcion: string;
  imagen: string;
  ubicacionTexto: string;
  lat: number;
  lng: number;
  altitud: string;
  bortleEscala?: number;
  mejorMomento: string;
  orientacionOptima: string;
  consejoFotografico: string;
  valoracion: number;
  distancia_km?: number;
}

export interface SkyWeatherForecast {
  temperatura: number;
  humedad: number;
  coberturaNubes: number;
  velocidadViento: number;
  condicionTexto: string;
  claridadCieloScore: number;
  calidadObservacion: 'Excelente' | 'Muy Buena' | 'Moderada' | 'Cubierto';
  horaPuestaSol: string;
  horaAmanecer: string;
  horaDorada: string;
  seeingCalidad: string;
  ciudadOZona: string;
}
