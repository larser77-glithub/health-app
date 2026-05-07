import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Save, User as UserIcon, Dumbbell, Activity as ActivityIcon } from 'lucide-react';

const CONDITIONS = [
  '없음', '허리 디스크', '거북목/일자목', '무릎 관절염', '회전근개 손상', '손목 터널 증후군', '측만증'
];

const MUSCLES = [
  '승모근', '복근', '대퇴사두근', '햄스트링', '삼두근', '이두근', '척추기립근', '둔근'
];

export function ProfileForm() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    condition: profile?.condition || '',
    weakMuscles: profile?.weakMuscles || [],
    displayName: profile?.displayName || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile(formData);
    setLoading(false);
    alert('프로필이 업데이트 되었습니다.');
  };

  const toggleMuscle = (muscle: string) => {
    setFormData(prev => ({
      ...prev,
      weakMuscles: prev.weakMuscles.includes(muscle)
        ? prev.weakMuscles.filter((m: string) => m !== muscle)
        : [...prev.weakMuscles, muscle]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-card rounded-3xl border border-slate-800 overflow-hidden">
      <div className="p-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-bg">
            <UserIcon size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">내 프로필 설정</h2>
            <p className="text-slate-400 text-sm">맞춤형 운동 추천을 위해 정보를 입력해주세요.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
               이름 (또는 닉네임)
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-colors"
              placeholder="표시될 이름을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
               <ActivityIcon size={16} /> 현재 컨디션 / 병명
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: c })}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                    formData.condition === c 
                      ? 'bg-accent/10 border-accent text-accent' 
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
               <Dumbbell size={16} /> 특히 약하다고 느끼는 부위 (다중 선택)
            </label>
            <div className="flex flex-wrap gap-2">
              {MUSCLES.map((m) => {
                const isActive = formData.weakMuscles.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMuscle(m)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isActive 
                        ? 'bg-blue-500/10 border-blue-500 text-blue-400 font-bold' 
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-accent text-bg rounded-xl font-bold hover:bg-sky-400 disabled:opacity-50 transition-all shadow-lg"
        >
          <Save size={18} />
          {loading ? '저장 중...' : '변경사항 저장'}
        </button>
      </div>
    </form>
  );
}
