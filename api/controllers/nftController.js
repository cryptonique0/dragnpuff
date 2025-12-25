/**
 * NFT Controller
 * Handles NFT-related business logic
 */

const { asyncHandler } = require('../middleware/errorHandler');
const NFT = require('../models/NFT');

const getNFT = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;
  const nft = await NFT.findByTokenId(tokenId);
  
  if (!nft) {
    return res.status(404).json({
      success: false,
      message: 'NFT not found'
    });
  }

  res.json({
    success: true,
    data: nft.toJSON()
  });
});

const getUserNFTs = asyncHandler(async (req, res) => {
  const { address } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  const nfts = await NFT.findByOwner(address);
  const skip = (page - 1) * limit;
  const paginated = nfts.slice(skip, skip + limit);

  res.json({
    success: true,
    data: paginated.map(nft => nft.toJSON()),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: nfts.length,
      pages: Math.ceil(nfts.length / limit)
    }
  });
});

const getNFTMetadata = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;
  const nft = await NFT.findByTokenId(tokenId);
  
  if (!nft) {
    return res.status(404).json({
      success: false,
      message: 'NFT not found'
    });
  }

  res.json({
    success: true,
    data: {
      name: nft.name,
      description: nft.description,
      image: nft.image,
      attributes: nft.attributes,
      rarity: nft.rarity,
      external_url: `https://dragnpuff.io/nft/${nft.tokenId}`,
      ...nft.metadata
    }
  });
});

const mintNFT = asyncHandler(async (req, res) => {
  const { to, tokenUri, data } = req.body;
  
  // TODO: Call contract mint function
  const nft = await NFT.create(null, {
    owner: to,
    creator: to,
    ...data
  });

  res.status(201).json({
    success: true,
    data: nft.toJSON(),
    message: 'NFT minted successfully'
  });
});

const transferNFT = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;
  const { to } = req.body;

  const nft = await NFT.findByTokenId(tokenId);
  if (!nft) {
    return res.status(404).json({
      success: false,
      message: 'NFT not found'
    });
  }

  await nft.transfer(to);

  res.json({
    success: true,
    data: nft.toJSON(),
    message: 'NFT transferred successfully'
  });
});

const burnNFT = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;

  const nft = await NFT.findByTokenId(tokenId);
  if (!nft) {
    return res.status(404).json({
      success: false,
      message: 'NFT not found'
    });
  }

  // TODO: Call contract burn function
  res.json({
    success: true,
    message: 'NFT burned successfully'
  });
});

module.exports = {
  getNFT,
  getUserNFTs,
  getNFTMetadata,
  mintNFT,
  transferNFT,
  burnNFT
};
