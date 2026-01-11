const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { ethers } = require("ethers");

// Simple frame payload verification using Ethers message signing
function verifyFramePayload(payload) {
  try {
    const { address, message, signature } = payload || {};
    if (!address || !message || !signature) return { valid: false, error: "Missing fields" };
    const recovered = ethers.verifyMessage(message, signature);
    const valid = recovered.toLowerCase() === address.toLowerCase();
    return { valid, recovered };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

class ReferralsController {
  // POST /api/referrals/submit
  static async submitReferral(req, res) {
    try {
      const db = getFirestore();
      const { referrerFid, refereeFid, context, payload, meta } = req.body;

      if (!referrerFid || !refereeFid) {
        return res.status(400).json({ success: false, error: "referrerFid and refereeFid are required" });
      }
      if (String(referrerFid) === String(refereeFid)) {
        return res.status(400).json({ success: false, error: "Self-referral not allowed" });
      }

      const verification = verifyFramePayload(payload || {});
      const proofId = ethers.id(JSON.stringify({ referrerFid, refereeFid, context, payload }));

      // Check duplicate proofs
      const proofDoc = await db.collection("referral_proofs").doc(proofId).get();
      if (proofDoc.exists) {
        return res.status(409).json({ success: false, error: "Duplicate referral proof" });
      }

      // Store proof regardless, with validity flag
      await db.collection("referral_proofs").doc(proofId).set({
        referrerFid: String(referrerFid),
        refereeFid: String(refereeFid),
        context: context || "frame",
        payload,
        meta: meta || {},
        valid: !!verification.valid,
        recovered: verification.recovered || null,
        timestamp: new Date()
      });

      if (!verification.valid) {
        return res.status(400).json({ success: false, error: "Invalid frame payload signature" });
      }

      // Update referrals collection (per-referrer aggregate)
      const referrerDoc = db.collection("referrals").doc(String(referrerFid));
      await referrerDoc.set({
        count: FieldValue.increment(1),
        members: FieldValue.arrayUnion(String(refereeFid)),
        lastUpdated: new Date()
      }, { merge: true });

      // Update squads collection for richer view
      const squadDoc = db.collection("squads").doc(String(referrerFid));
      await squadDoc.set({
        referrerFid: String(referrerFid),
        members: FieldValue.arrayUnion(String(refereeFid)),
        buffs: FieldValue.arrayUnion({ type: "recruit", target: "both", amount: 5, unit: "xp", appliedAt: new Date() }),
        loot: FieldValue.arrayUnion({ type: "starter_pack", to: String(refereeFid), grantedAt: new Date() })
      }, { merge: true });

      // Grant buffs/loot to both referrer and referee
      const buffDocRef = db.collection("buffs").doc(String(referrerFid));
      await buffDocRef.set({ items: FieldValue.arrayUnion({ type: "recruit", amount: 5, unit: "xp", expiresAt: null, grantedBy: String(refereeFid) }) }, { merge: true });
      const buffDocRef2 = db.collection("buffs").doc(String(refereeFid));
      await buffDocRef2.set({ items: FieldValue.arrayUnion({ type: "recruit", amount: 5, unit: "xp", expiresAt: null, grantedBy: String(referrerFid) }) }, { merge: true });

      return res.json({ success: true, proofId });
    } catch (err) {
      console.error("submitReferral error", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/referrals/user/:fid
  static async getUserReferrals(req, res) {
    try {
      const db = getFirestore();
      const { fid } = req.params;
      const refDoc = await db.collection("referrals").doc(String(fid)).get();
      const buffsDoc = await db.collection("buffs").doc(String(fid)).get();

      const data = {
        fid: String(fid),
        count: refDoc.exists ? (refDoc.data().count || 0) : 0,
        members: refDoc.exists ? (refDoc.data().members || []) : [],
        buffs: buffsDoc.exists ? (buffsDoc.data().items || []) : []
      };
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/referrals/squad/:referrerFid
  static async getSquad(req, res) {
    try {
      const db = getFirestore();
      const { referrerFid } = req.params;
      const doc = await db.collection("squads").doc(String(referrerFid)).get();
      const data = doc.exists ? doc.data() : { referrerFid: String(referrerFid), members: [], buffs: [], loot: [] };
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/referrals/leaderboard
  static async getLeaderboard(req, res) {
    try {
      const db = getFirestore();
      const limit = parseInt(req.query.limit || 10);
      const snap = await db.collection("referrals").orderBy("count", "desc").limit(limit).get();
      const leaders = [];
      snap.forEach(doc => {
        const d = doc.data();
        leaders.push({ referrerFid: doc.id, username: d.username, count: d.count || 0, members: d.members || [] });
      });
      return res.json({ success: true, leaders });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/referrals/redeem
  static async redeem(req, res) {
    try {
      const db = getFirestore();
      const { fid, type } = req.body;
      if (!fid || !type) return res.status(400).json({ success: false, error: "fid and type required" });

      // Mark a loot item as redeemed
      const lootDoc = db.collection("loot").doc(String(fid));
      await lootDoc.set({ items: FieldValue.arrayUnion({ type, redeemedAt: new Date() }) }, { merge: true });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = ReferralsController;
