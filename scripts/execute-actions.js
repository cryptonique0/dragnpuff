// Execute contract functions on deployed contracts
const hre = require("hardhat");
const addresses = require("../constants/addresses.js");
require("dotenv").config();

const DRAGN_ADDRESS = addresses.BASE.DRAGNPUFF;
const MINTER_ADDRESS = addresses.BASE.MINTER;
const FAIR_TOKEN_ADDRESS = addresses.BASE.FAIR_TOKEN;
const AIRDROP_ADDRESS = addresses.BASE.AIRDROP;

// Load ABIs
const dragNAbi = require("../artifacts/contracts/DragNPuff.sol/DragNPuff.json").abi;
const minterAbi = require("../artifacts/contracts/ERC721Minter.sol/ERC721Minter.json").abi;
const fairTokenAbi = require("../artifacts/contracts/FairToken.sol/FairToken.json").abi;

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const signerAddress = await signer.getAddress();
  
  console.log("🎮 DragNPuff Contract Executor");
  console.log("═════════════════════════════════════════");
  console.log(`📌 Connected with: ${signerAddress}\n`);
  
  // Get contract instances
  const dragN = new hre.ethers.Contract(DRAGN_ADDRESS, dragNAbi, signer);
  const minter = new hre.ethers.Contract(MINTER_ADDRESS, minterAbi, signer);
  const fairToken = new hre.ethers.Contract(FAIR_TOKEN_ADDRESS, fairTokenAbi, signer);
  
  try {
    // Example: Mint NFT
    console.log("🎬 Executing: Mint NFT");
    console.log("─────────────────────────────────────────");
    
    const tx = await dragN.safeMint(signerAddress);
    console.log(`✅ Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Minted successfully!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check balance
    const balance = await dragN.balanceOf(signerAddress);
    console.log(`\n💎 Your NFT balance: ${balance.toString()}`);
    
    // Check total supply
    const supply = await dragN.totalSupply();
    console.log(`📊 Total supply: ${supply.toString()}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.error("📋 Error data:", error.data);
    }
  }
  
  console.log("\n═════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
