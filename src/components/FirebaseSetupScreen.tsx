import { motion } from 'framer-motion';

export function FirebaseSetupScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#050508', color: '#fff' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full rounded-2xl p-8 border"
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderColor: 'rgba(0, 245, 255, 0.3)',
          boxShadow: '0 0 24px rgba(0, 245, 255, 0.15)',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl font-bold text-center mb-4"
          style={{ color: '#00F5FF', textShadow: '0 0 20px rgba(0, 245, 255, 0.6)' }}
        >
          Z
        </motion.div>
        <h1 className="text-xl font-bold text-center mb-2">Firebase setup required</h1>
        <p className="text-center text-sm mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
          The app cannot start until Firebase credentials are set. Your{' '}
          <code style={{ color: '#67e8f9' }}>.env.local</code> file is missing or empty.
        </p>
        <ol
          className="text-sm space-y-2 mb-6 list-decimal list-inside"
          style={{ color: 'rgba(255,255,255,0.8)' }}
        >
          <li>
            Copy <code style={{ color: '#67e8f9' }}>.env.local.example</code> to{' '}
            <code style={{ color: '#67e8f9' }}>.env.local</code>
          </li>
          <li>Paste keys from Firebase Console → Project settings</li>
          <li>Enable Authentication (Anonymous + Google) and Realtime Database</li>
          <li>
            Restart the dev server: <code style={{ color: '#67e8f9' }}>npm run dev</code>
          </li>
        </ol>
        <p className="text-xs text-center" style={{ color: 'rgba(0, 245, 255, 0.5)' }}>
          Required: VITE_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID, APP_ID, DATABASE_URL
        </p>
      </motion.div>
    </div>
  );
}
