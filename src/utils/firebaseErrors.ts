import type { FirebaseError } from 'firebase/app';

export function getFirebaseErrorMessage(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as FirebaseError).code)
      : '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Anonymous sign-in is disabled. In Firebase Console → Authentication → Sign-in method, enable Anonymous.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked. Allow popups for this site and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized. Add localhost to Firebase Console → Authentication → Settings → Authorized domains.';
    case 'permission-denied':
      return 'Firestore denied access. Deploy firestore.rules from this project or update rules in Firebase Console.';
    case 'failed-precondition':
      return 'Firestore is not set up yet. Create a Firestore database in Firebase Console.';
    default:
      if (error instanceof Error && error.message) {
        return error.message;
      }
      return 'Something went wrong. Please try again.';
  }
}
