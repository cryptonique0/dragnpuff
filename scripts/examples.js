// Contract Interaction Examples
// Copy and adapt these examples for your use cases

const hre = require("hardhat");
const addresses = require("../constants/addresses.js");
require("dotenv").config();

// Load ABIs
const dragNAbi = require("../artifacts/contracts/DragNPuff.sol/DragNPuff.json").abi;
const minterAbi = require("../artifacts/contracts/ERC721Minter.sol/ERC721Minter.json").abi;
const fairTokenAbi = require("../artifacts/contracts/FairToken.sol/FairToken.json").abi;
const airdropAbi = require("../artifacts/contracts/Airdrop.sol/Airdrop.json").abi;

const DRAGN_ADDRESS = addresses.BASE.DRAGNPUFF;
const MINTER_ADDRESS = addresses.BASE.MINTER;
const FAIR_TOKEN_ADDRESS = addresses.BASE.FAIR_TOKEN;
const AIRDROP_ADDRESS = addresses.BASE.AIRDROP;

// ============================================================
// DRAGN NFT EXAMPLES
// ============================================================

async function dragNExamples() {
  const [signer] = await hre.ethers.getSigners();
  const dragN = new hre.ethers.Contract(DRAGN_ADDRESS, dragNAbi, signer);
  
  console.log("🎨 DragNPuff (ERC721) Examples:");
  console.log("─────────────────────────────────────────");
  
  try {
    // Get contract info
    const name = await dragN.name();
    const symbol = await dragN.symbol();
    const supply = await dragN.totalSupply();
    console.log(`\n✓ Contract: ${name} (${symbol})`);
    console.log(`✓ Total Supply: ${supply.toString()}`);
    
    // Check user balance
    const balance = await dragN.balanceOf(signer.address);
    console.log(`✓ Your NFTs: ${balance.toString()}`);
    
    // Get base URI
    const baseURI = await dragN.baseURI();
    console.log(`✓ Base URI: ${baseURI}`);
    
    // Mint NFT
    console.log(`\n💎 Minting NFT...`);
    const tx = await dragN.safeMint(signer.address);
    const receipt = await tx.wait();
    console.log(`✓ Minted! Hash: ${tx.hash}`);
    console.log(`✓ Gas Used: ${receipt.gasUsed.toString()}`);
    
    // Check role
    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    const hasMinterRole = await dragN.hasRole(MINTER_ROLE, signer.address);
    console.log(`\n✓ Has MINTER_ROLE: ${hasMinterRole}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// ============================================================
// FAIR TOKEN EXAMPLES
// ============================================================

async function fairTokenExamples() {
  const [signer] = await hre.ethers.getSigners();
  const fairToken = new hre.ethers.Contract(FAIR_TOKEN_ADDRESS, fairTokenAbi, signer);
  
  console.log("\n💰 FairToken (ERC20) Examples:");
  console.log("─────────────────────────────────────────");
  
  try {
    // Get token info
    const name = await fairToken.name();
    const symbol = await fairToken.symbol();
    const decimals = await fairToken.decimals();
    console.log(`\n✓ Token: ${name} (${symbol})`);
    console.log(`✓ Decimals: ${decimals}`);
    
    // Check balance
    const balance = await fairToken.balanceOf(signer.address);
    const formatted = hre.ethers.formatUnits(balance, decimals);
    console.log(`✓ Your Balance: ${formatted} ${symbol}`);
    
    // Check total supply
    const supply = await fairToken.totalSupply();
    const formattedSupply = hre.ethers.formatUnits(supply, decimals);
    console.log(`✓ Total Supply: ${formattedSupply} ${symbol}`);
    
    // Transfer example (if you have tokens)
    if (balance > 0) {
      const recipient = "0x1234567890123456789012345678901234567890";
      const amount = hre.ethers.parseUnits("1", decimals);
      
      console.log(`\n💸 Transferring 1 ${symbol}...`);
      const tx = await fairToken.transfer(recipient, amount);
      const receipt = await tx.wait();
      console.log(`✓ Transferred! Hash: ${tx.hash}`);
      console.log(`✓ Gas Used: ${receipt.gasUsed.toString()}`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// ============================================================
// MINTER EXAMPLES
// ============================================================

async function minterExamples() {
  const [signer] = await hre.ethers.getSigners();
  const minter = new hre.ethers.Contract(MINTER_ADDRESS, minterAbi, signer);
  
  console.log("\n🏭 ERC721Minter Examples:");
  console.log("─────────────────────────────────────────");
  
  try {
    // Get fees
    const holderFee = await minter.mintFeeHolder();
    const publicFee = await minter.mintFeePublic();
    console.log(`\n✓ Holder Fee: ${hre.ethers.formatEther(holderFee)} ETH`);
    console.log(`✓ Public Fee: ${hre.ethers.formatEther(publicFee)} ETH`);
    
    // Mint with fee
    console.log(`\n🎫 Minting via Minter...`);
    const tx = await minter.mint(signer.address, { value: publicFee });
    const receipt = await tx.wait();
    console.log(`✓ Minted! Hash: ${tx.hash}`);
    console.log(`✓ Gas Used: ${receipt.gasUsed.toString()}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// ============================================================
// AIRDROP EXAMPLES
// ============================================================

async function airdropExamples() {
  const [signer] = await hre.ethers.getSigners();
  const airdrop = new hre.ethers.Contract(AIRDROP_ADDRESS, airdropAbi, signer);
  
  console.log("\n🎁 Airdrop Examples:");
  console.log("─────────────────────────────────────────");
  
  try {
    // Get airdrop info
    const dropId = 0;
    const drop = await airdrop.airdrops(dropId);
    console.log(`\n✓ Drop ${dropId}:`);
    console.log(`  Token: ${drop.token}`);
    console.log(`  Amount: ${drop.amount.toString()}`);
    console.log(`  Recipients: ${drop.recipientCount}`);
    
    // Check if eligible
    const eligible = await airdrop.getEligible(signer.address, dropId);
    console.log(`\n✓ Eligible for Drop ${dropId}: ${eligible}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

async function getAccountInfo() {
  const [signer] = await hre.ethers.getSigners();
  const address = await signer.getAddress();
  
  console.log("\n👤 Account Information:");
  console.log("─────────────────────────────────────────");
  
  try {
    // Get ETH balance
    const ethBalance = await hre.ethers.provider.getBalance(address);
    console.log(`✓ Address: ${address}`);
    console.log(`✓ ETH Balance: ${hre.ethers.formatEther(ethBalance)} ETH`);
    
    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    console.log(`✓ Network: ${network.name} (${network.chainId})`);
    
    // Get gas price
    const gasPrice = await hre.ethers.provider.getGasPrice();
    console.log(`✓ Gas Price: ${hre.ethers.formatUnits(gasPrice, "gwei")} gwei`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// ============================================================
// BATCH OPERATIONS
// ============================================================

async function batchOperations() {
  const [signer] = await hre.ethers.getSigners();
  const dragN = new hre.ethers.Contract(DRAGN_ADDRESS, dragNAbi, signer);
  const fairToken = new hre.ethers.Contract(FAIR_TOKEN_ADDRESS, fairTokenAbi, signer);
  
  console.log("\n📦 Batch Operations:");
  console.log("─────────────────────────────────────────");
  
  try {
    // Get all data in parallel
    const [dragNSupply, fairBalance, dragNBalance] = await Promise.all([
      dragN.totalSupply(),
      fairToken.balanceOf(signer.address),
      dragN.balanceOf(signer.address),
    ]);
    
    console.log(`\n✓ DragNPuff Supply: ${dragNSupply.toString()}`);
    console.log(`✓ FairToken Balance: ${hre.ethers.formatEther(fairBalance)}`);
    console.log(`✓ NFT Balance: ${dragNBalance.toString()}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// ============================================================
// MAIN EXECUTION
// ============================================================

async function main() {
  console.log("\n═════════════════════════════════════════");
  console.log("🎮 DragNPuff Contract Examples");
  console.log("═════════════════════════════════════════");
  
  await getAccountInfo();
  await dragNExamples();
  await fairTokenExamples();
  await minterExamples();
  await airdropExamples();
  await batchOperations();
  
  console.log("\n═════════════════════════════════════════");
  console.log("✅ Examples completed!");
  console.log("═════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
