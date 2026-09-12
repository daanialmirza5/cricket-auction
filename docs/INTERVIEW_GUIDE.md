# Cricket Auction — Interview Guide & Technical Defense

## 1. Pitches
- **30-Second Pitch**: "Cricket Auction is a real-time synchronized player bidding room built with React and WebSockets that enforces dynamic team purse constraints, minimum squad reserve math, and automated bidding ladders."
- **2-Minute Pitch**: "Live sports auctions require strict concurrency rules and real-time state synchronization. Cricket Auction delivers an interactive bidding experience with sub-second latency. When a player is presented on the auction block, franchise owners place synchronized bids via real-time sockets. The system dynamically enforces budget constraints using reserve calculation math—preventing a franchise from bidding an amount that would make it mathematically impossible to fill their mandatory minimum squad roster."

## 2. Key Technical Q&A
- **Q: How do you prevent a team from going bankrupt before completing their squad?**
  - **A**: The auction engine recalculates `MaxAllowedBid` on every step by reserving `(RemainingSlots - 1) * BasePrice` from the team's available purse. Any bid exceeding this threshold is rejected on the client and server before broadcast.
