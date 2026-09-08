import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateRemainingBudget,
  calculateRemainingSlots,
  calculateMaxAllowedBid,
  validateBid,
  applySoldPlayer,
  getNextBid,
} from "../src/utils/auctionHelpers.js";

describe("Cricket Auction Engine Calculations", () => {
  const sampleTeam = {
    name: "Deadly Destroyers",
    budget: 80000,
    spent: 30000,
    slots: 6,
    players: ["Player 1", "Player 2"],
  };

  test("calculates remaining purse correctly", () => {
    const remaining = calculateRemainingBudget(sampleTeam);
    assert.equal(remaining, 50000);
  });

  test("calculates remaining squad slots correctly", () => {
    const remainingSlots = calculateRemainingSlots(sampleTeam);
    assert.equal(remainingSlots, 4); // 6 total - 2 filled
  });

  test("calculates max allowed bid reserving min price for remaining slots", () => {
    // 4 remaining slots. 1 for current bid, 3 remaining after that.
    // With 2,000 min reserve per remaining slot: 50,000 - (3 * 2,000) = 44,000.
    const maxBid = calculateMaxAllowedBid(sampleTeam, 2000);
    assert.equal(maxBid, 44000);
  });

  test("validates bids within allowed budget", () => {
    const valid = validateBid(sampleTeam, 40000, 2000);
    assert.equal(valid.valid, true);

    const excessive = validateBid(sampleTeam, 45000, 2000);
    assert.equal(excessive.valid, false);
    assert.match(excessive.reason, /exceeds maximum allowed bid/);
  });

  test("rejects bids when team squad is full", () => {
    const fullTeam = {
      ...sampleTeam,
      players: ["P1", "P2", "P3", "P4", "P5", "P6"],
    };
    const check = validateBid(fullTeam, 1000);
    assert.equal(check.valid, false);
    assert.equal(check.reason, "Squad slots full");
  });

  test("applies sold player purchase to team budget and roster", () => {
    const updated = applySoldPlayer(sampleTeam, "Daanial Mirza", 15000);
    assert.equal(updated.spent, 45000);
    assert.equal(updated.players.length, 3);
    assert.equal(updated.players[2], "Daanial Mirza");
  });

  test("increments bid according to standard auction rules", () => {
    assert.equal(getNextBid(3000, 1000), 4000);
    assert.equal(getNextBid(10000, 2000), 12000);
  });
});
