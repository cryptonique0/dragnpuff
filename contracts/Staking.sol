// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Staking
 * @dev Staking contract with reward distribution
 */
contract Staking is Ownable, ReentrancyGuard {
    // Token to stake
    IERC20 public stakingToken;

    // Structs
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 totalClaimed;
    }

    // State
    mapping(address => StakeInfo) public stakes;
    mapping(address => bool) public isStaking;

    uint256 public totalStaked;
    uint256 public rewardRate = 10; // 10% APY
    uint256 public minStakeAmount = 1e18; // 1 token
    uint256 public lockPeriod = 7 days;

    uint256 public platformFeePercent = 2;
    address public platformFeeRecipient;

    // Events
    event Staked(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount);
    event RewardClaimed(address indexed staker, uint256 reward);
    event RewardRateUpdated(uint256 newRate);

    constructor(address _stakingToken, address _platformFeeRecipient) {
        stakingToken = IERC20(_stakingToken);
        platformFeeRecipient = _platformFeeRecipient;
    }

    /**
     * Stake tokens
     */
    function stake(uint256 _amount) external nonReentrant {
        require(_amount >= minStakeAmount, "Amount too low");
        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        StakeInfo storage stakeInfo = stakes[msg.sender];

        // Claim pending rewards if already staking
        if (isStaking[msg.sender]) {
            uint256 reward = calculateReward(msg.sender);
            if (reward > 0) {
                stakeInfo.totalClaimed += reward;
                stakingToken.transfer(msg.sender, reward);
                emit RewardClaimed(msg.sender, reward);
            }
        }

        stakeInfo.amount += _amount;
        stakeInfo.startTime = block.timestamp;
        stakeInfo.lastClaimTime = block.timestamp;
        isStaking[msg.sender] = true;
        totalStaked += _amount;

        emit Staked(msg.sender, _amount);
    }

    /**
     * Unstake tokens
     */
    function unstake(uint256 _amount) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount >= _amount, "Insufficient stake");
        require(
            block.timestamp >= stakeInfo.startTime + lockPeriod,
            "Lock period not elapsed"
        );

        // Claim rewards
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
            stakeInfo.totalClaimed += reward;
            stakingToken.transfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }

        stakeInfo.amount -= _amount;
        totalStaked -= _amount;

        if (stakeInfo.amount == 0) {
            isStaking[msg.sender] = false;
        }

        stakingToken.transfer(msg.sender, _amount);
        emit Unstaked(msg.sender, _amount);
    }

    /**
     * Claim rewards without unstaking
     */
    function claimRewards() external nonReentrant {
        require(isStaking[msg.sender], "Not staking");

        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards");

        StakeInfo storage stakeInfo = stakes[msg.sender];
        stakeInfo.lastClaimTime = block.timestamp;
        stakeInfo.totalClaimed += reward;

        stakingToken.transfer(msg.sender, reward);
        emit RewardClaimed(msg.sender, reward);
    }

    /**
     * Calculate pending reward
     */
    function calculateReward(address _staker) public view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[_staker];
        if (stakeInfo.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - stakeInfo.lastClaimTime;
        uint256 dailyReward = (stakeInfo.amount * rewardRate) / (365 * 100);
        return (dailyReward * stakingDuration) / 1 days;
    }

    /**
     * Get staker info
     */
    function getStakeInfo(address _staker)
        external
        view
        returns (StakeInfo memory)
    {
        return stakes[_staker];
    }

    /**
     * Set reward rate
     */
    function setRewardRate(uint256 _rate) external onlyOwner {
        require(_rate <= 50, "Rate too high"); // Max 50% APY
        rewardRate = _rate;
        emit RewardRateUpdated(_rate);
    }

    /**
     * Set minimum stake
     */
    function setMinStakeAmount(uint256 _amount) external onlyOwner {
        minStakeAmount = _amount;
    }

    /**
     * Withdraw excess tokens (emergency)
     */
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        stakingToken.transfer(msg.sender, _amount);
    }
}
