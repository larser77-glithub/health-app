import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, db } from '@/src/lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

interface AuthContextType {
  user: any | null;
  profile: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  saveWorkout: (workout: any) => Promise<void>;
  isGuestMode: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const isPlaceholder = firebaseConfig.projectId.includes('remixed');
    
    if (isPlaceholder) {
      // Local Storage Fallback Mode
      const savedUser = localStorage.getItem('mock_user');
      const savedProfile = localStorage.getItem('mock_profile');
      
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setIsGuestMode(true);
      }
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, 'users', u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            const initialProfile = {
              userId: u.uid,
              displayName: u.displayName,
              email: u.email,
              condition: '',
              weakMuscles: [],
              updatedAt: new Date().toISOString()
            };
            await setDoc(docRef, initialProfile);
            setProfile(initialProfile);
          }
        } catch (e) {
          console.error("Firestore error, falling back to local storage:", e);
          const savedProfile = localStorage.getItem(`profile_${u.uid}`);
          if (savedProfile) setProfile(JSON.parse(savedProfile));
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    const isPlaceholder = firebaseConfig.projectId.includes('remixed');
    
    if (isPlaceholder) {
      // Simulate Login
      const mockUser = {
        uid: 'guest_user',
        displayName: 'Guest Coach',
        email: 'guest@example.com',
        photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsGuestMode(true);
      
      if (!profile) {
        const initialProfile = {
          userId: mockUser.uid,
          displayName: mockUser.displayName,
          email: mockUser.email,
          condition: '',
          weakMuscles: [],
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('mock_profile', JSON.stringify(initialProfile));
        setProfile(initialProfile);
      }
      return;
    }

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/popup-blocked') {
        alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.');
      } else {
        alert(`로그인 중 오류가 발생했습니다. 로컬 모드로 시작하려면 Firebase 설정을 건너뛰세요.`);
      }
    }
  };

  const logOut = async () => {
    if (isGuestMode) {
      localStorage.removeItem('mock_user');
      setUser(null);
      setProfile(null);
      setIsGuestMode(false);
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (data: any) => {
    const updatedData = { ...profile, ...data, updatedAt: new Date().toISOString() };
    
    if (isGuestMode || !user) {
      localStorage.setItem('mock_profile', JSON.stringify(updatedData));
      setProfile(updatedData);
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, updatedData, { merge: true });
      setProfile(updatedData);
    } catch (e) {
      console.error("Failed to save to Firestore, saving to local storage:", e);
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify(updatedData));
      setProfile(updatedData);
    }
  };

  const saveWorkout = async (workout: any) => {
    if (!user) return;
    
    const workoutData = {
      ...workout,
      userId: user.uid,
      timestamp: new Date().toISOString()
    };

    if (isGuestMode) {
      const savedWorkouts = JSON.parse(localStorage.getItem('mock_workouts') || '[]');
      savedWorkouts.push(workoutData);
      localStorage.setItem('mock_workouts', JSON.stringify(savedWorkouts));
      return;
    }

    try {
      const workoutRef = collection(db, `users/${user.uid}/workouts`);
      await addDoc(workoutRef, workoutData);
    } catch (e) {
      console.error("Failed to save workout to Firestore, saving to local storage:", e);
      const savedWorkouts = JSON.parse(localStorage.getItem(`workouts_${user.uid}`) || '[]');
      savedWorkouts.push(workoutData);
      localStorage.setItem(`workouts_${user.uid}`, JSON.stringify(savedWorkouts));
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logOut, updateProfile, saveWorkout, isGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
