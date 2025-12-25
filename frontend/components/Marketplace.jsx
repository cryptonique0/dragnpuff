/**
 * Marketplace Component
 * Displays NFT marketplace with filtering and search
 */

import React, { useState, useEffect } from 'react';
import NFTCard from './NFTCard';
import './Marketplace.css';

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000,
    rarity: 'all',
    sort: 'newest'
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [filters, page]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from API
      const mockListings = [
        { id: 1, name: 'Dragon NFT #1', price: 2.5, rarity: 'rare', image: 'url' },
        { id: 2, name: 'Dragon NFT #2', price: 1.8, rarity: 'uncommon', image: 'url' }
      ];
      setListings(mockListings);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = (nftId) => {
    // TODO: Execute buy transaction
    console.log('Buying NFT:', nftId);
  };

  const handleBid = (nftId) => {
    // TODO: Open bidding modal
    console.log('Bidding on NFT:', nftId);
  };

  return (
    <div className="marketplace">
      <h1>NFT Marketplace</h1>

      <div className="marketplace-filters">
        <div className="filter-group">
          <label>Min Price</label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            min="0"
          />
        </div>
        <div className="filter-group">
          <label>Max Price</label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            min="0"
          />
        </div>
        <div className="filter-group">
          <label>Rarity</label>
          <select value={filters.rarity} onChange={(e) => setFilters({ ...filters, rarity: e.target.value })}>
            <option value="all">All</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="empty-state">No listings found</div>
      ) : (
        <div className="listings-grid">
          {listings.map(listing => (
            <NFTCard
              key={listing.id}
              nft={listing}
              onBuy={handleBuy}
              onBid={handleBid}
            />
          ))}
        </div>
      )}

      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Marketplace;
