import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from '../firebase/config';

function getFirestore() {
  if (!firestore) {
    throw new Error('Firebase is not configured');
  }
  return firestore;
}
import type { RankTier, User } from '../types';

type StoredUser = User & { usernameLower?: string };
type UsernameEntry = { uid: string };

const normalizeUsername = (username: string): string => username.trim().toLowerCase();

const rankFromWins = (totalWins: number): RankTier => {
  if (totalWins >= 500) return 'legend';
  if (totalWins >= 200) return 'master';
  if (totalWins >= 100) return 'diamond';
  if (totalWins >= 50) return 'platinum';
  if (totalWins >= 25) return 'gold';
  if (totalWins >= 10) return 'silver';
  return 'bronze';
};

export const userService = {
  async createUserDoc(uid: string, username: string, avatar: string): Promise<User> {
    const normalizedUsername = normalizeUsername(username);
    if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
      throw new Error('Username must be 3-20 characters');
    }

    const db = getFirestore();
    const userRef = doc(db, 'users', uid);
    const usernameRef = doc(db, 'usernames', normalizedUsername);

    let savedUser: User | null = null;

    await runTransaction(db, async (transaction) => {
      const [existingUserSnap, usernameSnap] = await Promise.all([
        transaction.get(userRef),
        transaction.get(usernameRef),
      ]);

      if (usernameSnap.exists()) {
        const usernameData = usernameSnap.data() as UsernameEntry;
        if (usernameData.uid !== uid) {
          throw new Error('Username is already taken');
        }
      }

      const existingUser = existingUserSnap.exists() ? (existingUserSnap.data() as StoredUser) : null;

      const nextUser: User = {
        uid,
        username,
        avatar,
        rank: existingUser?.rank ?? 'bronze',
        coins: existingUser?.coins ?? 100,
        totalWins: existingUser?.totalWins ?? 0,
        totalMatches: existingUser?.totalMatches ?? 0,
        winRate: existingUser?.winRate ?? 0,
      };

      transaction.set(usernameRef, { uid });
      transaction.set(userRef, { ...nextUser, usernameLower: normalizedUsername });
      savedUser = nextUser;
    });

    if (!savedUser) {
      throw new Error('Failed to create user profile');
    }

    return savedUser;
  },

  async getUserDoc(uid: string): Promise<User | null> {
    if (!isFirebaseConfigured) {
      return null;
    }
    const userSnap = await getDoc(doc(getFirestore(), 'users', uid));
    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data() as StoredUser;
    return {
      uid: userData.uid,
      username: userData.username,
      avatar: userData.avatar,
      rank: userData.rank,
      coins: userData.coins,
      totalWins: userData.totalWins,
      totalMatches: userData.totalMatches,
      winRate: userData.winRate,
    };
  },

  async updateUserStats(uid: string, wonMatch: boolean): Promise<void> {
    const db = getFirestore();
    const userRef = doc(db, 'users', uid);
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnap.data() as StoredUser;
      const totalMatches = userData.totalMatches + 1;
      const totalWins = wonMatch ? userData.totalWins + 1 : userData.totalWins;
      const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
      const rank = rankFromWins(totalWins);

      transaction.update(userRef, {
        totalMatches,
        totalWins,
        winRate,
        rank,
      });
    });
  },

  async updateRank(uid: string): Promise<void> {
    const db = getFirestore();
    const userRef = doc(db, 'users', uid);
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnap.data() as StoredUser;
      transaction.update(userRef, { rank: rankFromWins(userData.totalWins) });
    });
  },

  async updateUserAvatar(uid: string, avatar: string): Promise<User> {
    const db = getFirestore();
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    const userData = userSnap.data() as StoredUser;
    const updated: User = {
      uid: userData.uid,
      username: userData.username,
      avatar,
      rank: userData.rank,
      coins: userData.coins,
      totalWins: userData.totalWins,
      totalMatches: userData.totalMatches,
      winRate: userData.winRate,
    };
    await runTransaction(db, async (transaction) => {
      transaction.update(userRef, { avatar });
    });
    return updated;
  },

  async checkUsernameAvailability(username: string, currentUid?: string): Promise<boolean> {
    const normalizedUsername = normalizeUsername(username);
    if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
      return false;
    }

    const usernameSnap = await getDoc(doc(getFirestore(), 'usernames', normalizedUsername));
    if (!usernameSnap.exists()) {
      return true;
    }

    const usernameData = usernameSnap.data() as UsernameEntry;
    return usernameData.uid === currentUid;
  },
};
