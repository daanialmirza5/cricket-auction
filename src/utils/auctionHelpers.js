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
 * Simulates purchasing a player and returns an updated team copy.
 * @param {{ budget: number, spent: number, slots: number, players: Array }} team
 * @param {string} player
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
 * Calculates next standard bid increment.
 * @param {number} currentBid
 * @param {number} increment
 * @returns {number}
 */
export function getNextBid(currentBid, increment = 1000) {
  return (currentBid || 0) + increment;
}
