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
    <div className="w-full h-screen bg-black">
      <iframe
        src="/foxjump/index.html"
        className="w-full h-full border-none"
        title="FoxJump Game"
      />
    </div>
  );
}

