/**
 * Token Routes
 */

const express = require("express");
const router = express.Router();
const tokenController = require("../controllers/token.controller");

/**
 * Get token balance
 */
router.get("/balance/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await tokenController.getBalance(address);
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get total supply
 */
router.get("/supply", async (req, res) => {
  try {
    const supply = await tokenController.getTotalSupply();
    res.json({ success: true, data: supply });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Transfer tokens
 */
router.post("/transfer", async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    const result = await tokenController.transfer(from, to, amount);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Approve spending
 */
router.post("/approve", async (req, res) => {
  try {
    const { owner, spender, amount } = req.body;
    const result = await tokenController.approve(owner, spender, amount);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get allowance
 */
router.get("/allowance/:owner/:spender", async (req, res) => {
  try {
    const { owner, spender } = req.params;
    const allowance = await tokenController.getAllowance(owner, spender);
    res.json({ success: true, data: allowance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get token info
 */
router.get("/info", async (req, res) => {
  try {
    const info = await tokenController.getTokenInfo();
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
