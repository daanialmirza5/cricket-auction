/**
 * Core business logic and calculations for cricket player auction management.
 */

/**
 * Calculates remaining purse for a given team.
 * @param {{ budget: number, spent: number }} team
 * @returns {number}
 */
export function calculateRemainingBudget(team) {
  if (!team || typeof team.budget !== "number" || typeof team.spent !== "number") {
    return 0;
  }
  return Math.max(0, team.budget - team.spent);
}

/**
 * Calculates remaining available player slots for a team.
 * @param {{ slots: number, players?: Array }} team
 * @returns {number}
 */
export function calculateRemainingSlots(team) {
  if (!team || typeof team.slots !== "number") {
    return 0;
  }
  const count = Array.isArray(team.players) ? team.players.length : 0;
  return Math.max(0, team.slots - count);
}

/**
 * Calculates the maximum bid a team can place while reserving enough purse
 * for all remaining mandatory squad slots.
 * @param {{ budget: number, spent: number, slots: number, players?: Array }} team
 * @param {number} minReservePerSlot
 * @returns {number}
 */
export function calculateMaxAllowedBid(team, minReservePerSlot = 0) {
  const remainingBudget = calculateRemainingBudget(team);
  const remainingSlots = calculateRemainingSlots(team);

  if (remainingSlots <= 0) {
    return 0;
  }
  const reservedForOtherSlots = Math.max(0, (remainingSlots - 1) * minReservePerSlot);
  return Math.max(0, remainingBudget - reservedForOtherSlots);
}

/**
 * Calculates dynamic tiered bid increment based on current bid level.
 * Follows tournament bidding ladder:
 * - < 10,000 -> 1,000
 * - 10,000 to 50,000 -> 2,500
 * - 50,000 to 100,000 -> 5,000
 * - >= 100,000 -> 10,000
 * @param {number} currentBid
 * @returns {number}
 */
export function calculateDynamicIncrement(currentBid = 0) {
  if (currentBid < 10000) return 1000;
  if (currentBid < 50000) return 2500;
  if (currentBid < 100000) return 5000;
  return 10000;
}

/**
 * Validates if a team is eligible to place a specific bid amount.
 * @param {{ budget: number, spent: number, slots: number, players?: Array }} team
 * @param {number} bidAmount
 * @param {number} minReservePerSlot
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateBid(team, bidAmount, minReservePerSlot = 0) {
  if (!team) {
    return { valid: false, reason: "Team not found" };
  }
  if (bidAmount <= 0) {
    return { valid: false, reason: "Bid amount must be positive" };
  }
  const remainingSlots = calculateRemainingSlots(team);
  if (remainingSlots <= 0) {
    return { valid: false, reason: "Squad slots full" };
  }
  const maxBid = calculateMaxAllowedBid(team, minReservePerSlot);
  if (bidAmount > maxBid) {
    return {
      valid: false,
      reason: `Bid of ₹${bidAmount.toLocaleString()} exceeds maximum allowed bid of ₹${maxBid.toLocaleString()}`,
    };
  }
  return { valid: true };
}

/**
 * Resolves race conditions across concurrent incoming bids.
 * Orders primarily by timestamp ascending (earlier arrival wins).
 * If timestamps match, breaks tie by highest remaining purse, then by highest squad capacity.
 * @param {Array<{ team: Object, amount: number, timestamp: number, bidId: string }>} incomingBids
 * @param {number} minReservePerSlot
 * @returns {{ winningBid: Object | null, rejectedBids: Array<{ bid: Object, reason: string }> }}
 */
export function resolveConcurrentBids(incomingBids = [], minReservePerSlot = 0) {
  if (!Array.isArray(incomingBids) || incomingBids.length === 0) {
    return { winningBid: null, rejectedBids: [] };
  }

  const validBids = [];
  const rejectedBids = [];

  for (const bid of incomingBids) {
    const validation = validateBid(bid.team, bid.amount, minReservePerSlot);
    if (!validation.valid) {
      rejectedBids.push({ bid, reason: validation.reason || "Invalid bid" });
    } else {
      validBids.push(bid);
    }
  }

  if (validBids.length === 0) {
    return { winningBid: null, rejectedBids };
  }

  // Sort: higher amount first; if equal amount, earlier timestamp; if equal timestamp, larger remaining budget
  validBids.sort((a, b) => {
    if (b.amount !== a.amount) {
      return b.amount - a.amount;
    }
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }
    const aRemaining = calculateRemainingBudget(a.team);
    const bRemaining = calculateRemainingBudget(b.team);
    return bRemaining - aRemaining;
  });

  const winningBid = validBids[0];
  const outbid = validBids.slice(1).map((b) => ({
    bid: b,
    reason: "Outbid by concurrent higher or earlier bid",
  }));

  return {
    winningBid,
    rejectedBids: [...rejectedBids, ...outbid],
  };
}

/**
 * Simulates purchasing a player and returns an updated team copy.
 * @param {{ budget: number, spent: number, slots: number, players: Array }} team
 * @param {string | Object} player
 * @param {number} soldPrice
 * @returns {{ budget: number, spent: number, slots: number, players: Array }}
 */
export function applySoldPlayer(team, player, soldPrice) {
  const currentPlayers = Array.isArray(team.players) ? [...team.players] : [];
  return {
    ...team,
    spent: (team.spent || 0) + soldPrice,
    players: [...currentPlayers, player],
  };
}

/**
 * Calculates next standard or tiered bid.
 * @param {number} currentBid
 * @param {number} [customIncrement]
 * @returns {number}
 */
export function getNextBid(currentBid, customIncrement) {
  const increment = typeof customIncrement === "number" && customIncrement > 0
    ? customIncrement
    : calculateDynamicIncrement(currentBid);
  return (currentBid || 0) + increment;
}

/**
 * Generates an analytical roster summary for recruiter and admin inspection.
 * @param {{ name: string, budget: number, spent: number, slots: number, players?: Array }} team
 * @param {number} [minReservePerSlot=0]
 * @returns {Object}
 */
export function generateTeamRosterSummary(team, minReservePerSlot = 0) {
  const remainingBudget = calculateRemainingBudget(team);
  const remainingSlots = calculateRemainingSlots(team);
  const maxBid = calculateMaxAllowedBid(team, minReservePerSlot);
  const playerCount = Array.isArray(team.players) ? team.players.length : 0;
  const avgCostPerPlayer = playerCount > 0 ? Math.round(team.spent / playerCount) : 0;
  const budgetUtilizationPct = team.budget > 0 ? Number(((team.spent / team.budget) * 100).toFixed(1)) : 0;

  return {
    teamName: team.name || "Unnamed Team",
    totalBudget: team.budget || 0,
    spent: team.spent || 0,
    remainingBudget,
    totalSlots: team.slots || 0,
    filledSlots: playerCount,
    remainingSlots,
    maxAllowedBid: maxBid,
    avgCostPerPlayer,
    budgetUtilizationPct,
    isComplete: remainingSlots === 0,
  };
}
