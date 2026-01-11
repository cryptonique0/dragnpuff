/**
 * Marketplace Routes
 */

const express = require("express");
const router = express.Router();
const marketplaceController = require("../controllers/marketplace.controller");

/**
 * Get listings
 */
router.get("/listings", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const listings = await marketplaceController.getListings(page, limit);
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get listing by ID
 */
router.get("/listings/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await marketplaceController.getListing(listingId);
    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Create listing
 */
router.post("/listings", async (req, res) => {
  try {
    const { nftContract, tokenId, price } = req.body;
    const listing = await marketplaceController.createListing(
      nftContract,
      tokenId,
      price
    );
    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Buy NFT
 */
router.post("/buy", async (req, res) => {
  try {
    const { listingId, buyer } = req.body;
    const result = await marketplaceController.buyNFT(listingId, buyer);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Place bid
 */
router.post("/bid", async (req, res) => {
  try {
    const { listingId, bidder, amount } = req.body;
    const bid = await marketplaceController.placeBid(
      listingId,
      bidder,
      amount
    );
    res.json({ success: true, data: bid });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get bids for listing
 */
router.get("/bids/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const bids = await marketplaceController.getBids(listingId);
    res.json({ success: true, data: bids });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get floor price
 */
router.get("/floor-price", async (req, res) => {
  try {
    const price = await marketplaceController.getFloorPrice();
    res.json({ success: true, data: { floorPrice: price } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get trading volume
 */
router.get("/volume", async (req, res) => {
  try {
    const volume = await marketplaceController.getTradingVolume();
    res.json({ success: true, data: volume });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
