// Mint NFT from DragNPuff contract
const hre = require("hardhat");
require("dotenv").config();

const DRAGNPUFF_ADDRESS = "0x5eCbc3931C78169cbF682C9b15602EB8f9A42387";
const MINTER_ADDRESS = "0x1dfA9A1afe793882229111Df790B09155EDF86e0";

async function main() {
  console.log("🎨 Minting NFT from DragNPuff...");
  
  const [signer] = await hre.ethers.getSigners();
  console.log(`📌 Using account: ${signer.address}`);
  
  const contractAbi = require("../artifacts/contracts/DragNPuff.sol/DragNPuff.json").abi;
  const dragNPuff = new hre.ethers.Contract(DRAGNPUFF_ADDRESS, contractAbi, signer);
  
  try {
    console.log("\n🔄 Executing safeMint...");
    
    // Call safeMint function
    const tx = await dragNPuff.safeMint(signer.address);
    console.log(`📝 Transaction hash: ${tx.hash}`);
    
    // Wait for transaction
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed!`);
    console.log(`📊 Gas used: ${receipt.gasUsed.toString()}`);
    
    // Get total supply
    const totalSupply = await dragNPuff.totalSupply();
    console.log(`\n📈 Total supply: ${totalSupply.toString()}`);
    
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
