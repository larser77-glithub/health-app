import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

const isPlaceholder = firebaseConfig.apiKey === 'PLACEHOLDER';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

// Connectivity Test & Warning
async function testConnection() {
  if (isPlaceholder) {
    console.warn('Firebase is useing a placeholder configuration. Please complete the Firebase setup in the AI Studio UI.');
    return;
  }
  
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection established');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.");
    }
  }
}
testConnection();
