const { expect } = require("chai");
const {
  formatEth,
  parseEth,
  isValidAddress,
  getChainName,
  toChecksum,
} = require("../../../utils/blockchain");

describe("Blockchain Utils", () => {
  describe("formatEth", () => {
    it("should format wei to ETH", () => {
      const result = formatEth("1000000000000000000");
      expect(result).to.equal("1.00");
    });

    it("should handle large amounts", () => {
      const result = formatEth("1000000000000000000000");
      expect(result).to.equal("1000.00");
    });

    it("should handle zero", () => {
      const result = formatEth("0");
      expect(result).to.equal("0.00");
    });
  });

  describe("parseEth", () => {
    it("should parse ETH to wei", () => {
      const result = parseEth("1");
      expect(result).to.equal("1000000000000000000");
    });

    it("should handle decimals", () => {
      const result = parseEth("0.5");
      expect(result).to.equal("500000000000000000");
    });
  });

  describe("isValidAddress", () => {
    it("should validate valid addresses", () => {
      expect(isValidAddress("0x5eCbc3931C78169cbF682C9b15602EB8f9A42387")).to.be.true;
    });

    it("should reject invalid addresses", () => {
      expect(isValidAddress("0x123")).to.be.false;
      expect(isValidAddress("not-an-address")).to.be.false;
    });
  });

  describe("getChainName", () => {
    it("should return correct chain names", () => {
      expect(getChainName(8453)).to.equal("Base");
      expect(getChainName(1)).to.equal("Ethereum");
    });
  });

  describe("toChecksum", () => {
    it("should convert to checksummed address", () => {
      const addr = "0x5ecbc3931c78169cbf682c9b15602eb8f9a42387";
      const checksummed = toChecksum(addr);
      expect(checksummed).to.match(/^0x[0-9A-F]/);
    });
  });
});
