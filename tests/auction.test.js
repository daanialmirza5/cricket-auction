import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateRemainingBudget,
  calculateRemainingSlots,
  calculateMaxAllowedBid,
  calculateDynamicIncrement,
  validateBid,
  resolveConcurrentBids,
  applySoldPlayer,
  getNextBid,
  generateTeamRosterSummary,
} from "../src/utils/auctionHelpers.js";

describe("Cricket Auction Engine Calculations & Concurrency", () => {
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

  test("calculates dynamic tiered bid increments according to tournament ladder", () => {
    assert.equal(calculateDynamicIncrement(5000), 1000);
    assert.equal(calculateDynamicIncrement(25000), 2500);
    assert.equal(calculateDynamicIncrement(75000), 5000);
    assert.equal(calculateDynamicIncrement(150000), 10000);
  });

  test("computes next bid with standard or dynamic increment", () => {
    assert.equal(getNextBid(8000), 9000);
    assert.equal(getNextBid(20000), 22500);
    assert.equal(getNextBid(10000, 2000), 12000);
  });

  describe("Concurrent Bid Race Condition Resolver", () => {
    test("selects higher bid amount when timestamps differ or match", () => {
      const teamA = { name: "Team A", budget: 100000, spent: 20000, slots: 5, players: ["P1"] };
      const teamB = { name: "Team B", budget: 100000, spent: 30000, slots: 5, players: ["P1"] };

      const bids = [
        { team: teamA, amount: 25000, timestamp: 1002, bidId: "b1" },
        { team: teamB, amount: 30000, timestamp: 1001, bidId: "b2" },
      ];

      const resolution = resolveConcurrentBids(bids, 1000);
      assert.equal(resolution.winningBid.bidId, "b2");
      assert.equal(resolution.rejectedBids.length, 1);
      assert.equal(resolution.rejectedBids[0].bid.bidId, "b1");
    });

    test("breaks tie by earliest timestamp when bid amounts are identical", () => {
      const teamA = { name: "Team A", budget: 100000, spent: 20000, slots: 5, players: [] };
      const teamB = { name: "Team B", budget: 100000, spent: 20000, slots: 5, players: [] };

      const bids = [
        { team: teamB, amount: 20000, timestamp: 1050, bidId: "b-late" },
        { team: teamA, amount: 20000, timestamp: 1010, bidId: "b-early" },
      ];

      const resolution = resolveConcurrentBids(bids, 1000);
      assert.equal(resolution.winningBid.bidId, "b-early");
    });

    test("filters out invalid bids exceeding team capacity before resolving winners", () => {
      const poorTeam = { name: "Poor Team", budget: 10000, spent: 9000, slots: 5, players: [] };
      const solidTeam = { name: "Solid Team", budget: 100000, spent: 10000, slots: 5, players: [] };

      const bids = [
        { team: poorTeam, amount: 5000, timestamp: 1000, bidId: "invalid-overbudget" },
        { team: solidTeam, amount: 4000, timestamp: 1010, bidId: "valid-winner" },
      ];

      const resolution = resolveConcurrentBids(bids, 500);
      assert.equal(resolution.winningBid.bidId, "valid-winner");
      assert.match(resolution.rejectedBids[0].reason, /exceeds maximum allowed bid/);
    });
  });

  describe("Team Roster Analytics Summary", () => {
    test("generates complete team summary with utilization and remaining slots", () => {
      const summary = generateTeamRosterSummary(sampleTeam, 2000);
      assert.equal(summary.teamName, "Deadly Destroyers");
      assert.equal(summary.remainingBudget, 50000);
      assert.equal(summary.filledSlots, 2);
      assert.equal(summary.remainingSlots, 4);
      assert.equal(summary.maxAllowedBid, 44000);
      assert.equal(summary.avgCostPerPlayer, 15000);
      assert.equal(summary.budgetUtilizationPct, 37.5);
      assert.equal(summary.isComplete, false);
    });
  });
});
