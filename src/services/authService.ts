import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';

function getAuth() {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }
  return auth;
}
import type { User } from '../types';
import { useAuthStore } from '../store/authStore';
import { userService } from './userService';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';

export const authService = {
  async signInAsGuest(): Promise<FirebaseUser> {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured');
    }
    const credential = await signInAnonymously(getAuth());
    useAuthStore.getState().setFirebaseUser(credential.user);
    return credential.user;
  },

  async signInWithGoogle(): Promise<User> {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured');
    }

    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(getAuth(), provider);
    const firebaseUser = credential.user;
    useAuthStore.getState().setFirebaseUser(firebaseUser);

    try {
      let existingUser = await userService.getUserDoc(firebaseUser.uid);

      const googlePhotoUrl = firebaseUser.photoURL?.startsWith('http')
        ? firebaseUser.photoURL
        : null;

      if (!existingUser) {
        const defaultUsername =
          firebaseUser.displayName?.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 20) ||
          `Player_${firebaseUser.uid.slice(0, 6)}`;

        const username =
          defaultUsername.length < 3 ? `Player_${firebaseUser.uid.slice(0, 6)}` : defaultUsername;
        existingUser = await userService.createUserDoc(
          firebaseUser.uid,
          username,
          googlePhotoUrl ?? '⭐',
        );
      } else if (googlePhotoUrl && !existingUser.avatar.startsWith('http')) {
        existingUser = await userService.updateUserAvatar(firebaseUser.uid, googlePhotoUrl);
      }

      useAuthStore.getState().setUser(existingUser);
      return existingUser;
    } catch (error) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(getAuth());
    useAuthStore.getState().clearAuth();
  },

  onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(getAuth(), callback);
  },
};
