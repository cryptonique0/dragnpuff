/**
 * Token Controller
 * Handles token-related operations
 */

const { asyncHandler } = require('../middleware/errorHandler');

const getTokenBalance = asyncHandler(async (req, res) => {
  const { address } = req.params;

  // TODO: Call contract method
  const balance = 1000000;

  res.json({
    success: true,
    data: {
      address,
      balance,
      formattedBalance: (balance / 10**18).toString()
    }
  });
});

const getTotalSupply = asyncHandler(async (req, res) => {
  // TODO: Call contract method
  const supply = 1000000000 * 10**18;

  res.json({
    success: true,
    data: {
      totalSupply: supply,
      formattedSupply: (supply / 10**18).toString()
    }
  });
});

const transferTokens = asyncHandler(async (req, res) => {
  const { to, amount } = req.body;
  const from = req.user.address;

  // TODO: Execute transfer on contract
  res.json({
    success: true,
    data: {
      from,
      to,
      amount,
      transactionHash: '0x' + Math.random().toString(16).slice(2)
    },
    message: 'Transfer initiated'
  });
});

const approve = asyncHandler(async (req, res) => {
  const { spender, amount } = req.body;
  const owner = req.user.address;

  // TODO: Execute approve on contract
  res.json({
    success: true,
    data: {
      owner,
      spender,
      amount,
      transactionHash: '0x' + Math.random().toString(16).slice(2)
    },
    message: 'Approval granted'
  });
});

const getAllowance = asyncHandler(async (req, res) => {
  const { owner, spender } = req.params;

  // TODO: Call contract method
  const allowance = 500000;

  res.json({
    success: true,
    data: {
      owner,
      spender,
      allowance,
      formattedAllowance: (allowance / 10**18).toString()
    }
  });
});

const getTokenInfo = asyncHandler(async (req, res) => {
  const info = {
    name: 'Fair Token',
    symbol: 'FAIR',
    decimals: 18,
    totalSupply: 1000000000 * 10**18,
    address: process.env.FAIR_TOKEN_ADDRESS || '0xC4163b96b1c45e4A8920Cb3Db822b485d9748746',
    website: 'https://dragnpuff.io',
    description: 'The governance and staking token for DragNPuff'
  };

  res.json({
    success: true,
    data: info
  });
});

module.exports = {
  getTokenBalance,
  getTotalSupply,
  transferTokens,
  approve,
  getAllowance,
  getTokenInfo
};
