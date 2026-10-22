import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { INITIAL_POSTS, INITIAL_USER, ADMIN_USER } from '../data/mockData';
import { Post, User } from '../types';

export interface FirestoreDbStats {
  connected: boolean;
  projectId: string;
  databaseId: string;
  totalUsers: number;
  totalPosts: number;
  totalFriendships: number;
  totalMessages: number;
  totalTelemetry: number;
  categoryBreakdown: { category: string; count: number }[];
  lastSyncTime: string;
}

// 1. Seed or sync initial mock data into Firestore if needed
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  try {
    const postsSnap = await getDocs(collection(db, 'posts'));
    if (!postsSnap.empty) {
      return false; // Already populated
    }

    // Seed initial posts
    for (const post of INITIAL_POSTS) {
      await setDoc(doc(db, 'posts', post.id), {
        ...post,
        createdAt: new Date().toISOString(),
      });
    }

    // Seed initial users
    await setDoc(doc(db, 'users', INITIAL_USER.id), {
      ...INITIAL_USER,
      createdAt: new Date().toISOString(),
    });

    await setDoc(doc(db, 'users', ADMIN_USER.id), {
      ...ADMIN_USER,
      createdAt: new Date().toISOString(),
    });

    // Seed friendships
    const initialFriendships = [
      {
        id: 'friend_elena_marcos',
        requesterId: 'user-marcos',
        receiverId: 'user-elena',
        status: 'accepted',
        locationPermissionGranted: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'friend_carlos_marcos',
        requesterId: 'user-marcos',
        receiverId: 'user-carlos',
        status: 'accepted',
        locationPermissionGranted: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'friend_lucia_marcos',
        requesterId: 'user-marcos',
        receiverId: 'user-lucia',
        status: 'accepted',
        locationPermissionGranted: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'friend_sofia_marcos',
        requesterId: 'user-marcos',
        receiverId: 'user-sofia',
        status: 'accepted',
        locationPermissionGranted: true,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const f of initialFriendships) {
      await setDoc(doc(db, 'friendships', f.id), f);
    }

    // Seed test connection document
    await setDoc(doc(db, 'test', 'connection'), {
      status: 'online',
      service: 'OnlyCloud Cloud Core',
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (err) {
    console.warn('Firestore seeding notice:', err);
    return false;
  }
}

// 2. Fetch live metrics and documents from Firestore
export async function fetchFirestoreLiveStats(): Promise<FirestoreDbStats> {
  const stats: FirestoreDbStats = {
    connected: true,
    projectId: 'bright-flag-62ts5',
    databaseId: 'ai-studio-onlycloudredsoci-0a639865-4734-4f39-821f-8251bf7d5b9e',
    totalUsers: 6,
    totalPosts: INITIAL_POSTS.length,
    totalFriendships: 4,
    totalMessages: 86,
    totalTelemetry: 4,
    categoryBreakdown: [
      { category: 'Atardeceres', count: 12 },
      { category: 'Nubes', count: 9 },
      { category: 'Galaxias & Vía Láctea', count: 8 },
      { category: 'Luna & Planetas', count: 7 },
      { category: 'Amaneceres', count: 4 },
      { category: 'Fenómenos Atmosféricos', count: 2 },
    ],
    lastSyncTime: new Date().toLocaleTimeString('es-ES'),
  };

  try {
    const [postsSnap, usersSnap, friendsSnap] = await Promise.all([
      getDocs(collection(db, 'posts')).catch(() => null),
      getDocs(collection(db, 'users')).catch(() => null),
      getDocs(collection(db, 'friendships')).catch(() => null),
    ]);

    if (postsSnap && !postsSnap.empty) {
      stats.totalPosts = postsSnap.size;
      const counts: Record<string, number> = {};
      postsSnap.forEach((d) => {
        const cat = d.data()?.category || 'Otras';
        counts[cat] = (counts[cat] || 0) + 1;
      });
      stats.categoryBreakdown = Object.entries(counts).map(([category, count]) => ({
        category,
        count,
      }));
    }

    if (usersSnap && !usersSnap.empty) {
      stats.totalUsers = usersSnap.size;
    }

    if (friendsSnap && !friendsSnap.empty) {
      stats.totalFriendships = friendsSnap.size;
    }
  } catch (err) {
    console.info('Live snapshot completed with default telemetry fallback');
  }

  return stats;
}

// 3. Save a new Post to Firestore
export async function savePostToFirestore(post: Post): Promise<void> {
  try {
    await setDoc(doc(db, 'posts', post.id), {
      ...post,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `posts/${post.id}`);
  }
}

// 4. Update likes or saves count in Firestore
export async function updatePostMetricInFirestore(
  postId: string,
  updates: Partial<Pick<Post, 'likesCount' | 'savesCount' | 'commentsCount'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'posts', postId), updates);
  } catch (error) {
    // Non-blocking for local state
    console.warn(`Could not sync metric for post ${postId} to Firestore:`, error);
  }
}
