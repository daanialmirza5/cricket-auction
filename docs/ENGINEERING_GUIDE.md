# Cricket Auction — Engineering Guide & Mastery Document

## 1. What Is Cricket Auction?
Cricket Auction is a **real-time synchronized player bidding and squad management room**. Designed for amateur and semi-pro cricket leagues, it enables real-time synchronized bidding across multiple team franchise clients using WebSockets / Firebase real-time listeners, enforcing dynamic purse limits and squad composition rules.

## 2. Real-World Problem Solved
1. **Synchronized State in Live Auctions**: Bidding rooms require sub-second state propagation across multiple team owners without out-of-order bid anomalies.
2. **Purse & Budget Violations**: Teams accidentally overspending their salary cap without sufficient remaining funds to complete the mandatory minimum squad size.
3. **Role Composition Constraints**: Enforcing required ratios of batsmen, bowlers, wicket-keepers, and all-rounders.

## 3. High-Level Architecture
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons.
- **Real-Time Layer**: Firebase Realtime DB / WebSocket state synchronization.
- **Auction Engine**:
  - `auctionHelpers.js`: Dynamic bid increments, purse validation, and minimum reserve calculation.
  - `tests/auction.test.js`: Comprehensive Jest/Vitest unit tests asserting purse constraints and bidding ladder increments.

## 4. Algorithmic Formulations
- **Maximum Bid Allowance Constraint**:
  $$\text{MaxAllowedBid} = \text{CurrentPurse} - (\text{MinSquadSize} - \text{CurrentSquadSize} - 1) \times \text{BasePrice}_{\min}$$
  This ensures a team always retains enough budget to fill out remaining mandatory squad slots.
- **Dynamic Bidding Ladder**:
  - Bid $< 100\text{k} \to +10\text{k}$ increment
  - Bid $100\text{k} - 500\text{k} \to +25\text{k}$ increment
  - Bid $> 500\text{k} \to +50\text{k}$ increment

## 5. Testing Strategy
- Unit test suite verifying dynamic ladder step sizing, purse exhaustion guardrails, and tie-break resolution.
