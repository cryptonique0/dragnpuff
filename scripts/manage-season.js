const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * Seasonal Wars Management Script
 * Helper functions for managing seasons
 */

async function startSeason(contractAddress, durationInDays = 30) {
  const SeasonalWars = await ethers.getContractAt("SeasonalWars", contractAddress);
  
  const duration = durationInDays * 24 * 60 * 60; // Convert days to seconds
  
  console.log(`Starting new season with duration: ${durationInDays} days`);
  const tx = await SeasonalWars.startSeason(duration);
  await tx.wait();
  
  const currentSeasonId = await SeasonalWars.currentSeasonId();
  console.log(`Season ${currentSeasonId} started successfully`);
  
  return currentSeasonId;
}

async function getSeasonInfo(contractAddress, seasonId) {
  const SeasonalWars = await ethers.getContractAt("SeasonalWars", contractAddress);
  
  const info = await SeasonalWars.getSeasonInfo(seasonId);
  const isActive = await SeasonalWars.isSeasonActive(seasonId);
  
  console.log(`\nSeason ${seasonId} Info:`);
  console.log("===================");
  console.log("Start Time:", new Date(Number(info.startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(info.endTime) * 1000).toLocaleString());
  console.log("Prize Pool:", ethers.formatEther(info.prizePool), "ETH");
  console.log("Finalized:", info.finalized);
  console.log("Active:", isActive);
  
  return info;
}

async function recordScore(contractAddress, seasonId, houseId, points) {
  const SeasonalWars = await ethers.getContractAt("SeasonalWars", contractAddress);
  
  console.log(`Recording ${points} points for house ${houseId} in season ${seasonId}`);
  const tx = await SeasonalWars.recordScore(seasonId, houseId, points);
  await tx.wait();
  
  const score = await SeasonalWars.getHouseScore(seasonId, houseId);
  console.log(`House ${houseId} now has ${score} points`);
}

async function setMultiplier(contractAddress, seasonId, houseId, multiplier) {
  const SeasonalWars = await ethers.getContractAt("SeasonalWars", contractAddress);
  
  // Convert multiplier to basis points (e.g., 1.5 = 15000)
  const multiplierBP = Math.floor(multiplier * 10000);
  
  console.log(`Setting multiplier for house ${houseId} to ${multiplier}x`);
  const tx = await SeasonalWars.setMultiplier(seasonId, houseId, multiplierBP);
  await tx.wait();
  
  console.log(`Multiplier set successfully`);
}

async function addToPrizePool(contractAddress, seasonId, amountEth) {
  const SeasonalWars = await ethers.getContractAt("SeasonalWars", contractAddress);
  
  const amount = ethers.parseEther(amountEth.toString());
  
  console.log(`Adding ${amountEth} ETH to season ${seasonId} prize pool`);
  const tx = await SeasonalWars.addToPrizePool(seasonId, { value: amount });
  await tx.wait();
  
  const info = await SeasonalWars.getSeasonInfo(seasonId);
  console.log(`Prize pool now: ${ethers.formatEther(info.prizePool)} ETH`);
}

async function getLeaderboard(contractAddress, seasonId) {
  const SeasonalWars = await ethers.getContractAt("SeasonalWars", contractAddress);
  const houseNames = ["Aqua", "Fire", "Earth", "Air", "Light", "Dark", "Chaos"];
  
  console.log(`\nSeason ${seasonId} Leaderboard:`);
  console.log("===============================");
  
  const leaderboard = [];
  for (let i = 0; i < 7; i++) {
    const score = await SeasonalWars.getHouseScore(seasonId, i);
    const multiplier = await SeasonalWars.getHouseMultiplier(seasonId, i);
    const finalScore = await SeasonalWars.getFinalScore(seasonId, i);
    
    leaderboard.push({
      houseId: i,
      houseName: houseNames[i],
      score: Number(score),
      multiplier: Number(multiplier) / 10000,
      finalScore: Number(finalScore)
    });
  }
  
  leaderboard.sort((a, b) => b.finalScore - a.finalScore);
  
  leaderboard.forEach((house, index) => {
    console.log(`#${index + 1} ${house.houseName}: ${house.finalScore} (${house.score} × ${house.multiplier}x)`);
  });
  
  return leaderboard;
}

async function finalizeSeason(contractAddress, seasonId) {
  const SeasonalWars = await ethers.getContractAt("SeasonalWars", contractAddress);
  
  console.log(`Finalizing season ${seasonId}...`);
  const tx = await SeasonalWars.finalizeSeason(seasonId);
  const receipt = await tx.wait();
  
  console.log("Season finalized successfully");
  
  // Parse events
  const finalizedEvent = receipt.logs.find(
    log => log.fragment && log.fragment.name === "SeasonFinalized"
  );
  
  if (finalizedEvent) {
    console.log("\nFinal Rankings:");
    const topHouses = finalizedEvent.args.topHouses;
    const houseNames = ["Aqua", "Fire", "Earth", "Air", "Light", "Dark", "Chaos"];
    topHouses.forEach((houseId, index) => {
      console.log(`#${index + 1}: ${houseNames[houseId]}`);
    });
  }
}

async function grantGameMasterRole(contractAddress, address) {
  const SeasonalWars = await ethers.getContractAt("SeasonalWars", contractAddress);
  
  const GAME_MASTER_ROLE = await SeasonalWars.GAME_MASTER_ROLE();
  
  console.log(`Granting GAME_MASTER_ROLE to ${address}...`);
  const tx = await SeasonalWars.grantRole(GAME_MASTER_ROLE, address);
  await tx.wait();
  
  console.log("Role granted successfully");
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const contractAddress = args[1];
  
  if (!contractAddress) {
    console.error("Please provide contract address");
    console.log("\nUsage examples:");
    console.log("  npx hardhat run scripts/manage-season.js start <contract> [days]");
    console.log("  npx hardhat run scripts/manage-season.js info <contract> <seasonId>");
    console.log("  npx hardhat run scripts/manage-season.js leaderboard <contract> <seasonId>");
    console.log("  npx hardhat run scripts/manage-season.js score <contract> <seasonId> <houseId> <points>");
    console.log("  npx hardhat run scripts/manage-season.js multiplier <contract> <seasonId> <houseId> <value>");
    console.log("  npx hardhat run scripts/manage-season.js prize <contract> <seasonId> <eth>");
    console.log("  npx hardhat run scripts/manage-season.js finalize <contract> <seasonId>");
    console.log("  npx hardhat run scripts/manage-season.js grant <contract> <address>");
    process.exit(1);
  }
  
  switch (command) {
    case "start":
      const days = args[2] ? parseInt(args[2]) : 30;
      await startSeason(contractAddress, days);
      break;
      
    case "info":
      await getSeasonInfo(contractAddress, args[2]);
      break;
      
    case "leaderboard":
      await getLeaderboard(contractAddress, args[2]);
      break;
      
    case "score":
      await recordScore(contractAddress, args[2], parseInt(args[3]), parseInt(args[4]));
      break;
      
    case "multiplier":
      await setMultiplier(contractAddress, args[2], parseInt(args[3]), parseFloat(args[4]));
      break;
      
    case "prize":
      await addToPrizePool(contractAddress, args[2], parseFloat(args[3]));
      break;
      
    case "finalize":
      await finalizeSeason(contractAddress, args[2]);
      break;
      
    case "grant":
      await grantGameMasterRole(contractAddress, args[2]);
      break;
      
    default:
      console.error("Unknown command:", command);
      process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  startSeason,
  getSeasonInfo,
  recordScore,
  setMultiplier,
  addToPrizePool,
  getLeaderboard,
  finalizeSeason,
  grantGameMasterRole
};
