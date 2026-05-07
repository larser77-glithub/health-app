import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeartPulse, ChevronRight, Info, ShieldCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const CONDITIONS = [
  { 
    id: 'disc', 
    name: '허리 디스크 (Lumbar Disc)', 
    guide: '허리를 과도하게 숙이는 자세는 피해야 합니다. 코어 근육 강화와 골반 중립 유지가 핵심입니다.',
    exercises: ['골반 경사 운동', '버드독', '맥길 커업']
  },
  { 
    id: 'neck', 
    name: '거북목/일자목 (Forward Head)', 
    guide: '턱을 당기는 동작(Chin-tuck) 위주로 진행하세요. 가슴 근육 이완과 등 근육 강화가 병행되어야 합니다.',
    exercises: ['친턱 운동', '벽 천사 운동', '흉추 가동성 트레이닝']
  },
  { 
    id: 'knee', 
    name: '무릎 관절염 (Knee Arthritis)', 
    guide: '체중 부하가 적은 상태에서 허벅지 앞쪽 근육(대퇴사두근)을 강화하는 것이 무릎 통증 완화에 도움을 줍니다.',
    exercises: ['대퇴사두근 세팅', '직거상(SLR) 운동', '미니 스쿼트']
  },
  { 
    id: 'shoulder', 
    name: '회전근개 손상 (Rotator Cuff)', 
    guide: '어깨 가동 범위 내에서만 움직이세요. 통증이 발생하는 구간은 넘기지 않는 것이 원칙입니다.',
    exercises: ['페이스 풀', '외회전 강화', '스캡션']
  }
];

export function RehabSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentCondition = CONDITIONS.find(c => c.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONDITIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={cn(
              "flex items-center justify-between p-5 rounded-2xl border transition-all text-left",
              selectedId === c.id 
                ? "bg-accent/10 border-accent shadow-[0_0_15px_rgba(56,189,248,0.2)]" 
                : "bg-card border-slate-800 hover:border-slate-600"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                selectedId === c.id ? "bg-accent text-bg" : "bg-slate-800 text-accent"
              )}>
                <HeartPulse size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">{c.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{c.exercises.length}개의 가이드 운동</p>
              </div>
            </div>
            <ChevronRight size={20} className={cn("text-slate-600 transition-transform", selectedId === c.id && "rotate-90 text-accent")} />
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentCondition && (
          <motion.div
            key={currentCondition.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card rounded-3xl border border-slate-800 p-8 space-y-8"
          >
            <div className="flex items-start gap-4 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/20">
              <Info className="text-accent shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-accent mb-1">재활 가이드</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{currentCondition.guide}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                <ShieldCheck className="text-green-400" />
                추천 운동 리스트
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentCondition.exercises.map((ex, i) => (
                  <div 
                    key={i} 
                    className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer group"
                  >
                    <div className="w-full aspect-video bg-slate-700 rounded-lg mb-3 flex items-center justify-center text-slate-500 text-xs italic font-mono overflow-hidden relative">
                      [운동 이미지/영상 플레이스홀더]
                      <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-accent font-bold">영상 보기</span>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-200">{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!currentCondition && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-50 space-y-4">
          <HeartPulse size={64} strokeWidth={1} />
          <p className="text-lg">분석 및 가이드를 위해 병명이나 컨디션을 선택해주세요.</p>
        </div>
      )}
    </div>
  );
}
