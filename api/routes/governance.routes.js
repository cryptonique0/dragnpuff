/**
 * Governance Routes
 */

const express = require("express");
const router = express.Router();
const governanceController = require("../controllers/governance.controller");

/**
 * Get all proposals
 */
router.get("/proposals", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const proposals = await governanceController.getProposals(page, limit);
    res.json({ success: true, data: proposals });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get proposal by ID
 */
router.get("/proposals/:proposalId", async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await governanceController.getProposal(proposalId);
    res.json({ success: true, data: proposal });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Create proposal
 */
router.post("/proposals", async (req, res) => {
  try {
    const { proposer, description } = req.body;
    const proposal = await governanceController.createProposal(
      proposer,
      description
    );
    res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Cast vote
 */
router.post("/vote", async (req, res) => {
  try {
    const { proposalId, voter, support } = req.body;
    const vote = await governanceController.castVote(
      proposalId,
      voter,
      support
    );
    res.json({ success: true, data: vote });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get proposal votes
 */
router.get("/proposals/:proposalId/votes", async (req, res) => {
  try {
    const { proposalId } = req.params;
    const votes = await governanceController.getProposalVotes(proposalId);
    res.json({ success: true, data: votes });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get voting power
 */
router.get("/voting-power/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const power = await governanceController.getVotingPower(address);
    res.json({ success: true, data: { votingPower: power } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get proposal state
 */
router.get("/proposals/:proposalId/state", async (req, res) => {
  try {
    const { proposalId } = req.params;
    const state = await governanceController.getProposalState(proposalId);
    res.json({ success: true, data: { state } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Cancel proposal
 */
router.post("/proposals/:proposalId/cancel", async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { caller } = req.body;
    const result = await governanceController.cancelProposal(
      proposalId,
      caller
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
