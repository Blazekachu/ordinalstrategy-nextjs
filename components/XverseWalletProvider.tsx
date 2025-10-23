'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { request, AddressPurpose } from 'sats-connect';

interface AddressInfo {
  address: string;
  balance: number | null;
}

interface WalletState {
  connected: boolean;
  address: string | null;
  ordinalsAddress: string | null;
  sparkAddress: string | null;
  balance: number | null;
  nativeSegwit: AddressInfo | null;
  nestedSegwit: AddressInfo | null;
  taproot: AddressInfo | null;
  spark: AddressInfo | null;
  loading: boolean;
}

interface XverseWalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
}

const XverseWalletContext = createContext<XverseWalletContextType | undefined>(undefined);

export function XverseWalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    address: null,
    ordinalsAddress: null,
    sparkAddress: null,
    balance: null,
    nativeSegwit: null,
    nestedSegwit: null,
    taproot: null,
    spark: null,
    loading: true, // Start as loading to check localStorage
  });

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAddress = localStorage.getItem('xverse_address');
    const savedOrdinalsAddress = localStorage.getItem('xverse_ordinals_address');
    const savedSparkAddress = localStorage.getItem('xverse_spark_address');
    
    if (savedAddress && savedOrdinalsAddress) {
      const initBalance = async () => {
        const balance = await fetchBalance(savedAddress);
        const sparkBalance = savedSparkAddress ? await fetchBalance(savedSparkAddress, true) : null;
        setWalletState(prev => ({
          ...prev,
          connected: true,
          address: savedAddress,
          ordinalsAddress: savedOrdinalsAddress,
          sparkAddress: savedSparkAddress,
          balance,
          nativeSegwit: { address: savedAddress, balance },
          taproot: { address: savedOrdinalsAddress, balance: null },
          spark: savedSparkAddress ? { address: savedSparkAddress, balance: sparkBalance } : null,
          loading: false,
        }));
      };
      initBalance();
    } else {
      // No saved wallet, set loading to false
      setWalletState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchBalance = async (address: string, isSpark = false): Promise<number | null> => {
    try {
      if (isSpark) {
        // Fetch Spark balance from dedicated API
        const response = await fetch(`/api/spark/balance?address=${address}`);
        const data = await response.json();
        if (data.error) {
          console.error('Error fetching Spark balance:', data.error);
          return null;
        }
        // Spark API returns balance in btkn (satoshis)
        const balanceInBTC = (data.balance || 0) / 100000000;
        return balanceInBTC;
      } else {
        // Fetch Bitcoin balance from mempool.space API
        const response = await fetch(`https://mempool.space/api/address/${address}`);
        const data = await response.json();
        const balanceInSats = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
        const balanceInBTC = balanceInSats / 100000000;
        return balanceInBTC;
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  };

  const refreshBalances = async () => {
    if (walletState.nativeSegwit?.address) {
      const balance = await fetchBalance(walletState.nativeSegwit.address);
      setWalletState(prev => ({
        ...prev,
        nativeSegwit: prev.nativeSegwit ? { ...prev.nativeSegwit, balance } : null,
      }));
    }
    if (walletState.nestedSegwit?.address) {
      const balance = await fetchBalance(walletState.nestedSegwit.address);
      setWalletState(prev => ({
        ...prev,
        nestedSegwit: prev.nestedSegwit ? { ...prev.nestedSegwit, balance } : null,
      }));
    }
    if (walletState.taproot?.address) {
      const balance = await fetchBalance(walletState.taproot.address);
      setWalletState(prev => ({
        ...prev,
        taproot: prev.taproot ? { ...prev.taproot, balance } : null,
      }));
    }
    if (walletState.spark?.address) {
      const balance = await fetchBalance(walletState.spark.address, true); // true = isSpark
      setWalletState(prev => ({
        ...prev,
        spark: prev.spark ? { ...prev.spark, balance } : null,
      }));
    }
  };

  const connect = async () => {
    setWalletState(prev => ({ ...prev, loading: true }));
    
    try {
      // Detect if user is on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Check if we're in Xverse browser
        if (typeof window !== 'undefined' && !(window as any).BitcoinProvider) {
          // Not in Xverse browser - show instructions
          const siteUrl = window.location.origin;
          
          // Create a nicer modal-style message
          const userConfirmed = confirm(
            '📱 Connect on Mobile:\n\n' +
            '1. Open your Xverse Wallet app\n' +
            '2. Tap "Browser" (🌐) at the bottom\n' +
            '3. Visit this site in Xverse browser\n' +
            '4. Then tap "Join" to connect\n\n' +
            '✨ Site URL copied to clipboard!\n\n' +
            'Tap OK to continue'
          );
          
          // Copy URL to clipboard
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(siteUrl).catch(() => {
              console.log('Could not copy URL');
            });
          }
          
          // Show additional help
          if (userConfirmed) {
            setTimeout(() => {
              const needsHelp = confirm(
                'Need to install Xverse?\n\n' +
                'Tap OK to open the app store'
              );
              
              if (needsHelp) {
                const installUrl = /iPhone|iPad|iPod/i.test(navigator.userAgent)
                  ? 'https://apps.apple.com/app/xverse-wallet/id1552205925'
                  : 'https://play.google.com/store/apps/details?id=com.secretkeylabs.xverse';
                window.open(installUrl, '_blank');
              }
            }, 500);
          }
          
          setWalletState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        // We're in Xverse browser - sats-connect should work
      }
      
      // Desktop: Use browser extension
      // Request Bitcoin addresses (Payment and Ordinals)
      const response = await request('getAccounts', {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
        message: 'Connect to Ordinal Strategy',
      });

      if (response.status === 'success') {
        const ordinalsAccount = response.result.find(
          (account: any) => account.purpose === AddressPurpose.Ordinals
        );
        const paymentAccount = response.result.find(
          (account: any) => account.purpose === AddressPurpose.Payment
        );

        const ordinalsAddress = ordinalsAccount?.address || null;
        const paymentAddress = paymentAccount?.address || null;
        
        // Request Spark address separately using dedicated Spark method
        // Spark is a Bitcoin L2 protocol, separate from Stacks
        // Documentation: https://docs.xverse.app/sats-connect/spark-methods/spark_getaddress
        let sparkAddress = null;
        try {
          const sparkResponse = await request('spark_getAddress', {});
          if (sparkResponse.status === 'success' && sparkResponse.result && sparkResponse.result.length > 0) {
            sparkAddress = sparkResponse.result[0].address;
            console.log('Spark address connected:', sparkAddress);
          }
        } catch (sparkError) {
          console.log('Spark not available or user declined:', sparkError);
          // Spark is optional - continue without it
        }

        // Save to localStorage
        if (paymentAddress) localStorage.setItem('xverse_address', paymentAddress);
        if (ordinalsAddress) localStorage.setItem('xverse_ordinals_address', ordinalsAddress);
        if (sparkAddress) localStorage.setItem('xverse_spark_address', sparkAddress);

        // Fetch balances for all addresses
        const paymentBalance = paymentAddress ? await fetchBalance(paymentAddress) : null;
        const ordinalsBalance = ordinalsAddress ? await fetchBalance(ordinalsAddress) : null;
        const sparkBalance = sparkAddress ? await fetchBalance(sparkAddress, true) : null;

        setWalletState({
          connected: true,
          address: paymentAddress,
          ordinalsAddress: ordinalsAddress,
          sparkAddress: sparkAddress,
          balance: paymentBalance,
          nativeSegwit: paymentAddress ? { address: paymentAddress, balance: paymentBalance } : null,
          nestedSegwit: null, // Xverse primarily uses native segwit
          taproot: ordinalsAddress ? { address: ordinalsAddress, balance: ordinalsBalance } : null,
          spark: sparkAddress ? { address: sparkAddress, balance: sparkBalance } : null,
          loading: false,
        });
      } else {
        setWalletState(prev => ({ ...prev, loading: false }));
        console.error('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting to Xverse:', error);
      setWalletState(prev => ({ ...prev, loading: false }));
    }
  };

  const disconnect = () => {
    localStorage.removeItem('xverse_address');
    localStorage.removeItem('xverse_ordinals_address');
    localStorage.removeItem('xverse_spark_address');
    setWalletState({
      connected: false,
      address: null,
      ordinalsAddress: null,
      sparkAddress: null,
      balance: null,
      nativeSegwit: null,
      nestedSegwit: null,
      taproot: null,
      spark: null,
      loading: false,
    });
  };

  return (
    <XverseWalletContext.Provider value={{ ...walletState, connect, disconnect, refreshBalances }}>
      {children}
    </XverseWalletContext.Provider>
  );
}

export function useXverseWallet() {
  const context = useContext(XverseWalletContext);
  if (!context) {
    throw new Error('useXverseWallet must be used within XverseWalletProvider');
  }
  return context;
}

