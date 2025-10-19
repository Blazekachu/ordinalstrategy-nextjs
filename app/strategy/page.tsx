'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function StrategyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-black/85 backdrop-blur-lg shadow-2xl flex items-center justify-between px-[10%] py-4">
        <div className="logo">
          <Link href="/">
            <img src="/osfun.png" alt="Ordinal Strategy Logo" className="h-[42px] w-auto object-contain hover:scale-105 transition-transform" />
          </Link>
        </div>
        <nav className="flex gap-4">
          <Link href="/" className="text-[#f7931a] font-medium hover:text-white transition-colors">Home</Link>
          <Link href="/#about" className="text-[#f7931a] font-medium hover:text-white transition-colors">About</Link>
          <Link href="/#community" className="text-[#f7931a] font-medium hover:text-white transition-colors">Community</Link>
        </nav>
      </header>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen overflow-y-auto scroll-smooth">
        <div className="flex flex-col items-center justify-center min-h-screen px-[10%] py-32">
          
          {/* Strategy Card */}
          <div className="max-w-[900px] w-full bg-black/45 border border-[#f7931a]/35 rounded-[20px] shadow-2xl p-12 backdrop-blur-lg">
            
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-5xl font-bold text-[#f7931a] mb-4 drop-shadow-[0_0_20px_rgba(247,147,26,0.5)]">
                Strategy Protocol
              </h1>
              <p className="text-xl text-gray-300 font-light italic">
                Balancing Asset Holders & Token Economics
              </p>
            </div>

            {/* Tweet Section */}
            <div className="my-10 p-9 bg-white/3 border-l-4 border-[#f7931a] rounded-xl">
              <ul className="space-y-3">
                <li className="pl-8 relative text-lg text-white font-medium">
                  <span className="absolute left-0 text-[#f7931a] text-xl font-bold">➔</span>
                  Spread the buys
                </li>
                <li className="pl-8 relative text-lg text-white font-medium">
                  <span className="absolute left-0 text-[#f7931a] text-xl font-bold">➔</span>
                  Protocol spends <span className="text-[#ffd166] font-semibold">$N</span> daily
                </li>
                <li className="pl-8 relative text-lg text-white font-medium">
                  <span className="absolute left-0 text-[#f7931a] text-xl font-bold">➔</span>
                  If <span className="text-[#ffd166] font-semibold">$ordstrategytoken</span> &lt; <span className="text-[#ffd166] font-semibold">$X</span>, buy/burn tokens with <span className="text-[#ffd166] font-semibold">$N</span>. Otherwise, buy assets.
                </li>
              </ul>
            </div>

            {/* Formula Section */}
            <div className="mt-12 p-9 bg-[#f7931a]/8 border-2 border-[#f7931a]/30 rounded-2xl text-center">
              <h3 className="text-2xl text-[#f7931a] mb-5 font-semibold">Protocol Logic</h3>
              <div className="font-mono text-lg text-white bg-black/50 p-6 rounded-xl border-l-4 border-[#f7931a] text-left leading-loose">
                <strong>IF</strong> <span className="text-[#ffd166] font-semibold">token_price</span> &lt; <span className="text-[#ffd166] font-semibold">threshold_X</span><br />
                &nbsp;&nbsp;<strong>THEN</strong> <span className="text-[#ffd166] font-semibold">buy_and_burn(N)</span><br />
                <strong>ELSE</strong><br />
                &nbsp;&nbsp;<span className="text-[#ffd166] font-semibold">buy_assets(N)</span>
              </div>
            </div>

            {/* Mechanism Section */}
            <div className="mt-12">
              <h2 className="text-3xl text-[#f7931a] mb-8 text-center font-semibold">How It Works</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: '📊', title: 'Price Monitoring', text: 'Continuously track $ordstrategytoken price against threshold $X to determine optimal protocol action.' },
                  { icon: '💰', title: 'Daily Allocation', text: 'Protocol automatically spends $N daily, ensuring consistent market activity and balanced growth.' },
                  { icon: '🔥', title: 'Buy & Burn', text: 'When price is below threshold, tokens are purchased and burned, reducing supply and supporting price.' },
                  { icon: '🎯', title: 'Asset Acquisition', text: 'When price exceeds threshold, funds are used to acquire strategic assets, building treasury value.' },
                  { icon: '⚖️', title: 'Balance Mechanism', text: 'This dual approach balances token holder value with asset backing, creating sustainable growth.' },
                  { icon: '🚀', title: 'Community Driven', text: 'Transparent, algorithmic strategy that benefits all participants through smart economic design.' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-[#f7931a]/20 rounded-2xl p-8 hover:bg-white/8 hover:border-[#f7931a]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(247,147,26,0.2)] transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#f7931a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-4xl block mb-4">{item.icon}</span>
                    <h4 className="text-xl text-[#f7931a] mb-3 font-semibold">{item.title}</h4>
                    <p className="text-gray-300 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-5 mt-12 flex-wrap">
              <Link href="/#community" className="bg-[#f7931a] text-[#0b0c10] px-9 py-4 rounded-full font-bold text-base hover:bg-white hover:text-black hover:scale-105 shadow-[0_5px_20px_rgba(247,147,26,0.3)] transition-all">
                Join Community
              </Link>
              <Link href="/" className="bg-transparent border-2 border-[#f7931a] text-[#f7931a] px-9 py-4 rounded-full font-bold text-base hover:bg-[#f7931a] hover:text-[#0b0c10] transition-all">
                Back to Home
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

