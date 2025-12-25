/**
 * useContract Hook
 * Provides contract instance with event listening
 */

import { useState, useEffect, useCallback } from 'react';
import { Contract, ethers } from 'ethers';

const useContract = (address, abi, providerOrSigner) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address || !abi) return;

    setLoading(true);
    setError(null);

    try {
      const provider = providerOrSigner || ethers.getDefaultProvider();
      const contractInstance = new Contract(address, abi, provider);
      setContract(contractInstance);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address, abi, providerOrSigner]);

  const call = useCallback(async (methodName, ...args) => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      const result = await contract[methodName](...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [contract]);

  return { contract, call, loading, error };
};

export default useContract;
