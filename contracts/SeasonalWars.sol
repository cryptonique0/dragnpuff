// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SeasonalWars
 * @dev Lightweight contract for tracking seasonal House Wars scores and prize pools
 * Server-side tallying with contract emitting events for transparency
 */
contract SeasonalWars is AccessControl, ReentrancyGuard {
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");

    // Season structure
    struct Season {
        uint256 seasonId;
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool;
        bool finalized;
        mapping(uint8 => uint256) houseScores; // house ID => score
        mapping(uint8 => uint256) multipliers; // house ID => multiplier (basis points, e.g., 10000 = 1x)
    }

    // Prize distribution for top houses (in basis points, total 10000)
    uint256[] public prizeDistribution = [5000, 3000, 2000]; // 1st: 50%, 2nd: 30%, 3rd: 20%

    uint256 public currentSeasonId;
    mapping(uint256 => Season) public seasons;

    // Events
    event SeasonStarted(uint256 indexed seasonId, uint256 startTime, uint256 endTime);
    event SeasonEnded(uint256 indexed seasonId, uint256 endTime);
    event ScoreRecorded(uint256 indexed seasonId, uint8 indexed houseId, uint256 points, address indexed recorder);
    event MultiplierSet(uint256 indexed seasonId, uint8 indexed houseId, uint256 multiplier);
    event PrizePoolIncreased(uint256 indexed seasonId, uint256 amount, uint256 newTotal);
    event PrizeDistributed(uint256 indexed seasonId, uint8 indexed houseId, uint256 amount);
    event SeasonFinalized(uint256 indexed seasonId, uint8[] topHouses, uint256[] finalScores);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_MASTER_ROLE, msg.sender);
        currentSeasonId = 0;
    }

    /**
     * @dev Start a new season
     */
    function startSeason(uint256 duration) external onlyRole(GAME_MASTER_ROLE) {
        require(currentSeasonId == 0 || seasons[currentSeasonId].finalized, "Previous season not finalized");
        
        currentSeasonId++;
        Season storage newSeason = seasons[currentSeasonId];
        newSeason.seasonId = currentSeasonId;
        newSeason.startTime = block.timestamp;
        newSeason.endTime = block.timestamp + duration;
        newSeason.prizePool = 0;
        newSeason.finalized = false;

        // Initialize multipliers to 1x (10000 basis points) for all houses
        for (uint8 i = 0; i < 7; i++) {
            newSeason.multipliers[i] = 10000;
        }

        emit SeasonStarted(currentSeasonId, newSeason.startTime, newSeason.endTime);
    }

    /**
     * @dev Record score for a house (called by game master/server)
     */
    function recordScore(uint256 seasonId, uint8 houseId, uint256 points) 
        external 
        onlyRole(GAME_MASTER_ROLE) 
    {
        require(houseId < 7, "Invalid house ID");
        require(!seasons[seasonId].finalized, "Season finalized");
        require(block.timestamp >= seasons[seasonId].startTime, "Season not started");
        require(block.timestamp <= seasons[seasonId].endTime, "Season ended");

        Season storage season = seasons[seasonId];
        season.houseScores[houseId] += points;

        emit ScoreRecorded(seasonId, houseId, points, msg.sender);
    }

    /**
     * @dev Set multiplier for a house (event-based bonuses, special achievements)
     */
    function setMultiplier(uint256 seasonId, uint8 houseId, uint256 multiplier) 
        external 
        onlyRole(GAME_MASTER_ROLE) 
    {
        require(houseId < 7, "Invalid house ID");
        require(!seasons[seasonId].finalized, "Season finalized");
        require(multiplier > 0 && multiplier <= 50000, "Invalid multiplier"); // max 5x

        seasons[seasonId].multipliers[houseId] = multiplier;

        emit MultiplierSet(seasonId, houseId, multiplier);
    }

    /**
     * @dev Add to prize pool (accepts ETH)
     */
    function addToPrizePool(uint256 seasonId) external payable {
        require(!seasons[seasonId].finalized, "Season finalized");
        require(msg.value > 0, "Must send ETH");

        seasons[seasonId].prizePool += msg.value;

        emit PrizePoolIncreased(seasonId, msg.value, seasons[seasonId].prizePool);
    }

    /**
     * @dev Finalize season and distribute prizes
     */
    function finalizeSeason(uint256 seasonId) 
        external 
        onlyRole(GAME_MASTER_ROLE) 
        nonReentrant 
    {
        Season storage season = seasons[seasonId];
        require(!season.finalized, "Already finalized");
        require(block.timestamp > season.endTime, "Season not ended");

        // Calculate final scores with multipliers
        uint256[] memory finalScores = new uint256[](7);
        for (uint8 i = 0; i < 7; i++) {
            finalScores[i] = (season.houseScores[i] * season.multipliers[i]) / 10000;
        }

        // Get top 3 houses
        uint8[] memory topHouses = _getTopHouses(seasonId, finalScores);

        // Distribute prizes
        uint256 prizePool = season.prizePool;
        if (prizePool > 0) {
            for (uint256 i = 0; i < prizeDistribution.length && i < topHouses.length; i++) {
                uint256 prize = (prizePool * prizeDistribution[i]) / 10000;
                // Prize distribution would go to a treasury or house representative
                // For now, just emit events - actual distribution handled off-chain or by governance
                emit PrizeDistributed(seasonId, topHouses[i], prize);
            }
        }

        season.finalized = true;
        emit SeasonFinalized(seasonId, topHouses, finalScores);
        emit SeasonEnded(seasonId, block.timestamp);
    }

    /**
     * @dev Get top 3 houses by final score
     */
    function _getTopHouses(uint256 seasonId, uint256[] memory finalScores) 
        internal 
        view 
        returns (uint8[] memory) 
    {
        uint8[] memory houses = new uint8[](3);
        uint256[] memory topScores = new uint256[](3);

        for (uint8 i = 0; i < 7; i++) {
            for (uint8 j = 0; j < 3; j++) {
                if (finalScores[i] > topScores[j]) {
                    // Shift down
                    for (uint8 k = 2; k > j; k--) {
                        topScores[k] = topScores[k-1];
                        houses[k] = houses[k-1];
                    }
                    topScores[j] = finalScores[i];
                    houses[j] = i;
                    break;
                }
            }
        }

        return houses;
    }

    /**
     * @dev Get house score for a season
     */
    function getHouseScore(uint256 seasonId, uint8 houseId) 
        external 
        view 
        returns (uint256) 
    {
        return seasons[seasonId].houseScores[houseId];
    }

    /**
     * @dev Get house multiplier for a season
     */
    function getHouseMultiplier(uint256 seasonId, uint8 houseId) 
        external 
        view 
        returns (uint256) 
    {
        return seasons[seasonId].multipliers[houseId];
    }

    /**
     * @dev Get final score (with multiplier) for a house
     */
    function getFinalScore(uint256 seasonId, uint8 houseId) 
        external 
        view 
        returns (uint256) 
    {
        Season storage season = seasons[seasonId];
        return (season.houseScores[houseId] * season.multipliers[houseId]) / 10000;
    }

    /**
     * @dev Get season info
     */
    function getSeasonInfo(uint256 seasonId) 
        external 
        view 
        returns (
            uint256 startTime,
            uint256 endTime,
            uint256 prizePool,
            bool finalized
        ) 
    {
        Season storage season = seasons[seasonId];
        return (
            season.startTime,
            season.endTime,
            season.prizePool,
            season.finalized
        );
    }

    /**
     * @dev Check if season is active
     */
    function isSeasonActive(uint256 seasonId) external view returns (bool) {
        Season storage season = seasons[seasonId];
        return !season.finalized && 
               block.timestamp >= season.startTime && 
               block.timestamp <= season.endTime;
    }

    /**
     * @dev Update prize distribution percentages
     */
    function setPrizeDistribution(uint256[] calldata distribution) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(distribution.length <= 7, "Too many positions");
        uint256 total = 0;
        for (uint256 i = 0; i < distribution.length; i++) {
            total += distribution[i];
        }
        require(total == 10000, "Must total 10000 basis points");
        
        prizeDistribution = distribution;
    }

    /**
     * @dev Withdraw unclaimed prizes (only after season finalized)
     */
    function withdrawUnclaimedPrizes(uint256 seasonId, address payable recipient) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        nonReentrant 
    {
        require(seasons[seasonId].finalized, "Season not finalized");
        require(block.timestamp > seasons[seasonId].endTime + 30 days, "Must wait 30 days");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        
        (bool success, ) = recipient.call{value: balance}("");
        require(success, "Transfer failed");
    }

    receive() external payable {
        if (currentSeasonId > 0 && !seasons[currentSeasonId].finalized) {
            seasons[currentSeasonId].prizePool += msg.value;
            emit PrizePoolIncreased(currentSeasonId, msg.value, seasons[currentSeasonId].prizePool);
        }
    }
}
