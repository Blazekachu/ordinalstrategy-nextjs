'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

interface GameScore {
  _id: string;
  score: number;
  level: number;
  coinsCollected: number;
  playTime: number;
  createdAt: string;
}

interface UserData {
  privyId: string;
  twitterHandle?: string;
  totalScore: number;
  gamesPlayed: number;
}

export default function ProfilePage() {
  const { user, authenticated, logout } = usePrivy();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [scores, setScores] = useState<GameScore[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'leaderboard'>('stats');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Matrix animation background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);

    const fontSize = 14;
    const cols = Math.floor(window.innerWidth / fontSize);
    const drops = new Array(cols).fill(1);
    ctx.font = `${fontSize}px monospace`;

    let animationId: number;
    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(11, 12, 16, 0.08)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < cols; i++) {
        const char = Math.random() < 0.5 ? '0' : '1';
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        const rand = Math.random();
        if (rand < 0.03) {
          ctx.fillStyle = '#ffffff';
        } else if (rand < 0.10) {
          ctx.fillStyle = '#ffd166';
        } else {
          ctx.fillStyle = '#f7931a';
        }
        
        ctx.fillText(char, x, y);

        if (y > window.innerHeight && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i]++;
        }
      }
      
      animationId = requestAnimationFrame(drawMatrix);
    };

    drawMatrix();
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    if (!authenticated) {
      router.push('/');
      return;
    }

    if (user?.id) {
      fetchUserData();
      fetchUserScores();
      fetchLeaderboard();
    }
  }, [authenticated, user]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user?privyId=${user?.id}`);
      const data = await response.json();
      setUserData(data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserScores = async () => {
    try {
      const response = await fetch(`/api/scores?privyId=${user?.id}&type=user&limit=20`);
      const data = await response.json();
      setScores(data.scores || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scores:', error);
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/scores?type=leaderboard&limit=10');
      const data = await response.json();
      setLeaderboard(data.scores || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#f7931a] mb-4">Please log in to view your profile</h1>
          <Link href="/" className="bg-[#f7931a] text-[#0b0c10] px-6 py-3 rounded-full font-bold hover:bg-white hover:scale-105 transition-all">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative">
      {/* Matrix Background Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />

      {/* Header */}
      <header className="relative z-50 bg-black/85 backdrop-blur-lg shadow-2xl flex items-center justify-between px-4 md:px-[10%] py-4 sticky top-0">
        <div className="logo">
          <Link href="/">
            <img src="/osfun.png" alt="Ordinal Strategy Logo" className="h-[42px] w-auto object-contain hover:scale-105 transition-transform" />
          </Link>
        </div>
        <nav className="flex gap-4 items-center">
          <Link href="/" className="text-[#f7931a] font-medium hover:text-white transition-colors">Home</Link>
          <Link href="/strategy" className="text-[#f7931a] font-medium hover:text-white transition-colors">Strategy</Link>
          <button
            onClick={() => logout()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#1b1c1f]/90 via-[#0b0c10]/90 to-[#1b1c1f]/90 backdrop-blur-md rounded-3xl p-6 md:p-10 mb-8 border-2 border-[#f7931a]/30 shadow-[0_0_50px_rgba(247,147,26,0.15)] hover:shadow-[0_0_80px_rgba(247,147,26,0.25)] transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#f7931a] rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-[#f7931a] to-[#ffd166] rounded-full flex items-center justify-center text-5xl md:text-6xl font-bold text-[#0b0c10] shadow-2xl border-4 border-[#ffd166]/50">
                {userData?.twitterHandle?.[0]?.toUpperCase() || user?.twitter?.username?.[0]?.toUpperCase() || '₿'}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <h1 className="text-3xl md:text-5xl font-bold text-[#f7931a] drop-shadow-[0_0_20px_rgba(247,147,26,0.5)]">
                  {userData?.twitterHandle || user?.twitter?.username || 'Anonymous Player'}
                </h1>
                <span className="text-2xl">🎮</span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-gray-300">
                <div className="bg-black/40 px-4 py-2 rounded-xl border border-[#f7931a]/20 hover:border-[#f7931a]/50 transition-colors">
                  <span className="text-[#ffd166] font-bold text-xl md:text-3xl block">{userData?.gamesPlayed || 0}</span>
                  <span className="text-xs md:text-sm opacity-80">Games Played</span>
                </div>
                <div className="bg-black/40 px-4 py-2 rounded-xl border border-[#f7931a]/20 hover:border-[#f7931a]/50 transition-colors">
                  <span className="text-[#ffd166] font-bold text-xl md:text-3xl block">{userData?.totalScore?.toLocaleString() || 0}</span>
                  <span className="text-xs md:text-sm opacity-80">Total Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          {['stats', 'history', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-[#f7931a] border-b-2 border-[#f7931a]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#f7931a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="group bg-gradient-to-br from-[#111317]/90 to-[#1b1c1f]/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-[#f7931a]/20 hover:border-[#f7931a]/60 hover:shadow-[0_10px_40px_rgba(247,147,26,0.2)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">🏆</div>
                  <div className="relative">
                    <div className="text-[#f7931a] text-xs md:text-sm mb-2 uppercase tracking-wider font-semibold">Best Score</div>
                    <div className="text-3xl md:text-4xl font-bold text-white">
                      {scores.length > 0 ? Math.max(...scores.map(s => s.score)).toLocaleString() : 0}
                    </div>
                  </div>
                </div>
                <div className="group bg-gradient-to-br from-[#111317]/90 to-[#1b1c1f]/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-[#f7931a]/20 hover:border-[#f7931a]/60 hover:shadow-[0_10px_40px_rgba(247,147,26,0.2)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">📊</div>
                  <div className="relative">
                    <div className="text-[#f7931a] text-xs md:text-sm mb-2 uppercase tracking-wider font-semibold">Average Score</div>
                    <div className="text-3xl md:text-4xl font-bold text-white">
                      {scores.length > 0
                        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toLocaleString()
                        : 0}
                    </div>
                  </div>
                </div>
                <div className="group bg-gradient-to-br from-[#111317]/90 to-[#1b1c1f]/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-[#f7931a]/20 hover:border-[#f7931a]/60 hover:shadow-[0_10px_40px_rgba(247,147,26,0.2)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">🪙</div>
                  <div className="relative">
                    <div className="text-[#f7931a] text-xs md:text-sm mb-2 uppercase tracking-wider font-semibold">Total Coins</div>
                    <div className="text-3xl md:text-4xl font-bold text-white">
                      {scores.reduce((sum, s) => sum + (s.coinsCollected || 0), 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="group bg-gradient-to-br from-[#111317]/90 to-[#1b1c1f]/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-[#f7931a]/20 hover:border-[#f7931a]/60 hover:shadow-[0_10px_40px_rgba(247,147,26,0.2)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">⏱️</div>
                  <div className="relative">
                    <div className="text-[#f7931a] text-xs md:text-sm mb-2 uppercase tracking-wider font-semibold">Total Play Time</div>
                    <div className="text-3xl md:text-4xl font-bold text-white">
                      {formatTime(scores.reduce((sum, s) => sum + (s.playTime || 0), 0))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="bg-[#111317]/90 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-[#f7931a]/20 shadow-lg">
                <table className="w-full">
                  <thead className="bg-[#1b1c1f]">
                    <tr>
                      <th className="px-6 py-4 text-left text-[#f7931a] font-semibold">Date</th>
                      <th className="px-6 py-4 text-left text-[#f7931a] font-semibold">Score</th>
                      <th className="px-6 py-4 text-left text-[#f7931a] font-semibold">Level</th>
                      <th className="px-6 py-4 text-left text-[#f7931a] font-semibold">Coins</th>
                      <th className="px-6 py-4 text-left text-[#f7931a] font-semibold">Play Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.length > 0 ? (
                      scores.map((score) => (
                        <tr key={score._id} className="border-t border-gray-700 hover:bg-[#1b1c1f] transition-colors">
                          <td className="px-6 py-4 text-gray-300">{formatDate(score.createdAt)}</td>
                          <td className="px-6 py-4 text-white font-bold">{score.score.toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-300">{score.level}</td>
                          <td className="px-6 py-4 text-yellow-400">{score.coinsCollected}</td>
                          <td className="px-6 py-4 text-gray-300">{formatTime(score.playTime)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                          No games played yet. <Link href="/foxjump" className="text-[#f7931a] hover:underline">Play now!</Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="bg-[#111317]/90 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-[#f7931a]/20 shadow-lg">
                <table className="w-full">
                  <thead className="bg-[#1b1c1f]">
                    <tr>
                      <th className="px-6 py-4 text-left text-[#f7931a] font-semibold">Rank</th>
                      <th className="px-6 py-4 text-left text-[#f7931a] font-semibold">Player</th>
                      <th className="px-6 py-4 text-left text-[#f7931a] font-semibold">Score</th>
                      <th className="px-6 py-4 text-left text-[#f7931a] font-semibold">Level</th>
                      <th className="px-6 py-4 text-left text-[#f7931a] font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={entry._id}
                        className={`border-t border-gray-700 hover:bg-[#1b1c1f] transition-colors ${
                          entry.userId?.privyId === user?.id ? 'bg-[#f7931a]/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className={`font-bold text-xl ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-orange-600' :
                            'text-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white font-medium">
                          {entry.userId?.twitterHandle || 'Anonymous'}
                          {entry.userId?.privyId === user?.id && (
                            <span className="ml-2 text-xs text-[#f7931a]">(You)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-white font-bold text-lg">{entry.score.toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-300">{entry.level}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(entry.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Play Game Button */}
        <div className="mt-12 text-center">
          <Link
            href="/foxjump"
            target="_blank"
            className="inline-block bg-gradient-to-r from-[#f7931a] to-[#ffd166] text-[#0b0c10] px-12 py-5 rounded-full font-bold text-lg md:text-xl hover:shadow-[0_10px_50px_rgba(247,147,26,0.5)] hover:scale-110 transition-all duration-300 shadow-2xl border-2 border-[#ffd166]/50"
          >
            🎮 Play FoxJump →
          </Link>
        </div>
      </div>
    </div>
  );
}

