// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
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
        uint256 lockDuration; // seconds
        uint8 houseId; // 0-6 house identifier
    }

    // State
    mapping(address => StakeInfo) public stakes;
    mapping(address => bool) public isStaking;

    uint256 public totalStaked;
    uint256 public rewardRate = 10; // 10% APY
    uint256 public minStakeAmount = 1e18; // 1 token
    uint256 public lockPeriod = 7 days; // default for legacy stake()
    uint256 public maxLockPeriod = 180 days;

    // House boost weights (amount * lockFactor)
    mapping(uint8 => uint256) public houseWeightedStake;

    // Multiplier tuning (basis points; 10000 = 1x)
    uint256 public constant BASE_MULTIPLIER_BPS = 10000;
    uint256 public maxBonusBps = 10000; // up to +1.0x bonus
    uint256 public boostPerUnitBps = 500; // +0.05x per boost unit
    uint256 public boostUnitAmount = 10_000 * 1e18; // 10k NOM locked for 30 days

    uint256 public platformFeePercent = 2;
    address public platformFeeRecipient;

    // Events
    event Staked(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount);
    event RewardClaimed(address indexed staker, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    event HouseBoostUpdated(uint8 indexed houseId, uint256 boostBps, uint256 weight);

    constructor(address _stakingToken, address _platformFeeRecipient) {
        stakingToken = IERC20(_stakingToken);
        platformFeeRecipient = _platformFeeRecipient;
    }

    /**
     * Stake tokens
     */
    function stake(uint256 _amount) external nonReentrant {
        // Legacy entrypoint defaults to house 0 and the default lock period
        _stake(_amount, 0, lockPeriod);
    }

    /**
     * Stake tokens for a house with a custom lock duration to earn a house multiplier boost
     */
    function stakeForHouse(uint256 _amount, uint8 _houseId, uint256 _lockDuration) external nonReentrant {
        _stake(_amount, _houseId, _lockDuration);
    }

    function _stake(uint256 _amount, uint8 _houseId, uint256 _lockDuration) internal {
        require(_amount >= minStakeAmount, "Amount too low");
        require(_houseId < 7, "Invalid house");
        require(_lockDuration >= lockPeriod, "Lock too short");
        require(_lockDuration <= maxLockPeriod, "Lock too long");
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

        // Track house assignment (immutable per wallet once set)
        if (stakeInfo.amount > 0) {
            require(stakeInfo.houseId == _houseId, "House already set");
        }

        uint256 weightDelta = (_amount * _lockDuration) / 30 days;
        houseWeightedStake[_houseId] += weightDelta;

        stakeInfo.amount += _amount;
        stakeInfo.startTime = block.timestamp;
        stakeInfo.lastClaimTime = block.timestamp;
        stakeInfo.lockDuration = _lockDuration;
        stakeInfo.houseId = _houseId;
        isStaking[msg.sender] = true;
        totalStaked += _amount;

        emit Staked(msg.sender, _amount);
        _emitHouseBoost(_houseId);
    }

    /**
     * Unstake tokens
     */
    function unstake(uint256 _amount) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount >= _amount, "Insufficient stake");
        require(
            block.timestamp >= stakeInfo.startTime + stakeInfo.lockDuration,
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

        uint256 weightDelta = (_amount * stakeInfo.lockDuration) / 30 days;
        houseWeightedStake[stakeInfo.houseId] = houseWeightedStake[stakeInfo.houseId] > weightDelta
            ? houseWeightedStake[stakeInfo.houseId] - weightDelta
            : 0;

        if (stakeInfo.amount == 0) {
            isStaking[msg.sender] = false;
        }

        stakingToken.transfer(msg.sender, _amount);
        emit Unstaked(msg.sender, _amount);
        _emitHouseBoost(stakeInfo.houseId);
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
     * Tune max lock period (affects boost weight)
     */
    function setMaxLockPeriod(uint256 _duration) external onlyOwner {
        require(_duration >= lockPeriod, "Must be >= base lock");
        maxLockPeriod = _duration;
    }

    /**
     * Configure boost economics (admin)
     */
    function setBoostConfig(uint256 _unitAmount, uint256 _boostPerUnitBps, uint256 _maxBonusBps) external onlyOwner {
        require(_unitAmount > 0, "Unit amount required");
        require(_boostPerUnitBps > 0, "Boost per unit required");
        require(_maxBonusBps >= _boostPerUnitBps, "Max bonus too low");
        boostUnitAmount = _unitAmount;
        boostPerUnitBps = _boostPerUnitBps;
        maxBonusBps = _maxBonusBps;
    }

    /**
     * Preview a house multiplier including staking boost (basis points)
     */
    function getHouseBoost(uint8 _houseId) public view returns (uint256) {
        require(_houseId < 7, "Invalid house");
        uint256 weight = houseWeightedStake[_houseId];
        if (weight == 0) {
            return BASE_MULTIPLIER_BPS;
        }
        uint256 bonus = (weight / boostUnitAmount) * boostPerUnitBps;
        if (bonus > maxBonusBps) {
            bonus = maxBonusBps;
        }
        return BASE_MULTIPLIER_BPS + bonus;
    }

    function _emitHouseBoost(uint8 _houseId) internal {
        uint256 boost = getHouseBoost(_houseId);
        emit HouseBoostUpdated(_houseId, boost, houseWeightedStake[_houseId]);
    }

    /**
     * Withdraw excess tokens (emergency)
     */
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        stakingToken.transfer(msg.sender, _amount);
    }
}
