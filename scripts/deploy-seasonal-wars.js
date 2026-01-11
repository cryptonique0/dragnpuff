const hre = require("hardhat");

async function main() {
  console.log("Deploying SeasonalWars contract...");

  const SeasonalWars = await hre.ethers.getContractFactory("SeasonalWars");
  const seasonalWars = await SeasonalWars.deploy();

  await seasonalWars.waitForDeployment();

  const address = await seasonalWars.getAddress();
  console.log("SeasonalWars deployed to:", address);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await seasonalWars.deploymentTransaction().wait(5);

  // Verify contract on Basescan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.error("Error verifying contract:", error.message);
    }
  }

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("SeasonalWars:", address);
  console.log("\nNext steps:");
  console.log("1. Grant GAME_MASTER_ROLE to server address");
  console.log("2. Start first season using startSeason()");
  console.log("3. Update frontend config with contract address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
