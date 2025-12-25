// React Hook for FairToken Contract Interaction

import { useState, useCallback } from 'react';
import { useContract } from './useContract';

export function useFairToken() {
  const [balance, setBalance] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { contract, signer } = useContract('FairToken');

  // Get token balance
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

  // Get total supply
  const getTotalSupply = useCallback(async () => {
    if (!contract) return;
    try {
      const supply = await contract.totalSupply();
      setTotalSupply(supply.toString());
      return supply;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching total supply:', err);
    }
  }, [contract]);

  // Transfer tokens
  const transfer = useCallback(async (to, amount) => {
    if (!contract || !signer) return;
    try {
      setIsLoading(true);
      const tx = await contract.connect(signer).transfer(to, amount);
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      console.error('Error transferring tokens:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, signer]);

  // Approve spending
  const approve = useCallback(async (spender, amount) => {
    if (!contract || !signer) return;
    try {
      setIsLoading(true);
      const tx = await contract.connect(signer).approve(spender, amount);
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      console.error('Error approving spending:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, signer]);

  // Get allowance
  const getAllowance = useCallback(async (owner, spender) => {
    if (!contract) return;
    try {
      const allowance = await contract.allowance(owner, spender);
      return allowance.toString();
    } catch (err) {
      console.error('Error fetching allowance:', err);
      setError(err.message);
    }
  }, [contract]);

  return {
    balance,
    totalSupply,
    isLoading,
    error,
    getBalance,
    getTotalSupply,
    transfer,
    approve,
    getAllowance,
  };
}
