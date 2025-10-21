'use client';

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export default function FoxJumpGame() {
  const { user, authenticated } = usePrivy();

  useEffect(() => {
    // Listen for game score messages from iframe
    const handleMessage = async (event: MessageEvent) => {
      // Verify the message is from our game
      if (event.data.type === 'GAME_SCORE') {
        const { score, level, coins, playTime } = event.data;
        
        if (authenticated && user?.id) {
          try {
            // Submit score to API
            const response = await fetch('/api/scores', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                privyId: user.id,
                gameName: 'foxjump',
                score,
                level,
                coinsCollected: coins,
                playTime,
              }),
            });

            if (response.ok) {
              console.log('Score submitted successfully!');
            }
          } catch (error) {
            console.error('Error submitting score:', error);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [authenticated, user]);

  return (
    <div className="w-full h-screen bg-[#0b0c10] flex items-center justify-center relative overflow-hidden">
      {/* Left Panel - Controls */}
      <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-[#0b0c10] to-transparent z-10 p-6">
        <div className="bg-[#14161c]/90 backdrop-blur-lg border border-[#f7931a]/30 rounded-2xl p-6 h-full overflow-y-auto shadow-[0_0_30px_rgba(247,147,26,0.2)]">
          <h3 className="text-[#f7931a] text-xl font-bold mb-6 text-center border-b border-[#f7931a]/30 pb-3">
            🎮 Controls
          </h3>
          
          <div className="space-y-4">
            <div className="bg-black/40 rounded-lg p-4 border border-[#f7931a]/20 hover:border-[#f7931a]/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-[#f7931a] text-[#0b0c10] px-3 py-1 rounded font-bold text-sm">←</div>
                <div className="bg-[#f7931a] text-[#0b0c10] px-3 py-1 rounded font-bold text-sm">→</div>
              </div>
              <p className="text-gray-300 text-sm">Move left/right</p>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-[#f7931a]/20 hover:border-[#f7931a]/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-[#f7931a] text-[#0b0c10] px-3 py-1 rounded font-bold text-sm">SPACE</div>
              </div>
              <p className="text-gray-300 text-sm">Jump higher</p>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-[#f7931a]/20 hover:border-[#f7931a]/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-[#f7931a] text-[#0b0c10] px-3 py-1 rounded font-bold text-sm">ESC</div>
              </div>
              <p className="text-gray-300 text-sm">Pause game</p>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-[#f7931a]/20 hover:border-[#f7931a]/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-[#f7931a] text-[#0b0c10] px-3 py-1 rounded font-bold text-sm">M</div>
              </div>
              <p className="text-gray-300 text-sm">Toggle music</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#f7931a]/30">
            <p className="text-gray-400 text-xs text-center leading-relaxed">
              💡 Pro tip: Use arrow keys for precise movement and space bar for boost jumps!
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Collectibles */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-[#0b0c10] to-transparent z-10 p-6">
        <div className="bg-[#14161c]/90 backdrop-blur-lg border border-[#f7931a]/30 rounded-2xl p-6 h-full overflow-y-auto shadow-[0_0_30px_rgba(247,147,26,0.2)]">
          <h3 className="text-[#f7931a] text-xl font-bold mb-6 text-center border-b border-[#f7931a]/30 pb-3">
            🎁 Collectibles
          </h3>
          
          <div className="space-y-4">
            <div className="bg-black/40 rounded-lg p-4 border border-[#ffd166]/30 hover:border-[#ffd166]/60 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">🪙</div>
                <div className="text-[#ffd166] font-bold text-lg">Bitcoin</div>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                <span className="text-[#ffd166] font-semibold">+10 points</span> each
              </p>
              <p className="text-gray-400 text-xs">
                Collect Bitcoin coins to increase your score!
              </p>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-[#f7931a]/30 hover:border-[#f7931a]/60 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">🎨</div>
                <div className="text-[#f7931a] font-bold text-lg">Ordinals</div>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                <span className="text-[#f7931a] font-semibold">+50 points</span> bonus
              </p>
              <p className="text-gray-400 text-xs">
                Rare ordinal inscriptions give massive point boosts!
              </p>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-green-500/30 hover:border-green-500/60 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">🚀</div>
                <div className="text-green-400 font-bold text-lg">Boost</div>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                <span className="text-green-400 font-semibold">Super jump</span> power-up
              </p>
              <p className="text-gray-400 text-xs">
                Launch yourself to new heights!
              </p>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-blue-500/30 hover:border-blue-500/60 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">🏃</div>
                <div className="text-blue-400 font-bold text-lg">Platform</div>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                <span className="text-blue-400 font-semibold">Bounce higher</span>
              </p>
              <p className="text-gray-400 text-xs">
                Land on platforms to bounce and climb!
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#f7931a]/30">
            <p className="text-gray-400 text-xs text-center leading-relaxed">
              🎯 Goal: Jump as high as you can and collect everything!
            </p>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="w-full max-w-[1200px] h-screen flex items-center justify-center px-0 lg:px-72">
        <div className="relative w-full h-full lg:max-h-[900px] bg-black rounded-none lg:rounded-2xl overflow-hidden shadow-2xl border-0 lg:border-2 lg:border-[#f7931a]/50">
          <iframe
            src="/foxjump/index.html"
            className="w-full h-full border-none"
            title="FoxJump Game"
            allow="accelerometer; gyroscope"
          />
          
          {/* Mobile Touch Instructions Overlay - appears briefly on mobile */}
          <div className="lg:hidden absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-20">
            <div className="bg-black/80 backdrop-blur-md border border-[#f7931a]/50 rounded-full px-4 py-2 text-xs text-[#f7931a] animate-pulse">
              Tap screen to control • Swipe left/right to move
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

