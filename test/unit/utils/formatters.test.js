const { expect } = require("chai");
const {
  formatAddress,
  formatEthValue,
  formatNumber,
  formatPercent,
  formatDate,
} = require("../../../utils/formatters");

describe("Formatter Utils", () => {
  describe("formatAddress", () => {
    it("should shorten address", () => {
      const addr = "0x5eCbc3931C78169cbF682C9b15602EB8f9A42387";
      const result = formatAddress(addr);
      expect(result).to.equal("0x5eCb...42387");
    });

    it("should handle invalid addresses", () => {
      expect(() => formatAddress("invalid")).to.throw();
    });
  });

  describe("formatEthValue", () => {
    it("should format wei to ETH with decimals", () => {
      const result = formatEthValue("1234567890123456789");
      expect(result).to.include("ETH");
    });

    it("should handle large numbers", () => {
      const result = formatEthValue("1000000000000000000000");
      expect(result).to.include("ETH");
    });
  });

  describe("formatNumber", () => {
    it("should format numbers with commas", () => {
      const result = formatNumber(1000000);
      expect(result).to.equal("1,000,000");
    });

    it("should handle decimals", () => {
      const result = formatNumber(1000.5, 1);
      expect(result).to.include("1,000");
    });
  });

  describe("formatPercent", () => {
    it("should format decimal as percent", () => {
      const result = formatPercent(0.5);
      expect(result).to.equal("50.00%");
    });

    it("should handle edge cases", () => {
      expect(formatPercent(0)).to.equal("0.00%");
      expect(formatPercent(1)).to.equal("100.00%");
    });
  });

  describe("formatDate", () => {
    it("should format timestamp to date string", () => {
      const timestamp = 1700000000;
      const result = formatDate(timestamp);
      expect(result).to.be.a("string");
    });
  });
});
