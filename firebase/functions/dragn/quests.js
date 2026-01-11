const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");

const QUEST_DEFINITIONS = {
  daily: [
    {
      id: "breath_fire",
      title: "Breathe Fire",
      description: "Use the Breathe Fire cast action on a rival house.",
      goal: 1,
      reward: { type: "xp", amount: 15 },
    },
    {
      id: "flex_house",
      title: "Flex Your House",
      description: "Share a DragN from your stable.",
      goal: 1,
      reward: { type: "xp", amount: 10 },
    },
  ],
  weekly: [
    {
      id: "recruit",
      title: "Recruit Allies",
      description: "Earn referrals by bringing new players.",
      goal: 3,
      reward: { type: "nom", amount: 500 },
    },
  ],
};

const DEFAULT_BALANCES = { xp: 0, nom: 0 };

const getWeekKey = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // ISO week: Thursday in current week decides the year.
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  const week = weekNo.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}-W${week}`;
};

const periodKey = (period) => {
  const now = new Date();
  if (period === "weekly") {
    return getWeekKey(now);
  }
  return now.toISOString().slice(0, 10);
};

const questIndex = Object.keys(QUEST_DEFINITIONS).reduce((acc, period) => {
  QUEST_DEFINITIONS[period].forEach((quest) => {
    acc[quest.id] = { ...quest, period };
  });
  return acc;
}, {});

const bootstrapPeriods = () => {
  const periods = {};
  Object.keys(QUEST_DEFINITIONS).forEach((period) => {
    const key = periodKey(period);
    periods[period] = {
      key,
      quests: QUEST_DEFINITIONS[period].reduce((map, quest) => {
        map[quest.id] = {
          progress: 0,
          goal: quest.goal,
          claimed: false,
          reward: quest.reward,
          updatedAt: Timestamp.now(),
        };
        return map;
      }, {}),
    };
  });
  return periods;
};

const mergeDefinitions = (state) => {
  const merged = { ...state };
  Object.keys(QUEST_DEFINITIONS).forEach((period) => {
    if (!merged.periods[period]) {
      merged.periods[period] = { key: periodKey(period), quests: {} };
    }
    // Reset when period key changes
    if (merged.periods[period].key !== periodKey(period)) {
      merged.periods[period].key = periodKey(period);
      merged.periods[period].quests = {};
    }
    QUEST_DEFINITIONS[period].forEach((quest) => {
      if (!merged.periods[period].quests[quest.id]) {
        merged.periods[period].quests[quest.id] = {
          progress: 0,
          goal: quest.goal,
          claimed: false,
          reward: quest.reward,
          updatedAt: Timestamp.now(),
        };
      } else {
        const existing = merged.periods[period].quests[quest.id];
        merged.periods[period].quests[quest.id] = {
          progress: Math.min(existing.progress || 0, quest.goal),
          goal: quest.goal,
          claimed: Boolean(existing.claimed),
          reward: quest.reward,
          updatedAt: existing.updatedAt || Timestamp.now(),
        };
      }
    });
  });
  merged.balances = merged.balances || { ...DEFAULT_BALANCES };
  merged.addresses = merged.addresses || [];
  return merged;
};

const toClientPayload = (state) => {
  const quests = [];
  Object.keys(state.periods).forEach((period) => {
    Object.entries(state.periods[period].quests).forEach(([id, details]) => {
      const base = questIndex[id] || { title: id, description: "", goal: details.goal, reward: details.reward };
      const progress = details.progress || 0;
      quests.push({
        id,
        title: base.title,
        description: base.description,
        period,
        goal: details.goal,
        progress,
        reward: details.reward,
        claimed: Boolean(details.claimed),
        claimable: progress >= details.goal && !details.claimed,
        remaining: Math.max(0, (details.goal || 0) - progress),
        updatedAt: details.updatedAt ? details.updatedAt.toDate() : null,
      });
    });
  });
  quests.sort((a, b) => {
    if (a.period === b.period) return a.id.localeCompare(b.id);
    return a.period === "daily" ? -1 : 1;
  });
  return {
    userId: state.userId,
    periods: Object.keys(state.periods).reduce((acc, period) => {
      acc[period] = state.periods[period].key;
      return acc;
    }, {}),
    balances: state.balances || { ...DEFAULT_BALANCES },
    quests,
  };
};

const resolveDoc = async ({ userId, address }) => {
  const db = getFirestore();
  const questsCollection = db.collection("quests");
  const primaryId = userId ? userId.toString() : address;
  let docRef = primaryId ? questsCollection.doc(primaryId.toString()) : null;

  if (docRef) {
    const snapshot = await docRef.get();
    if (snapshot.exists) {
      return { docRef, snapshot };
    }
  }

  if (address) {
    const byAddress = await questsCollection.where("addresses", "array-contains", address.toLowerCase()).limit(1).get();
    if (!byAddress.empty) {
      const first = byAddress.docs[0];
      return { docRef: questsCollection.doc(first.id), snapshot: first };
    }
  }

  if (!docRef) {
    docRef = questsCollection.doc();
  }

  return { docRef, snapshot: null };
};

const loadState = async ({ userId, address }) => {
  const { docRef, snapshot } = await resolveDoc({ userId, address });
  if (!snapshot || !snapshot.exists) {
    const base = {
      userId: userId ? userId.toString() : docRef.id,
      addresses: address ? [address.toLowerCase()] : [],
      periods: bootstrapPeriods(),
      balances: { ...DEFAULT_BALANCES },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    return { docRef, state: base };
  }
  const data = snapshot.data();
  const merged = mergeDefinitions({ ...data, userId: data.userId || docRef.id });
  return { docRef, state: merged };
};

const persistState = async (docRef, state) => {
  await docRef.set({ ...state, updatedAt: Timestamp.now() }, { merge: true });
};

const applyProgress = (state, questId, amount = 1) => {
  const questMeta = questIndex[questId];
  if (!questMeta) return state;
  const periodState = state.periods[questMeta.period];
  if (!periodState) return state;

  const entry = periodState.quests[questId] || {
    progress: 0,
    goal: questMeta.goal,
    claimed: false,
    reward: questMeta.reward,
    updatedAt: Timestamp.now(),
  };
  const progress = Math.min(entry.goal, (entry.progress || 0) + amount);
  periodState.quests[questId] = {
    ...entry,
    progress,
    updatedAt: Timestamp.now(),
  };
  return state;
};

const claimReward = (state, questId) => {
  const questMeta = questIndex[questId];
  if (!questMeta) return state;
  const periodState = state.periods[questMeta.period];
  if (!periodState || !periodState.quests[questId]) return state;
  const quest = periodState.quests[questId];
  if (quest.claimed || quest.progress < quest.goal) return state;

  quest.claimed = true;
  quest.claimedAt = Timestamp.now();

  const { type, amount } = quest.reward || {};
  if (type && typeof amount === "number") {
    const balances = state.balances || { ...DEFAULT_BALANCES };
    const current = balances[type] || 0;
    balances[type] = current + amount;
    state.balances = balances;
  }

  return state;
};

module.exports = {
  QUEST_DEFINITIONS,
  async getUserQuests({ userId, address }) {
    const { docRef, state } = await loadState({ userId, address });
    await persistState(docRef, state);
    return toClientPayload(state);
  },
  async recordEvent({ userId, address, questId, amount = 1 }) {
    const { docRef, state } = await loadState({ userId, address });
    const merged = mergeDefinitions(state);
    if (address) {
      const lower = address.toLowerCase();
      if (!merged.addresses.includes(lower)) {
        merged.addresses.push(lower);
      }
    }
    const updated = applyProgress(merged, questId, amount);
    // Achievements: 10 fire breaths badge
    try {
      if (questId === 'breath_fire') {
        const progress = updated.periods['daily'].quests['breath_fire'].progress;
        const achievements = require('./achievements');
        if (address) {
          await achievements.maybeAwardBreathFire10({ fid: userId, address, progress });
        }
      }
    } catch (e) { /* noop */ }
    await persistState(docRef, updated);
    return toClientPayload(updated);
  },
  async claimQuest({ userId, address, questId }) {
    const { docRef, state } = await loadState({ userId, address });
    const merged = mergeDefinitions(state);
    const claimed = claimReward(merged, questId);
    await persistState(docRef, claimed);
    return toClientPayload(claimed);
  },
};
