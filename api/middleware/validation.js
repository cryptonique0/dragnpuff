/**
 * Validation Middleware
 * Validates request data and parameters
 */

const validateAddress = (req, res, next) => {
  const { address } = req.params || req.body;
  
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Ethereum address'
    });
  }
  
  next();
};

const validateTokenId = (req, res, next) => {
  const { tokenId } = req.params;
  
  if (!tokenId || isNaN(tokenId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid token ID'
    });
  }
  
  next();
};

const validateListingData = (req, res, next) => {
  const { nftId, price } = req.body;
  
  if (!nftId || typeof nftId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid NFT ID'
    });
  }
  
  if (!price || isNaN(price) || parseFloat(price) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid price'
    });
  }
  
  next();
};

const validatePagination = (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Invalid pagination parameters'
    });
  }
  
  req.pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit)
  };
  
  next();
};

const validateProposalData = (req, res, next) => {
  const { title, description, target, value } = req.body;
  
  if (!title || typeof title !== 'string' || title.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid proposal title'
    });
  }
  
  if (!description || typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid proposal description'
    });
  }
  
  next();
};

module.exports = {
  validateAddress,
  validateTokenId,
  validateListingData,
  validatePagination,
  validateProposalData
};
