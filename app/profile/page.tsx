'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useXverseWallet } from '@/components/XverseWalletProvider';

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
  const { 
    connected, 
    address, 
    ordinalsAddress, 
    sparkAddress,
    balance, 
    nativeSegwit,
    nestedSegwit,
    taproot,
    spark,
    disconnect,
    refreshBalances,
    loading: walletLoading 
  } = useXverseWallet();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [scores, setScores] = useState<GameScore[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'addresses' | 'games' | 'inscriptions'>('addresses');
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [loadingInscriptions, setLoadingInscriptions] = useState(false);
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
    // Only redirect after wallet loading is complete
    if (!walletLoading && !connected) {
      router.push('/');
      return;
    }

    // Use wallet address as user ID
    if (connected && address) {
      fetchUserData();
      fetchUserScores();
      fetchLeaderboard();
    }
  }, [connected, address, walletLoading]);

  useEffect(() => {
    if (activeTab === 'inscriptions' && ordinalsAddress) {
      fetchInscriptions();
    }
  }, [activeTab, ordinalsAddress]);

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

  const fetchInscriptions = async () => {
    if (!ordinalsAddress) return;
    
    setLoadingInscriptions(true);
    try {
      // Try Hiro API first
      const response = await fetch(
        `https://api.hiro.so/ordinals/v1/inscriptions?address=${ordinalsAddress}&limit=60`
      );
      const data = await response.json();
      setInscriptions(data.results || []);
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
      setInscriptions([]);
    } finally {
      setLoadingInscriptions(false);
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

  if (walletLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#f7931a] border-t-transparent rounded-full animate-spin mb-4" />
          <div className="text-gray-400">Loading wallet...</div>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#f7931a] mb-4">Please connect your wallet</h1>
          <p className="text-gray-400 mb-6">Connect your Xverse wallet to access your profile</p>
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
            onClick={() => { disconnect(); router.push('/'); }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Disconnect
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
                ₿
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col items-center md:items-start gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-[#f7931a] drop-shadow-[0_0_20px_rgba(247,147,26,0.5)] break-all">
                    {address && `${address.slice(0, 8)}...${address.slice(-8)}`}
                  </h1>
                  <span className="text-2xl">🎮</span>
                </div>
                {balance !== null && (
                  <div className="bg-black/60 px-4 py-2 rounded-lg border border-[#f7931a]/30">
                    <span className="text-[#ffd166] font-bold text-lg md:text-xl">{balance.toFixed(8)} BTC</span>
                  </div>
                )}
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
              {[
                { key: 'addresses', label: 'Addresses & Sats' },
                { key: 'games', label: 'Games' },
                { key: 'inscriptions', label: 'Inscriptions' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'text-[#f7931a] border-b-2 border-[#f7931a]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
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
            {/* Addresses & Sats Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                {/* Native SegWit */}
                {nativeSegwit && (
                  <div className="group bg-gradient-to-br from-[#111317]/90 to-[#1b1c1f]/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-[#f7931a]/20 hover:border-[#f7931a]/60 hover:shadow-[0_10px_40px_rgba(247,147,26,0.2)] transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-[#f7931a] text-sm mb-2 uppercase tracking-wider font-semibold flex items-center gap-2">
                          <span className="text-2xl">🔐</span>
                          Native SegWit (bc1q...)
                        </div>
                        <div className="text-white font-mono text-sm break-all bg-black/40 p-3 rounded-lg">
                          {nativeSegwit.address}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#ffd166]">
                          {nativeSegwit.balance !== null ? nativeSegwit.balance.toFixed(8) : '...'}
                        </div>
                        <div className="text-sm text-gray-400">BTC</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Taproot */}
                {taproot && (
                  <div className="group bg-gradient-to-br from-[#111317]/90 to-[#1b1c1f]/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-[#f7931a]/20 hover:border-[#f7931a]/60 hover:shadow-[0_10px_40px_rgba(247,147,26,0.2)] transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-[#f7931a] text-sm mb-2 uppercase tracking-wider font-semibold flex items-center gap-2">
                          <span className="text-2xl">🎨</span>
                          Taproot / Ordinals (bc1p...)
                        </div>
                        <div className="text-white font-mono text-sm break-all bg-black/40 p-3 rounded-lg">
                          {taproot.address}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#ffd166]">
                          {taproot.balance !== null ? taproot.balance.toFixed(8) : '...'}
                        </div>
                        <div className="text-sm text-gray-400">BTC</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Spark (Stacks) */}
                {spark && (
                  <div className="group bg-gradient-to-br from-[#111317]/90 to-[#1b1c1f]/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-purple-500/20 hover:border-purple-500/60 hover:shadow-[0_10px_40px_rgba(168,85,247,0.2)] transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-purple-400 text-sm mb-2 uppercase tracking-wider font-semibold flex items-center gap-2">
                          <span className="text-2xl">⚡</span>
                          Spark / Stacks (SP...)
                        </div>
                        <div className="text-white font-mono text-sm break-all bg-black/40 p-3 rounded-lg">
                          {spark.address}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-300">
                          {spark.balance !== null ? spark.balance.toFixed(8) : '...'}
                        </div>
                        <div className="text-sm text-gray-400">BTC</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Refresh Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={refreshBalances}
                    className="bg-[#f7931a] text-[#0b0c10] px-6 py-3 rounded-lg font-semibold hover:bg-[#ffd166] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    🔄 Refresh Balances
                  </button>
                </div>
              </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
              <div className="space-y-8">
                {/* Stats Cards */}
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

                {/* Game History Table */}
                <div className="bg-[#111317]/90 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-[#f7931a]/20 shadow-lg">
                  <div className="bg-[#1b1c1f] px-6 py-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-[#f7931a]">Game History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#1b1c1f]/50">
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
                            <tr key={score._id} className="border-t border-gray-700 hover:bg-[#1b1c1f]/30 transition-colors">
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
                </div>
              </div>
            )}

            {/* Inscriptions Tab */}
            {activeTab === 'inscriptions' && (
              <div>
                {loadingInscriptions ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-[#f7931a] border-t-transparent rounded-full animate-spin mb-4" />
                    <div className="text-gray-400">Loading inscriptions...</div>
                  </div>
                ) : inscriptions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {inscriptions.map((inscription: any) => (
                      <div
                        key={inscription.id}
                        className="group bg-gradient-to-br from-[#111317]/90 to-[#1b1c1f]/90 backdrop-blur-sm rounded-2xl border-2 border-[#f7931a]/20 hover:border-[#f7931a]/60 hover:shadow-[0_10px_40px_rgba(247,147,26,0.2)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                      >
                        {/* Inscription Preview */}
                        <div className="aspect-square bg-black/40 flex items-center justify-center p-4 relative overflow-hidden">
                          {inscription.content_type?.startsWith('image/') ? (
                            <img
                              src={`https://ordinals.com/content/${inscription.id}`}
                              alt={`Inscription ${inscription.number}`}
                              className="w-full h-full object-contain"
                              loading="lazy"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                // Try alternative image sources
                                if (img.src.includes('ordinals.com')) {
                                  img.src = `https://ord-mirror.magiceden.dev/content/${inscription.id}`;
                                } else if (img.src.includes('magiceden')) {
                                  img.src = `https://ordinals.hiro.so/inscription/${inscription.id}/content`;
                                } else {
                                  // If all fail, show icon
                                  img.style.display = 'none';
                                  const parent = img.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="text-[#f7931a] text-4xl">🖼️</div>';
                                  }
                                }
                              }}
                            />
                          ) : inscription.content_type?.startsWith('text/') ? (
                            <div className="text-[#f7931a] text-4xl">📄</div>
                          ) : inscription.content_type?.startsWith('video/') ? (
                            <div className="text-[#f7931a] text-4xl">🎬</div>
                          ) : inscription.content_type?.startsWith('audio/') ? (
                            <div className="text-[#f7931a] text-4xl">🎵</div>
                          ) : inscription.content_type?.includes('html') ? (
                            <div className="text-[#f7931a] text-4xl">🌐</div>
                          ) : (
                            <div className="text-[#f7931a] text-4xl">🎨</div>
                          )}
                        </div>

                        {/* Inscription Details */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[#f7931a] font-bold text-lg">
                              #{inscription.number?.toLocaleString() || 'N/A'}
                            </span>
                            <a
                              href={`https://ordinals.com/inscription/${inscription.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-400 hover:text-[#f7931a] transition-colors"
                            >
                              View ↗
                            </a>
                          </div>
                          <div className="text-xs text-gray-400 font-mono break-all">
                            {inscription.id.slice(0, 12)}...{inscription.id.slice(-8)}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              {inscription.content_type || 'Unknown'}
                            </span>
                            <span className="text-gray-500">
                              {inscription.content_length ? `${(inscription.content_length / 1024).toFixed(1)} KB` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-[#111317]/90 backdrop-blur-sm rounded-2xl border-2 border-[#f7931a]/20">
                    <div className="text-6xl mb-4">🎨</div>
                    <div className="text-xl text-[#f7931a] mb-2">No Inscriptions Found</div>
                    <div className="text-gray-400">
                      Your taproot address doesn't have any inscriptions yet.
                    </div>
                  </div>
                )}
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

