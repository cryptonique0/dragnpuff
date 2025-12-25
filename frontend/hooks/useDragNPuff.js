// React Hook for DragNPuff Contract Interaction

import { useState, useEffect, useCallback } from 'react';
import { useContract } from './useContract';

export function useDragNPuff() {
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { contract, provider, signer } = useContract('DragNPuff');

  // Get NFT balance of address
  const getBalance = useCallback(async (address) => {
    if (!contract) return;
    try {
      setIsLoading(true);
      const bal = await contract.balanceOf(address);
      setBalance(bal.toString());
      return bal;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching balance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Get token URI metadata
  const getTokenURI = useCallback(async (tokenId) => {
    if (!contract) return null;
    try {
      const uri = await contract.tokenURI(tokenId);
      return uri;
    } catch (err) {
      console.error('Error fetching token URI:', err);
      setError(err.message);
    }
  }, [contract]);

  // Mint new NFT (requires fee)
  const mint = useCallback(async (to, fee) => {
    if (!contract || !signer) return;
    try {
      setIsLoading(true);
      const tx = await contract.connect(signer).safeMint(to, {
        value: fee,
      });
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      console.error('Error minting NFT:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, signer]);

  // Transfer NFT
  const transfer = useCallback(async (from, to, tokenId) => {
    if (!contract || !signer) return;
    try {
      setIsLoading(true);
      const tx = await contract.connect(signer).transferFrom(from, to, tokenId);
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      console.error('Error transferring NFT:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, signer]);

  // Burn NFT
  const burn = useCallback(async (tokenId) => {
    if (!contract || !signer) return;
    try {
      setIsLoading(true);
      const tx = await contract.connect(signer).burn(tokenId);
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      console.error('Error burning NFT:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, signer]);

  return {
    balance,
    isLoading,
    error,
    getBalance,
    getTokenURI,
    mint,
    transfer,
    burn,
  };
}
