import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { RehabSection } from './components/rehab/RehabSection';
import { BodyweightSection } from './components/bodyweight/BodyweightSection';
import { ProfileForm } from './components/profile/ProfileForm';
import { RecommendationList } from './components/recommendations/RecommendationList';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Dumbbell, HeartPulse, Sparkles, LogIn, Activity } from 'lucide-react';
import { cn } from './lib/utils';

function LandingPage() {
  const { signIn } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <span className="px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent font-bold text-xs tracking-widest uppercase mb-4 inline-block">
          Physical AI Technology
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
          당신의 몸을 이해하는<br />
          <span className="text-accent underline decoration-accent/30 underline-offset-8">가장 똑똑한</span> 코치
        </h1>
        <p className="max-w-xl mx-auto text-slate-400 text-lg md:text-xl font-medium">
          실시간 모션 분석과 맞춤형 재활 가이드를 통해<br /> 안전하고 건강한 운동 습관을 시작하세요.
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button 
          onClick={signIn}
          className="flex items-center gap-3 px-10 py-5 bg-accent text-bg rounded-2xl font-black text-lg hover:bg-sky-400 transition-all shadow-[0_20px_50px_rgba(56,189,248,0.3)] group"
        >
          <LogIn size={24} />
          무료로 시작하기
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
             <LayoutDashboard size={20} />
          </motion.span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-20">
        {[
          { icon: <HeartPulse className="text-pink-500" />, title: '맞춤형 재활', desc: '현재 컨디션에 맞춘 안전한 재활 루틴' },
          { icon: <Dumbbell className="text-accent" />, title: '실시간 피드백', desc: 'MediaPipe 기반의 정확한 자세 측정' },
          { icon: <Sparkles className="text-yellow-500" />, title: '지능형 추천', desc: '약점 부위를 보완하는 추천 시스템' }
        ].map((item, i) => (
          <div key={i} className="p-8 bg-card rounded-3xl border border-slate-800 text-left space-y-4">
            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">{item.icon}</div>
            <h3 className="font-bold text-xl">{item.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MainDashboard() {
  const [activeTab, setActiveTab] = useState<'bodyweight' | 'rehabilitation' | 'recommendation'>('bodyweight');
  const location = useLocation();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">트레이닝 대시보드</h1>
          <p className="text-slate-400">오늘의 운동 컨디션을 체크하고 시작하세요.</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 self-start">
          {[
            { id: 'bodyweight', icon: <Dumbbell size={18} />, label: '맨몸운동' },
            { id: 'rehabilitation', icon: <HeartPulse size={18} />, label: '재활운동' },
            { id: 'recommendation', icon: <Sparkles size={18} />, label: '추천' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-slate-800 text-accent shadow-inner" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           className="min-h-[500px]"
        >
          {activeTab === 'bodyweight' && <BodyweightSection />}
          {activeTab === 'rehabilitation' && <RehabSection />}
          {activeTab === 'recommendation' && <RecommendationList />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Activity className="text-accent animate-spin" size={48} />
           <p className="font-mono text-xs tracking-widest text-slate-500 uppercase">System Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-slate-100 selection:bg-accent/30">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-28 pb-20">
        <Routes>
          <Route path="/" element={user ? <MainDashboard /> : <LandingPage />} />
          <Route path="/profile" element={user ? <ProfileForm /> : <LandingPage />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-900 py-10 text-center text-slate-600 text-sm font-medium">
         &copy; 2026 Physical AI Motion Coach. Powered by Gemini & MediaPipe.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
