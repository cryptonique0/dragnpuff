// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Governance
 * @dev DAO governance with voting and proposals
 */
contract Governance is Ownable, Pausable {
    // Token for voting
    IERC20 public governanceToken;

    // Enums
    enum ProposalStatus {
        Pending,
        Active,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed,
        Cancelled
    }

    // Structs
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool cancelled;
        bool executed;
        mapping(address => Receipt) receipts;
    }

    struct Receipt {
        bool hasVoted;
        uint8 support; // 0=against, 1=for, 2=abstain
        uint256 votes;
    }

    // State
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    uint256 public votingDelay = 1; // blocks
    uint256 public votingPeriod = 45818; // ~1 week
    uint256 public proposalThreshold = 65000e18; // 65000 tokens

    // Events
    event ProposalCreated(
        uint256 id,
        address indexed proposer,
        string description,
        uint256 startBlock,
        uint256 endBlock
    );
    event VoteCast(
        address indexed voter,
        uint256 proposalId,
        uint8 support,
        uint256 votes
    );
    event ProposalCancelled(uint256 id);
    event ProposalExecuted(uint256 id);

    constructor(address _governanceToken) {
        governanceToken = IERC20(_governanceToken);
    }

    /**
     * Create proposal
     */
    function propose(string memory _description)
        external
        returns (uint256)
    {
        require(
            governanceToken.balanceOf(msg.sender) > proposalThreshold,
            "Insufficient voting power"
        );

        uint256 startBlock = block.number + votingDelay;
        uint256 endBlock = startBlock + votingPeriod;

        uint256 proposalId = proposalCount++;
        Proposal storage newProposal = proposals[proposalId];

        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.description = _description;
        newProposal.startBlock = startBlock;
        newProposal.endBlock = endBlock;

        emit ProposalCreated(proposalId, msg.sender, _description, startBlock, endBlock);

        return proposalId;
    }

    /**
     * Cast vote
     */
    function castVote(uint256 _proposalId, uint8 _support) external {
        require(_support <= 2, "Invalid vote type");
        Proposal storage proposal = proposals[_proposalId];
        require(block.number >= proposal.startBlock, "Voting not started");
        require(block.number <= proposal.endBlock, "Voting ended");
        require(!proposal.receipts[msg.sender].hasVoted, "Already voted");

        uint256 votes = governanceToken.balanceOf(msg.sender);
        require(votes > 0, "No voting power");

        Receipt storage receipt = proposal.receipts[msg.sender];
        receipt.hasVoted = true;
        receipt.support = _support;
        receipt.votes = votes;

        if (_support == 0) {
            proposal.againstVotes += votes;
        } else if (_support == 1) {
            proposal.forVotes += votes;
        } else if (_support == 2) {
            proposal.abstainVotes += votes;
        }

        emit VoteCast(msg.sender, _proposalId, _support, votes);
    }

    /**
     * Get proposal state
     */
    function getProposalState(uint256 _proposalId)
        public
        view
        returns (ProposalStatus)
    {
        Proposal storage proposal = proposals[_proposalId];

        if (proposal.cancelled) {
            return ProposalStatus.Cancelled;
        } else if (block.number <= proposal.startBlock) {
            return ProposalStatus.Pending;
        } else if (block.number <= proposal.endBlock) {
            return ProposalStatus.Active;
        } else if (proposal.forVotes <= proposal.againstVotes) {
            return ProposalStatus.Defeated;
        } else if (proposal.executed) {
            return ProposalStatus.Executed;
        } else {
            return ProposalStatus.Succeeded;
        }
    }

    /**
     * Cancel proposal
     */
    function cancelProposal(uint256 _proposalId) external {
        ProposalStatus status = getProposalState(_proposalId);
        require(
            status != ProposalStatus.Executed,
            "Cannot cancel executed proposal"
        );
        Proposal storage proposal = proposals[_proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Only proposer or owner"
        );

        proposal.cancelled = true;
        emit ProposalCancelled(_proposalId);
    }

    /**
     * Execute proposal
     */
    function executeProposal(uint256 _proposalId) external onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        require(
            getProposalState(_proposalId) == ProposalStatus.Succeeded,
            "Proposal not succeeded"
        );

        proposal.executed = true;
        emit ProposalExecuted(_proposalId);
    }

    /**
     * Get voting power
     */
    function getVotingPower(address _voter) external view returns (uint256) {
        return governanceToken.balanceOf(_voter);
    }

    /**
     * Set proposal threshold
     */
    function setProposalThreshold(uint256 _threshold) external onlyOwner {
        proposalThreshold = _threshold;
    }
}
