/**
 * NFT Routes
 */

const express = require("express");
const { ethers } = require("ethers");

const router = express.Router();

// NFT Controller imports would go here
const nftController = require("../controllers/nft.controller");

/**
 * Get NFT by token ID
 */
router.get("/:tokenId", async (req, res) => {
  try {
    const { tokenId } = req.params;
    const nft = await nftController.getNFT(tokenId);
    res.json({ success: true, data: nft });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get user NFTs
 */
router.get("/user/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const nfts = await nftController.getUserNFTs(address);
    res.json({ success: true, data: nfts });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Mint NFT
 */
router.post("/mint", async (req, res) => {
  try {
    const { to, uri, fee } = req.body;
    const result = await nftController.mintNFT(to, uri, fee);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get NFT metadata
 */
router.get("/:tokenId/metadata", async (req, res) => {
  try {
    const { tokenId } = req.params;
    const metadata = await nftController.getNFTMetadata(tokenId);
    res.json({ success: true, data: metadata });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Transfer NFT
 */
router.post("/transfer", async (req, res) => {
  try {
    const { from, to, tokenId } = req.body;
    const result = await nftController.transferNFT(from, to, tokenId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Burn NFT
 */
router.post("/burn", async (req, res) => {
  try {
    const { tokenId } = req.body;
    const result = await nftController.burnNFT(tokenId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
