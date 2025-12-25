const { expect } = require("chai");
const {
  createLogger,
  logTransaction,
  logError,
} = require("../../../utils/logger");

describe("Logger Utils", () => {
  let logger;
  const originalLog = console.log;
  const originalError = console.error;
  let logs = [];

  before(() => {
    console.log = (...args) => logs.push(args.join(" "));
    console.error = (...args) => logs.push(args.join(" "));
  });

  after(() => {
    console.log = originalLog;
    console.error = originalError;
  });

  beforeEach(() => {
    logs = [];
    logger = createLogger("test");
  });

  describe("createLogger", () => {
    it("should create logger with name", () => {
      expect(logger).to.exist;
      expect(logger.info).to.be.a("function");
      expect(logger.warn).to.be.a("function");
      expect(logger.error).to.be.a("function");
      expect(logger.debug).to.be.a("function");
    });

    it("should log at different levels", () => {
      logger.info("info message");
      logger.warn("warn message");
      logger.error("error message");
      logger.debug("debug message");
      
      expect(logs.length).to.be.greaterThan(0);
    });
  });

  describe("logTransaction", () => {
    it("should log transaction details", () => {
      const tx = {
        hash: "0xabc123",
        from: "0x123",
        to: "0x456",
        value: "1000000000000000000",
      };
      logTransaction(logger, tx);
      expect(logs.length).to.be.greaterThan(0);
    });
  });

  describe("logError", () => {
    it("should log error with context", () => {
      const error = new Error("test error");
      logError(logger, error, "test context");
      expect(logs.length).to.be.greaterThan(0);
    });
  });
});
