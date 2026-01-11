// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title DragNRoles
 * @dev Off-chain role registry with signed actions for role assignment
 * Lightweight contract supporting scout/defender/support loadouts
 */
contract DragNRoles is Ownable, EIP712 {
    using ECDSA for bytes32;

    // Role types
    enum Role {
        UNASSIGNED,
        SCOUT,
        DEFENDER,
        SUPPORT
    }

    // Action modifiers for each role
    struct RoleModifiers {
        uint256 attackMultiplier;      // basis points (10000 = 1x)
        uint256 defenseMultiplier;     // basis points
        uint256 recruitMultiplier;     // basis points
        uint256 actionCost;            // gas cost multiplier
    }

    // DragN loadout (tokenId => role)
    mapping(uint256 => Role) public dragNRole;
    mapping(uint256 => uint256) public dragNHouse; // tokenId => houseId

    // Role modifiers for each role type
    mapping(uint8 => RoleModifiers) public roleModifiers;

    // User role assignments (userId => array of loaded tokenIds)
    mapping(address => uint256[]) public userLoadout;
    mapping(address => mapping(uint256 => bool)) public isLoaded;

    // Action nonce for signature verification
    mapping(address => uint256) public actionNonce;

    // Events
    event RoleAssigned(uint256 indexed tokenId, uint8 role, address indexed assignedBy);
    event RoleRemoved(uint256 indexed tokenId, address indexed removedBy);
    event LoadoutUpdated(address indexed user, uint256[] loadout);
    event ModifiersUpdated(uint8 indexed role, uint256 attack, uint256 defense, uint256 recruit);
    event SignedActionExecuted(address indexed signer, uint256 nonce, bytes action);

    // Type hash for EIP-712
    bytes32 public constant ASSIGN_ROLE_TYPEHASH =
        keccak256("AssignRole(address user,uint256 tokenId,uint8 role,uint256 houseId,uint256 nonce,uint256 deadline)");

    bytes32 public constant UPDATE_LOADOUT_TYPEHASH =
        keccak256("UpdateLoadout(address user,uint256[] tokenIds,uint256 nonce,uint256 deadline)");

    constructor() EIP712("DragNRoles", "1") {
        // Initialize default modifiers for each role
        roleModifiers[0] = RoleModifiers(10000, 10000, 10000, 10000); // UNASSIGNED (1x all)
        roleModifiers[1] = RoleModifiers(15000, 8000, 8000, 10000);   // SCOUT (1.5x atk, 0.8x def)
        roleModifiers[2] = RoleModifiers(8000, 15000, 8000, 10000);   // DEFENDER (0.8x atk, 1.5x def)
        roleModifiers[3] = RoleModifiers(8000, 8000, 15000, 10000);   // SUPPORT (1.5x recruit)
    }

    /**
     * @dev Assign role to a DragN via signed message
     */
    function assignRoleSigned(
        address user,
        uint256 tokenId,
        uint8 roleId,
        uint256 houseId,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(block.timestamp <= deadline, "Signature expired");
        require(roleId <= 3, "Invalid role");

        // Verify signature
        bytes32 domainSeparator = _domainSeparatorV4();
        bytes32 structHash = keccak256(
            abi.encode(
                ASSIGN_ROLE_TYPEHASH,
                user,
                tokenId,
                roleId,
                houseId,
                actionNonce[user],
                deadline
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        address signer = digest.recover(signature);

        require(signer == user || signer == owner(), "Invalid signature");

        // Increment nonce
        actionNonce[user]++;

        // Assign role
        dragNRole[tokenId] = Role(roleId);
        dragNHouse[tokenId] = houseId;

        emit RoleAssigned(tokenId, roleId, signer);
    }

    /**
     * @dev Assign role directly (owner/authorized only)
     */
    function assignRole(uint256 tokenId, uint8 roleId, uint256 houseId) external onlyOwner {
        require(roleId <= 3, "Invalid role");
        dragNRole[tokenId] = Role(roleId);
        dragNHouse[tokenId] = houseId;

        emit RoleAssigned(tokenId, roleId, msg.sender);
    }

    /**
     * @dev Remove role from DragN
     */
    function removeRole(uint256 tokenId) external {
        require(dragNRole[tokenId] != Role.UNASSIGNED, "No role assigned");

        // Remove from loadout if loaded
        if (isLoaded[msg.sender][tokenId]) {
            _removeFromLoadout(msg.sender, tokenId);
        }

        dragNRole[tokenId] = Role.UNASSIGNED;
        delete dragNHouse[tokenId];

        emit RoleRemoved(tokenId, msg.sender);
    }

    /**
     * @dev Update user's active loadout via signed message
     */
    function updateLoadoutSigned(
        address user,
        uint256[] calldata tokenIds,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(block.timestamp <= deadline, "Signature expired");
        require(tokenIds.length <= 5, "Max 5 DragNs per loadout");

        // Verify signature
        bytes32 domainSeparator = _domainSeparatorV4();
        bytes32 structHash = keccak256(
            abi.encode(
                UPDATE_LOADOUT_TYPEHASH,
                user,
                keccak256(abi.encodePacked(tokenIds)),
                actionNonce[user],
                deadline
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        address signer = digest.recover(signature);

        require(signer == user || signer == owner(), "Invalid signature");

        // Increment nonce
        actionNonce[user]++;

        // Clear existing loadout
        uint256[] memory oldLoadout = userLoadout[user];
        for (uint256 i = 0; i < oldLoadout.length; i++) {
            isLoaded[user][oldLoadout[i]] = false;
        }

        // Set new loadout
        userLoadout[user] = tokenIds;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(dragNRole[tokenIds[i]] != Role.UNASSIGNED, "DragN has no role");
            isLoaded[user][tokenIds[i]] = true;
        }

        emit LoadoutUpdated(user, tokenIds);
    }

    /**
     * @dev Update user's active loadout directly
     */
    function updateLoadout(address user, uint256[] calldata tokenIds) external onlyOwner {
        require(tokenIds.length <= 5, "Max 5 DragNs per loadout");

        // Clear existing loadout
        uint256[] memory oldLoadout = userLoadout[user];
        for (uint256 i = 0; i < oldLoadout.length; i++) {
            isLoaded[user][oldLoadout[i]] = false;
        }

        // Set new loadout
        userLoadout[user] = tokenIds;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(dragNRole[tokenIds[i]] != Role.UNASSIGNED, "DragN has no role");
            isLoaded[user][tokenIds[i]] = true;
        }

        emit LoadoutUpdated(user, tokenIds);
    }

    /**
     * @dev Internal function to remove DragN from loadout
     */
    function _removeFromLoadout(address user, uint256 tokenId) internal {
        uint256[] storage loadout = userLoadout[user];
        for (uint256 i = 0; i < loadout.length; i++) {
            if (loadout[i] == tokenId) {
                loadout[i] = loadout[loadout.length - 1];
                loadout.pop();
                isLoaded[user][tokenId] = false;
                break;
            }
        }
    }

    /**
     * @dev Update role modifiers
     */
    function setRoleModifiers(
        uint8 roleId,
        uint256 attackMult,
        uint256 defenseMult,
        uint256 recruitMult
    ) external onlyOwner {
        require(roleId <= 3, "Invalid role");
        require(attackMult > 0 && defenseMult > 0 && recruitMult > 0, "Invalid multiplier");
        require(attackMult <= 30000 && defenseMult <= 30000 && recruitMult <= 30000, "Multiplier too high");

        roleModifiers[roleId] = RoleModifiers(
            attackMult,
            defenseMult,
            recruitMult,
            10000
        );

        emit ModifiersUpdated(roleId, attackMult, defenseMult, recruitMult);
    }

    /**
     * @dev Get role for a DragN
     */
    function getDragNRole(uint256 tokenId) external view returns (uint8) {
        return uint8(dragNRole[tokenId]);
    }

    /**
     * @dev Get house for a DragN
     */
    function getDragNHouse(uint256 tokenId) external view returns (uint256) {
        return dragNHouse[tokenId];
    }

    /**
     * @dev Get user's active loadout
     */
    function getUserLoadout(address user) external view returns (uint256[] memory) {
        return userLoadout[user];
    }

    /**
     * @dev Check if DragN is loaded
     */
    function isLoadedDragN(address user, uint256 tokenId) external view returns (bool) {
        return isLoaded[user][tokenId];
    }

    /**
     * @dev Get modifiers for a role
     */
    function getRoleModifiers(uint8 roleId) external view returns (RoleModifiers memory) {
        require(roleId <= 3, "Invalid role");
        return roleModifiers[roleId];
    }

    /**
     * @dev Calculate action result with role modifier
     */
    function applyRoleModifier(
        uint256 baseValue,
        uint256 tokenId,
        string memory actionType
    ) external view returns (uint256) {
        Role role = dragNRole[tokenId];
        RoleModifiers memory mods = roleModifiers[uint8(role)];

        bytes32 actionHash = keccak256(abi.encodePacked(actionType));

        if (actionHash == keccak256(abi.encodePacked("attack"))) {
            return (baseValue * mods.attackMultiplier) / 10000;
        } else if (actionHash == keccak256(abi.encodePacked("defense"))) {
            return (baseValue * mods.defenseMultiplier) / 10000;
        } else if (actionHash == keccak256(abi.encodePacked("recruit"))) {
            return (baseValue * mods.recruitMultiplier) / 10000;
        }

        return baseValue;
    }

    /**
     * @dev Get nonce for EIP-712 signing
     */
    function getNonce(address user) external view returns (uint256) {
        return actionNonce[user];
    }
}
