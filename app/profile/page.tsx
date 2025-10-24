'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useXverseWallet } from '@/components/XverseWalletProvider';
import ScrollButton from '@/components/ScrollButton';

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
  username?: string;
  profilePic?: string;
  twitterHandle?: string;
  walletAddress?: string;
  nativeSegwitAddress?: string;
  taprootAddress?: string;
  sparkAddress?: string;
  totalScore: number;
  gamesPlayed: number;
  highScore: number;
  inscriptionCount: number;
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
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'games' | 'leaderboard' | 'inscriptions'>('profile');
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [totalInscriptionCount, setTotalInscriptionCount] = useState<number>(0);
  const [loadingInscriptions, setLoadingInscriptions] = useState(false);
  const [inscriptionViewMode, setInscriptionViewMode] = useState<'grid-large' | 'grid-small' | 'list'>('grid-large');
  const [inscriptionSortOrder, setInscriptionSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardSort, setLeaderboardSort] = useState<'highScore' | 'gamesPlayed' | 'avgScore'>('highScore');
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editProfilePic, setEditProfilePic] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
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
    console.log('Tab changed to:', activeTab);
    console.log('ordinalsAddress:', ordinalsAddress);
    console.log('taproot?.address:', taproot?.address);
    console.log('Are they equal?', ordinalsAddress === taproot?.address);
    
    if (activeTab === 'inscriptions' && (taproot?.address || ordinalsAddress)) {
      console.log('Triggering fetchInscriptions...');
      fetchInscriptions();
    }
    
    // Refresh user data and scores when switching to games tab
    if (activeTab === 'games' && connected && address) {
      fetchUserData();
      fetchUserScores();
    }
    
    // Refresh user data when switching to profile tab
    if (activeTab === 'profile' && connected && address) {
      fetchUserData();
    }
  }, [activeTab, ordinalsAddress, taproot, connected, address]);

  // Re-fetch inscriptions when sort order changes
  useEffect(() => {
    if (activeTab === 'inscriptions' && (taproot?.address || ordinalsAddress) && inscriptions.length > 0) {
      fetchInscriptions();
    }
  }, [inscriptionSortOrder]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboardData(leaderboardSort);
    }
  }, [activeTab, leaderboardSort]);

  useEffect(() => {
    // Auto-refresh data when page becomes visible (user returns from game)
    const handleVisibilityChange = () => {
      if (!document.hidden && connected && address) {
        console.log('Page visible - refreshing profile data');
        fetchUserData();
        fetchUserScores();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [connected, address]);


  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user/profile?walletAddress=${address}`);
      if (response.ok) {
      const data = await response.json();
      setUserData(data.user);
        setEditUsername(data.user?.username || '');
        setEditProfilePic(data.user?.profilePic || '');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserScores = async () => {
    try {
      const response = await fetch(`/api/scores?walletAddress=${address}&type=user&limit=20`);
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

  const fetchLeaderboardData = async (sortBy: 'highScore' | 'gamesPlayed' | 'avgScore' = 'highScore') => {
    setLoadingLeaderboard(true);
    try {
      const response = await fetch(`/api/leaderboard?sortBy=${sortBy}&limit=100`);
      const data = await response.json();
      setLeaderboardData(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileSaveMessage(null);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          username: editUsername,
          profilePic: editProfilePic,
          nativeSegwitAddress: nativeSegwit?.address,
          taprootAddress: taproot?.address,
          sparkAddress: spark?.address,
          inscriptionCount: totalInscriptionCount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setProfileSaveMessage({ type: 'success', text: '✓ Profile updated successfully!' });
        setTimeout(() => {
          setShowEditProfile(false);
          setProfileSaveMessage(null);
        }, 1500);
      } else {
        const errorData = await response.json();
        setProfileSaveMessage({ 
          type: 'error', 
          text: errorData.error || 'Failed to save profile. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setProfileSaveMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchInscriptions = async () => {
    // Use taproot address for inscriptions (inscriptions only exist on Taproot)
    const taprootAddr = taproot?.address || ordinalsAddress;
    
    if (!taprootAddr) {
      console.log('No taproot address available for fetching inscriptions');
      return;
    }
    
    console.log('🚀 MULTI-API STRATEGY: Fetching from ALL sources for:', taprootAddr);
    setLoadingInscriptions(true);
    try {
      // NEW APPROACH: Fetch from MULTIPLE APIs simultaneously and merge results
      // This ensures we get ALL inscriptions even if one API is incomplete
      
      const allInscriptionsMap = new Map(); // Use Map for instant deduplication
      let highestTotal = 0;
      
      // ============================================
      // API 1: Ordiscan (with AGGRESSIVE pagination)
      // ============================================
      const fetchOrdiscan = async () => {
        try {
          console.log('📡 [Ordiscan] Starting COMPLETE fetch...');
          let offset = 0;
          const limit = 100; // Use smaller batches for reliability
          let count = 0;
          let reportedTotal = 0;
          
          // First request to get total count
          const firstResponse = await fetch(
            `https://api.ordiscan.com/v1/address/${taprootAddr}/inscriptions?limit=${limit}&offset=0`,
            {
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ***REMOVED***`,
              }
            }
          );
          
          if (!firstResponse.ok) {
            console.warn('⚠️ [Ordiscan] Initial request failed');
            return;
          }
          
          const firstData = await firstResponse.json();
          reportedTotal = firstData.total || 0;
          highestTotal = Math.max(highestTotal, reportedTotal);
          console.log('📊 [Ordiscan] Total inscriptions reported:', reportedTotal);
          
          // Process first batch
          const firstBatch = firstData.data || [];
          firstBatch.forEach((insc: any) => {
            if (insc.inscription_id && !allInscriptionsMap.has(insc.inscription_id)) {
              allInscriptionsMap.set(insc.inscription_id, {
                id: insc.inscription_id,
                number: insc.inscription_number,
                address: insc.address,
                content_type: insc.content_type,
                content_length: insc.content_length,
                timestamp: new Date(insc.timestamp).getTime(),
                tx_id: insc.genesis_transaction,
                content: `https://ordinals.com/content/${insc.inscription_id}`,
              });
              count++;
            }
          });
          
          // Continue fetching until we reach the reported total
          // AGGRESSIVE: Keep going even BEYOND reported total to catch any stragglers
          offset = limit;
          let consecutiveEmptyBatches = 0;
          const maxOffset = Math.max(reportedTotal + 500, 5000); // At least 5000 or total+500
          
          while (offset < maxOffset) {
            const response = await fetch(
              `https://api.ordiscan.com/v1/address/${taprootAddr}/inscriptions?limit=${limit}&offset=${offset}`,
              {
                headers: {
                  'Accept': 'application/json',
                  'Authorization': `Bearer ***REMOVED***`,
                }
              }
            );
            
            if (!response.ok) {
              console.warn(`⚠️ [Ordiscan] Failed at offset ${offset} (status ${response.status}), continuing...`);
              offset += limit;
              continue;
            }
            
            const data = await response.json();
            const batch = data.data || [];
            
            // Track empty batches
            if (batch.length === 0) {
              consecutiveEmptyBatches++;
              console.log(`⚠️ [Ordiscan] Empty batch #${consecutiveEmptyBatches} at offset ${offset} (count: ${count}/${reportedTotal})`);
              
              // Only stop after 5 consecutive empty batches AND we have at least the reported total
              if (consecutiveEmptyBatches >= 5 && count >= reportedTotal) {
                console.log(`✅ [Ordiscan] Stopping: 5 empty batches and have ${count} inscriptions`);
                break;
              }
              
              offset += limit;
              continue;
            }
            
            // Reset empty batch counter on successful batch
            consecutiveEmptyBatches = 0;
            
            // Process batch
            let addedThisBatch = 0;
            batch.forEach((insc: any) => {
              if (insc.inscription_id && !allInscriptionsMap.has(insc.inscription_id)) {
                allInscriptionsMap.set(insc.inscription_id, {
                  id: insc.inscription_id,
                  number: insc.inscription_number,
                  address: insc.address,
                  content_type: insc.content_type,
                  content_length: insc.content_length,
                  timestamp: new Date(insc.timestamp).getTime(),
                  tx_id: insc.genesis_transaction,
                  content: `https://ordinals.com/content/${insc.inscription_id}`,
                });
                count++;
                addedThisBatch++;
              }
            });
            
            console.log(`📦 [Ordiscan] Offset ${offset}: fetched ${batch.length}, added ${addedThisBatch} new (total: ${count}/${reportedTotal})`);
            
            offset += limit;
            
            // Progress log every 200 inscriptions
            if (count % 200 === 0) {
              console.log(`📡 [Ordiscan] Progress: ${count}/${reportedTotal} inscriptions`);
            }
          }
          
          console.log(`✅ [Ordiscan] Added ${count} unique inscriptions (target was ${reportedTotal})`);
          if (count < reportedTotal) {
            console.warn(`⚠️ [Ordiscan] Missing ${reportedTotal - count} inscriptions!`);
          }
        } catch (error) {
          console.warn('⚠️ [Ordiscan] Failed:', error);
        }
      };
      
      // ============================================
      // API 2: Hiro (single request, no pagination)
      // ============================================
      const fetchHiro = async () => {
        try {
          console.log('📡 [Hiro] Starting fetch...');
          const response = await fetch(
            `https://api.hiro.so/ordinals/v1/inscriptions?address=${taprootAddr}&limit=60`,
            {
              headers: {
                'Accept': 'application/json',
                'x-api-key': '***REMOVED***',
              }
            }
          );
          
          if (!response.ok) {
            console.warn('⚠️ [Hiro] Failed with status:', response.status);
            return;
          }
          
          const data = await response.json();
          if (data.total) {
            highestTotal = Math.max(highestTotal, data.total);
            console.log('📊 [Hiro] Total reported:', data.total);
          }
          
          let count = 0;
          const inscriptions = data.results || [];
          inscriptions.forEach((insc: any) => {
            if (insc.id && !allInscriptionsMap.has(insc.id)) {
              allInscriptionsMap.set(insc.id, {
                id: insc.id,
                number: insc.number,
                address: insc.address,
                content_type: insc.content_type,
                content_length: insc.content_length,
                timestamp: insc.timestamp,
                tx_id: insc.genesis_tx_id,
                content: `https://ordinals.com/content/${insc.id}`,
              });
              count++;
            }
          });
          
          console.log(`✅ [Hiro] Added ${count} unique inscriptions`);
        } catch (error) {
          console.warn('⚠️ [Hiro] Failed:', error);
        }
      };
      
      // ============================================
      // API 3: Unisat (with AGGRESSIVE pagination)
      // ============================================
      const fetchUnisat = async () => {
        try {
          console.log('📡 [Unisat] Starting COMPLETE fetch...');
          let cursor = 0;
          const size = 100; // Use smaller batches for reliability
          let count = 0;
          let reportedTotal = 0;
          
          // First request to get total
          const firstResponse = await fetch(
            `https://open-api.unisat.io/v1/indexer/address/${taprootAddr}/inscription-data?cursor=0&size=${size}`,
            {
              headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ***REMOVED***',
              }
            }
          );
          
          if (!firstResponse.ok) {
            console.warn('⚠️ [Unisat] Initial request failed');
            return;
          }
          
          const firstData = await firstResponse.json();
          reportedTotal = firstData.data?.total || 0;
          highestTotal = Math.max(highestTotal, reportedTotal);
          console.log('📊 [Unisat] Total inscriptions reported:', reportedTotal);
          
          // Process first batch
          const firstBatch = firstData.data?.inscription || [];
          firstBatch.forEach((insc: any) => {
            if (insc.inscriptionId && !allInscriptionsMap.has(insc.inscriptionId)) {
              allInscriptionsMap.set(insc.inscriptionId, {
                id: insc.inscriptionId,
                number: insc.inscriptionNumber,
                address: insc.address,
                content_type: insc.contentType,
                content_length: insc.contentLength,
                timestamp: insc.timestamp,
                tx_id: insc.genesisTransaction,
                content: `https://ordinals.com/content/${insc.inscriptionId}`,
              });
              count++;
            }
          });
          
          // Continue fetching until we reach the reported total
          cursor = size;
          while (cursor < reportedTotal && cursor < 50000) { // Safety limit at 50k
            const response = await fetch(
              `https://open-api.unisat.io/v1/indexer/address/${taprootAddr}/inscription-data?cursor=${cursor}&size=${size}`,
              {
                headers: {
                  'Accept': 'application/json',
                  'Authorization': 'Bearer ***REMOVED***',
                }
              }
            );
            
            if (!response.ok) {
              console.warn(`⚠️ [Unisat] Failed at cursor ${cursor}, continuing...`);
              cursor += size;
              continue;
            }
            
            const data = await response.json();
            const batch = data.data?.inscription || [];
            
            if (batch.length === 0 && cursor < reportedTotal - size) {
              console.log(`⚠️ [Unisat] Empty batch at cursor ${cursor}, but total is ${reportedTotal}. Continuing...`);
              cursor += size;
              continue;
            }
            
            if (batch.length === 0) {
              console.log(`✅ [Unisat] Reached end at cursor ${cursor}`);
              break;
            }
            
            batch.forEach((insc: any) => {
              if (insc.inscriptionId && !allInscriptionsMap.has(insc.inscriptionId)) {
                allInscriptionsMap.set(insc.inscriptionId, {
                  id: insc.inscriptionId,
                  number: insc.inscriptionNumber,
                  address: insc.address,
                  content_type: insc.contentType,
                  content_length: insc.contentLength,
                  timestamp: insc.timestamp,
                  tx_id: insc.genesisTransaction,
                  content: `https://ordinals.com/content/${insc.inscriptionId}`,
                });
                count++;
              }
            });
            
            cursor += size;
            
            if (count % 500 === 0) {
              console.log(`📡 [Unisat] Progress: ${count}/${reportedTotal} inscriptions`);
            }
          }
          
          console.log(`✅ [Unisat] Added ${count} unique inscriptions (target was ${reportedTotal})`);
          if (count < reportedTotal) {
            console.warn(`⚠️ [Unisat] Missing ${reportedTotal - count} inscriptions!`);
          }
        } catch (error) {
          console.warn('⚠️ [Unisat] Failed:', error);
        }
      };
      
      // ============================================
      // API 4: OKX (as backup)
      // ============================================
      const fetchOKX = async () => {
        try {
          console.log('📡 [OKX] Starting fetch...');
          let page = 1;
          const limit = 100;
          let hasMore = true;
          let count = 0;
          
          while (hasMore && page <= 50) { // Up to 50 pages (5000 inscriptions)
            const response = await fetch(
              `https://www.okx.com/api/v5/explorer/inscription/inscription-list-by-address?address=${taprootAddr}&limit=${limit}&page=${page}`,
              {
                headers: {
                  'Accept': 'application/json',
                  'Ok-Access-Key': '***REMOVED***',
                }
              }
            );
            
            if (!response.ok) {
              console.warn(`⚠️ [OKX] Failed at page ${page}`);
              break;
            }
            
            const data = await response.json();
            if (page === 1 && data.data?.total) {
              const okxTotal = parseInt(data.data.total);
              highestTotal = Math.max(highestTotal, okxTotal);
              console.log('📊 [OKX] Total reported:', okxTotal);
            }
            
            const batch = data.data?.inscriptionsList || [];
            if (batch.length === 0) break;
            
            batch.forEach((insc: any) => {
              const inscId = insc.inscriptionId || insc.inscription_id;
              if (inscId && !allInscriptionsMap.has(inscId)) {
                allInscriptionsMap.set(inscId, {
                  id: inscId,
                  number: insc.inscriptionNumber || insc.inscription_number,
                  address: insc.ownerAddress || insc.address,
                  content_type: insc.contentType || insc.content_type,
                  content_length: insc.contentSize || insc.content_length,
                  timestamp: insc.blockTime || insc.timestamp,
                  tx_id: insc.genesisTx || insc.tx_id,
                  content: `https://ordinals.com/content/${inscId}`,
                });
                count++;
              }
            });
            
            page++;
            if (batch.length < limit) hasMore = false;
          }
          
          console.log(`✅ [OKX] Added ${count} unique inscriptions (fetched ${page-1} pages)`);
        } catch (error) {
          console.warn('⚠️ [OKX] Failed:', error);
        }
      };
      
      // Execute all APIs in parallel
      console.log('🔄 Fetching from ALL 4 APIs simultaneously...');
      await Promise.all([
        fetchOrdiscan(),
        fetchHiro(),
        fetchUnisat(),
        fetchOKX(),
      ]);
      
      // Convert Map to array
      let fetchedInscriptions = Array.from(allInscriptionsMap.values());
      
      // Analyze what we got
      const cursedInscriptions = fetchedInscriptions.filter(i => i.number < 0);
      const normalInscriptions = fetchedInscriptions.filter(i => i.number >= 0);
      
      // Find the range of inscription numbers
      const allNumbers = fetchedInscriptions.map(i => i.number).filter(n => n != null);
      const highestNumber = allNumbers.length > 0 ? Math.max(...allNumbers) : 0;
      const lowestNumber = allNumbers.length > 0 ? Math.min(...allNumbers) : 0;
      
      console.log('🎉 FINAL RESULTS:');
      console.log(`   - Total unique inscriptions: ${fetchedInscriptions.length}`);
      console.log(`   - Normal inscriptions: ${normalInscriptions.length} (range: 0 to #${highestNumber})`);
      console.log(`   - Cursed inscriptions: ${cursedInscriptions.length} (range: #${lowestNumber} to #-1)`);
      console.log(`   - Highest reported total: ${highestTotal}`);
      console.log(`   - Potential missing: ${Math.max(0, highestTotal - fetchedInscriptions.length)}`);
      
      const finalTotal = Math.max(highestTotal, fetchedInscriptions.length);
      
      // CRITICAL: Explicitly sort by inscription number
      // Don't rely on API order - merge from multiple sources means mixed order
      fetchedInscriptions.sort((a, b) => {
        // Handle null/undefined numbers
        const numA = a.number ?? -Infinity;
        const numB = b.number ?? -Infinity;
        
        if (inscriptionSortOrder === 'oldest') {
          // Oldest first: lowest number first (but keep cursed inscriptions at the end)
          return numA - numB;
        } else {
          // Latest first: highest number first (default)
          return numB - numA;
        }
      });
      
      console.log('✅ Sorted inscriptions:', inscriptionSortOrder);
      if (fetchedInscriptions.length > 0) {
        console.log(`   - First inscription #: ${fetchedInscriptions[0].number}`);
        console.log(`   - Last inscription #: ${fetchedInscriptions[fetchedInscriptions.length - 1].number}`);
      }
      
      setInscriptions(fetchedInscriptions);
      setTotalInscriptionCount(finalTotal); // Use the calculated final total
      
      console.log('🎯 Updated state with', fetchedInscriptions.length, 'inscriptions to display');
      console.log('🎯 Total count set to:', finalTotal);
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
      // If API fails, show a helpful message but don't set count to 0
      // Keep existing count from user data if available
      setInscriptions([]);
      // Don't reset count to 0 if we already have a count from somewhere
      if (totalInscriptionCount === 0 && userData?.inscriptionCount) {
        setTotalInscriptionCount(userData.inscriptionCount);
      }
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

  // View mode handler for inscriptions (no pagination needed)
  const handleViewModeChange = (mode: 'grid-large' | 'grid-small' | 'list') => {
    setInscriptionViewMode(mode);
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
          <Link href="/" className="text-[#f7931a] font-medium hover:text-white transition-colors text-sm md:text-base">Home</Link>
          <Link href="/strategy" className="text-[#f7931a] font-medium hover:text-white transition-colors text-sm md:text-base">Strategy</Link>
          <div className="w-48">
            <ScrollButton
              text="Disconnect"
              onComplete={() => { disconnect(); router.push('/'); }}
              backgroundColor="#ef4444"
              textColor="#ffffff"
              accentColor="#ffffff"
            />
          </div>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-[#f7931a] drop-shadow-[0_0_20px_rgba(247,147,26,0.5)]">
                    {userData?.username || (spark?.address && `${spark.address.slice(0, 8)}...${spark.address.slice(-8)}`)}
              </h1>
                  <span className="text-2xl text-[#f7931a]">*</span>
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="bg-[#f7931a]/20 hover:bg-[#f7931a]/40 border border-[#f7931a]/50 px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  >
                    ✏️ Edit
                  </button>
                </div>
                
                {/* Primary Spark Address */}
                {spark?.address && (
                  <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/30">
                    <span className="text-blue-400 font-mono text-xs md:text-sm">
                      {spark.address.slice(0, 12)}...{spark.address.slice(-12)}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(spark.address);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      📋
                    </button>
                    <span className="text-blue-300 text-xs font-semibold px-2 py-0.5 bg-blue-500/20 rounded">Spark L2</span>
                  </div>
                )}
                
                {/* Spark Balance */}
                {spark?.balance !== null && spark?.balance !== undefined && (
                  <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 px-4 py-2 rounded-lg border border-blue-500/30">
                    <span className="text-blue-300 font-bold text-lg md:text-xl">{spark.balance.toFixed(8)} BTC</span>
                    <span className="text-blue-400 text-xs ml-2">on Spark L2</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 text-gray-300">
                <div className="bg-black/40 px-4 py-2 rounded-xl border border-[#f7931a]/20 hover:border-[#f7931a]/50 transition-colors">
                  <span className="text-[#ffd166] font-bold text-xl md:text-2xl block">{userData?.gamesPlayed || 0}</span>
                  <span className="text-xs opacity-80">Games</span>
                </div>
                <div className="bg-black/40 px-4 py-2 rounded-xl border border-[#f7931a]/20 hover:border-[#f7931a]/50 transition-colors">
                  <span className="text-[#ffd166] font-bold text-xl md:text-2xl block">{userData?.totalScore?.toLocaleString() || 0}</span>
                  <span className="text-xs opacity-80">Total Score</span>
                </div>
                <div className="bg-black/40 px-4 py-2 rounded-xl border border-[#f7931a]/20 hover:border-[#f7931a]/50 transition-colors">
                  <span className="text-[#ffd166] font-bold text-xl md:text-2xl block">{userData?.highScore?.toLocaleString() || 0}</span>
                  <span className="text-xs opacity-80">High Score</span>
                </div>
                {nativeSegwit?.balance !== null && nativeSegwit?.balance !== undefined && (
                  <div className="bg-black/40 px-4 py-2 rounded-xl border border-orange-500/20 hover:border-orange-500/50 transition-colors">
                    <span className="text-orange-300 font-bold text-xl md:text-2xl block">{nativeSegwit.balance.toFixed(8)}</span>
                    <span className="text-xs opacity-80">SegWit BTC</span>
                  </div>
                )}
                <div className="bg-black/40 px-4 py-2 rounded-xl border border-[#f7931a]/20 hover:border-[#f7931a]/50 transition-colors">
                  <span className="text-[#ffd166] font-bold text-xl md:text-2xl block">{totalInscriptionCount || userData?.inscriptionCount || 0}</span>
                  <span className="text-xs opacity-80">Inscriptions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative max-w-[500px] w-full bg-[#1b1c1f] border-2 border-[#f7931a]/50 rounded-2xl shadow-2xl p-6">
              <button
                onClick={() => setShowEditProfile(false)}
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-[#f7931a]"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-[#f7931a] mb-6">Edit Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-black/50 border border-[#f7931a]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f7931a]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Profile Picture URL</label>
                  <input
                    type="text"
                    value={editProfilePic}
                    onChange={(e) => setEditProfilePic(e.target.value)}
                    placeholder="https://example.com/your-image.jpg"
                    className="w-full bg-black/50 border border-[#f7931a]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f7931a]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Paste an image URL for your profile picture</p>
                </div>

                {editProfilePic && (
                  <div className="flex justify-center">
                    <img 
                      src={editProfilePic} 
                      alt="Preview" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#f7931a]/50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
              </div>
                )}

                {profileSaveMessage && (
                  <div className={`p-3 rounded-lg text-center font-semibold ${
                    profileSaveMessage.type === 'success' 
                      ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                      : 'bg-red-500/20 border border-red-500/50 text-red-400'
                  }`}>
                    {profileSaveMessage.text}
            </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="flex-1 bg-[#f7931a] text-[#0b0c10] px-6 py-3 rounded-lg font-semibold hover:bg-[#ffd166] transition-all disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEditProfile(false);
                      setProfileSaveMessage(null);
                    }}
                    className="px-6 py-3 border-2 border-[#f7931a]/50 text-[#f7931a] rounded-lg font-semibold hover:bg-[#f7931a]/10 transition-all"
                  >
                    Cancel
                  </button>
          </div>
        </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 md:gap-4 mb-8 border-b border-gray-700 overflow-x-auto">
              {[
                { key: 'profile', label: 'Profile' },
                { key: 'addresses', label: 'Addresses' },
                { key: 'games', label: 'Games' },
                { key: 'leaderboard', label: 'Leaderboard' },
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
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#111317]/90 to-[#1b1c1f]/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl border-2 border-[#f7931a]/20">
                  <h3 className="text-2xl font-bold text-[#f7931a] mb-6">Profile Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <span className="text-gray-400">Username</span>
                      <span className="text-white font-semibold">{userData?.username || 'Not set'}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <span className="text-gray-400">Spark Address</span>
                      <span className="text-blue-300 font-mono text-sm">{spark?.address && `${spark.address.slice(0, 10)}...${spark.address.slice(-10)}`}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <span className="text-gray-400">Games Played</span>
                      <span className="text-[#ffd166] font-bold text-xl">{userData?.gamesPlayed || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <span className="text-gray-400">High Score</span>
                      <span className="text-[#ffd166] font-bold text-xl">{userData?.highScore?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <span className="text-gray-400">Total Score</span>
                      <span className="text-[#ffd166] font-bold text-xl">{userData?.totalScore?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <span className="text-gray-400">Average Score</span>
                      <span className="text-[#ffd166] font-bold text-xl">
                        {userData?.gamesPlayed && userData?.gamesPlayed > 0 
                          ? Math.round(userData.totalScore / userData.gamesPlayed).toLocaleString()
                          : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-400">Inscriptions</span>
                      <span className="text-[#ffd166] font-bold text-xl">{totalInscriptionCount || userData?.inscriptionCount || 0}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="w-full mt-6 bg-[#f7931a] text-[#0b0c10] px-6 py-3 rounded-lg font-semibold hover:bg-[#ffd166] transition-all"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#111317]/90 to-[#1b1c1f]/90 backdrop-blur-sm rounded-2xl border-2 border-[#f7931a]/20 overflow-hidden">
                  <div className="bg-[#1b1c1f] px-6 py-4 border-b border-gray-700 flex flex-wrap items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-[#f7931a]">Global Leaderboard</h3>
                    <div className="flex gap-2">
                      {['highScore', 'gamesPlayed', 'avgScore'].map((sortType) => (
                        <button
                          key={sortType}
                          onClick={() => setLeaderboardSort(sortType as any)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                            leaderboardSort === sortType
                              ? 'bg-[#f7931a] text-[#0b0c10]'
                              : 'bg-black/40 text-gray-400 hover:text-white'
                          }`}
                        >
                          {sortType === 'highScore' ? 'High Score' : sortType === 'gamesPlayed' ? 'Games' : 'Avg Score'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loadingLeaderboard ? (
                    <div className="text-center py-12">
                      <div className="inline-block w-8 h-8 border-4 border-[#f7931a] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#1b1c1f]/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-[#f7931a] font-semibold text-sm">Rank</th>
                            <th className="px-4 py-3 text-left text-[#f7931a] font-semibold text-sm">Player</th>
                            <th className="px-4 py-3 text-center text-[#f7931a] font-semibold text-sm">Games</th>
                            <th className="px-4 py-3 text-center text-[#f7931a] font-semibold text-sm">High Score</th>
                            <th className="px-4 py-3 text-center text-[#f7931a] font-semibold text-sm">Avg Score</th>
                            <th className="px-4 py-3 text-center text-[#f7931a] font-semibold text-sm">Inscriptions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboardData.slice(0, 50).map((player, index) => {
                            const isCurrentUser = player.walletAddress === address;
                            return (
                              <tr 
                                key={player.walletAddress}
                                className={`border-t border-gray-700 hover:bg-[#1b1c1f]/30 transition-colors ${
                                  isCurrentUser ? 'bg-[#f7931a]/10' : ''
                                }`}
                              >
                                <td className="px-4 py-3">
                                  <span className={`font-bold ${index < 3 ? 'text-[#ffd166]' : 'text-gray-400'}`}>
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {isCurrentUser && <span className="text-[#f7931a]">👤</span>}
                                    <span className="text-white font-semibold">{player.displayName}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center text-gray-300">{player.gamesPlayed}</td>
                                <td className="px-4 py-3 text-center text-[#ffd166] font-bold">{player.highScore?.toLocaleString()}</td>
                                <td className="px-4 py-3 text-center text-gray-300">{player.avgScore?.toLocaleString()}</td>
                                <td className="px-4 py-3 text-center text-gray-300">{player.inscriptionCount || 0}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Addresses & Sats Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                {/* Spark (Bitcoin L2) - PRIMARY */}
                {spark && (
                  <div className="group bg-gradient-to-br from-[#111317]/90 to-[#1b1c1f]/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-blue-500/20 hover:border-blue-500/60 hover:shadow-[0_10px_40px_rgba(59,130,246,0.2)] transition-all duration-300">
                    <div className="flex flex-col gap-4">
                      <div className="text-blue-400 text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
                        <span className="text-2xl">⚡</span>
                        Spark L2 (Bitcoin Native)
                      </div>
                      
                      {/* Spark Address */}
                      <div className="flex items-center justify-between gap-4 bg-black/40 p-4 rounded-xl border border-blue-500/20">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400 mb-1">Address</div>
                          <div className="font-mono text-sm text-white truncate">{spark.address}</div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(spark.address);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 rounded-lg hover:bg-blue-500/10"
                        >
                          📋
                        </button>
                      </div>

                      {/* Balance Display */}
                      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-blue-600/5 p-4 rounded-xl border border-blue-500/20">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Total Balance</div>
                          <div className="text-sm text-blue-300">Spark L2</div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-400">
                            {spark.balance !== null ? spark.balance.toFixed(8) : '...'}
                          </div>
                          <div className="text-sm text-gray-400">BTC</div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Fast, near-zero cost Bitcoin transactions on Spark L2 network.
                      </div>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-700/50 my-6"></div>
                <div className="text-center text-gray-500 text-sm mb-4">
                  📊 Read-Only Reference Addresses
                </div>

                {/* Native SegWit - For Balance Reference */}
                {nativeSegwit && (
                  <div className="group bg-gradient-to-br from-[#111317]/50 to-[#1b1c1f]/50 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 opacity-75">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-orange-400 text-sm mb-2 uppercase tracking-wider font-semibold flex items-center gap-2">
                          <span className="text-2xl">🔐</span>
                          Native SegWit (Balance Reference)
                        </div>
                        <div className="text-white/70 font-mono text-xs break-all bg-black/40 p-3 rounded-lg">
                          {nativeSegwit.address}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-300">
                          {nativeSegwit.balance !== null ? nativeSegwit.balance.toFixed(8) : '...'}
                        </div>
                        <div className="text-xs text-gray-400">BTC (L1)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Taproot - For Inscriptions Reference */}
                {taproot && (
                  <div className="group bg-gradient-to-br from-[#111317]/50 to-[#1b1c1f]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#f7931a]/20 hover:border-[#f7931a]/40 transition-all duration-300 opacity-75">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-[#f7931a] text-sm mb-2 uppercase tracking-wider font-semibold flex items-center gap-2">
                          <span className="text-2xl">🎨</span>
                          Taproot / Ordinals (Inscriptions Reference)
                        </div>
                        <div className="text-white/70 font-mono text-xs break-all bg-black/40 p-3 rounded-lg">
                          {taproot.address}
                        </div>
                      </div>
                      <div className="text-right flex gap-6">
                        <div>
                          <div className="text-2xl font-bold text-purple-400">
                            {taproot.balance !== null ? taproot.balance.toFixed(8) : '...'}
                          </div>
                          <div className="text-xs text-gray-400">BTC Balance</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#ffd166]">
                            {totalInscriptionCount || userData?.inscriptionCount || 0}
                          </div>
                          <div className="text-xs text-gray-400">Inscriptions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Refresh Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => refreshBalances()}
                    className="bg-[#f7931a] text-[#0b0c10] px-6 py-3 rounded-lg font-semibold hover:bg-[#ffd166] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    🔄 Refresh All Balances
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

                {/* Recent Games - Last 5 */}
                {scores.length > 0 && (
                  <div className="bg-gradient-to-br from-[#111317]/90 to-[#1b1c1f]/90 backdrop-blur-sm rounded-2xl border-2 border-[#f7931a]/30 overflow-hidden">
                    <div className="bg-[#1b1c1f] px-6 py-4 border-b border-[#f7931a]/30">
                      <h3 className="text-xl font-bold text-[#f7931a] flex items-center gap-2">
                        🎯 Recent Games (Last 5)
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {scores.slice(0, 5).map((score, index) => (
                        <div 
                          key={score._id}
                          className="bg-black/40 rounded-xl p-4 border-2 border-[#f7931a]/20 hover:border-[#f7931a]/50 transition-all"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{index === 0 ? '🔥' : '🎮'}</div>
                              <div>
                                <div className="text-sm text-gray-400">{formatDate(score.createdAt)}</div>
                                <div className="text-2xl font-bold text-[#ffd166]">{score.score.toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="flex gap-4 text-sm">
                              <div className="text-center">
                                <div className="text-gray-400 text-xs">Level</div>
                                <div className="text-white font-bold">{score.level}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-400 text-xs">Coins</div>
                                <div className="text-yellow-400 font-bold">{score.coinsCollected}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-400 text-xs">Time</div>
                                <div className="text-white font-bold">{formatTime(score.playTime)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            )}

                {/* Full Game History Table */}
                <div className="bg-[#111317]/90 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-[#f7931a]/20 shadow-lg">
                  <div className="bg-[#1b1c1f] px-6 py-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-[#f7931a]">All Game History</h3>
                  </div>
                  <div className="overflow-x-auto">
                <table className="w-full">
                      <thead className="bg-[#1b1c1f]/50">
                    <tr>
                      <th className="px-4 md:px-6 py-4 text-left text-[#f7931a] font-semibold text-sm">Date</th>
                      <th className="px-4 md:px-6 py-4 text-left text-[#f7931a] font-semibold text-sm">Score</th>
                      <th className="px-4 md:px-6 py-4 text-left text-[#f7931a] font-semibold text-sm">Level</th>
                      <th className="px-4 md:px-6 py-4 text-left text-[#f7931a] font-semibold text-sm">Coins</th>
                      <th className="px-4 md:px-6 py-4 text-left text-[#f7931a] font-semibold text-sm">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.length > 0 ? (
                      scores.map((score, index) => (
                            <tr 
                              key={score._id} 
                              className={`border-t border-gray-700 hover:bg-[#1b1c1f]/30 transition-colors ${
                                index < 5 ? 'bg-[#f7931a]/5' : ''
                              }`}
                            >
                          <td className="px-4 md:px-6 py-4 text-gray-300 text-sm">{formatDate(score.createdAt)}</td>
                          <td className="px-4 md:px-6 py-4 text-white font-bold">{score.score.toLocaleString()}</td>
                          <td className="px-4 md:px-6 py-4 text-gray-300">{score.level}</td>
                          <td className="px-4 md:px-6 py-4 text-yellow-400">{score.coinsCollected}</td>
                          <td className="px-4 md:px-6 py-4 text-gray-300 text-sm">{formatTime(score.playTime)}</td>
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
              <div className="space-y-6">
                <div className="text-center py-12 bg-[#111317]/90 backdrop-blur-sm rounded-2xl border-2 border-[#f7931a]/20">
                  <div className="text-6xl mb-4">🎨</div>
                  <div className="text-xl text-[#f7931a] mb-2">Inscriptions Tab</div>
                  <div className="text-gray-400">Rebuilding with simplified interface...</div>
                </div>
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

