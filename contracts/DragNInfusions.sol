// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title DragNInfusions
 * @dev Manages DragN NFT upgrades and charm attachments with $NOM spending
 * 
 * Features:
 * - Attach charms to DragNs (offchain metadata)
 * - Upgrade traits permanently
 * - Spend $NOM tokens for infusions
 * - EIP-712 signatures for gasless transactions
 * - Configurable charm costs and upgrade multipliers
 */
contract DragNInfusions is Ownable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;

    // Token interfaces
    IERC721 public dragNContract;
    IERC20 public nomToken;

    // Charm structure
    struct Charm {
        string name;
        string description;
        uint256 cost;
        uint256 rarity; // 1-5 scale
        bool active;
    }

    // Token infusion data
    struct TokenInfusion {
        uint256 tokenId;
        string[] appliedCharms;
        mapping(string => bool) hasCharm;
        mapping(string => uint256) charmAppliedAt;
        uint256 totalInfusionsPaid;
        uint256 lastInfusionTime;
        TraitUpgrade[] traitUpgrades;
    }

    // Trait upgrade structure
    struct TraitUpgrade {
        string traitName;
        string newValue;
        uint256 cost;
        uint256 appliedAt;
    }

    // Infusion metadata
    struct InfusionMetadata {
        uint256 tokenId;
        string[] charms;
        TraitUpgrade[] upgrades;
        uint256 totalSpent;
        uint256 infusionScore;
    }

    // Mappings
    mapping(uint256 => TokenInfusion) public tokenInfusions;
    mapping(string => Charm) public charms;
    mapping(address => uint256) public userSpending;
    mapping(address => uint256) public userNonce;

    // State
    string[] public charmList;
    uint256 public totalInfusionValue;
    uint256 public charmApplyFee; // Additional fee for applying charms
    uint256 public upgradeBaseCost; // Base cost for trait upgrades

    // Events
    event CharmCreated(string indexed charmName, uint256 cost, uint256 rarity);
    event CharmAttached(uint256 indexed tokenId, string indexed charmName, uint256 cost, address indexed user);
    event TraitUpgraded(uint256 indexed tokenId, string indexed traitName, string newValue, uint256 cost, address indexed user);
    event CharmRemoved(uint256 indexed tokenId, string indexed charmName);
    event CharmCostUpdated(string indexed charmName, uint256 newCost);
    event InfusionFeeUpdated(uint256 newFee);

    // Modifiers
    modifier onlyDragNOwner(uint256 tokenId) {
        require(dragNContract.ownerOf(tokenId) == msg.sender, "Not DragN owner");
        _;
    }

    modifier charmExists(string calldata charmName) {
        require(charms[charmName].active, "Charm does not exist");
        _;
    }

    // Constructor
    constructor(address _dragNContract, address _nomToken) 
        EIP712("DragNInfusions", "1") 
    {
        dragNContract = IERC721(_dragNContract);
        nomToken = IERC20(_nomToken);
        charmApplyFee = 0;
        upgradeBaseCost = 100 ether; // 100 $NOM
    }

    // ============ Charm Management ============

    /**
     * @dev Create a new charm
     * @param charmName Name of the charm
     * @param description Description
     * @param cost Cost in $NOM to apply
     * @param rarity Rarity level (1-5)
     */
    function createCharm(
        string calldata charmName,
        string calldata description,
        uint256 cost,
        uint256 rarity
    ) external onlyOwner {
        require(rarity >= 1 && rarity <= 5, "Invalid rarity");
        require(!charms[charmName].active, "Charm already exists");
        
        charms[charmName] = Charm({
            name: charmName,
            description: description,
            cost: cost,
            rarity: rarity,
            active: true
        });
        
        charmList.push(charmName);
        emit CharmCreated(charmName, cost, rarity);
    }

    /**
     * @dev Update charm cost
     * @param charmName Name of charm
     * @param newCost New cost in $NOM
     */
    function updateCharmCost(string calldata charmName, uint256 newCost) 
        external 
        onlyOwner 
        charmExists(charmName) 
    {
        charms[charmName].cost = newCost;
        emit CharmCostUpdated(charmName, newCost);
    }

    /**
     * @dev Disable a charm
     * @param charmName Name of charm
     */
    function disableCharm(string calldata charmName) external onlyOwner {
        charms[charmName].active = false;
    }

    // ============ Charm Application ============

    /**
     * @dev Apply a charm to a DragN (direct)
     * @param tokenId Token ID to apply charm to
     * @param charmName Name of charm to apply
     */
    function applyCharm(uint256 tokenId, string calldata charmName)
        external
        nonReentrant
        onlyDragNOwner(tokenId)
        charmExists(charmName)
    {
        require(!tokenInfusions[tokenId].hasCharm[charmName], "Charm already applied");
        
        Charm storage charm = charms[charmName];
        uint256 totalCost = charm.cost + charmApplyFee;
        
        // Transfer $NOM
        require(
            nomToken.transferFrom(msg.sender, address(this), totalCost),
            "Transfer failed"
        );
        
        // Apply charm
        tokenInfusions[tokenId].appliedCharms.push(charmName);
        tokenInfusions[tokenId].hasCharm[charmName] = true;
        tokenInfusions[tokenId].charmAppliedAt[charmName] = block.timestamp;
        tokenInfusions[tokenId].totalInfusionsPaid += totalCost;
        tokenInfusions[tokenId].lastInfusionTime = block.timestamp;
        
        // Track user spending
        userSpending[msg.sender] += totalCost;
        totalInfusionValue += totalCost;
        
        emit CharmAttached(tokenId, charmName, totalCost, msg.sender);
    }

    /**
     * @dev Apply charm with EIP-712 signature (gasless)
     * @param user User address
     * @param tokenId Token ID
     * @param charmName Charm name
     * @param deadline Signature deadline
     * @param signature EIP-712 signature
     */
    function applyCharmSigned(
        address user,
        uint256 tokenId,
        string calldata charmName,
        uint256 deadline,
        bytes calldata signature
    )
        external
        nonReentrant
        charmExists(charmName)
    {
        require(block.timestamp <= deadline, "Signature expired");
        require(dragNContract.ownerOf(tokenId) == user, "Not DragN owner");
        require(!tokenInfusions[tokenId].hasCharm[charmName], "Charm already applied");
        
        // Verify signature
        bytes32 digest = _hashApplyCharm(user, tokenId, charmName, userNonce[user], deadline);
        address signer = digest.recover(signature);
        require(signer == user, "Invalid signature");
        
        // Apply charm
        Charm storage charm = charms[charmName];
        uint256 totalCost = charm.cost + charmApplyFee;
        
        require(
            nomToken.transferFrom(user, address(this), totalCost),
            "Transfer failed"
        );
        
        tokenInfusions[tokenId].appliedCharms.push(charmName);
        tokenInfusions[tokenId].hasCharm[charmName] = true;
        tokenInfusions[tokenId].charmAppliedAt[charmName] = block.timestamp;
        tokenInfusions[tokenId].totalInfusionsPaid += totalCost;
        tokenInfusions[tokenId].lastInfusionTime = block.timestamp;
        
        userSpending[user] += totalCost;
        totalInfusionValue += totalCost;
        
        userNonce[user]++;
        
        emit CharmAttached(tokenId, charmName, totalCost, user);
    }

    /**
     * @dev Remove a charm from a DragN (owner only)
     * @param tokenId Token ID
     * @param charmName Charm to remove
     */
    function removeCharm(uint256 tokenId, string calldata charmName)
        external
        onlyOwner
    {
        require(tokenInfusions[tokenId].hasCharm[charmName], "Charm not applied");
        
        tokenInfusions[tokenId].hasCharm[charmName] = false;
        
        // Remove from array
        string[] storage charms_applied = tokenInfusions[tokenId].appliedCharms;
        for (uint i = 0; i < charms_applied.length; i++) {
            if (keccak256(bytes(charms_applied[i])) == keccak256(bytes(charmName))) {
                charms_applied[i] = charms_applied[charms_applied.length - 1];
                charms_applied.pop();
                break;
            }
        }
        
        emit CharmRemoved(tokenId, charmName);
    }

    // ============ Trait Upgrades ============

    /**
     * @dev Upgrade a trait on a DragN
     * @param tokenId Token ID to upgrade
     * @param traitName Name of trait to upgrade
     * @param newValue New trait value
     * @param costMultiplier Cost multiplier (1-5 for rarity scaling)
     */
    function upgradetrait(
        uint256 tokenId,
        string calldata traitName,
        string calldata newValue,
        uint256 costMultiplier
    )
        external
        nonReentrant
        onlyDragNOwner(tokenId)
    {
        require(costMultiplier >= 1 && costMultiplier <= 5, "Invalid multiplier");
        
        uint256 cost = upgradeBaseCost * costMultiplier;
        
        // Transfer $NOM
        require(
            nomToken.transferFrom(msg.sender, address(this), cost),
            "Transfer failed"
        );
        
        // Record upgrade
        tokenInfusions[tokenId].traitUpgrades.push(TraitUpgrade({
            traitName: traitName,
            newValue: newValue,
            cost: cost,
            appliedAt: block.timestamp
        }));
        
        tokenInfusions[tokenId].totalInfusionsPaid += cost;
        tokenInfusions[tokenId].lastInfusionTime = block.timestamp;
        
        userSpending[msg.sender] += cost;
        totalInfusionValue += cost;
        
        emit TraitUpgraded(tokenId, traitName, newValue, cost, msg.sender);
    }

    // ============ Queries ============

    /**
     * @dev Get all charms
     */
    function getAllCharms() external view returns (Charm[] memory) {
        Charm[] memory result = new Charm[](charmList.length);
        for (uint i = 0; i < charmList.length; i++) {
            result[i] = charms[charmList[i]];
        }
        return result;
    }

    /**
     * @dev Get charms applied to a token
     */
    function getTokenCharms(uint256 tokenId) 
        external 
        view 
        returns (string[] memory) 
    {
        return tokenInfusions[tokenId].appliedCharms;
    }

    /**
     * @dev Check if token has a specific charm
     */
    function hasCharm(uint256 tokenId, string calldata charmName) 
        external 
        view 
        returns (bool) 
    {
        return tokenInfusions[tokenId].hasCharm[charmName];
    }

    /**
     * @dev Get trait upgrades for a token
     */
    function getTraitUpgrades(uint256 tokenId) 
        external 
        view 
        returns (TraitUpgrade[] memory) 
    {
        return tokenInfusions[tokenId].traitUpgrades;
    }

    /**
     * @dev Get total infusion data for a token
     */
    function getTokenInfusionData(uint256 tokenId) 
        external 
        view 
        returns (InfusionMetadata memory) 
    {
        TokenInfusion storage infusion = tokenInfusions[tokenId];
        return InfusionMetadata({
            tokenId: tokenId,
            charms: infusion.appliedCharms,
            upgrades: infusion.traitUpgrades,
            totalSpent: infusion.totalInfusionsPaid,
            infusionScore: calculateInfusionScore(tokenId)
        });
    }

    /**
     * @dev Calculate infusion score based on charms and upgrades
     */
    function calculateInfusionScore(uint256 tokenId) 
        public 
        view 
        returns (uint256) 
    {
        uint256 score = 0;
        
        // Score from charms
        for (uint i = 0; i < tokenInfusions[tokenId].appliedCharms.length; i++) {
            string memory charmName = tokenInfusions[tokenId].appliedCharms[i];
            score += charms[charmName].rarity * 10;
        }
        
        // Score from upgrades
        score += tokenInfusions[tokenId].traitUpgrades.length * 5;
        
        return score;
    }

    /**
     * @dev Get user's total $NOM spending
     */
    function getUserSpending(address user) 
        external 
        view 
        returns (uint256) 
    {
        return userSpending[user];
    }

    /**
     * @dev Get user's nonce for EIP-712
     */
    function getNonce(address user) 
        external 
        view 
        returns (uint256) 
    {
        return userNonce[user];
    }

    // ============ Admin Functions ============

    /**
     * @dev Update charm apply fee
     */
    function setCharmApplyFee(uint256 newFee) external onlyOwner {
        charmApplyFee = newFee;
        emit InfusionFeeUpdated(newFee);
    }

    /**
     * @dev Update upgrade base cost
     */
    function setUpgradeBaseCost(uint256 newCost) external onlyOwner {
        upgradeBaseCost = newCost;
    }

    /**
     * @dev Withdraw collected $NOM
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(nomToken.transfer(msg.sender, amount), "Transfer failed");
    }

    // ============ EIP-712 Hashing ============

    function _hashApplyCharm(
        address user,
        uint256 tokenId,
        string calldata charmName,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            keccak256("ApplyCharm(address user,uint256 tokenId,string charmName,uint256 nonce,uint256 deadline)"),
            user,
            tokenId,
            keccak256(bytes(charmName)),
            nonce,
            deadline
        )));
    }
}
