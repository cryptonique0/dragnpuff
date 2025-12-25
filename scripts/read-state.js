// Read contract state information
const hre = require("hardhat");
require("dotenv").config();

const CONTRACTS = {
  DRAGNPUFF: "0x5eCbc3931C78169cbF682C9b15602EB8f9A42387",
  MINTER: "0x1dfA9A1afe793882229111Df790B09155EDF86e0",
  FAIR_TOKEN: "0xC4163b96b1c45e4A8920Cb3Db822b485d9748746",
  AIRDROP: "0xEBD66a0624e758Ec0FA3268e012Bab33e8247080"
};

async function main() {
  console.log("📊 Reading Contract State...");
  console.log("═════════════════════════════════════════\n");
  
  const [signer] = await hre.ethers.getSigners();
  console.log(`👤 Account: ${signer.address}`);
  
  try {
    // Get account balance
    const balance = await hre.ethers.provider.getBalance(signer.address);
    const balanceInEth = hre.ethers.formatEther(balance);
    console.log(`💰 ETH Balance: ${balanceInEth} ETH`);
    
    // DragNPuff info
    console.log("\n🐉 DragNPuff Contract:");
    console.log("─────────────────────────────────────────");
    
    const dragNPuffAbi = require("../artifacts/contracts/DragNPuff.sol/DragNPuff.json").abi;
    const dragNPuff = new hre.ethers.Contract(CONTRACTS.DRAGNPUFF, dragNPuffAbi, signer);
    
    const name = await dragNPuff.name();
    const symbol = await dragNPuff.symbol();
    const totalSupply = await dragNPuff.totalSupply();
    const balance721 = await dragNPuff.balanceOf(signer.address);
    
    console.log(`✓ Name: ${name}`);
    console.log(`✓ Symbol: ${symbol}`);
    console.log(`✓ Total Supply: ${totalSupply.toString()}`);
    console.log(`✓ Your Balance: ${balance721.toString()} NFTs`);
    
    // FairToken info (ERC20)
    console.log("\n💎 FairToken Contract:");
    console.log("─────────────────────────────────────────");
    
    try {
      const erc20Abi = [
        "function name() public view returns (string memory)",
        "function symbol() public view returns (string memory)",
        "function decimals() public view returns (uint8)",
        "function totalSupply() public view returns (uint256)",
        "function balanceOf(address account) public view returns (uint256)"
      ];
      
      const fairToken = new hre.ethers.Contract(CONTRACTS.FAIR_TOKEN, erc20Abi, signer);
      
      const tokenName = await fairToken.name();
      const tokenSymbol = await fairToken.symbol();
      const tokenBalance = await fairToken.balanceOf(signer.address);
      const decimals = await fairToken.decimals();
      
      console.log(`✓ Name: ${tokenName}`);
      console.log(`✓ Symbol: ${tokenSymbol}`);
      console.log(`✓ Your Balance: ${hre.ethers.formatUnits(tokenBalance, decimals)} ${tokenSymbol}`);
    } catch (error) {
      console.log(`⚠️  Could not read FairToken: ${error.message}`);
    }
    
    console.log("\n📋 Contract Addresses:");
    console.log("─────────────────────────────────────────");
    Object.entries(CONTRACTS).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });
    
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
