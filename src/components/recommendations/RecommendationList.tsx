import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { Youtube, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Video {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: { url: string };
    };
  };
}

export function RecommendationList() {
  const { profile } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!profile) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const query = `${profile.condition || '기본 재활'} ${profile.weakMuscles?.join(' ') || '맨몸운동'} 추천 운동 가이드`;
        const response = await axios.get('/api/youtube/search', {
          params: { q: query }
        });
        setVideos(response.data.items || []);
      } catch (err: any) {
        console.error('Failed to fetch videos:', err);
        setError('운동 영상을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/10 p-3 rounded-2xl text-yellow-500 border border-yellow-500/20">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI 맞춤 추천 루틴</h2>
            <p className="text-slate-400 text-sm">
              <span className="text-accent font-bold">#{profile.condition}</span> 전문가가 추천하는 보조 운동 영상입니다.
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-3xl border border-slate-800 animate-pulse overflow-hidden">
              <div className="aspect-video bg-slate-800" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-12 bg-red-500/5 rounded-3xl border border-red-500/20 text-red-400 gap-3">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, idx) => (
            <motion.a
              key={video.id.videoId}
              href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-card rounded-3xl border border-slate-800 overflow-hidden hover:border-accent/50 transition-all hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]"
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={video.snippet.thumbnails.high.url} 
                  alt={video.snippet.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-red-600 p-4 rounded-full text-white shadow-xl">
                      <Youtube size={32} />
                   </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-slate-100 leading-snug line-clamp-2 group-hover:text-accent transition-colors" dangerouslySetInnerHTML={{ __html: video.snippet.title }} />
                <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">YouTube 전문가 제안</span>
                  <ExternalLink size={14} />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}
