const { expect } = require("chai");
const request = require("supertest");

// Import the express app exported from the functions index
const { api } = require("../firebase/functions/dragn/index.js");

describe("Frame endpoints", function () {
  it("returns frame markup for quests", async function () {
    const res = await request(api).get("/api/frames/quests");
    expect(res.status).to.equal(200);
    expect(res.text).to.include("fc:frame");
    expect(res.text).to.include("Quest Board");
  });

  it("returns frame markup for badges", async function () {
    const res = await request(api).get("/api/frames/badges");
    expect(res.status).to.equal(200);
    expect(res.text).to.include("fc:frame");
    expect(res.text).to.include("Badges");
  });
});
