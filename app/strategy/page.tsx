'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import ScrollButton from '@/components/ScrollButton';
import { useXverseWallet } from '@/components/XverseWalletProvider';

export default function StrategyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCountMeIn, setShowCountMeIn] = useState(false);
  const { login, authenticated } = usePrivy();
  const { connect: connectWallet, connected, address, balance, loading } = useXverseWallet();
  const router = useRouter();

  const handleCountMeIn = () => {
    setShowCountMeIn(true);
  };

  const handleWalletConnect = async () => {
    await connectWallet();
    if (!loading && address) {
      setTimeout(() => router.push('/profile'), 1000);
    }
  };

  // Matrix animation with custom characters
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

    const fontSize = 15;
    const cols = Math.floor(window.innerWidth / fontSize);
    const drops = new Array(cols).fill(1);
    ctx.font = `${fontSize}px monospace`;

    // Character distribution: * dominant, others evenly spread
    const characters = [
      '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*',
      '+', '+', '-', '-', '/', '/', '#', '#', '@', '@'
    ];

    let animationId: number;
    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(11, 12, 16, 0.08)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < cols; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
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

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white relative">
      {/* Matrix Background Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />

      {/* Count Me In Modal */}
      {showCountMeIn && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/35 backdrop-blur-lg p-4">
          <div className="relative max-w-[600px] w-full bg-black/35 border border-[#f7931a]/45 rounded-2xl shadow-2xl p-6 md:p-8 text-center font-mono">
            <button
              onClick={() => setShowCountMeIn(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 text-2xl text-gray-400 hover:text-[#f7931a]"
            >
              &times;
            </button>
            <div className="text-lg md:text-xl tracking-[0.2em] uppercase text-[#f7931a] mb-3">
              Join Ordinal Strategy
            </div>
            <div className="text-sm md:text-base text-gray-300 mb-6">
              Connect your Bitcoin wallet to join our community
            </div>
            {connected ? (
              <div className="space-y-3">
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                  <div className="text-green-400 font-semibold mb-2">✓ Wallet Connected</div>
                  <div className="text-sm text-gray-300 break-all">{address}</div>
                  {balance !== null && (
                    <div className="text-[#f7931a] font-bold mt-2">{balance.toFixed(8)} BTC</div>
                  )}
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="bg-[#f7931a] text-[#0b0c10] w-full px-6 py-3 rounded-lg font-semibold hover:bg-[#ffd166] hover:-translate-y-0.5 transition-all"
                >
                  Go to Profile →
                </button>
              </div>
            ) : (
              <button
                onClick={handleWalletConnect}
                disabled={loading}
                className="bg-gradient-to-r from-[#f7931a] to-[#ffd166] text-[#0b0c10] px-5 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Connecting...' : '₿ Connect Xverse Wallet'}
              </button>
            )}
            <div className="text-xs text-gray-500 mt-4">
              Bitcoin & Ordinals wallet required. Make sure Xverse is installed.
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-black/85 backdrop-blur-lg shadow-2xl flex items-center justify-between px-4 md:px-[10%] py-3 md:py-4">
        <div className="logo">
          <Link href="/">
            <img src="/osfun.png" alt="Ordinal Strategy Logo" className="h-[32px] md:h-[42px] w-auto object-contain hover:scale-105 transition-transform" />
          </Link>
        </div>
        <nav className="flex gap-2 md:gap-4">
          <Link href="/" className="text-[#f7931a] font-medium hover:text-white transition-colors text-xs md:text-base">Home</Link>
          <Link href="/#about" className="text-[#f7931a] font-medium hover:text-white transition-colors text-xs md:text-base">About</Link>
          <Link href="/#community" className="text-[#f7931a] font-medium hover:text-white transition-colors text-xs md:text-base">Community</Link>
        </nav>
      </header>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen overflow-y-auto scroll-smooth">
        <div className="flex flex-col items-center justify-center min-h-screen px-4 md:px-[10%] py-20 md:py-32">
          
          {/* Strategy Card */}
          <div className="max-w-[900px] w-full bg-black/45 border border-[#f7931a]/35 rounded-[20px] shadow-2xl p-5 md:p-12 backdrop-blur-lg">
            
            {/* Header */}
            <div className="text-center mb-6 md:mb-10">
              <h1 className="text-3xl md:text-5xl font-bold text-[#f7931a] mb-3 md:mb-4 drop-shadow-[0_0_20px_rgba(247,147,26,0.5)]">
                Strategy Protocol
              </h1>
              <p className="text-base md:text-xl text-gray-300 font-light italic">
                Balancing Asset Holders & Token Economics
              </p>
            </div>

            {/* Tweet Section */}
            <div className="my-6 md:my-10 p-4 md:p-9 bg-white/3 border-l-4 border-[#f7931a] rounded-xl">
              <ul className="space-y-2 md:space-y-3">
                <li className="pl-6 md:pl-8 relative text-sm md:text-lg text-white font-medium">
                  <span className="absolute left-0 text-[#f7931a] text-lg md:text-xl font-bold">➔</span>
                  Spread the buys
                </li>
                <li className="pl-6 md:pl-8 relative text-sm md:text-lg text-white font-medium">
                  <span className="absolute left-0 text-[#f7931a] text-lg md:text-xl font-bold">➔</span>
                  Protocol spends <span className="text-[#ffd166] font-semibold">$N</span> daily
                </li>
                <li className="pl-6 md:pl-8 relative text-sm md:text-lg text-white font-medium">
                  <span className="absolute left-0 text-[#f7931a] text-lg md:text-xl font-bold">➔</span>
                  If <span className="text-[#ffd166] font-semibold">$ordstrategytoken</span> &lt; <span className="text-[#ffd166] font-semibold">$X</span>, buy/burn tokens with <span className="text-[#ffd166] font-semibold">$N</span>. Otherwise, buy assets.
                </li>
              </ul>
            </div>

            {/* Formula Section */}
            <div className="mt-8 md:mt-12 p-4 md:p-9 bg-[#f7931a]/8 border-2 border-[#f7931a]/30 rounded-2xl text-center">
              <h3 className="text-xl md:text-2xl text-[#f7931a] mb-4 md:mb-5 font-semibold">Protocol Logic</h3>
              <div className="font-mono text-xs md:text-lg text-white bg-black/50 p-4 md:p-6 rounded-xl border-l-4 border-[#f7931a] text-left leading-loose overflow-x-auto">
                <strong>IF</strong> <span className="text-[#ffd166] font-semibold">token_price</span> &lt; <span className="text-[#ffd166] font-semibold">threshold_X</span><br />
                &nbsp;&nbsp;<strong>THEN</strong> <span className="text-[#ffd166] font-semibold">buy_and_burn(N)</span><br />
                <strong>ELSE</strong><br />
                &nbsp;&nbsp;<span className="text-[#ffd166] font-semibold">buy_assets(N)</span>
              </div>
            </div>

            {/* Mechanism Section */}
            <div className="mt-8 md:mt-12">
              <h2 className="text-2xl md:text-3xl text-[#f7931a] mb-6 md:mb-8 text-center font-semibold">How It Works</h2>
              
              {/* Infinite Scrolling Blocks Container */}
              <div className="relative overflow-hidden">
                {/* Gradient overlays for fade effect */}
                <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-[#0b0c10] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-[#0b0c10] to-transparent z-10 pointer-events-none" />
                
                {/* Scrolling wrapper */}
                <div className="flex gap-6 animate-scroll">
                  {/* First set of blocks */}
                  {[
                    { icon: '📊', title: 'Price Monitoring', text: 'Continuously track $ordstrategytoken price against threshold $X to determine optimal protocol action.' },
                    { icon: '💰', title: 'Daily Allocation', text: 'Protocol automatically spends $N daily, ensuring consistent market activity and balanced growth.' },
                    { icon: '🔥', title: 'Buy & Burn', text: 'When price is below threshold, tokens are purchased and burned, reducing supply and supporting price.' },
                    { icon: '🎯', title: 'Asset Acquisition', text: 'When price exceeds threshold, funds are used to acquire strategic assets, building treasury value.' },
                    { icon: '⚖️', title: 'Balance Mechanism', text: 'This dual approach balances token holder value with asset backing, creating sustainable growth.' },
                    { icon: '🚀', title: 'Community Driven', text: 'Transparent, algorithmic strategy that benefits all participants through smart economic design.' },
                  ].map((item, i) => (
                    <div key={i} className="flex-shrink-0 w-[320px] md:w-[380px] bg-white/5 border border-[#f7931a]/20 rounded-2xl p-6 md:p-8 hover:bg-white/8 hover:border-[#f7931a]/50 hover:shadow-[0_10px_30px_rgba(247,147,26,0.2)] transition-all duration-300 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#f7931a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-4xl block mb-4">{item.icon}</span>
                      <h4 className="text-xl text-[#f7931a] mb-3 font-semibold">{item.title}</h4>
                      <p className="text-gray-300 leading-relaxed text-sm md:text-base">{item.text}</p>
                    </div>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {[
                    { icon: '📊', title: 'Price Monitoring', text: 'Continuously track $ordstrategytoken price against threshold $X to determine optimal protocol action.' },
                    { icon: '💰', title: 'Daily Allocation', text: 'Protocol automatically spends $N daily, ensuring consistent market activity and balanced growth.' },
                    { icon: '🔥', title: 'Buy & Burn', text: 'When price is below threshold, tokens are purchased and burned, reducing supply and supporting price.' },
                    { icon: '🎯', title: 'Asset Acquisition', text: 'When price exceeds threshold, funds are used to acquire strategic assets, building treasury value.' },
                    { icon: '⚖️', title: 'Balance Mechanism', text: 'This dual approach balances token holder value with asset backing, creating sustainable growth.' },
                    { icon: '🚀', title: 'Community Driven', text: 'Transparent, algorithmic strategy that benefits all participants through smart economic design.' },
                  ].map((item, i) => (
                    <div key={`dup-${i}`} className="flex-shrink-0 w-[320px] md:w-[380px] bg-white/5 border border-[#f7931a]/20 rounded-2xl p-6 md:p-8 hover:bg-white/8 hover:border-[#f7931a]/50 hover:shadow-[0_10px_30px_rgba(247,147,26,0.2)] transition-all duration-300 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#f7931a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-4xl block mb-4">{item.icon}</span>
                      <h4 className="text-xl text-[#f7931a] mb-3 font-semibold">{item.title}</h4>
                      <p className="text-gray-300 leading-relaxed text-sm md:text-base">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Add the animation styles */}
            <style jsx>{`
              @keyframes scroll {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(calc(-320px * 6 - 24px * 6));
                }
              }
              
              @media (min-width: 768px) {
                @keyframes scroll {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(calc(-380px * 6 - 24px * 6));
                  }
                }
              }
              
              .animate-scroll {
                animation: scroll 40s linear infinite;
              }
              
              .animate-scroll:hover {
                animation-play-state: paused;
              }
            `}</style>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-5 mt-8 md:mt-12 items-center">
              <ScrollButton
                text="Join"
                onComplete={handleCountMeIn}
                backgroundColor="#f7931a"
                textColor="#0b0c10"
                accentColor="#ffffff"
              />
              <Link href="/" className="bg-transparent border-2 border-[#f7931a] text-[#f7931a] px-6 md:px-9 py-3 md:py-4 rounded-full font-bold text-sm md:text-base hover:bg-[#f7931a] hover:text-[#0b0c10] transition-all w-full md:w-auto text-center">
                Back to Home
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

