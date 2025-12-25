/**
 * Authentication Middleware
 * Verifies JWT tokens and Web3 signatures
 */

const jwt = require('jsonwebtoken');
const { verifyMessage } = require('ethers');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const verifyWeb3Message = async (req, res, next) => {
  try {
    const { message, signature, address } = req.body;

    if (!message || !signature || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: message, signature, address'
      });
    }

    const recoveredAddress = verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    req.user = { address: address.toLowerCase() };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Signature verification failed'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
      req.user = decoded;
    }
  } catch (error) {
    // Optional auth, so we don't fail
  }
  next();
};

module.exports = {
  authMiddleware,
  verifyWeb3Message,
  optionalAuth
};
