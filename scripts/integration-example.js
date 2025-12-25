/**
 * Complete Integration Example
 * Shows how to use all DragNPuff contracts together
 */

const { ethers } = require("ethers");
const contracts = require("./constants/addresses");

async function main() {
  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("🚀 Starting Complete Integration Example");
  console.log("📍 Connected to Base Network");
  console.log(`👤 Signer: ${signer.address}`);

  try {
    // === EXAMPLE 1: Check Account Balance ===
    console.log("\n1️⃣ Checking Account Balance...");
    const balance = await provider.getBalance(signer.address);
    console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);

    // === EXAMPLE 2: Get FairToken Balance ===
    console.log("\n2️⃣ Getting FairToken Balance...");
    const fairTokenAbi = [
      "function balanceOf(address owner) external view returns (uint256)",
    ];
    const fairToken = new ethers.Contract(
      contracts.BASE.FAIR_TOKEN,
      fairTokenAbi,
      provider
    );
    const tokenBalance = await fairToken.balanceOf(signer.address);
    console.log(
      `   FairToken Balance: ${ethers.formatEther(tokenBalance)} FAIR`
    );

    // === EXAMPLE 3: Get DragNPuff NFT Count ===
    console.log("\n3️⃣ Getting DragNPuff NFT Count...");
    const dragnpuffAbi = [
      "function balanceOf(address owner) external view returns (uint256)",
    ];
    const dragnpuff = new ethers.Contract(
      contracts.BASE.DRAGNPUFF,
      dragnpuffAbi,
      provider
    );
    const nftCount = await dragnpuff.balanceOf(signer.address);
    console.log(`   NFT Count: ${nftCount.toString()}`);

    // === EXAMPLE 4: Check MINTER_ROLE ===
    console.log("\n4️⃣ Checking MINTER_ROLE...");
    const minterAbi = [
      "function hasRole(bytes32 role, address account) external view returns (bool)",
      "function MINTER_ROLE() external view returns (bytes32)",
    ];
    const minter = new ethers.Contract(
      contracts.BASE.MINTER,
      minterAbi,
      provider
    );
    const MINTER_ROLE = await minter.MINTER_ROLE();
    const hasMinterRole = await minter.hasRole(MINTER_ROLE, signer.address);
    console.log(`   Has MINTER_ROLE: ${hasMinterRole}`);

    // === EXAMPLE 5: Estimate Mint Fee ===
    console.log("\n5️⃣ Estimating Mint Fee...");
    const minterWithoutRole = new ethers.Contract(
      contracts.BASE.MINTER,
      [
        "function publicMintFee() external view returns (uint256)",
        "function holderMintFee() external view returns (uint256)",
      ],
      provider
    );
    const publicFee = await minterWithoutRole.publicMintFee();
    const holderFee = await minterWithoutRole.holderMintFee();
    console.log(`   Public Mint Fee: ${ethers.formatEther(publicFee)} ETH`);
    console.log(`   Holder Mint Fee: ${ethers.formatEther(holderFee)} ETH`);

    // === EXAMPLE 6: Get Airdrop Info ===
    console.log("\n6️⃣ Getting Airdrop Information...");
    const airdropAbi = [
      "function balanceOf(address account) external view returns (uint256)",
      "function claimed(address account) external view returns (bool)",
    ];
    const airdrop = new ethers.Contract(
      contracts.BASE.AIRDROP,
      airdropAbi,
      provider
    );
    const airdropBalance = await airdrop.balanceOf(signer.address);
    const claimed = await airdrop.claimed(signer.address);
    console.log(`   Airdrop Balance: ${ethers.formatEther(airdropBalance)} ETH`);
    console.log(`   Already Claimed: ${claimed}`);

    // === EXAMPLE 7: Estimate Gas Costs ===
    console.log("\n7️⃣ Estimating Gas Costs...");
    const gasPrice = await provider.getFeeData();
    console.log(`   Base Fee: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} gwei`);
    console.log(
      `   Current Priority Fee: ${ethers.formatUnits(gasPrice.maxPriorityFeePerGas, "gwei")} gwei`
    );

    // === EXAMPLE 8: Network Information ===
    console.log("\n8️⃣ Network Information...");
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    console.log(`   Network: ${network.name}`);
    console.log(`   Chain ID: ${network.chainId}`);
    console.log(`   Block Number: ${blockNumber}`);

    console.log("\n✅ Integration Example Complete!");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  }
}

main().catch(console.error);
