'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';

export default function Home() {
  const [blockHeight, setBlockHeight] = useState('--');
  const [mempoolCount, setMempoolCount] = useState('--');
  const [avgFee, setAvgFee] = useState('--');
  const [btcPrice, setBtcPrice] = useState('$--');
  const [change7d, setChange7d] = useState<{ value: string; positive: boolean } | null>(null);
  const [change30d, setChange30d] = useState<{ value: string; positive: boolean } | null>(null);
  const [latestInscription, setLatestInscription] = useState('--');
  const [showGate, setShowGate] = useState(true);
  const [showCountMeIn, setShowCountMeIn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const siteRef = useRef<HTMLDivElement>(null);
  const { login, authenticated } = usePrivy();

  // Matrix animation
  useEffect(() => {
    if (!showGate || !canvasRef.current) return;

    const canvas = canvasRef.current;
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
    const drops = new Array(cols).fill(0);
    ctx.font = `${fontSize}px monospace`;

    let animationId: number;
    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < cols; i++) {
        const char = Math.random() < 0.5 ? '0' : '1';
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const highlight = Math.random() < 0.06;
        ctx.fillStyle = highlight ? '#ffffff' : '#f7931a';
        ctx.fillText(char, x, y);

        if (y > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
        else drops[i]++;
      }
      animationId = requestAnimationFrame(drawMatrix);
    };

    drawMatrix();
    return () => cancelAnimationFrame(animationId);
  }, [showGate]);

  // Check if gate was passed
  useEffect(() => {
    const passed = localStorage.getItem('os_gate_passed');
    if (passed === '1') setShowGate(false);
  }, []);

  // Bitcoin data fetching
  useEffect(() => {
    if (showGate) return;

    // Fetch BTC price
    fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true')
      .then(res => res.json())
      .then(data => {
        const price = data?.market_data?.current_price?.usd;
        const p7d = data?.market_data?.price_change_percentage_7d_in_currency?.usd;
        const p30d = data?.market_data?.price_change_percentage_30d_in_currency?.usd;
        
        if (price) setBtcPrice(`$${Math.round(price).toLocaleString()}`);
        if (typeof p7d === 'number') {
          setChange7d({ value: `${p7d >= 0 ? '+' : ''}${p7d.toFixed(2)}%`, positive: p7d >= 0 });
        }
        if (typeof p30d === 'number') {
          setChange30d({ value: `${p30d >= 0 ? '+' : ''}${p30d.toFixed(2)}%`, positive: p30d >= 0 });
        }
      })
      .catch(console.error);

    // Fetch mempool data
    Promise.all([
      fetch('https://mempool.space/api/blocks').then(r => r.json()),
      fetch('https://mempool.space/api/mempool').then(r => r.json()),
    ])
      .then(([blocks, mempool]) => {
        if (blocks?.[0]?.height) setBlockHeight(blocks[0].height);
        if (mempool?.count) setMempoolCount(mempool.count.toLocaleString());
      })
      .catch(console.error);

    // Fetch ordinals data
    fetch('https://api.ordiscan.com/v1/inscriptions?limit=1', {
      headers: { Authorization: 'Bearer ***REMOVED***' },
    })
      .then(res => res.json())
      .then(data => {
        if (data.data?.[0]?.inscription_number) {
          setLatestInscription(data.data[0].inscription_number.toLocaleString());
        }
      })
      .catch(console.error);
  }, [showGate]);

  const handleGateClick = () => {
    localStorage.setItem('os_gate_passed', '1');
    setShowGate(false);
  };

  const handleCountMeIn = () => {
    setShowCountMeIn(true);
  };

  const handleTwitterConnect = async () => {
    if (!authenticated) {
      await login();
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      {/* Landing Overlay */}
      {showGate && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/35 backdrop-blur-lg">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="relative z-[10001] max-w-[720px] mx-5 bg-black/35 border border-[#f7931a]/45 rounded-2xl shadow-2xl p-7 text-center font-mono">
            <div className="text-sm tracking-[0.2em] uppercase text-[#f7931a] mb-2">
              Bitcoin Genesis — 03 Jan 2009
            </div>
            <div className="text-[1.4rem] leading-relaxed mb-5 text-shadow-[0_0_6px_rgba(247,147,26,0.35)]">
              "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"
            </div>
            <button
              onClick={handleGateClick}
              className="bg-[#f7931a] text-[#0b0c10] px-6 py-2.5 rounded-full font-bold shadow-lg hover:brightness-110 hover:scale-105 active:scale-95 transition-all"
            >
              TRUE
            </button>
          </div>
        </div>
      )}

      {/* Count Me In Modal */}
      {showCountMeIn && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/35 backdrop-blur-lg">
          <div className="relative max-w-[600px] mx-5 bg-black/35 border border-[#f7931a]/45 rounded-2xl shadow-2xl p-8 text-center font-mono">
            <button
              onClick={() => setShowCountMeIn(false)}
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-[#f7931a]"
            >
              &times;
            </button>
            <div className="text-xl tracking-[0.2em] uppercase text-[#f7931a] mb-3">
              Join Ordinal Strategy
            </div>
            <div className="text-base text-gray-300 mb-6">
              Connect your Twitter to verify your identity and join our community
            </div>
            <button
              onClick={handleTwitterConnect}
              className="bg-[#1da1f2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0d8bd9] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
            >
              🐦 Connect Twitter Account
            </button>
            <div className="text-xs text-gray-500 mt-4">
              We only verify your identity. No posting permissions required.
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!showGate && (
        <>
          {/* Mempool Bar */}
          <div className="fixed left-0 right-0 bottom-[72px] z-[1001] bg-[#0f1116] backdrop-blur border-t border-white/10 border-b border-white/6 px-[10%] py-0.5">
            <div className="flex flex-wrap justify-center gap-3 text-[#f7931a] font-semibold text-sm">
              <span>🟠 Block: {blockHeight}</span>
              <span>Txns: {mempoolCount}</span>
              <span>Avg Fee: {avgFee} sats/vB</span>
            </div>
          </div>

          {/* Price Bar (Left) */}
          <div className="fixed left-[18px] top-1/2 -translate-y-1/2 z-[1002] bg-[#14161c]/45 border border-white/12 rounded-2xl px-3.5 py-3 backdrop-blur-lg shadow-2xl pointer-events-none min-w-[180px]">
            <div className="text-[#ffd166] font-semibold">{btcPrice}</div>
            {change7d && (
              <div className={`text-sm ${change7d.positive ? 'text-[#36d399]' : 'text-[#ef4444]'}`}>
                7d: {change7d.value}
              </div>
            )}
            {change30d && (
              <div className={`text-sm ${change30d.positive ? 'text-[#36d399]' : 'text-[#ef4444]'}`}>
                30d: {change30d.value}
              </div>
            )}
          </div>

          {/* Ordinals Bar (Right) */}
          <div className="fixed right-[18px] top-1/2 -translate-y-1/2 z-[1002] bg-[#14161c]/45 border border-[#f7931a]/12 rounded-2xl px-3.5 py-3 backdrop-blur-lg shadow-2xl pointer-events-none min-w-[200px]">
            <div className="text-[#f7931a] text-sm">Total:</div>
            <div className="text-[#ffd166] font-semibold">{latestInscription}</div>
          </div>

          {/* Mascot */}
          <Link href="/foxjump" target="_blank">
            <div className="fixed top-3 right-11 z-[1003] flex items-center gap-2 cursor-pointer hover:scale-110 transition-transform">
              <div className="relative bg-white/92 text-[#0b0c10] px-2.5 py-1.5 rounded-2xl font-bold text-sm shadow-lg whitespace-nowrap">
                up only
                <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-l-[8px] border-l-white/92 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent" />
              </div>
              <img src="/osmascot.png" alt="OS Mascot" className="w-14 h-14 object-contain drop-shadow-lg rounded-lg" />
            </div>
          </Link>

          {/* Header */}
          <header className="fixed bottom-0 left-0 right-0 z-[1000] bg-black/85 backdrop-blur-lg shadow-[0_-10px_30px_rgba(0,0,0,0.5)] h-[72px] flex items-center justify-between px-[10%]">
            <div className="logo">
              <img src="/osfun.png" alt="Ordinal Strategy Logo" className="h-[42px] w-auto object-contain hover:scale-105 transition-transform" />
            </div>
            <nav className="flex gap-2.5">
              <a href="#about" className="text-[#f7931a] font-medium hover:text-white transition-colors">About</a>
              <a href="#mechanics" className="text-[#f7931a] font-medium hover:text-white transition-colors">How It Works</a>
              <a href="#community" className="text-[#f7931a] font-medium hover:text-white transition-colors">Community</a>
            </nav>
          </header>

          {/* Main Scrollable Content */}
          <div ref={siteRef} className="h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory pb-[72px]">
            {/* Hero Section */}
            <section id="hero" className="min-h-screen flex flex-col justify-center items-center text-center px-[10%] bg-gradient-radial from-[#1b1c1f] to-[#0b0c10]">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 max-w-3xl">
                <h2 className="text-5xl font-bold text-[#f7931a] mb-4">
                  Precision in the World of Bitcoin Ordinals
                </h2>
                <p className="text-xl mb-6 max-w-2xl">
                  Ordinal Strategy is a framework for research, tracking, and optimization across Bitcoin Ordinals, built for collectors, creators, and strategists.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/strategy" className="bg-[#f7931a] text-[#0b0c10] px-7 py-3 rounded-full font-bold hover:bg-white hover:text-black hover:scale-105 transition-all shadow-lg">
                    Explore Strategy
                  </Link>
                  <a href="#about" className="bg-transparent border-2 border-[#f7931a] text-[#f7931a] px-7 py-3 rounded-full font-bold hover:bg-[#f7931a] hover:text-[#0b0c10] transition-all">
                    Learn More
                  </a>
                </div>
              </div>
            </section>

            {/* About Section */}
            <section id="about" className="min-h-screen flex flex-col justify-center items-center px-[10%] py-24">
              <h3 className="text-4xl text-[#f7931a] mb-6 text-center">Why Ordinal Strategy?</h3>
              <p className="text-center max-w-3xl text-lg">
                We blend research, on-chain tools, and market data to empower collectors and creators. With precise insights and curated analytics, we help decode the Bitcoin Ordinals ecosystem for strategic advantage.
              </p>
            </section>

            {/* Mechanics Section */}
            <section id="mechanics" className="min-h-screen flex flex-col justify-center items-center px-[10%] py-24">
              <h3 className="text-4xl text-[#f7931a] mb-12 text-center">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
                {[
                  { icon: '🔍', title: 'Track', text: 'Monitor Ordinal activity across blocks with precision.' },
                  { icon: '⚙️', title: 'Analyze', text: 'Study rarity, metadata, and market behavior in real time.' },
                  { icon: '🧾', title: 'Curate', text: 'Organize collections and optimize your strategy portfolio.' },
                  { icon: '🔗', title: 'Share', text: 'Collaborate and share your research across the ecosystem.' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#111317] p-8 rounded-2xl text-center hover:bg-[#1d1f25] transition-colors">
                    <h4 className="text-3xl mb-3">{item.icon} {item.title}</h4>
                    <p className="text-gray-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Community Section */}
            <section id="community" className="min-h-screen flex flex-col justify-center items-center px-[10%] py-24">
              <h3 className="text-4xl text-[#f7931a] mb-6 text-center">Join the Movement</h3>
              <p className="text-center max-w-3xl mb-8 text-lg">
                Ordinals are the art of precision join us in mastering the strategy.
              </p>
              <button
                onClick={handleCountMeIn}
                className="bg-[#f7931a] text-[#0b0c10] px-8 py-3 rounded-full font-bold hover:bg-white hover:text-black hover:scale-105 transition-all shadow-lg"
              >
                count me in
              </button>
            </section>

            {/* Footer */}
            <footer className="bg-[#090a0d] text-center py-8 text-gray-500 text-sm">
              © 2025 OrdinalStrategy.fun — Built with precision on Bitcoin.
            </footer>
          </div>
        </>
      )}
    </div>
  );
}
