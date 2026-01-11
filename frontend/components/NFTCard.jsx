/**
 * NFTCard Component
 * Displays a single NFT in card format
 */

import React, { useState } from 'react';
import './NFTCard.css';

const NFTCard = ({ nft, onBuy, onBid }) => {
  const [showDetails, setShowDetails] = useState(false);
  const ownerLabel = nft.owner ? `${nft.owner.slice(0, 6)}...` : '—';
  const collectionLabel = nft.collection || "DragN'Puff";
  const priceValue = typeof nft.price === 'number' || typeof nft.price === 'string'
    ? nft.price
    : null;
  const primaryTraits = (nft.attributes || []).slice(0, 3);
  const likesCount = nft.likes ?? 0;
  const contractLabel = nft.contractAddress
    ? `${nft.contractAddress.slice(0, 10)}...`
    : '—';
  const tokenLabel = nft.tokenId ?? nft.id;

  return (
    <div className="nft-card">
      <div className="nft-card-image">
        <img src={nft.image} alt={nft.name} />
        <span className="nft-rarity-badge">{nft.rarity}</span>
        {nft.listed && <span className="nft-listed-badge">For Sale</span>}
      </div>

      <div className="nft-card-content">
        <h3 className="nft-card-title">{nft.name}</h3>
        <p className="nft-card-collection">{collectionLabel}</p>

        {priceValue !== null && (
          <div className="nft-card-price">
            <span className="label">{nft.listed ? 'Price' : 'Est. Value'}</span>
            <span className="value">{priceValue} ETH</span>
          </div>
        )}

        <div className="nft-card-stats">
          <div className="stat">
            <span className="label">Owner</span>
            <span className="value">{ownerLabel}</span>
          </div>
          <div className="stat">
            <span className="label">Likes</span>
            <span className="value">{likesCount}</span>
          </div>
        </div>

        {primaryTraits.length > 0 && (
          <div className="nft-card-traits">
            {primaryTraits.map((trait) => (
              <span key={`${trait.trait_type}-${trait.value}`} className="trait-pill">
                {trait.trait_type}: {trait.value}
              </span>
            ))}
          </div>
        )}

        <div className="nft-card-actions">
          {nft.listed && (
            <>
              <button className="btn btn-primary" onClick={() => onBuy(nft.id)}>
                Buy Now
              </button>
              <button className="btn btn-secondary" onClick={() => onBid(nft.id)}>
                Place Bid
              </button>
            </>
          )}
          <button 
            className="btn btn-tertiary" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'View'} Details
          </button>
        </div>

        {showDetails && (
          <div className="nft-card-details">
            <p><strong>Description:</strong> {nft.description}</p>
            <p><strong>Contract:</strong> {contractLabel}</p>
            <p><strong>Token ID:</strong> {tokenLabel}</p>
            {nft.attributes && nft.attributes.length > 0 && (
              <p><strong>Traits:</strong> {nft.attributes.map(attr => `${attr.trait_type}: ${attr.value}`).join(', ')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCard;
