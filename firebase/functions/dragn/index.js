const {getStorage} = require("firebase-admin/storage");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {
  log,
  info,
  debug,
  warn,
  error,
  write,
} = require("firebase-functions/logger");

const express = require("express");
const api = express();
const cors = require("cors");
const sharp = require("sharp");
const fetch = require("node-fetch");

api.use(express.json({ limit: "1mb" }));

// Basic anti-abuse heuristics
const RATE_WINDOW_MS = 60 * 1000;
const IP_LIMIT = 80; // per minute
const FID_LIMIT = 40; // per minute
const repCache = new Map();
const ipHits = new Map();
const fidHits = new Map();
const abuseStats = { limited: 0, reputationBlocks: 0 };

const nowMs = () => Date.now();
const sweep = (bucket, now) => {
  for (const [key, entries] of bucket.entries()) {
    bucket.set(key, entries.filter((t) => now - t < RATE_WINDOW_MS));
    if (bucket.get(key).length === 0) bucket.delete(key);
  }
};

const hit = (bucket, key, limit) => {
  const now = nowMs();
  const arr = bucket.get(key) || [];
  const fresh = arr.filter((t) => now - t < RATE_WINDOW_MS);
  fresh.push(now);
  bucket.set(key, fresh);
  return fresh.length <= limit;
};

const getClientIp = (req) => {
  const xf = req.headers["x-forwarded-for"];
  if (xf) return xf.split(",")[0].trim();
  return req.headers["fastly-client-ip"] || req.ip || "unknown";
};

const getFid = (req) => {
  return req.body?.untrustedData?.fid || req.body?.data?.fid || req.params?.fid || req.query?.fid;
};

async function reputationGuard(req, res, next) {
  const fid = getFid(req);
  if (!fid || !process.env.NEYNAR_API_KEY) return next();
  const cache = repCache.get(fid);
  const now = nowMs();
  if (cache && now - cache.ts < 5 * 60 * 1000) {
    if (!cache.ok) {
      abuseStats.reputationBlocks += 1;
      return res.status(403).json({ success: false, error: "Low reputation" });
    }
    return next();
  }

  try {
    const resp = await fetch(`https://api.neynar.com/v2/farcaster/user?fid=${fid}`, {
      headers: { accept: "application/json", api_key: process.env.NEYNAR_API_KEY }
    });
    const body = await resp.json();
    const user = body?.result?.user || {};
    const score =
      (user.power_badge ? 1 : 0) +
      ((user.verifications || []).length > 0 ? 1 : 0) +
      (user.follower_count > 50 ? 1 : 0);
    const ok = score >= 1;
    repCache.set(fid, { ok, ts: now });
    if (!ok) {
      abuseStats.reputationBlocks += 1;
      return res.status(403).json({ success: false, error: "Reputation too low" });
    }
  } catch (err) {
    console.warn("reputationGuard error", err.message);
  }
  return next();
}

function rateGuard(req, res, next) {
  const now = nowMs();
  sweep(ipHits, now);
  sweep(fidHits, now);

  const ip = getClientIp(req);
  if (!hit(ipHits, ip, IP_LIMIT)) {
    abuseStats.limited += 1;
    return res.status(429).json({ success: false, error: "Rate limited (ip)" });
  }

  const fid = getFid(req);
  if (fid && !hit(fidHits, fid, FID_LIMIT)) {
    abuseStats.limited += 1;
    return res.status(429).json({ success: false, error: "Rate limited (fid)" });
  }

  return next();
}

api.use(rateGuard);
api.use(reputationGuard);
api.use(cors({ origin: true }));

const util = require("./util");
const actions = require("./actions");
const quests = require("./quests");

const questFrameIdentity = (req) => {
  const fid = req.body?.untrustedData?.fid || req.query?.fid || req.body?.fid;
  const address = req.body?.untrustedData?.address || req.query?.address || req.body?.address;
  return { fid: fid ? fid.toString() : null, address };
};

const questTextFromPayload = (payload, note) => {
  if (!payload) return "Quest board ready. Tap Refresh with Farcaster to load progress.";
  const lines = [];
  const daily = payload.quests.filter((q) => q.period === "daily");
  const weekly = payload.quests.filter((q) => q.period === "weekly");
  const claimable = payload.quests.filter((q) => q.claimable);
  const formatRow = (qs) => qs.map((q) => `${q.title.split(" ")[0]} ${q.progress}/${q.goal}${q.claimed ? " ✓" : q.claimable ? " !" : ""}`).join("  ·  ") || "None";
  lines.push(`FID ${payload.userId || "unknown"}`);
  lines.push(`Daily: ${formatRow(daily)}`);
  lines.push(`Weekly: ${formatRow(weekly)}`);
  lines.push(`Claimable: ${claimable.length} · XP ${payload.balances?.xp || 0} · NOM ${payload.balances?.nom || 0}`);
  if (note) lines.push(note);
  return lines.join("\n");
};

const renderQuestFrame = async ({ fid, address, claim }) => {
  let payload = null;
  let actionNote = "";
  let claimableBefore = 0;
  try {
    if (fid) {
      let preClaim = null;
      if (claim) {
        preClaim = await quests.getUserQuests({ userId: fid, address });
        claimableBefore = (preClaim.quests || []).filter((q) => q.claimable).length;
      }
      payload = claim
        ? await quests.claimQuest({ userId: fid, address })
        : await quests.getUserQuests({ userId: fid, address });
      if (claim) {
        const before = claimableBefore;
        const after = (payload?.quests || []).filter((q) => q.claimable).length;
        actionNote = before > after ? "Rewards claimed" : "Nothing ready to claim yet";
      }
    }
  } catch (err) {
    actionNote = `Error: ${err.message}`;
  }

  const text = questTextFromPayload(payload, actionNote);
  const claimableCount = payload
    ? Math.max((payload.quests || []).filter((q) => q.claimable).length, claimableBefore)
    : claimableBefore;
  const frame = {
    id: "Quest Board",
    square: true,
    postUrl: `https://api.dragnpuff.xyz/api/frames/quests`,
    image: `https://frm.lol/api/dragnpuff/frimg/bg4/${encodeURIComponent(text)}.png`,
    buttons: [
      { label: "Refresh", action: "post" },
      { label: claimableCount ? `Claim (${claimableCount})` : "Claim", action: "post", postUrl: `https://api.dragnpuff.xyz/api/frames/quests/claim` },
      { label: "Open Board", action: "link", target: `https://dragnpuff.xyz/quests` }
    ]
  };
  return frame;
};

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
};

