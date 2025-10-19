'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { request, AddressPurpose } from 'sats-connect';

interface WalletState {
  connected: boolean;
  address: string | null;
  ordinalsAddress: string | null;
  balance: number | null;
  loading: boolean;
}

interface XverseWalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const XverseWalletContext = createContext<XverseWalletContextType | undefined>(undefined);

export function XverseWalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    address: null,
    ordinalsAddress: null,
    balance: null,
    loading: false,
  });

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAddress = localStorage.getItem('xverse_address');
    const savedOrdinalsAddress = localStorage.getItem('xverse_ordinals_address');
    if (savedAddress && savedOrdinalsAddress) {
      setWalletState(prev => ({
        ...prev,
        connected: true,
        address: savedAddress,
        ordinalsAddress: savedOrdinalsAddress,
      }));
      fetchBalance(savedAddress);
    }
  }, []);

  const fetchBalance = async (address: string) => {
    try {
      // Fetch balance from mempool.space API
      const response = await fetch(`https://mempool.space/api/address/${address}`);
      const data = await response.json();
      const balanceInSats = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
      const balanceInBTC = balanceInSats / 100000000;
      setWalletState(prev => ({ ...prev, balance: balanceInBTC }));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const connect = async () => {
    setWalletState(prev => ({ ...prev, loading: true }));
    
    try {
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

        // Save to localStorage
        if (paymentAddress) localStorage.setItem('xverse_address', paymentAddress);
        if (ordinalsAddress) localStorage.setItem('xverse_ordinals_address', ordinalsAddress);

        setWalletState({
          connected: true,
          address: paymentAddress,
          ordinalsAddress: ordinalsAddress,
          balance: null,
          loading: false,
        });

        // Fetch balance
        if (paymentAddress) {
          await fetchBalance(paymentAddress);
        }
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
    setWalletState({
      connected: false,
      address: null,
      ordinalsAddress: null,
      balance: null,
      loading: false,
    });
  };

  return (
    <XverseWalletContext.Provider value={{ ...walletState, connect, disconnect }}>
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

