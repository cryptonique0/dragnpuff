/**
 * NFTCard Component
 * Displays a single NFT in card format
 */

import React, { useState } from 'react';
import './NFTCard.css';

const NFTCard = ({ nft, onBuy, onBid }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="nft-card">
      <div className="nft-card-image">
        <img src={nft.image} alt={nft.name} />
        <span className="nft-rarity-badge">{nft.rarity}</span>
        {nft.listed && <span className="nft-listed-badge">For Sale</span>}
      </div>

      <div className="nft-card-content">
        <h3 className="nft-card-title">{nft.name}</h3>
        <p className="nft-card-collection">{nft.collection}</p>

        {nft.listed && (
          <div className="nft-card-price">
            <span className="label">Price</span>
            <span className="value">{nft.price} ETH</span>
          </div>
        )}

        <div className="nft-card-stats">
          <div className="stat">
            <span className="label">Owner</span>
            <span className="value">{nft.owner.slice(0, 6)}...</span>
          </div>
          <div className="stat">
            <span className="label">Likes</span>
            <span className="value">{nft.likes}</span>
          </div>
        </div>

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
            <p><strong>Contract:</strong> {nft.contractAddress.slice(0, 10)}...</p>
            <p><strong>Token ID:</strong> {nft.tokenId}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCard;