module.exports.processMint = async function(message) {
  return new Promise(async function(resolve, reject) {
      log("PS: processMint message", message.json);
      const state = message.json;
      // get user from contractAddress
      var text = `DragN'Puff #${state.tokenId} was minted by @${state.username}`;
      const quoteCast =             {
        "cast_id": {
          "fid": 309710,
          "hash": "0x1d6df6f73f53635cf53f33d5c53d8feeb66edc4c",
        }
      };
      var frameURL = `https://dragnpuff.xyz/token/${state.tokenId}`;
      const cast = {
          "embeds": [
            {
              "url": frameURL,
            }
          ],
          "text": text,
          "signer_uuid": process.env.MINBOT_UUID,
          "channel_id": "nomadicframe"
      };
      log("cast", cast);
      // save it to firestore
      const db = getFirestore();
      const castRef = db.collection('casts').doc(state.contractAddress + state.tokenId);
      // does it exist?
      const doc = await castRef.get();
      if (doc.exists) {
          return 1;
      } else {
          await castRef.set(cast);
          await util.sendCast(cast);
      }
      return 1;
  }); // return promise
};

module.exports.processReferral = async function(message) {
  return new Promise(async function(resolve, reject) {
      log("PS: processReferral message", message.json);
      const state = message.json;
      // get user from contractAddress
      // fecth https://frm.lol/api/dragns/:castFid/:round/:fid
      const castFid = state.castFid;
      const round = state.round;
      const fid = state.fid;
      const tokenId = state.tokenId;
      // get User from fid
      const user = await util.getFCUserbyFid(castFid);
      // get firestore docRef for /referrals/:castFid
      const db = getFirestore();
      const docRef = db.collection("referrals").doc(castFid.toString());
      // set with merge true
      await docRef.set(
          {
            username: user.username,
            count: FieldValue.increment(1),
            tokenIds: FieldValue.arrayUnion(tokenId)
          },
          { merge: true }
      );
      await quests.recordEvent({ userId: castFid.toString(), questId: "recruit" });
      const response = await fetch(`https://frm.lol/api/dragns/${castFid}/${round}/${fid}`);
      const referral = await response.json();
      log("referral", referral);
      return 1;
  }); // return promise
}; // processReferral

api.get(['/testing'], async function (req, res) {
  console.log("start GET /testing path", req.path);
  //res.set('Cache-Control', 'public, max-age=60, s-maxage=120');
  //res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.json({ message: 'Hello DragNs' });
  //}
}); // GET /testing

api.get(['/api/ops/abuse'], async function (req, res) {
  const snapshot = {
    ipBuckets: ipHits.size,
    fidBuckets: fidHits.size,
    limited: abuseStats.limited,
    reputationBlocks: abuseStats.reputationBlocks,
  };
  res.json({ success: true, data: snapshot });
});

