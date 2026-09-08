# Cricket Auction Simulator

A real-time, interactive cricket player auction and squad management platform built with React, Vite, Tailwind CSS, and Firebase Realtime Database.

[![CI](https://github.com/daanialmirza5/cricket-auction/actions/workflows/ci.yml/badge.svg)](https://github.com/daanialmirza5/cricket-auction/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime_Database-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Overview

Conducting community or club cricket player auctions typically suffers from manual bookkeeping errors, desynchronized bidding logs, and budget calculation mistakes. 

**Cricket Auction Simulator** solves this by providing a synchronized, multi-role auction room:
- **Role-Based Access Control**: Separate interfaces and permissions for *Organizers* (control auction flow, next player, pause/timer reset, sell/unsold), *Team Owners* (live 1-tap bidding, remaining purse enforcement, squad constraints), and *Viewers* (read-only live dashboard).
- **Real-Time State Synchronization**: Backed by Firebase Realtime Database with live WebSocket updates for bids, countdown timers, and team purse deductions.
- **Budget & Slot Enforcement**: Automatic purse deduction, slot limit checks, and maximum allowed bid calculations ensuring teams reserve funds for mandatory squad spots.
- **Roster & Player Management**: Live categorized rosters, player status tracking (Sold, Unsold, In Pool), and team breakdown views.

---

## Architecture

```mermaid
flowchart TD
    subgraph Clients ["Web Client (React + Vite + Tailwind)"]
        OrganizerView[Organizer Console\nTimer | Pause | Sell | Next]
        OwnerView[Team Owner Console\n1-Tap Bidding | Purse Radar]
        ViewerView[Spectator Dashboard\nLive Auction Stream]
    end

    subgraph Logic ["Auction Engine (src/utils/auctionHelpers.js)"]
        BidValidator[Bid & Purse Validator]
        SlotManager[Squad Slot Counter]
        PurseCalculator[Max Allowed Bid Calculator]
    end

    subgraph FirebaseCloud ["Backend & State Sync (Firebase Realtime DB)"]
        AuctionRef["/auction state\ncurrentBid | highestBidder | timer"]
        TeamsRef["/teams state\nbudget | spent | slots | players"]
        PlayersRef["/players state\nsold | unsold | remaining"]
    end

    OrganizerView -->|Update Auction State| AuctionRef
    OwnerView -->|Place Bid| BidValidator
    BidValidator --> PurseCalculator
    PurseCalculator --> SlotManager
    OwnerView -->|Sync Valid Bid| AuctionRef
    AuctionRef -->|Real-Time Broadcast| Clients
    TeamsRef -->|Real-Time Broadcast| Clients
    PlayersRef -->|Real-Time Broadcast| Clients
```

---

## Key Features

- **Live Bidding Room**: Instantaneous bid increments with automatic tracking of highest bidder and leading team.
- **Timer & Phase Controls**: Configurable bidding timers with pause, resume, and overtime warning sounds.
- **Purse & Squad Math Engine**: Enforces minimum slot reserves so teams cannot overspend early and fail to fill their roster.
- **Role-Based Login**: Seamless switcher between Organizers, Team Owners (Deadly Destroyers, Turf Assassins, Spartans), and Spectators.
- **Dynamic Team Rosters**: Instant squad card updates showing acquired players, remaining slots, total spent, and remaining purse.

---

## Tech Stack

- **Frontend**: React 19, JavaScript (ESM)
- **Styling**: Tailwind CSS, PostCSS, Lucide React Icons
- **Build Tool**: Vite 6.0
- **Real-Time Backend**: Firebase Realtime Database (Google Cloud)
- **Testing**: Node.js Test Runner (`node:test`)
- **CI/CD**: GitHub Actions

---

## Project Structure

```text
cricket-auction/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated build & test CI pipeline
├── public/                      # Static icons and assets
├── src/
│   ├── assets/                  # Team logos and visual branding
│   ├── utils/
│   │   └── auctionHelpers.js    # Pure business logic and bid calculations
│   ├── App.css                  # Custom layout styles
│   ├── App.jsx                  # Main auction room & role view switcher
│   ├── firebase.js              # Firebase client SDK initialization
│   ├── index.css                # Tailwind directives
│   └── main.jsx                 # React root render
├── tests/
│   └── auction.test.js          # Unit tests for budget, slots & bid validation
├── .env.example                 # Environment configuration template
├── package.json
├── vite.config.js
└── README.md
```

---

## Installation & Local Setup

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 20 & 22)
- npm or pnpm

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/daanialmirza5/cricket-auction.git
cd cricket-auction
npm install
```

### 3. Environment Configuration (Optional)
A pre-configured demo Firebase database instance is provided in `src/firebase.js`. To connect your own Firebase Realtime Database:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Running Tests

Execute the automated unit test suite:

```bash
npm test
```

---

## Demo Credentials

The application provides demo roles for instant local evaluation:

| Role | Username | Password | Access / Permissions |
|---|---|---|---|
| **Organizer** | `organizer1` | `admin123` | Full controls: Start, Pause, Sell, Next Player, Reset |
| **Team Owner (Deadly Destroyers)** | `Uzair` | `1234` | Place bids on behalf of Deadly Destroyers |
| **Team Owner (Turf Assassins)** | `Muzammil` | `1234` | Place bids on behalf of Turf Assassins |
| **Team Owner (Spartans)** | `Dilli` | `1234` | Place bids on behalf of Spartans |
| **Viewer** | `viewer` | `1234` | Read-only live stream of bids and player allocations |

---

## License

This project is licensed under the [MIT License](LICENSE).
