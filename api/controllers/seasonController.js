const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { log, error } = require("firebase-functions/logger");

/**
 * Seasonal Wars API Controller
 * Manages seasonal scoring, leaderboards, and prize pools
 */

/**
 * Get current active season
 */
async function getCurrentSeason(req, res) {
    try {
        const db = getFirestore();
        const seasonsRef = db.collection("seasons");
        
        const activeSeasonSnapshot = await seasonsRef
            .where("active", "==", true)
            .where("endTime", ">", new Date())
            .limit(1)
            .get();
        
        if (activeSeasonSnapshot.empty) {
            return res.status(404).json({ error: "No active season" });
        }
        
        const seasonDoc = activeSeasonSnapshot.docs[0];
        const seasonData = seasonDoc.data();
        
        // Get house scores
        const houseScoresSnapshot = await db.collection("seasons")
            .doc(seasonDoc.id)
            .collection("houseScores")
            .get();
        
        const houseScores = {};
        houseScoresSnapshot.forEach(doc => {
            houseScores[doc.id] = doc.data();
        });
        
        return res.json({
            seasonId: seasonDoc.id,
            ...seasonData,
            houseScores: houseScores
        });
    } catch (err) {
        error("Error getting current season:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Get season leaderboard
 */
async function getSeasonLeaderboard(req, res) {
    try {
        const { seasonId } = req.params;
        const db = getFirestore();
        
        let season;
        if (seasonId === "current") {
            const activeSeasonSnapshot = await db.collection("seasons")
                .where("active", "==", true)
                .where("endTime", ">", new Date())
                .limit(1)
                .get();
            
            if (activeSeasonSnapshot.empty) {
                return res.status(404).json({ error: "No active season" });
            }
            season = activeSeasonSnapshot.docs[0];
        } else {
            season = await db.collection("seasons").doc(seasonId).get();
            if (!season.exists) {
                return res.status(404).json({ error: "Season not found" });
            }
        }
        
        const seasonData = season.data();
        
        // Get house scores
        const houseScoresSnapshot = await db.collection("seasons")
            .doc(season.id)
            .collection("houseScores")
            .get();
        
        const leaderboard = [];
        houseScoresSnapshot.forEach(doc => {
            const data = doc.data();
            const multiplier = seasonData.multipliers?.[doc.id] || 1.0;
            const finalScore = Math.floor(data.score * multiplier);
            
            leaderboard.push({
                houseId: parseInt(doc.id),
                houseName: getHouseName(parseInt(doc.id)),
                score: data.score,
                multiplier: multiplier,
                finalScore: finalScore
            });
        });
        
        // Sort by final score descending
        leaderboard.sort((a, b) => b.finalScore - a.finalScore);
        
        return res.json({
            seasonId: season.id,
            startTime: seasonData.startTime,
            endTime: seasonData.endTime,
            prizePool: seasonData.prizePool || 0,
            leaderboard: leaderboard
        });
    } catch (err) {
        error("Error getting season leaderboard:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Create a new season (admin only)
 */
async function createSeason(req, res) {
    try {
        // TODO: Add authentication/authorization check
        const { duration, prizePool, multipliers } = req.body;
        
        if (!duration || duration <= 0) {
            return res.status(400).json({ error: "Invalid duration" });
        }
        
        const db = getFirestore();
        
        // End current active season if exists
        const activeSeasons = await db.collection("seasons")
            .where("active", "==", true)
            .get();
        
        const batch = db.batch();
        activeSeasons.forEach(doc => {
            batch.update(doc.ref, { active: false });
        });
        await batch.commit();
        
        // Create new season
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + duration * 1000);
        
        const newSeason = {
            active: true,
            startTime: startTime,
            endTime: endTime,
            prizePool: prizePool || 0,
            multipliers: multipliers || { 0: 1.0, 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0 },
            createdAt: new Date()
        };
        
        const seasonRef = await db.collection("seasons").add(newSeason);
        
        // Initialize house scores
        for (let i = 0; i < 7; i++) {
            await db.collection("seasons")
                .doc(seasonRef.id)
                .collection("houseScores")
                .doc(i.toString())
                .set({
                    houseId: i,
                    score: 0,
                    lastUpdated: new Date()
                });
        }
        
        log(`New season created: ${seasonRef.id}`);
        
        return res.json({
            seasonId: seasonRef.id,
            ...newSeason
        });
    } catch (err) {
        error("Error creating season:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Update season multiplier (admin only)
 */
async function updateMultiplier(req, res) {
    try {
        // TODO: Add authentication/authorization check
        const { seasonId, houseId, multiplier } = req.body;
        
        if (houseId < 0 || houseId > 6) {
            return res.status(400).json({ error: "Invalid house ID" });
        }
        
        if (multiplier <= 0 || multiplier > 5) {
            return res.status(400).json({ error: "Invalid multiplier (must be 0-5)" });
        }
        
        const db = getFirestore();
        const seasonRef = db.collection("seasons").doc(seasonId);
        
        await seasonRef.update({
            [`multipliers.${houseId}`]: multiplier
        });
        
        log(`Multiplier updated: Season ${seasonId}, House ${houseId}, Multiplier ${multiplier}`);
        
        return res.json({ success: true });
    } catch (err) {
        error("Error updating multiplier:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Get house statistics for a season
 */
async function getHouseStats(req, res) {
    try {
        const { seasonId, houseId } = req.params;
        const db = getFirestore();
        
        // Get season
        const seasonDoc = await db.collection("seasons").doc(seasonId).get();
        if (!seasonDoc.exists) {
            return res.status(404).json({ error: "Season not found" });
        }
        
        // Get house score
        const houseScoreDoc = await db.collection("seasons")
            .doc(seasonId)
            .collection("houseScores")
            .doc(houseId)
            .get();
        
        if (!houseScoreDoc.exists) {
            return res.status(404).json({ error: "House not found" });
        }
        
        // Get recent actions
        const actionsSnapshot = await db.collection("seasons")
            .doc(seasonId)
            .collection("actions")
            .where("houseId", "==", parseInt(houseId))
            .orderBy("timestamp", "desc")
            .limit(100)
            .get();
        
        const actions = [];
        actionsSnapshot.forEach(doc => {
            actions.push(doc.data());
        });
        
        const seasonData = seasonDoc.data();
        const houseData = houseScoreDoc.data();
        const multiplier = seasonData.multipliers?.[houseId] || 1.0;
        
        return res.json({
            houseId: parseInt(houseId),
            houseName: getHouseName(parseInt(houseId)),
            score: houseData.score,
            multiplier: multiplier,
            finalScore: Math.floor(houseData.score * multiplier),
            recentActions: actions.slice(0, 10),
            totalActions: actions.length
        });
    } catch (err) {
        error("Error getting house stats:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Helper function to get house name
 */
function getHouseName(houseId) {
    const houseNames = ["Aqua", "Fire", "Earth", "Air", "Light", "Dark", "Chaos"];
    return houseNames[houseId] || "Unknown";
}

module.exports = {
    getCurrentSeason,
    getSeasonLeaderboard,
    createSeason,
    updateMultiplier,
    getHouseStats
};