// Quest engine endpoints
api.get(['/api/quests/:userId'], async function (req, res) {
  try {
    const { userId } = req.params;
    const { address } = req.query;
    const data = await quests.getUserQuests({ userId, address });
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

api.post(['/api/quests/:userId/progress'], async function (req, res) {
  try {
    const { userId } = req.params;
    const { questId, amount, address } = req.body;
    const data = await quests.recordEvent({ userId, questId, amount: amount || 1, address });
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

api.post(['/api/quests/:userId/claim'], async function (req, res) {
  try {
    const { userId } = req.params;
    const { questId, address } = req.body;
    const data = await quests.claimQuest({ userId, questId, address });
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

api.get(['/api/frames/top', '/api/frames/top/:fid'], async function (req, res) {
  console.log("start GET /api/frames/top path", req.path);
  const fid = req.params.fid;
  var frame = {};
  frame.id = "Top DragNs";
  frame.square = true;
  frame.postUrl = `https://api.dragnpuff.xyz/api/frames/top`;
  if (fid) {
    frame.postUrl = `https://api.dragnpuff.xyz/api/frames/top/${fid}`;
  }
  // get top dragns from firestore referrals collection by count descending
  const db = getFirestore();
  const query = db.collection("referrals").orderBy("count", "desc").limit(7);
  const querySnapshot = await query.get();
  var frameText = "Top DragNs\n";
  var rank = 1;
  const team = ["8685", "375831", "355110", "309710"];
  querySnapshot.forEach((doc) => {
    if (team.includes(doc.id)) {
      // no-op
    } else {
      frameText += `#${rank} - ${doc.data().username} (${doc.data().count - 1})\n`;
      rank++;
    }
  });
  frame.imageText = frameText;
  frame.image = `https://frm.lol/api/dragnpuff/frimg/bg2/${encodeURIComponent(frame.imageText)}.png`;
  delete frame.imageText;
  const html = await util.frameHTML(frame);
  res.send(html);
}); // GET /api/frames/top

api.get(['/api/frames/badges', '/badges'], async function (req, res) {
  console.log("start GET /api/frames/badges path", req.path);
  var frame = {};
  frame.id = "Your Badges";
  frame.square = true;
  frame.postUrl = `https://api.dragnpuff.xyz/api/frames/badges`;
  frame.image = `https://api.dragnpuff.xyz/img/badges.png`;
  frame.buttons = [
    { label: "View", action: "post" },
    { label: "Recruit", action: "link", target: `https://dragnpuff.xyz/recruit` }
  ];
  const html = await util.frameHTML(frame);
  res.send(html);
}); // GET /api/frames/badges

api.post(['/api/frames/badges'], async function (req, res) {
  console.log("start POST /api/frames/badges path", req.path);
  // Simple echo frame; further implementation can fetch badges by address
  var frame = { id: 'Your Badges', square: true };
  frame.imageText = "Badges coming in hot!";
  frame.image = `https://frm.lol/api/dragnpuff/frimg/${encodeURIComponent(frame.imageText)}.png`;
  delete frame.imageText;
  const html = await util.frameHTML(frame);
  res.send(html);
}); // POST /api/frames/badges

// Quest Board frame
api.get(['/api/frames/quests', '/quests'], async function (req, res) {
  console.log("start GET /api/frames/quests path", req.path);
  const { fid, address } = questFrameIdentity(req);
  const frame = await renderQuestFrame({ fid, address, claim: false });
  const html = await util.frameHTML(frame);
  res.send(html);
});

api.post(['/api/frames/quests', '/api/frames/quests/claim'], async function (req, res) {
  console.log("start POST /api/frames/quests path", req.path);
  const { fid, address } = questFrameIdentity(req);
  const frame = await renderQuestFrame({ fid, address, claim: req.path.endsWith('/claim') });
  const html = await util.frameHTML(frame);
  res.send(html);
});

// Season Recap frame
const SEASON_GIF = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmFjcnppNHpmc2txdGN0bnRhNHRoZDA5ajh0YzF3M3ByMWJscW5zayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oEjI6SIIHBdRxXI40/giphy.gif";
api.get(['/api/frames/season-recap', '/season-recap'], async function (req, res) {
  console.log("start GET /api/frames/season-recap path", req.path);
  const frame = {
    id: "Season Recap",
    square: true,
    postUrl: `https://api.dragnpuff.xyz/api/frames/season-recap`,
    image: SEASON_GIF,
    buttons: [
      { label: "View Recap", action: "post" },
      { label: "Leaderboard", action: "link", target: `https://dragnpuff.xyz/seasonal-leaderboard` },
      { label: "Share", action: "link", target: `https://warpcast.com/~/compose?text=${encodeURIComponent('Season recap: DragNs marched. See the highlights.')}\u0026embeds[]=https://dragnpuff.xyz/seasonal-leaderboard` }
    ]
  };
  const html = await util.frameHTML(frame);
  res.send(html);
});

api.post(['/api/frames/season-recap'], async function (req, res) {
  console.log("start POST /api/frames/season-recap path", req.path);
  const frame = {
    id: "Season Recap",
    square: true,
    imageText: "Season over. Top 3 houses crowned. Claim your rewards.",
    postUrl: `https://api.dragnpuff.xyz/api/frames/season-recap`
  };
  frame.image = `https://frm.lol/api/dragnpuff/frimg/bg2/${encodeURIComponent(frame.imageText)}.png`;
  delete frame.imageText;
  frame.buttons = [
    { label: "Replay", action: "post" },
    { label: "Leaderboard", action: "link", target: `https://dragnpuff.xyz/seasonal-leaderboard` },
    { label: "Share", action: "link", target: `https://warpcast.com/~/compose?text=${encodeURIComponent('Season recap: DragNs marched. See the highlights.')}\u0026embeds[]=https://dragnpuff.xyz/seasonal-leaderboard` }
  ];
  const html = await util.frameHTML(frame);
  res.send(html);
});

// Squad Status frame
const SQUAD_GIF = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGQxMTM2dDR1NWJ2bjBlMjF2c3Z3eWR0Ynh3Mmx2bWN2dzY2em5lcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/10LKovKon8DENq/giphy.gif";
api.get(['/api/frames/squad', '/squad'], async function (req, res) {
  console.log("start GET /api/frames/squad path", req.path);
  const frame = {
    id: "Squad Status",
    square: true,
    postUrl: `https://api.dragnpuff.xyz/api/frames/squad`,
    image: SQUAD_GIF,
    buttons: [
      { label: "Refresh", action: "post" },
      { label: "Recruit", action: "link", target: `https://warpcast.com/~/compose?text=${encodeURIComponent('Join my DragN squad for the next push. All must choose.')}\u0026embeds[]=https://dragnpuff.xyz/recruit` },
      { label: "Open Squad", action: "link", target: `https://dragnpuff.xyz/squad` }
    ]
  };
  const html = await util.frameHTML(frame);
  res.send(html);
});

api.post(['/api/frames/squad'], async function (req, res) {
  console.log("start POST /api/frames/squad path", req.path);
  const frame = {
    id: "Squad Status",
    square: true,
    imageText: "Squad ready. Buffs synced. Recruit and march.",
    postUrl: `https://api.dragnpuff.xyz/api/frames/squad`
  };
  frame.image = `https://frm.lol/api/dragnpuff/frimg/bg3/${encodeURIComponent(frame.imageText)}.png`;
  delete frame.imageText;
  frame.buttons = [
    { label: "Refresh", action: "post" },
    { label: "Recruit", action: "link", target: `https://warpcast.com/~/compose?text=${encodeURIComponent('Join my DragN squad for the next push. All must choose.')}\u0026embeds[]=https://dragnpuff.xyz/recruit` },
    { label: "Open Squad", action: "link", target: `https://dragnpuff.xyz/squad` }
  ];
  const html = await util.frameHTML(frame);
  res.send(html);
});

api.post(['/api/frames/mint'], async function (req, res) {
  console.log("start POST /api/frames/mint path", req.path);
  const frame = await actions.mint(req);
  const html = await util.frameHTML(frame);
  res.send(html);
}); // POST /api/frames/mint

api.post(['/api/frames/nom'], async function (req, res) {
  console.log("start POST /api/frames/mint path", req.path);
  const html = util.nomSwapFrameHTML();
  res.send(html);
}); // POST /api/frames/mint

api.get(['/api/frames/flex', '/flex'], async function (req, res) {
  console.log("start GET /api/frames/flex path", req.path);
  var frame = {};
  frame.id = "DragN Flex";
  frame.square = true;
  frame.postUrl = `https://api.dragnpuff.xyz/api/frames/flex`;
  frame.image = `https://api.dragnpuff.xyz/img/flex.png`;
  frame.buttons = [
    { 
      "label": "Flex",
      "action": "post"
    },
    {
      "label": "Cast It!",
      "action": "link",
      "target": `https://warpcast.com/~/compose?text=${encodeURIComponent('The DragNs have arrived. Have you minted yours?')}&embeds[]=https://dragnpuff.xyz` 
    }
  ];
  const html = await util.frameHTML(frame);
  res.send(html);
}); // GET /api/frames/flex

api.get(['/api/frames/recruit', '/recruit'], async function (req, res) {
  console.log("start GET /api/frames/recruit path", req.path);
  var frame = {};
  frame.id = "Recruit Allies";
  frame.square = true;
  frame.postUrl = `https://api.dragnpuff.xyz/api/frames/recruit`;
  frame.image = `https://api.dragnpuff.xyz/img/recruit.png`;
  frame.buttons = [
    { label: "Recruit", action: "post" },
    { label: "Top", action: "link", target: `https://dragnpuff.xyz/seasonal-leaderboard` }
  ];
  const html = await util.frameHTML(frame);
  res.send(html);
}); // GET /api/frames/recruit

api.post(['/api/frames/recruit'], async function (req, res) {
  console.log("start POST /api/frames/recruit path", req.path);
  const frame = await actions.recruit(req);
  const html = await util.frameHTML(frame);
  res.send(html);
}); // POST /api/frames/recruit

api.get(['/api/frames/pixel', '/pixel'], async function (req, res) {
  console.log("start GET /api/frames/pixel path", req.path);
  var frame = {};
  frame.id = "DragN x Pixel";
  frame.square = true;
  frame.postUrl = `https://api.dragnpuff.xyz/api/frames/pixelnounsAirdrop`;
  frame.image = `https://api.dragnpuff.xyz/img/pixel.gif`;
  frame.buttons = [
    { 
      "label": "Claim",
      "action": "post"
    },
    {
      "label": "Mint",
      "action": "post",
      "postUrl": "https://api.dragnpuff.xyz/api/frames/mint" 
    }
  ];
  const html = await util.frameHTML(frame);
  res.send(html);
}); // GET /api/frames/pixel

api.post(['/api/frames/house/fire', '/api/frames/house/fire/:fid'], async function (req, res) {
  console.log("start POST /api/frames/house/fire path", req.path);
  const frame = await actions.fire(req);
  const html = await util.frameHTML(frame);
  res.send(html);
}); // POST /api/frames/house/fire

api.get(['/api/frames/house/fire', '/api/frames/house/fire/:house', '/house/fire/:house'], async function (req, res) {
  console.log("start GET /api/frames/house/fire path", req.path);
  const house = req.params.house;
  var frame = {};
  if (!house) {
    frame.id = "Breathe Fire";
    frame.square = true;
    frame.imageText = "Install Breathe Fire cast action";
    frame.buttons = [
      {
          "label": "Install",
          "action": "link",
          "target": "https://warpcast.com/~/add-cast-action?url=https%3A%2F%2Fdragnpuff.xyz%2Fapi%2Factions%2Ffire"
      }
    ];
    frame.image = `https://frm.lol/api/dragnpuff/frimg/${encodeURIComponent(frame.imageText)}.png?v=2`;
    delete frame.imageText;
  } else {
    frame.id = "House of " + house;
    frame.square = true;
    frame.postUrl = `https://api.dragnpuff.xyz/api/frames/house/fire`;
    frame.image = `https://dragnpuff.xyz/img/house-of-${house}-fire.gif`;
    frame.buttons = [
      { 
        "label": "Breathe Fire",
        "action": "post",
        "postUrl": "https://api.dragnpuff.xyz/api/frames/house/fire"
      }
    ];
  } // end if house
  const html = await util.frameHTML(frame);
  res.send(html);
}); // GET /api/frames/house/fire

api.get(['/api/frames/choose', '/choose'], async function (req, res) {
  console.log("start GET /api/frames/choose path", req.path);
  var frame = {};
  frame.id = "All Must Choose";
  frame.square = true;
  frame.postUrl = `https://api.dragnpuff.xyz/api/frames/choose`;
  frame.image = `https://api.dragnpuff.xyz/img/choose.gif`;
  frame.buttons = [
    { 
      "label": "Choose",
      "action": "post"
    },
    {
      "label": "Mint",
      "action": "post",
      "postUrl": "https://api.dragnpuff.xyz/api/frames/mint" 
    }
  ];
  const html = await util.frameHTML(frame);
  res.send(html);
}); // GET /api/frames/choose

api.post(['/api/frames/choose'], async function (req, res) {
  console.log("start POST /api/frames/choose path", req.path);
  const frame = await actions.choose(req);
  const html = await util.frameHTML(frame);
  res.send(html);
}); // POST /api/frames/choose

api.get(['/api/frames/house/:house', '/house/:house'], async function (req, res) {
  console.log("start GET /api/frames/house path", req.path);
  const house = req.params.house;
  var frame = {};
  frame.id = "House of " + house;
  frame.square = true;
  frame.postUrl = `https://api.dragnpuff.xyz/api/frames/choose`;
  frame.image = `https://dragnpuff.xyz/img/house-of-${house}.png`;
  frame.buttons = [
    { 
      "label": "Leaderboard",
      "action": "post",
      "postUrl": "https://api.dragnpuff.xyz/api/frames/leaderboard"
    }
  ];
  const html = await util.frameHTML(frame);
  res.send(html);
}); // GET /api/frames/house

api.get(['/api/frames/leaderboard', '/leaderboard'], async function (req, res) {
  console.log("start GET /api/frames/leaderboard path", req.path);
  var frame = {};
  frame.id = "Leaderboard";
  frame.square = true;
  frame.postUrl = `https://api.dragnpuff.xyz/api/frames/leaderboard`;
  frame.imageText = '';
  // get houses from firestore ordered by total descending
  const db = getFirestore();
  const query = db.collection("houses").orderBy("total", "desc").limit(7);
  const querySnapshot = await query.get();
  var rank = 1;
  querySnapshot.forEach((doc) => {
    frame.imageText += `#${rank} - ${doc.id} (${doc.data().total})\n`;
    rank++;
  });
  frame.image = `https://frm.lol/api/dragnpuff/frimg/leaderboard/${encodeURIComponent(frame.imageText)}.png`;
  frame.buttons = [
    { 
      "label": "Choose",
      "action": "post",
      "postUrl": "https://api.dragnpuff.xyz/api/frames/choose"
    },
    {
      "label": "Seasonal",
      "action": "post",
      "postUrl": "https://api.dragnpuff.xyz/api/frames/seasonal-leaderboard"
    },
    {
      "label": "Mint",
      "action": "post",
      "postUrl": "https://api.dragnpuff.xyz/api/frames/mint" 
    }
  ];
  const html = await util.frameHTML(frame);
  res.send(html);
}); // GET /api/frames/leaderboard

api.get(['/api/frames/seasonal-leaderboard', '/seasonal-leaderboard'], async function (req, res) {
  console.log("start GET /api/frames/seasonal-leaderboard path", req.path);
  var frame = {};
  frame.id = "Seasonal Wars";
  frame.square = true;
  frame.postUrl = `https://api.dragnpuff.xyz/api/frames/seasonal-leaderboard`;
  frame.imageText = '';
  
  try {
    const db = getFirestore();
    
    // Get current active season
    const activeSeasonSnapshot = await db.collection("seasons")
      .where("active", "==", true)
      .where("endTime", ">", new Date())
      .limit(1)
      .get();
    
    if (activeSeasonSnapshot.empty) {
      frame.imageText = "No active season\n\nStay tuned for the next\nHouse Wars season!";
      frame.buttons = [
        { 
          "label": "All-Time",
          "action": "post",
          "postUrl": "https://api.dragnpuff.xyz/api/frames/leaderboard"
        }
      ];
    } else {
      const seasonDoc = activeSeasonSnapshot.docs[0];
      const seasonData = seasonDoc.data();
      
      // Get house scores
      const houseScoresSnapshot = await db.collection("seasons")
        .doc(seasonDoc.id)
        .collection("houseScores")
        .get();

      const boostMultipliers = await util.getHouseBoostMultipliers();
      
      const leaderboard = [];
      const houseNames = ["Aqua", "Fire", "Earth", "Air", "Light", "Dark", "Chaos"];
      
      houseScoresSnapshot.forEach(doc => {
        const data = doc.data();
        const houseId = parseInt(doc.id);
        const configMultiplier = seasonData.multipliers?.[doc.id] || 1.0;
        const stakingMultiplier = boostMultipliers?.[houseId] || 1.0;
        const totalMultiplier = Number((configMultiplier * stakingMultiplier).toFixed(2));
        const finalScore = Math.floor(data.score * totalMultiplier);
        
        leaderboard.push({
          houseId: houseId,
          houseName: houseNames[houseId],
          finalScore: finalScore,
          multiplier: configMultiplier,
          stakingMultiplier,
          totalMultiplier
        });
      });
      
      // Sort by final score descending
      leaderboard.sort((a, b) => b.finalScore - a.finalScore);
      
      // Calculate time remaining
      const endTime = seasonData.endTime.toDate();
      const now = new Date();
      const timeRemaining = Math.floor((endTime - now) / 1000 / 60 / 60 / 24);
      
      frame.imageText = `🏆 SEASON ${seasonDoc.id} 🏆\n${timeRemaining}d remaining\n\n`;
      
      leaderboard.slice(0, 7).forEach((house, index) => {
        const multiplierText = house.totalMultiplier !== 1.0
          ? ` (x${house.totalMultiplier}${house.stakingMultiplier && house.stakingMultiplier !== 1.0 ? `; stake x${house.stakingMultiplier.toFixed(2)}` : ''})`
          : '';
        frame.imageText += `#${index + 1} - ${house.houseName}: ${house.finalScore}${multiplierText}\n`;
      });
      
      if (seasonData.prizePool && seasonData.prizePool > 0) {
        frame.imageText += `\n💰 Prize Pool: ${(seasonData.prizePool / 1e18).toFixed(2)} ETH`;
      }
      
      frame.buttons = [
        { 
          "label": "All-Time",
          "action": "post",
          "postUrl": "https://api.dragnpuff.xyz/api/frames/leaderboard"
        },
        {
          "label": "Breathe Fire",
          "action": "post",
          "postUrl": "https://api.dragnpuff.xyz/api/frames/house/fire"
        }
      ];
    }
  } catch (err) {
    error("Error loading seasonal leaderboard:", err);
    frame.imageText = "Error loading seasonal data\n\nPlease try again later";
    frame.buttons = [
      { 
        "label": "All-Time",
        "action": "post",
        "postUrl": "https://api.dragnpuff.xyz/api/frames/leaderboard"
      }
    ];
  }
  
  frame.image = `https://frm.lol/api/dragnpuff/frimg/leaderboard/${encodeURIComponent(frame.imageText)}.png`;
  const html = await util.frameHTML(frame);
  res.send(html);
}); // GET /api/frames/seasonal-leaderboard

api.post(['/api/frames/leaderboard', '/leaderboard'], async function (req, res) {
  console.log("start POST /api/frames/leaderboard path", req.path);
  var frame = {};
  frame.id = "Leaderboard";
  frame.square = true;
  frame.postUrl = `https://api.dragnpuff.xyz/api/frames/leaderboard`;
  frame.imageText = '';
  // get houses from firestore ordered by total descending
  const db = getFirestore();
  const query = db.collection("houses").orderBy("total", "desc").limit(7);
  const querySnapshot = await query.get();
  var rank = 1;
  querySnapshot.forEach((doc) => {
    frame.imageText += `#${rank} - ${doc.id} (${doc.data().total})\n`;
    rank++;
  });
  frame.image = `https://frm.lol/api/dragnpuff/frimg/leaderboard/${encodeURIComponent(frame.imageText)}.png`;
  frame.buttons = [
    { 
      "label": "Choose",
      "action": "post",
      "postUrl": "https://api.dragnpuff.xyz/api/frames/choose"
    },
    {
      "label": "Mint",
      "action": "post",
      "postUrl": "https://api.dragnpuff.xyz/api/frames/mint" 
    }
  ];
  const html = await util.frameHTML(frame);
  res.send(html);
}); // POST /api/frames/leaderboard


api.get(`/api/actions/fire`, async function (req, res) {
  console.log("start GET /api/actions/fire");
  const responseJson = {
    "name": "Breathe Fire",
    "icon": "flame",
    "description": "Breath fire on your DragN'Puff foes",
    "action": {
      "type": "post"
    }
  };
  return res.json(responseJson);
}); // GET /api/actions/alfafrens

api.post(`/api/actions/fire`, async function (req, res) {
  console.log("start POST /api/actions/alfafrens");
  console.log("body", JSON.stringify(req.body));
  await util.validateAirstackREST(req);
  const responseJson = {
    "type": "frame",
    "frameUrl": `https://dragnpuff.xyz/api/frames/house/fire/${req.body.untrustedData.castId.fid}`,
  };
  return res.json(responseJson);
}); // POST /api/actions/fire

api.post(['/api/frames/pixelnounsAirdrop'], async function (req, res) {
  console.log("start POST /api/frames/pixelnounsAirdrop path", req.path);
  const frame = await actions.pixelnounsAirdrop(req);
  const html = await util.frameHTML(frame);
  res.send(html);
}); // POST /api/frames/pixelnounsAirdrop

api.post(['/api/frames/flex'], async function (req, res) {
  console.log("start POST /api/frames/flex path", req.path);
  const frame = await actions.flex(req);
  const html = await util.frameHTML(frame);
  res.send(html);
}); // POST /api/frames/flex

api.post(['/api/txn/mint/:address/:quantity'], async function (req, res) {
  console.log("start POST /api/txn/mint/:address/:quantity path", req.path);
  var address = req.params.address;
  const quantity = parseInt(req.params.quantity);
  if ("address" in req.body.untrustedData) {
    // connected wallet address
    address = req.body.untrustedData.address;
  }
  const tx = await actions.mintTxn(address, quantity);
  res.json(tx);
}); // POST /api/txn/mint/:address/:quantity

api.get('/api/frimg/:imageText.png', async function (req, res) {
  // url decode imageText
  const imageText = decodeURIComponent(req.params.imageText);
  console.log("imageText", imageText);
  const image = await util.imageFromText(imageText)
    .catch((e) => { return res.status(404).send('Not found'); });
  //console.log("image", image);
  const img = Buffer.from(image.replace("data:image/png;base64,",""), 'base64');
  // increase cache
  res.set('Cache-Control', 'public, max-age=3600, s-maxage=86200');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length
  });
  return res.end(img);
}); // GET /api/frimg/:imageText.png

api.get(['/api/pledgestats/:fid'], async function (req, res) {
  console.log("start GET /api/pledgestats/:fid path", req.path);
  const fid = req.params.fid;
  const stats = await util.pledgeStats(fid);
  res.json(stats);
}); // GET /api/pledgestats/:fid


api.get(['/api/importmeta'], async function (req, res) {
  //return res.status(404).send('Not found');
  var start = parseInt(req.query.start);
  var end = parseInt(req.query.end);
  console.log("start GET /api/importmeta path", req.path, start, end);
  const db = getFirestore();
  for (let i = start; i <= end; i++) {
    const meta = require(`./meta/${i}.json`);
    // for loop through the attributes
    // add elments for each attribute
    for (let j = 0; j < meta.attributes.length; j++) {
      meta[meta.attributes[j].trait_type] = meta.attributes[j].value;
    }
    // save meta to firestore
    const docRef = db.collection("dragns").doc(i.toString());
    await docRef.set(meta);
  }
  res.json({ message: 'Imported Meta' });
}); // GET /api/importmeta

api.get(['/api/promote/:tokenId'], async function (req, res) {
  return res.status(404).send('Not found');
  const tokenId = req.params.tokenId;
  console.log("start GET /api/promote/:tokenId path", req.path, tokenId);
  const db = getFirestore();
  const docRef = db.collection("dragns").doc(tokenId);
  if (parseInt(tokenId) <= 13579) {
    // remove Status field from doc
    await docRef.update({ "Status": "" });
  } else {
    await docRef.update({ "Status": "Promoted" });
  }
  res.json({ message: 'Promoted' });
}); // GET /api/promote/:tokenId

api.get(['/api/promote/top/:tokenId'], async function (req, res) {
  return res.status(404).send('Not found');
  const tokenId = req.params.tokenId;
  console.log("start GET /api/promote/top/:tokenId path", req.path, tokenId);
  const db = getFirestore();
  const docRef = db.collection("dragns").doc(tokenId);
  await docRef.update({ "top": true });
  res.json({ message: 'Promoted' });
}); // GET /api/promote/top/:tokenId

api.get(['/api/demote/:tokenId'], async function (req, res) {
  return res.status(404).send('Not found');
  const tokenId = req.params.tokenId;
  console.log("start GET /api/demote/:tokenId path", req.path, tokenId);
  const db = getFirestore();
  const docRef = db.collection("dragns").doc(tokenId);
  if (parseInt(tokenId) > 13579) {
    // remove Status field from doc
    await docRef.update({ "Status": "" });
  } else {
    await docRef.update({ "Status": "Demoted" });
  }
  res.json({ message: 'Demoted' });
}); // GET /api/demote/:tokenId

api.get(['/api/bullring/demote'], async function (req, res) {
  return res.status(404).send('Not found');
  const tokenId = req.params.tokenId;
  console.log("start GET /api/demote/:tokenId path", req.path, tokenId);
  const db = getFirestore();
  // query for all dragns with Piercings == Bull Ring AND Mouth == any of the following: "Normal", "Blunt", "Pipe", or "Gold Tooth"
  const query = db.collection("dragns").where("Piercings", "==", "Bull Ring").where("Mouth", "in", ["Normal", "Blunt", "Pipe", "Gold Tooth"]);
  const querySnapshot = await query.get();
  var count = 0;
  querySnapshot.forEach(async (doc) => {
    await doc.ref.update({ "Status": "Demoted" });
    count++;
  });
  res.json({ message: `Demoted ${count}` });
}); // GET /api/bullring/demote

api.get(['/api/browring/demote'], async function (req, res) {
  return res.status(404).send('Not found');
  const tokenId = req.params.tokenId;
  console.log("start GET /api/demote/:tokenId path", req.path, tokenId);
  const db = getFirestore();
  // query for all dragns with Piercings == Bull Ring AND Mouth == any of the following: "Normal", "Blunt", "Pipe", or "Gold Tooth"
  const query = db.collection("dragns").where("Piercings", "==", "Brow Rings").where("Headwear", "in", ["Mfer Cap", "Based Cap", "FC Arch Cap", "Do-Rag", "Thug Bandana", "Biker Helmet", "Headband", "Pepe Cap", "Afro"]);
  const querySnapshot = await query.get();
  var count = 0;
  querySnapshot.forEach(async (doc) => {
    await doc.ref.update({ "Status": "Demoted" });
    count++;
  });
  res.json({ message: `Demoted ${count}` });
}); // GET /api/browring/demote

api.get(['/api/top'], async function (req, res) {
  return res.status(404).send('Not found');
  console.log("start GET /api/top path", req.path);
  const db = getFirestore();
  // query for all dragns with top == true
  const query = db.collection("dragns").where("top", "==", true);
  const querySnapshot = await query.get();
  var top = [];
  querySnapshot.forEach(async (doc) => {
    top.push(doc.id);
    count++;
  });
  res.json(top);
}); // GET /api/top

api.get(['/api/demoted'], async function (req, res) {
  return res.status(404).send('Not found');
  console.log("start GET /api/top path", req.path);
  const db = getFirestore();
  // query for all dragns with top == true
  const query = db.collection("dragns").where("Status", "==", "Demoted").where("edition", "<=", 13579);
  const querySnapshot = await query.get();
  var top = [];
  querySnapshot.forEach(async (doc) => {
    top.push(doc.id);
    count++;
  });
  res.json(top);
}); // GET /api/demoted

api.get(['/api/promoted'], async function (req, res) {
  return res.status(404).send('Not found');
  console.log("start GET /api/top path", req.path);
  const db = getFirestore();
  // query for all dragns with top == true
  const query = db.collection("dragns").where("Status", "==", "Promoted");
  const querySnapshot = await query.get();
  var top = [];
  querySnapshot.forEach(async (doc) => {
    top.push(doc.id);
    count++;
  });
  res.json(top);
}); // GET /api/promoted

api.get(['/api/promotedemote/counts'], async function (req, res) {
  return res.status(404).send('Not found');
  console.log("start GET /api/promotedemote/counts path", req.path);
  var promoted = 0;
  var demoted = 0;
  var top = 0;
  const db = getFirestore();
  var query = db.collection("dragns");
  // query where Status == Promoted and edition <= 13579
  query= query.where("Status", "==", "Demoted").where("edition", "<=", 13579);
  // count the number of documents in the query
  const snapshot = await query.count().get();
  console.log(snapshot.data().count);
  demoted = snapshot.data().count;
  // query where Status == Demoted and edition > 13579
  query = db.collection("dragns").where("Status", "==", "Promoted").where("edition", ">", 13579);
  // count the number of documents in the query
  const promotedSnapshot = await query.count().get();
  console.log(promotedSnapshot.data().count);
  promoted = promotedSnapshot.data().count;
  // query where top == true
  query = db.collection("dragns").where("top", "==", true);
  // count the number of documents in the query
  const topSnapshot = await query.count().get();
  console.log(topSnapshot.data().count);
  top = topSnapshot.data().count;
  res.json({ promoted: promoted, demoted: demoted, top: top});
}); // GET /api/promotedemote/counts

api.get(['/meta/:id'], async function (req, res) {
  console.log("start GET /meta/:id path", req.path);
  const id = req.params.id;
  const isMinted = await util.isMinted(id);
  if (!isMinted) {
    return res.status(404).send('Not found');
  }
  const storage = getStorage();
  const bucket = storage.bucket("dragn-puff.appspot.com");
  const file = bucket.file(`meta/${id}.json`);
  const exists = await file.exists();
  if (!exists[0]) {
    res.status(404).send('Not found');
    return;
  }
  // Download file into memory from bucket.
  const downloadResponse = await file.download();
  const metadata = downloadResponse[0];
  //logger.log("Image downloaded!");

  res.set('Content-Type', 'application/json');
  res.set('Content-Length', metadata.length);
  // Set cache control headers
  res.set('Cache-Control', 'public, max-age=3600, s-maxage=86200');
  res.send(metadata);
}); // GET /meta/:id   

api.get(['/images/:id.png'], async function (req, res) {
  console.log("start GET /images/:id.png path", req.path);
  const id = req.params.id;
  const isMinted = await util.isMinted(id);
  if (!isMinted) {
    return res.status(404).send('Not found');
  }
  const storage = getStorage();
  const bucket = storage.bucket("dragn-puff.appspot.com");
  const file = bucket.file(`images/${id}.png`);
  const exists = await file.exists();
  if (!exists[0]) {
    res.status(404).send('Not found');
    return;
  }
  // Download file into memory from bucket.
  const downloadResponse = await file.download();
  const imageBuffer = downloadResponse[0];
  //logger.log("Image downloaded!");

    // Send cache in the response.
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=86200');
    res.set('Content-Type', 'image/png');
    // TODO: Set cache control headers
    res.send(imageBuffer);
}); // GET /images/:id   

api.get(['/thumbs/:size(1024|512|256|128|64)/:id.png'], async function (req, res) {
  console.log("start GET /thumbs/:id.png path", req.path);
  const id = req.params.id;
  const isMinted = await util.isMinted(id);
  if (!isMinted) {
    return res.status(404).send('Not found');
  }
  const size = parseInt(req.params.size);
  const storage = getStorage();
  const bucket = storage.bucket("dragn-puff.appspot.com");
  const file = bucket.file(`thumbs/${size}/${id}.png`);
  const exists = await file.exists();
  if (!exists[0]) {
    res.status(404).send('Not found');
    return;
  }
  // Download file into memory from bucket.
  const downloadResponse = await file.download();
  const imageBuffer = downloadResponse[0];
  //logger.log("Image downloaded!");

    // Send cache in the response.
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=86200');
    res.set('Content-Type', 'image/png');
    // TODO: Set cache control headers
    res.send(imageBuffer);
}); // GET /thumbs/:id    

api.get(['/token/:id'], async function (req, res) {
  console.log("start GET /token/:id path", req.path);
  const id = req.params.id;
  const html = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DragN'Puff #${id}</title>
    <link rel="stylesheet" href="/css/style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="DragN'Puff #${id}">
    <link rel="icon" type="image/png" href="/img/favicon.png">

    <meta name="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="https://api.dragnpuff.xyz/thumbs/1024/${id}.png" />
    <meta name="fc:frame:post_url" content="https://api.dragnpuff.xyz/api/frames/mint" />
    <meta name="fc:frame:button:1" content="Mint Yours" />
    <meta name="fc:frame:button:1:action" content="post" />
    <meta name="fc:frame:image:aspect_ratio" content="1:1" />
    <meta name="og:image" content="https://api.dragnpuff.xyz/thumbs/1024/${id}.png">
    <meta name="og:title" content="DragN'Puff #${id}" />

    <style>
        @font-face {
            font-family: SartoshiScript;
            src: url(/css/SartoshiScript-Regular.otf);
        }
        body {
            font-family: SartoshiScript;
            text-align: center;
        }
        h1 {
            font-size: 3em;
            margin: 0;
            font-weight: 800;
        }
        h3 {
            font-size: 1.5em;
            margin: 0;
            font-weight: 400;
        }
        img {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
        }   
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DragN'Puff #${id}</h1>
        </div>
        <div>
            <a href="https://warpcast.com/~/channel/nomadicframe"><img src="https://api.dragnpuff.xyz/thumbs/1024/${id}.png" alt="DragN'Puff #${id}" /></a>
        </div>
        <div class="footer">
            <p><span style="letter-spacing:0px">@~</span> 2024 DragN'Puff</p>
        </div>
    </div>
</html>
  `;
  // TODO: set cache
  //res.set('Cache-Control', 'public, max-age=60, s-maxage=120');
  res.send(html);
});

api.get(['/mint/:image', '/mint/:image/:extra'], async function (req, res) {
  console.log("start GET /mint/:image path", req.path);
  const image = req.params.image;
  const html = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DragN'Puff</title>
    <link rel="stylesheet" href="/css/style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="DragN'Puff">
    <link rel="icon" type="image/png" href="/img/favicon.png">

    <meta name="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="https://api.dragnpuff.xyz/img/${image}" />
    <meta name="fc:frame:post_url" content="https://api.dragnpuff.xyz/api/frames/mint" />
    <meta name="fc:frame:button:1" content="Get Started" />
    <meta name="fc:frame:button:1:action" content="post" />
    <meta name="fc:frame:image:aspect_ratio" content="1:1" />
    <meta name="og:image" content="https://api.dragnpuff.xyz/img/${image}">
    <meta name="og:title" content="DragN'Puff" />

    <style>
        @font-face {
            font-family: SartoshiScript;
            src: url(/css/SartoshiScript-Regular.otf);
        }
        body {
            font-family: SartoshiScript;
            text-align: center;
        }
        h1 {
            font-size: 3em;
            margin: 0;
            font-weight: 800;
        }
        h3 {
            font-size: 1.5em;
            margin: 0;
            font-weight: 400;
        }
        img {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
        }   
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DragN'Puff</h1>
        </div>
        <div>
            <a href="https://warpcast.com/~/channel/nomadicframe"><img src="https://api.dragnpuff.xyz/img/${image}" alt="DragN'Puff" /></a>
        </div>
        <div class="footer">
            <p><span style="letter-spacing:0px">@~</span> 2024 DragN'Puff</p>
        </div>
    </div>
</html>
  `;
  // set content type
  res.set('Content-Type', 'text/html');
  return res.send(html);
}); // GET /mint/:image

api.get(['/random.png'], async function (req, res) {
    console.log("start GET /random.png path", req.path);
    // random id between 1 and 18957
    const id = Math.floor(Math.random() * 21180) + 1;
    const storage = getStorage();
    const bucket = storage.bucket("dragn-puff.appspot.com");
    const file = bucket.file(`thumbs/1024/${id}.png`);
    const exists = await file.exists();
    if (!exists[0]) {
      res.status(404).send('Not found');
      return;
    }
    // Download file into memory from bucket.
    const downloadResponse = await file.download();
    const imageBuffer = downloadResponse[0];
    //logger.log("Image downloaded!");
  
      // Send the thumbnail in the response.
      res.set('Content-Type', 'image/png');
      // TODO: Set cache control headers
      res.send(imageBuffer);
  }); // GET /random.png    

  api.get(['/api/frame/urls'], async function (req, res) {
    // return plaint text
    res.set('Content-Type', 'text/plain');
    res.send(`
    https://dragnpuff.xyz\n
    https://dragnpuff.xyz/mint/degen.gif/\n
    https://dragnpuff.xyz/mint/nom.gif/\n
    https://dragnpuff.xyz/mint/farcards.gif/\n
    https://dragnpuff.xyz/mint/perl.gif/\n
    https://dragnpuff.xyz/mint/drakula.gif/\n
    https://dragnpuff.xyz/mint/mfers.gif/\n
    https://dragnpuff.xyz/mint/nouns.gif/\n
    https://dragnpuff.xyz/mint/shitters.gif/\n
    https://dragnpuff.xyz/mint/ham.gif/\n
    https://dragnpuff.xyz/mint/based.gif/\n
    https://dragnpuff.xyz/mint/degen-gm.png/\n
    https://dragnpuff.xyz/mint/pepehat.gif/\n
    https://dragnpuff.xyz/mint/alfafrens.gif/\n
    `);
  }); // GET /api/frame/urls

module.exports.api = api;