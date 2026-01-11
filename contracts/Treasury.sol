// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Treasury
 * @dev Treasury contract for fund management and distributions
 */
contract Treasury is Ownable, ReentrancyGuard {
    // Token
    IERC20 public treasuryToken;

    // Structs
    struct Fund {
        string name;
        uint256 balance;
        uint256 createdAt;
        address manager;
    }

    struct Proposal {
        uint256 id;
        address recipient;
        uint256 amount;
        string reason;
        uint256 createdAt;
        bool approved;
        bool executed;
    }

    // State
    mapping(uint256 => Fund) public funds;
    mapping(uint256 => Proposal) public proposals;

    uint256 public fundCounter;
    uint256 public proposalCounter;
    uint256 public totalReserve;

    // Events
    event FundCreated(uint256 indexed fundId, string name, address manager);
    event FundsDeposited(uint256 indexed fundId, uint256 amount);
    event ProposalCreated(uint256 indexed proposalId, address recipient, uint256 amount);
    event ProposalApproved(uint256 indexed proposalId);
    event ProposalExecuted(uint256 indexed proposalId);
    event FundsDistributed(address indexed recipient, uint256 amount);

    constructor(address _treasuryToken) {
        treasuryToken = IERC20(_treasuryToken);
    }

    /**
     * Create fund
     */
    function createFund(string memory _name, address _manager)
        external
        onlyOwner
        returns (uint256)
    {
        uint256 fundId = fundCounter++;
        Fund storage fund = funds[fundId];
        fund.name = _name;
        fund.manager = _manager;
        fund.createdAt = block.timestamp;

        emit FundCreated(fundId, _name, _manager);
        return fundId;
    }

    /**
     * Deposit to fund
     */
    function depositToFund(uint256 _fundId, uint256 _amount) external {
        require(_amount > 0, "Amount must be > 0");
        require(
            treasuryToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        Fund storage fund = funds[_fundId];
        fund.balance += _amount;
        totalReserve += _amount;

        emit FundsDeposited(_fundId, _amount);
    }

    /**
     * Propose distribution
     */
    function proposeDistribution(
        address _recipient,
        uint256 _amount,
        string memory _reason
    ) external onlyOwner returns (uint256) {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be > 0");
        require(_amount <= totalReserve, "Insufficient reserve");

        uint256 proposalId = proposalCounter++;
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.recipient = _recipient;
        proposal.amount = _amount;
        proposal.reason = _reason;
        proposal.createdAt = block.timestamp;

        emit ProposalCreated(proposalId, _recipient, _amount);
        return proposalId;
    }

    /**
     * Approve proposal
     */
    function approveProposal(uint256 _proposalId) external onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.approved, "Already approved");
        require(!proposal.executed, "Already executed");

        proposal.approved = true;
        emit ProposalApproved(_proposalId);
    }

    /**
     * Execute proposal
     */
    function executeProposal(uint256 _proposalId) external onlyOwner nonReentrant {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.approved, "Not approved");
        require(!proposal.executed, "Already executed");
        require(totalReserve >= proposal.amount, "Insufficient reserve");

        proposal.executed = true;
        totalReserve -= proposal.amount;

        require(
            treasuryToken.transfer(proposal.recipient, proposal.amount),
            "Transfer failed"
        );

        emit ProposalExecuted(_proposalId);
        emit FundsDistributed(proposal.recipient, proposal.amount);
    }

    /**
     * Get fund info
     */
    function getFund(uint256 _fundId) external view returns (Fund memory) {
        return funds[_fundId];
    }

    /**
     * Get proposal info
     */
    function getProposal(uint256 _proposalId)
        external
        view
        returns (Proposal memory)
    {
        return proposals[_proposalId];
    }

    /**
     * Get total balance
     */
    function getTotalBalance() external view returns (uint256) {
        return treasuryToken.balanceOf(address(this));
    }
}
