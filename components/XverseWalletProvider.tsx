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
  balance: number | null;
  nativeSegwit: AddressInfo | null;
  nestedSegwit: AddressInfo | null;
  taproot: AddressInfo | null;
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
    balance: null,
    nativeSegwit: null,
    nestedSegwit: null,
    taproot: null,
    loading: false,
  });

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAddress = localStorage.getItem('xverse_address');
    const savedOrdinalsAddress = localStorage.getItem('xverse_ordinals_address');
    if (savedAddress && savedOrdinalsAddress) {
      const initBalance = async () => {
        const balance = await fetchBalance(savedAddress);
        setWalletState(prev => ({
          ...prev,
          connected: true,
          address: savedAddress,
          ordinalsAddress: savedOrdinalsAddress,
          balance,
          nativeSegwit: { address: savedAddress, balance },
          taproot: { address: savedOrdinalsAddress, balance: null },
        }));
      };
      initBalance();
    }
  }, []);

  const fetchBalance = async (address: string): Promise<number | null> => {
    try {
      // Fetch balance from mempool.space API
      const response = await fetch(`https://mempool.space/api/address/${address}`);
      const data = await response.json();
      const balanceInSats = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
      const balanceInBTC = balanceInSats / 100000000;
      return balanceInBTC;
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

        // Fetch balances for all addresses
        const paymentBalance = paymentAddress ? await fetchBalance(paymentAddress) : null;
        const ordinalsBalance = ordinalsAddress ? await fetchBalance(ordinalsAddress) : null;

        setWalletState({
          connected: true,
          address: paymentAddress,
          ordinalsAddress: ordinalsAddress,
          balance: paymentBalance,
          nativeSegwit: paymentAddress ? { address: paymentAddress, balance: paymentBalance } : null,
          nestedSegwit: null, // Xverse primarily uses native segwit
          taproot: ordinalsAddress ? { address: ordinalsAddress, balance: ordinalsBalance } : null,
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
    setWalletState({
      connected: false,
      address: null,
      ordinalsAddress: null,
      balance: null,
      nativeSegwit: null,
      nestedSegwit: null,
      taproot: null,
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

