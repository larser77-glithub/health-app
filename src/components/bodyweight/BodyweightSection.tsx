import { useEffect, useRef, useState, useCallback } from 'react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { motion } from 'motion/react';
import { Play, Square, RotateCcw, Activity, ShieldAlert, Sparkles, BrainCircuit } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getAICoaching } from '../../services/geminiService';
import { cn } from '@/src/lib/utils';

function calculateAngle(a: any, b: any, c: any) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

export function BodyweightSection() {
  const { profile, user, saveWorkout } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState<'up' | 'down'>('up');
  const [mode, setMode] = useState<'스쿼트' | '푸시업' | '런지'>('스쿼트');
  const [status, setStatus] = useState<string>('카메라 연결 대기 중...');
  const [isRunning, setIsRunning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const stateRef = useRef({ count, stage, mode, isRunning });

  useEffect(() => {
    stateRef.current = { count, stage, mode, isRunning };
  }, [count, stage, mode, isRunning]);

  const onResults = useCallback((results: any) => {
    if (!canvasRef.current || !stateRef.current.isRunning) return;
    
    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.poseLandmarks) {
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#ffffff55', lineWidth: 2 });
      drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#38bdf8', lineWidth: 1, radius: 3 });

      const lm = results.poseLandmarks;
      let angle = 0;
      let upThreshold = 160;
      let downThreshold = 100;

      if (stateRef.current.mode === '스쿼트') {
        angle = calculateAngle(lm[24], lm[26], lm[28]); 
      } else if (stateRef.current.mode === '푸시업') {
        angle = calculateAngle(lm[11], lm[13], lm[15]); 
        upThreshold = 150;
        downThreshold = 95;
      } else if (stateRef.current.mode === '런지') {
        angle = calculateAngle(lm[24], lm[26], lm[28]); 
      }

      setCurrentAngle(Math.round(angle));
      
      if (angle > upThreshold) {
        if (stateRef.current.stage !== 'up') {
          setStage('up');
          setStatus('좋아요! 다음 횟수를 위해 준비하세요.');
        }
      }
      
      if (angle < downThreshold && stateRef.current.stage === 'up') {
        const nextCount = stateRef.current.count + 1;
        setCount(nextCount);
        setStage('down');
        setStatus('멋집니다! 천천히 올라오세요.');
        setHistory(prev => [...prev, { count: nextCount, angle, time: Date.now() }]);
      }
    }
    canvasCtx.restore();
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && stateRef.current.isRunning) {
          await pose.send({ image: videoRef.current });
        }
      },
      width: 1280,
      height: 720,
    });

    camera.start().then(() => setCameraReady(true));

    return () => {
      camera.stop();
      pose.close();
    };
  }, [onResults]);

  const toggleSession = async () => {
    if (isRunning) {
      // End session and save
      setIsRunning(false);
      if (user && count > 0) {
        try {
          await saveWorkout({
            category: 'bodyweight',
            exerciseName: mode,
            count: count,
            duration: 0, // Placeholder
            feedback: aiFeedback || ''
          });
          setStatus('기록이 성공적으로 저장되었습니다.');
        } catch (error) {
          console.error("Error saving workout:", error);
          setStatus('저장 중 오류가 발생했습니다.');
        }
      }
    } else {
      setCount(0);
      setHistory([]);
      setAiFeedback(null);
      setIsRunning(true);
      setStatus('운동을 시작합니다! 자세에 집중하세요.');
    }
  };

  const requestAiAnalysis = async () => {
    if (count < 1) return;
    setIsAiLoading(true);
    const feedback = await getAICoaching(history, count, mode, profile);
    setAiFeedback(feedback || '분석 결과를 가져오지 못했습니다.');
    setIsAiLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-4">
        {/* Type Selector */}
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 gap-2">
          {(['스쿼트', '푸시업', '런지'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setCount(0); }}
              disabled={isRunning}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                mode === m 
                  ? "bg-accent text-bg shadow-lg" 
                  : "text-slate-400 hover:bg-slate-800 disabled:opacity-50"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl group">
          <video ref={videoRef} className="hidden" />
          <canvas ref={canvasRef} className="w-full h-full object-contain" width={1280} height={720} />
          
          <div className="absolute top-6 left-6 flex align-center gap-3">
             <div className="bg-bg/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-3">
               <div className={cn("w-3 h-3 rounded-full", isRunning ? "bg-red-500 animate-pulse" : "bg-slate-500")} />
               <span className="font-mono text-sm font-bold">{isRunning ? "RECORDING" : "STANDBY"}</span>
             </div>
          </div>

          {!cameraReady && (
             <div className="absolute inset-0 flex items-center justify-center bg-bg/50 backdrop-blur-sm">
                <div className="text-center space-y-4">
                   <Activity className="mx-auto text-accent animate-spin" size={48} />
                   <p className="text-slate-300 font-medium">카메라를 준비 중입니다...</p>
                </div>
             </div>
          )}
        </div>

        <div className="bg-card p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
               onClick={toggleSession}
               className={cn(
                 "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg",
                 isRunning 
                   ? "bg-red-500 hover:bg-red-600 text-white" 
                   : "bg-accent hover:bg-sky-400 text-bg"
               )}
            >
              {isRunning ? <Square size={20} /> : <Play size={20} />}
              {isRunning ? "운동 종료" : "운동 시작"}
            </button>
            <button
               onClick={() => setCount(0)}
               className="p-4 bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-100 transition-colors"
               disabled={isRunning}
            >
               <RotateCcw size={20} />
            </button>
          </div>
          <p className="text-slate-300 font-medium hidden sm:block italic">"{status}"</p>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="space-y-4">
        <div className="bg-card p-8 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-2">
           <span className="text-slate-400 text-sm font-bold tracking-widest uppercase">현재 횟수</span>
           <span className="text-8xl font-black text-accent tabular-nums">{count}</span>
           <span className="text-slate-500 text-xs">COUNT</span>
        </div>

        <div className="bg-card p-6 rounded-3xl border border-slate-800 space-y-4">
           <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">관절 각도</span>
              <span className="text-accent font-mono font-bold">{currentAngle}°</span>
           </div>
           <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (currentAngle / 180) * 100)}%` }}
              />
           </div>
        </div>

        <div className="bg-high/10 p-6 rounded-3xl border border-high/20 space-y-3">
           <div className="flex items-center gap-2 text-high">
              <ShieldAlert size={18} />
              <span className="font-bold text-sm">자세 주의사항</span>
           </div>
           <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>무릎이 발등보다 너무 나가지 않게 하세요.</li>
              <li>허리를 곧게 펴고 시선은 정면을 향하세요.</li>
              <li>동작은 천천히 제어하며 수행하세요.</li>
           </ul>
        </div>

        {count > 0 && !isRunning && (
          <div className="bg-accent/10 p-6 rounded-3xl border border-accent/20 space-y-4">
             <div className="flex items-center gap-2 text-accent">
                <BrainCircuit size={18} />
                <span className="font-bold text-sm">AI 운동 분석</span>
             </div>
             {aiFeedback ? (
               <p className="text-xs text-slate-200 leading-relaxed italic">
                 "{aiFeedback}"
               </p>
             ) : (
               <button
                 onClick={requestAiAnalysis}
                 disabled={isAiLoading}
                 className="w-full py-3 bg-accent text-bg rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-sky-400 transition-colors"
               >
                 {isAiLoading ? <Activity className="animate-spin" size={14} /> : <Sparkles size={14} />}
                 {isAiLoading ? "분석 중..." : "AI 정밀 분석 요청"}
               </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
