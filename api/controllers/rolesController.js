const { getFirestore } = require("firebase-admin/firestore");
const { log, error } = require("firebase-functions/logger");

/**
 * House Roles & Loadouts API Controller
 * Manages DragN role assignments and loadout configurations
 */

/**
 * Get DragN role and loadout information
 */
async function getDragNRole(req, res) {
    try {
        const { tokenId } = req.params;
        const db = getFirestore();

        const roleDoc = await db
            .collection("dragn_roles")
            .doc(tokenId)
            .get();

        if (!roleDoc.exists) {
            return res.status(404).json({ error: "DragN not found" });
        }

        const data = roleDoc.data();
        const roleNames = ["Unassigned", "Scout", "Defender", "Support"];

        return res.json({
            tokenId: tokenId,
            role: roleNames[data.role] || "Unknown",
            roleId: data.role,
            houseId: data.houseId,
            assignedAt: data.assignedAt,
            modifiers: data.modifiers || {},
        });
    } catch (err) {
        error("Error getting DragN role:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Get user's loadout
 */
async function getUserLoadout(req, res) {
    try {
        const { userId } = req.params;
        const db = getFirestore();

        const loadoutDoc = await db
            .collection("user_loadouts")
            .doc(userId)
            .get();

        if (!loadoutDoc.exists) {
            return res.json({
                userId: userId,
                loadout: [],
                dragns: [],
                stats: {
                    totalAttack: 0,
                    totalDefense: 0,
                    totalRecruit: 0,
                },
            });
        }

        const data = loadoutDoc.data();
        const roleNames = ["Unassigned", "Scout", "Defender", "Support"];

        // Get detailed DragN info
        const dragns = [];
        for (const tokenId of data.tokenIds || []) {
            const dragNDoc = await db
                .collection("dragn_roles")
                .doc(tokenId.toString())
                .get();

            if (dragNDoc.exists) {
                const dragNData = dragNDoc.data();
                dragns.push({
                    tokenId: tokenId,
                    role: roleNames[dragNData.role] || "Unknown",
                    roleId: dragNData.role,
                    houseId: dragNData.houseId,
                    modifiers: dragNData.modifiers || {},
                });
            }
        }

        // Calculate aggregate stats
        const stats = {
            totalAttack: 0,
            totalDefense: 0,
            totalRecruit: 0,
        };

        dragns.forEach((dragn) => {
            stats.totalAttack += dragn.modifiers.attackMultiplier || 1.0;
            stats.totalDefense += dragn.modifiers.defenseMultiplier || 1.0;
            stats.totalRecruit += dragn.modifiers.recruitMultiplier || 1.0;
        });

        return res.json({
            userId: userId,
            loadout: data.tokenIds || [],
            dragns: dragns,
            stats: {
                totalAttack: (stats.totalAttack / dragns.length).toFixed(2),
                totalDefense: (stats.totalDefense / dragns.length).toFixed(2),
                totalRecruit: (stats.totalRecruit / dragns.length).toFixed(2),
                dragnsActive: dragns.length,
            },
            lastUpdated: data.lastUpdated,
        });
    } catch (err) {
        error("Error getting user loadout:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Assign role to a DragN
 */
async function assignRole(req, res) {
    try {
        const { tokenId, roleId, houseId } = req.body;

        if (!tokenId || roleId === undefined || !houseId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (roleId < 0 || roleId > 3) {
            return res.status(400).json({ error: "Invalid role ID (0-3)" });
        }

        const db = getFirestore();
        const roleNames = ["Unassigned", "Scout", "Defender", "Support"];

        // Get default modifiers for role
        const roleModifiers = {
            0: { attackMultiplier: 1.0, defenseMultiplier: 1.0, recruitMultiplier: 1.0 },
            1: { attackMultiplier: 1.5, defenseMultiplier: 0.8, recruitMultiplier: 0.8 },
            2: { attackMultiplier: 0.8, defenseMultiplier: 1.5, recruitMultiplier: 0.8 },
            3: { attackMultiplier: 0.8, defenseMultiplier: 0.8, recruitMultiplier: 1.5 },
        };

        await db
            .collection("dragn_roles")
            .doc(tokenId.toString())
            .set({
                tokenId: tokenId,
                role: roleId,
                roleName: roleNames[roleId],
                houseId: houseId,
                modifiers: roleModifiers[roleId],
                assignedAt: new Date(),
                lastModified: new Date(),
            });

        log(`Role assigned: Token ${tokenId} -> ${roleNames[roleId]} (House ${houseId})`);

        return res.json({
            success: true,
            tokenId: tokenId,
            role: roleNames[roleId],
            roleId: roleId,
            houseId: houseId,
            modifiers: roleModifiers[roleId],
        });
    } catch (err) {
        error("Error assigning role:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Update user's loadout
 */
async function updateLoadout(req, res) {
    try {
        const { userId } = req.params;
        const { tokenIds } = req.body;

        if (!Array.isArray(tokenIds) || tokenIds.length === 0 || tokenIds.length > 5) {
            return res.status(400).json({ error: "Invalid loadout (1-5 DragNs)" });
        }

        const db = getFirestore();

        // Verify all tokens have roles
        for (const tokenId of tokenIds) {
            const roleDoc = await db
                .collection("dragn_roles")
                .doc(tokenId.toString())
                .get();

            if (!roleDoc.exists || roleDoc.data().role === 0) {
                return res.status(400).json({
                    error: `DragN ${tokenId} has no role assigned`,
                });
            }
        }

        // Update loadout
        await db
            .collection("user_loadouts")
            .doc(userId)
            .set({
                userId: userId,
                tokenIds: tokenIds,
                lastUpdated: new Date(),
                dragNCount: tokenIds.length,
            });

        log(`Loadout updated for user ${userId}: ${tokenIds.length} DragNs`);

        // Calculate stats
        let totalAttack = 0,
            totalDefense = 0,
            totalRecruit = 0;
        for (const tokenId of tokenIds) {
            const roleDoc = await db
                .collection("dragn_roles")
                .doc(tokenId.toString())
                .get();

            if (roleDoc.exists) {
                const mods = roleDoc.data().modifiers;
                totalAttack += mods.attackMultiplier || 1.0;
                totalDefense += mods.defenseMultiplier || 1.0;
                totalRecruit += mods.recruitMultiplier || 1.0;
            }
        }

        return res.json({
            success: true,
            userId: userId,
            loadout: tokenIds,
            dragNCount: tokenIds.length,
            stats: {
                avgAttack: (totalAttack / tokenIds.length).toFixed(2),
                avgDefense: (totalDefense / tokenIds.length).toFixed(2),
                avgRecruit: (totalRecruit / tokenIds.length).toFixed(2),
            },
        });
    } catch (err) {
        error("Error updating loadout:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Get role statistics
 */
async function getRoleStats(req, res) {
    try {
        const db = getFirestore();

        // Count roles
        const rolesSnapshot = await db.collection("dragn_roles").get();

        const stats = {
            0: { name: "Unassigned", count: 0 },
            1: { name: "Scout", count: 0 },
            2: { name: "Defender", count: 0 },
            3: { name: "Support", count: 0 },
        };

        rolesSnapshot.forEach((doc) => {
            const role = doc.data().role;
            if (stats[role]) {
                stats[role].count++;
            }
        });

        // Count loaded DragNs
        const loadoutsSnapshot = await db.collection("user_loadouts").get();
        let totalLoaded = 0;
        let usersWithLoadout = 0;

        loadoutsSnapshot.forEach((doc) => {
            const data = doc.data();
            totalLoaded += data.tokenIds?.length || 0;
            usersWithLoadout++;
        });

        return res.json({
            totalRoles: rolesSnapshot.size,
            roleDistribution: stats,
            loadoutStats: {
                usersWithLoadout: usersWithLoadout,
                totalLoadedDragNs: totalLoaded,
                avgDragNsPerUser: usersWithLoadout > 0 ? (totalLoaded / usersWithLoadout).toFixed(2) : 0,
            },
        });
    } catch (err) {
        error("Error getting role stats:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Get available roles and modifiers
 */
async function getAvailableRoles(req, res) {
    try {
        const roles = [
            {
                id: 0,
                name: "Unassigned",
                description: "No special abilities",
                modifiers: {
                    attackMultiplier: 1.0,
                    defenseMultiplier: 1.0,
                    recruitMultiplier: 1.0,
                },
            },
            {
                id: 1,
                name: "Scout",
                description: "Fast striker - High attack, reduced defense",
                modifiers: {
                    attackMultiplier: 1.5,
                    defenseMultiplier: 0.8,
                    recruitMultiplier: 0.8,
                },
            },
            {
                id: 2,
                name: "Defender",
                description: "Tank - High defense, reduced attack",
                modifiers: {
                    attackMultiplier: 0.8,
                    defenseMultiplier: 1.5,
                    recruitMultiplier: 0.8,
                },
            },
            {
                id: 3,
                name: "Support",
                description: "Team player - High recruitment, reduced combat",
                modifiers: {
                    attackMultiplier: 0.8,
                    defenseMultiplier: 0.8,
                    recruitMultiplier: 1.5,
                },
            },
        ];

        return res.json({
            availableRoles: roles,
            maxLoadoutSize: 5,
        });
    } catch (err) {
        error("Error getting available roles:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getDragNRole,
    getUserLoadout,
    assignRole,
    updateLoadout,
    getRoleStats,
    getAvailableRoles,
};
