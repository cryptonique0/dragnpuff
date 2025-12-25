// Deploy contracts to Base network
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying Contracts...");
  console.log("═════════════════════════════════════════\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📌 Deploying with account: ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);
  
  try {
    // Deploy DragNPuff
    console.log("📦 Deploying DragNPuff...");
    const DragNPuff = await hre.ethers.getContractFactory("DragNPuff");
    const dragNPuff = await DragNPuff.deploy(
      "DragN'Puff",
      "DRAGN",
      "https://dragnpuff.xyz/metadata/",
      deployer.address
    );
    await dragNPuff.waitForDeployment();
    const dragNPuffAddress = await dragNPuff.getAddress();
    console.log(`✅ DragNPuff deployed to: ${dragNPuffAddress}`);
    
    // Deploy FairToken
    console.log("\n📦 Deploying FairToken...");
    const FairToken = await hre.ethers.getContractFactory("FairToken");
    const fairToken = await FairToken.deploy();
    await fairToken.waitForDeployment();
    const fairTokenAddress = await fairToken.getAddress();
    console.log(`✅ FairToken deployed to: ${fairTokenAddress}`);
    
    // Deploy ERC721Minter
    console.log("\n📦 Deploying ERC721Minter...");
    const ERC721Minter = await hre.ethers.getContractFactory("ERC721Minter");
    const minter = await ERC721Minter.deploy(
      dragNPuffAddress,
      fairTokenAddress,
      hre.ethers.parseEther("0.001"), // mintFeeHolder
      hre.ethers.parseEther("0.002")  // mintFeePublic
    );
    await minter.waitForDeployment();
    const minterAddress = await minter.getAddress();
    console.log(`✅ ERC721Minter deployed to: ${minterAddress}`);
    
    // Deploy Airdrop
    console.log("\n📦 Deploying Airdrop...");
    const Airdrop = await hre.ethers.getContractFactory("Airdrop");
    const airdrop = await Airdrop.deploy(dragNPuffAddress);
    await airdrop.waitForDeployment();
    const airdropAddress = await airdrop.getAddress();
    console.log(`✅ Airdrop deployed to: ${airdropAddress}`);
    
    // Grant minter role to ERC721Minter
    console.log("\n🔐 Setting up roles...");
    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    await dragNPuff.grantRole(MINTER_ROLE, minterAddress);
    console.log(`✅ Granted MINTER_ROLE to ERC721Minter`);
    
    console.log("\n📋 Deployment Summary:");
    console.log("═════════════════════════════════════════");
    console.log(`DragNPuff:    ${dragNPuffAddress}`);
    console.log(`FairToken:    ${fairTokenAddress}`);
    console.log(`ERC721Minter: ${minterAddress}`);
    console.log(`Airdrop:      ${airdropAddress}`);
    
    console.log("\n💾 Save these addresses to your .env file!");
    console.log("═════════════════════════════════════════");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
