/**
 * useDragNPuffContract Hook
 * Provides interaction with DragNPuff NFT contract
 */

import { useState, useCallback } from 'react';
import { useContract } from './useContract';

const useDragNPuffContract = () => {
  const contract = useContract('DRAGNPUFF_ADDRESS', 'DRAGNPUFF_ABI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mintNFT = useCallback(async (to, tokenUri) => {
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.mint(to, tokenUri);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const transferNFT = useCallback(async (from, to, tokenId) => {
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.transferFrom(from, to, tokenId);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const getNFT = useCallback(async (tokenId) => {
    setLoading(true);
    setError(null);
    try {
      const nft = await contract.tokenURI(tokenId);
      return nft;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const balanceOf = useCallback(async (address) => {
    setLoading(true);
    setError(null);
    try {
      const balance = await contract.balanceOf(address);
      return balance.toNumber();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  return {
    contract,
    mintNFT,
    transferNFT,
    getNFT,
    balanceOf,
    loading,
    error
  };
};

export default useDragNPuffContract;
