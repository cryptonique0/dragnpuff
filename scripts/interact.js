// Interact with deployed DragNPuff contract
const hre = require("hardhat");
require("dotenv").config();

const DRAGNPUFF_ADDRESS = "0x5eCbc3931C78169cbF682C9b15602EB8f9A42387";

async function main() {
  console.log("🔍 Connecting to DragNPuff contract...");
  
  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`📌 Using account: ${signer.address}`);
  
  // Get contract ABI
  const contractAbi = require("../artifacts/contracts/DragNPuff.sol/DragNPuff.json").abi;
  
  // Create contract instance
  const dragNPuff = new hre.ethers.Contract(DRAGNPUFF_ADDRESS, contractAbi, signer);
  
  console.log("\n📊 Contract Information:");
  console.log("─────────────────────────────────────────");
  
  try {
    // Get contract name and symbol
    const name = await dragNPuff.name();
    const symbol = await dragNPuff.symbol();
    const baseUri = await dragNPuff.baseURI();
    
    console.log(`✓ Name: ${name}`);
    console.log(`✓ Symbol: ${symbol}`);
    console.log(`✓ Base URI: ${baseUri}`);
    
    console.log("\n🔐 Role Information:");
    console.log("─────────────────────────────────────────");
    
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
    
    const hasAdminRole = await dragNPuff.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
    const hasMinterRole = await dragNPuff.hasRole(MINTER_ROLE, signer.address);
    
    console.log(`✓ Admin Role: ${hasAdminRole}`);
    console.log(`✓ Minter Role: ${hasMinterRole}`);
    
    console.log("\n✅ Connected successfully!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
