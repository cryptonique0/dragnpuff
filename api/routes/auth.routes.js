/**
 * Auth Routes
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

/**
 * Get nonce for signing
 */
router.post("/nonce", async (req, res) => {
  try {
    const { address } = req.body;
    const nonce = await authController.getNonce(address);
    res.json({ success: true, data: { nonce } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Verify signature and login
 */
router.post("/login", async (req, res) => {
  try {
    const { address, signature, nonce } = req.body;
    const result = await authController.verifyAndLogin(
      address,
      signature,
      nonce
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Logout
 */
router.post("/logout", async (req, res) => {
  try {
    const { token } = req.body;
    await authController.logout(token);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Verify token
 */
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;
    const valid = await authController.verifyToken(token);
    res.json({ success: true, data: { valid } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Refresh token
 */
router.post("/refresh", async (req, res) => {
  try {
    const { token } = req.body;
    const newToken = await authController.refreshToken(token);
    res.json({ success: true, data: { token: newToken } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Check authentication status
 */
router.get("/status", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.json({ success: true, authenticated: false });
    }
    const user = await authController.getUser(token);
    res.json({ success: true, authenticated: true, data: user });
  } catch (error) {
    res.json({ success: true, authenticated: false });
  }
});

module.exports = router;
