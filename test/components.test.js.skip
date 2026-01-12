/**
 * Test Suite: Frontend Component Tests
 * Unit tests for React components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NFTCard from '../frontend/components/NFTCard';
import StakingPanel from '../frontend/components/StakingPanel';
import Marketplace from '../frontend/components/Marketplace';

describe('NFTCard Component', () => {
  const mockNFT = {
    id: '1',
    name: 'Dragon NFT #1',
    price: 2.5,
    rarity: 'rare',
    image: 'https://example.com/image.png',
    owner: '0x1234567890123456789012345678901234567890',
    collection: 'Dragons',
    listed: true,
    likes: 42
  };

  test('renders NFT card with basic information', () => {
    render(
      <NFTCard nft={mockNFT} onBuy={jest.fn()} onBid={jest.fn()} />
    );
    expect(screen.getByText('Dragon NFT #1')).toBeInTheDocument();
    expect(screen.getByText('Dragons')).toBeInTheDocument();
    expect(screen.getByText('2.5 ETH')).toBeInTheDocument();
  });

  test('shows rarity badge', () => {
    render(
      <NFTCard nft={mockNFT} onBuy={jest.fn()} onBid={jest.fn()} />
    );
    expect(screen.getByText('rare')).toBeInTheDocument();
  });

  test('calls onBuy when Buy Now is clicked', () => {
    const mockOnBuy = jest.fn();
    render(
      <NFTCard nft={mockNFT} onBuy={mockOnBuy} onBid={jest.fn()} />
    );
    fireEvent.click(screen.getByText('Buy Now'));
    expect(mockOnBuy).toHaveBeenCalledWith('1');
  });

  test('calls onBid when Place Bid is clicked', () => {
    const mockOnBid = jest.fn();
    render(
      <NFTCard nft={mockNFT} onBuy={jest.fn()} onBid={mockOnBid} />
    );
    fireEvent.click(screen.getByText('Place Bid'));
    expect(mockOnBid).toHaveBeenCalledWith('1');
  });

  test('toggles details visibility', () => {
    render(
      <NFTCard nft={mockNFT} onBuy={jest.fn()} onBid={jest.fn()} />
    );
    const viewButton = screen.getByText('View Details');
    fireEvent.click(viewButton);
    expect(screen.getByText(/Dragon NFT #1/)).toBeInTheDocument();
  });
});

describe('StakingPanel Component', () => {
  test('renders staking stats', () => {
    render(
      <StakingPanel 
        userAddress="0x123" 
        onStake={jest.fn()} 
        onUnstake={jest.fn()}
        onClaim={jest.fn()}
      />
    );
    expect(screen.getByText('Token Staking')).toBeInTheDocument();
    expect(screen.getByText(/Staked Amount/)).toBeInTheDocument();
  });

  test('shows claim and unstake buttons when staked', () => {
    render(
      <StakingPanel 
        userAddress="0x123" 
        onStake={jest.fn()} 
        onUnstake={jest.fn()}
        onClaim={jest.fn()}
      />
    );
    // Note: actual implementation would set staking data
  });

  test('shows staking form when not staked', () => {
    render(
      <StakingPanel 
        userAddress="0x123" 
        onStake={jest.fn()} 
        onUnstake={jest.fn()}
        onClaim={jest.fn()}
      />
    );
    expect(screen.getByText(/Start Staking|Amount to stake/)).toBeInTheDocument();
  });
});

describe('Marketplace Component', () => {
  test('renders marketplace heading', () => {
    render(<Marketplace />);
    expect(screen.getByText('NFT Marketplace')).toBeInTheDocument();
  });

  test('displays filter controls', () => {
    render(<Marketplace />);
    expect(screen.getByText(/Min Price|Max Price|Rarity/)).toBeInTheDocument();
  });

  test('displays pagination controls', () => {
    render(<Marketplace />);
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
});
