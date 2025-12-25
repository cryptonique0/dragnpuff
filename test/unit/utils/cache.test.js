const { expect } = require("chai");
const {
  createCache,
  withCache,
} = require("../../../utils/cache");

describe("Cache Utils", () => {
  describe("createCache", () => {
    it("should create a cache instance", () => {
      const cache = createCache(1000);
      expect(cache).to.exist;
      expect(cache.set).to.be.a("function");
      expect(cache.get).to.be.a("function");
      expect(cache.clear).to.be.a("function");
    });

    it("should store and retrieve values", () => {
      const cache = createCache(5000);
      cache.set("key", "value");
      expect(cache.get("key")).to.equal("value");
    });

    it("should expire values after TTL", (done) => {
      const cache = createCache(100);
      cache.set("key", "value");
      expect(cache.get("key")).to.equal("value");
      
      setTimeout(() => {
        expect(cache.get("key")).to.be.undefined;
        done();
      }, 150);
    });

    it("should clear cache", () => {
      const cache = createCache(5000);
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.clear();
      expect(cache.get("key1")).to.be.undefined;
      expect(cache.get("key2")).to.be.undefined;
    });

    it("should handle multiple keys", () => {
      const cache = createCache(5000);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      expect(cache.get("a")).to.equal(1);
      expect(cache.get("b")).to.equal(2);
      expect(cache.get("c")).to.equal(3);
    });
  });

  describe("withCache", () => {
    it("should cache function results", async () => {
      let callCount = 0;
      const fn = async (x) => {
        callCount++;
        return x * 2;
      };

      const cached = withCache(fn, 5000);
      const result1 = await cached(5);
      const result2 = await cached(5);

      expect(result1).to.equal(10);
      expect(result2).to.equal(10);
      expect(callCount).to.equal(1);
    });

    it("should cache different arguments separately", async () => {
      let callCount = 0;
      const fn = async (x) => {
        callCount++;
        return x * 2;
      };

      const cached = withCache(fn, 5000);
      await cached(5);
      await cached(10);

      expect(callCount).to.equal(2);
    });
  });
});
