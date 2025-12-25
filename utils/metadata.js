/**
 * NFT Metadata Generator
 */

/**
 * Generate trait values
 * @param {number} tokenId - Token ID
 * @returns {array}
 */
function generateTraits(tokenId) {
  const categories = ["Species", "Color", "Pattern", "Size", "Element", "Aura", "Expression"];
  const traits = [];

  for (let i = 0; i < categories.length; i++) {
    const seed = tokenId * (i + 1);
    const value = Math.floor(seed % 111);
    traits.push({
      trait_type: categories[i],
      value: `Trait_${value}`,
    });
  }

  return traits;
}

/**
 * Generate metadata for NFT
 * @param {number} tokenId - Token ID
 * @param {string} baseUrl - Base URL for metadata
 * @returns {object}
 */
function generateMetadata(tokenId, baseUrl = "https://dragnpuff.xyz/metadata") {
  return {
    name: `DragN'Puff #${tokenId}`,
    description: "A unique DragN'Puff NFT from House of the DragNs",
    image: `${baseUrl}/images/${tokenId}.png`,
    external_url: `https://dragnpuff.xyz/dragn/${tokenId}`,
    attributes: generateTraits(tokenId),
    properties: {
      category: "DragN'Puff",
      rarity: Math.random() > 0.9 ? "Rare" : "Common",
    },
  };
}

module.exports = {
  generateTraits,
  generateMetadata,
};
