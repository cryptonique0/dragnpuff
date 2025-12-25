// React Hook for Wallet Connection

import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';

export function useWallet() {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const BASE_CHAIN_ID = 8453;

  // Connect wallet
  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask not installed');
      return;
    }

    try {
      setIsLoading(true);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const chainId = (await provider.getNetwork()).chainId;

      setAddress(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setChainId(chainId);
      setIsConnected(true);

      // Get balance
      const bal = await provider.getBalance(accounts[0]);
      setBalance(ethers.formatEther(bal));

      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error connecting wallet:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance('0');
    setIsConnected(false);
  }, []);

  // Switch to Base network
  const switchToBase = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not installed');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + BASE_CHAIN_ID.toString(16) }],
      });
    } catch (err) {
      // Chain not added, add it
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x' + BASE_CHAIN_ID.toString(16),
                chainName: 'Base',
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addErr) {
          setError('Failed to add Base network');
        }
      }
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(parseInt(chainId, 16));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  const isOnBase = chainId === BASE_CHAIN_ID;

  return {
    address,
    provider,
    signer,
    chainId,
    balance,
    isConnected,
    isOnBase,
    error,
    isLoading,
    connect,
    disconnect,
    switchToBase,
  };
}
