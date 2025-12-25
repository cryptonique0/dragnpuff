/**
 * Marketplace Controller
 * Handles marketplace operations
 */

const { asyncHandler } = require('../middleware/errorHandler');
const Listing = require('../models/Listing');

const getListings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sort = 'newest' } = req.query;
  
  // TODO: Fetch from database with filters
  const listings = [];
  const skip = (page - 1) * limit;

  res.json({
    success: true,
    data: listings.slice(skip, skip + limit),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: listings.length,
      pages: Math.ceil(listings.length / limit)
    }
  });
});

const createListing = asyncHandler(async (req, res) => {
  const { nftId, price } = req.body;
  const seller = req.user.address;

  const listing = await Listing.create(nftId, seller, price);

  res.status(201).json({
    success: true,
    data: listing.toJSON(),
    message: 'Listing created successfully'
  });
});

const getListing = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const listing = await Listing.findById(listingId);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }

  res.json({
    success: true,
    data: listing.toJSON()
  });
});

const buyNFT = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const buyer = req.user.address;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }

  // TODO: Process payment and transfer
  listing.sell(buyer);
  await listing.save();

  res.json({
    success: true,
    data: listing.toJSON(),
    message: 'Purchase successful'
  });
});

const placeBid = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const { amount } = req.body;
  const bidder = req.user.address;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }

  const bid = listing.addBid(bidder, amount);
  await listing.save();

  res.json({
    success: true,
    data: { ...bid, listingId },
    message: 'Bid placed successfully'
  });
});

const getBids = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const listing = await Listing.findById(listingId);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }

  res.json({
    success: true,
    data: listing.bids.map(bid => ({
      ...bid,
      timestamp: bid.timestamp
    }))
  });
});

const getFloorPrice = asyncHandler(async (req, res) => {
  // TODO: Calculate from listings
  const floorPrice = 1.5;

  res.json({
    success: true,
    data: { floorPrice }
  });
});

const getVolume = asyncHandler(async (req, res) => {
  // TODO: Calculate from completed sales
  const volume = {
    daily: 150.5,
    weekly: 892.3,
    monthly: 3245.8,
    allTime: 15678.2
  };

  res.json({
    success: true,
    data: volume
  });
});

module.exports = {
  getListings,
  createListing,
  getListing,
  buyNFT,
  placeBid,
  getBids,
  getFloorPrice,
  getVolume
};
