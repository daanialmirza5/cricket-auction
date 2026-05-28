import {
  useState,
  useEffect,
} from "react";

import {
  getDatabase,
  ref,
  set,
  onValue,
} from "firebase/database";

import app from "./firebase";

import thunderLogo from "./assets/thunder.jpeg";
import turfLogo from "./assets/turf.jpeg";
import gladiatorLogo from "./assets/gladiator.jpeg";

const db = getDatabase(app);

const initialTeams = [
  {
    name: "Thunder Strikers",
    owner: "Dr. Asif",
    icon: "Azim",
    budget: 80000,
    spent: 20000,
    slots: 6,
    logo: thunderLogo,
    players: [],
  },

  {
    name: "Turf Titans",
    owner: "Dr. Jameel",
    icon: "Asif New",
    budget: 80000,
    spent: 20000,
    slots: 6,
    logo: turfLogo,
    players: [],
  },

  {
    name: "Gladiator XI",
    owner: "Daanial",
    icon: "Wasif",
    budget: 80000,
    spent: 20000,
    slots: 6,
    logo: gladiatorLogo,
    players: [],
  },
];

const players = [
  "Dilli Rao",
  "Danish",
  "Faiz",
  "Muzammil",
  "Kaif",
  "Saquib",
  "Asif Saikh",
  "Mubarak",
  "Salim Bhai",
  "Reyaz",
  "Uzair",
  "Dinesh",
  "Ahad",
  "Mujahid",
  "Adnaan",
  "Zaid",
  "Ayaz",
  "Afsar Ali",
];

export default function App() {

  const [teams, setTeams] =
    useState(initialTeams);

  const [currentPlayerIndex, setCurrentPlayerIndex] =
    useState(0);

  const [currentBid, setCurrentBid] =
    useState(3000);

  const [highestBidder, setHighestBidder] =
    useState("");

  const [soldPlayers, setSoldPlayers] =
    useState([]);

  const [unsoldPlayers, setUnsoldPlayers] =
    useState([]);

  const [timer, setTimer] =
    useState(100);

  const [isPaused, setIsPaused] =
    useState(false);

  const [pauseTimer, setPauseTimer] =
    useState(15);

  const [auctionStarted, setAuctionStarted] =
    useState(false);

  const [auctionPaused, setAuctionPaused] =
    useState(false);

  const currentPlayer =
    players[currentPlayerIndex];

  // FIREBASE LOAD

  useEffect(() => {

    const auctionRef =
      ref(db, "auction");

    onValue(
      auctionRef,
      (snapshot) => {

        const data =
          snapshot.val();

        if (data) {

          setTeams(
            data.teams ||
            initialTeams
          );

          setCurrentPlayerIndex(
            data.currentPlayerIndex || 0
          );

          setCurrentBid(
            data.currentBid || 3000
          );

          setHighestBidder(
            data.highestBidder || ""
          );

          setSoldPlayers(
            data.soldPlayers || []
          );

          setUnsoldPlayers(
            data.unsoldPlayers || []
          );

          setTimer(
            data.timer || 100
          );

          setIsPaused(
            data.isPaused || false
          );

          setPauseTimer(
            data.pauseTimer || 15
          );

          setAuctionStarted(
            data.auctionStarted || false
          );

          setAuctionPaused(
            data.auctionPaused || false
          );
        }
      }
    );

  }, []);

  // SAVE FIREBASE

  useEffect(() => {

    set(
      ref(db, "auction"),

      {

        teams,

        currentPlayerIndex,

        currentBid,

        highestBidder,

        soldPlayers,

        unsoldPlayers,

        timer,

        isPaused,

        pauseTimer,

        auctionStarted,

        auctionPaused,

      }

    );

  }, [

    teams,

    currentPlayerIndex,

    currentBid,

    highestBidder,

    soldPlayers,

    unsoldPlayers,

    timer,

    isPaused,

    pauseTimer,

    auctionStarted,

    auctionPaused,

  ]);

  // TIMER EFFECT

  useEffect(() => {

    if (
      currentPlayerIndex >=
      players.length
    ) {
      return;
    }

    if (!auctionStarted) {
      return;
    }

    if (auctionPaused) {
      return;
    }

    // WAIT TIMER

    if (isPaused) {

      if (pauseTimer <= 0) {

        setIsPaused(false);

        setPauseTimer(15);

        setCurrentPlayerIndex(
          (prev) => prev + 1
        );

        setCurrentBid(3000);

        setHighestBidder("");

        return;
      }

      const pauseInterval =
        setInterval(() => {

          setPauseTimer(
            (prev) => prev - 1
          );

        }, 1000);

      return () =>
        clearInterval(
          pauseInterval
        );
    }

    // MAIN TIMER

    if (timer <= 0) {

      handleUnsold();

      return;
    }

    const interval =
      setInterval(() => {

        setTimer(
          (prev) => prev - 1
        );

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [
    timer,
    isPaused,
    pauseTimer,
    auctionStarted,
    auctionPaused,
    currentPlayerIndex,
  ]);

  // BID INCREMENT

  const getIncrement = () => {

    return currentBid < 15000
      ? 3000
      : 5000;
  };

  // NEXT PLAYER

  const moveToNextPlayer = () => {

    setIsPaused(true);

    setTimer(100);
  };

  // BID FUNCTION

  const handleBid = (team) => {

    if (isPaused) return;

    if (team.slots <= 0) {

      alert(
        `${team.name} squad is full`
      );

      return;
    }

    let nextBid;

    if (!highestBidder) {

      nextBid = 3000;

    } else {

      nextBid =
        currentBid +
        getIncrement();
    }

    const remainingSlots =
      team.slots - 1;

    const minimumRequired =
      remainingSlots * 3000;

    const remainingBalance =
      team.budget - nextBid;

    if (
      remainingBalance <
      minimumRequired
    ) {

      alert(
        `${team.name} does not have enough balance`
      );

      return;
    }

    setCurrentBid(nextBid);

    setHighestBidder(team.name);
  };

  // SOLD FUNCTION

  const handleSold = () => {

    if (!highestBidder) {

      alert("No bids yet");

      return;
    }

    const updatedTeams =
      teams.map((team) => {

        if (
          team.name ===
          highestBidder
        ) {

          return {
            ...team,

            budget:
              team.budget -
              currentBid,

            spent:
              team.spent +
              currentBid,

            slots:
              team.slots - 1,

            players: [
              ...(team.players || []),

              {
                name: currentPlayer,
                price: currentBid,
              },
            ],
          };
        }

        return team;
      });

    setTeams(updatedTeams);

    setSoldPlayers([
      ...(soldPlayers || []),

      {
        player: currentPlayer,
        amount: currentBid,
        team: highestBidder,
      },
    ]);

    moveToNextPlayer();
  };

  // UNSOLD

  const handleUnsold = () => {

    const availableTeams =
      teams.filter(
        (team) =>
          team.slots > 0 &&
          team.budget >= 3000
      );

    // AUTO ASSIGN

    if (availableTeams.length === 1) {

      const lastTeam =
        availableTeams[0];

      const updatedTeams =
        teams.map((team) => {

          if (
            team.name ===
            lastTeam.name
          ) {

            return {
              ...team,

              budget:
                team.budget - 3000,

              spent:
                team.spent + 3000,

              slots:
                team.slots - 1,

              players: [
                ...(team.players || []),

                {
                  name: currentPlayer,
                  price: 3000,
                },
              ],
            };
          }

          return team;
        });

      setTeams(updatedTeams);

      setSoldPlayers([
        ...(soldPlayers || []),

        {
          player: currentPlayer,
          amount: 3000,
          team: lastTeam.name,
        },
      ]);

      alert(
        `${currentPlayer} auto assigned to ${lastTeam.name}`
      );

      moveToNextPlayer();

      return;
    }

    setUnsoldPlayers([
      ...(unsoldPlayers || []),
      currentPlayer,
    ]);

    moveToNextPlayer();
  };

  return (

    <div className="min-h-screen bg-[#020817] text-white p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-black">
              Cricket Auction
            </h1>

            <p className="text-gray-400 mt-2">
              Live Tournament Dashboard
            </p>

          </div>

        </div>

        {/* STATS */}

        <div className="grid md:grid-cols-4 gap-5 mb-8">

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6">

            <p className="text-gray-400 text-sm">
              Teams
            </p>

            <h2 className="text-4xl font-black text-cyan-400 mt-2">
              3
            </h2>

          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6">

            <p className="text-gray-400 text-sm">
              Current Bid
            </p>

            <h2 className="text-4xl font-black text-green-400 mt-2">
              ₹{currentBid}
            </h2>

          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6">

            <p className="text-gray-400 text-sm">
              Highest Bidder
            </p>

            <h2 className="text-2xl font-bold mt-3">
              {highestBidder ||
                "Waiting..."}
            </h2>

          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6">

            <p className="text-gray-400 text-sm">
              Players Remaining
            </p>

            <h2 className="text-4xl font-black text-orange-400 mt-2">
              {
                players.length -
                currentPlayerIndex
              }
            </h2>

          </div>

        </div>

        {/* MAIN */}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* TEAMS */}

          <div className="lg:col-span-2">

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

              {teams.map((team, index) => (

                <div
                  key={index}
                  className="bg-[#0f172a] border border-[#1e293b] rounded-3xl overflow-hidden"
                >

                  <img
                    src={team.logo}
                    alt=""
                    className="w-full h-52 object-cover"
                  />

                  <div className="p-5">

                    <h2 className="text-2xl font-bold mb-5">
                      {team.name}
                    </h2>

                    <div className="space-y-3 mb-5">

                      <div className="bg-[#111c35] p-3 rounded-2xl flex justify-between">
                        <span className="text-gray-400">
                          Owner
                        </span>

                        <span>
                          {team.owner}
                        </span>
                      </div>

                      <div className="bg-[#111c35] p-3 rounded-2xl flex justify-between">
                        <span className="text-gray-400">
                          Balance
                        </span>

                        <span className="text-green-400 font-bold">
                          ₹{team.budget}
                        </span>
                      </div>

                      <div className="bg-[#111c35] p-3 rounded-2xl flex justify-between">
                        <span className="text-gray-400">
                          Slots
                        </span>

                        <span>
                          {team.slots}
                        </span>
                      </div>

                    </div>

                    <button
                      onClick={() =>
                        handleBid(team)
                      }

                      disabled={
                        team.slots <= 0 ||
                        isPaused ||
                        !auctionStarted ||
                        auctionPaused
                      }

                      className={`w-full py-4 rounded-2xl font-bold transition ${
                        team.slots <= 0
                          ? "bg-gray-700"
                          : "bg-cyan-500 hover:bg-cyan-400 text-black"
                      }`}
                    >

                      {team.slots <= 0
                        ? "SQUAD FULL"
                        : "BID NOW"}

                    </button>

                    {/* PLAYERS */}

                    <div className="mt-5">

                      <h3 className="font-bold mb-3">
                        Purchased Players
                      </h3>

                      <div className="space-y-2 max-h-40 overflow-y-auto">

                        {(team.players || []).length === 0 ? (

                          <p className="text-gray-500 text-sm">
                            No players
                          </p>

                        ) : (

                          (team.players || []).map(
                            (
                              player,
                              idx
                            ) => (

                              <div
                                key={idx}
                                className="bg-[#111c35] p-3 rounded-2xl flex justify-between"
                              >

                                <span>
                                  {
                                    player.name
                                  }
                                </span>

                                <span className="text-green-400">
                                  ₹
                                  {
                                    player.price
                                  }
                                </span>

                              </div>
                            )
                          )
                        )}

                      </div>

                    </div>

                  </div>

                </div>
              ))}

            </div>

          </div>

          {/* LIVE AUCTION */}

          <div>

            <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 sticky top-5">

              <h2 className="text-3xl font-bold mb-6">
                Live Auction
              </h2>

              <div className="bg-[#111c35] rounded-3xl p-8 text-center mb-5">

                <p className="text-gray-400 mb-3">
                  Current Player
                </p>

                <h2 className="text-5xl font-black mb-5">
                  {currentPlayer ||
                    "Finished"}
                </h2>

                <div className="mb-6">

                  {isPaused ? (

                    <div>

                      <p className="text-yellow-400 mb-2">
                        Next Player In
                      </p>

                      <h2 className="text-5xl font-black text-yellow-400">
                        {pauseTimer}s
                      </h2>

                    </div>

                  ) : (

                    <div>

                      <p className="text-gray-400 mb-2">
                        Auction Timer
                      </p>

                      <h2 className="text-5xl font-black text-red-400">
                        {timer}s
                      </h2>

                    </div>

                  )}

                </div>

                <p className="text-gray-400 mb-2">
                  Current Bid
                </p>

                <div className="text-6xl font-black text-green-400 mb-5">
                  ₹{currentBid}
                </div>

                <div className="text-lg">

                  Highest Bidder:

                  <span className="text-cyan-400 ml-2 font-bold">
                    {highestBidder ||
                      "No bids yet"}
                  </span>

                </div>

              </div>

              {/* SOLD UNSOLD */}

              <div className="grid grid-cols-2 gap-4 mb-4">

                <button
                  onClick={handleSold}

                  disabled={
                    isPaused ||
                    !auctionStarted ||
                    auctionPaused
                  }

                  className="bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-2xl"
                >
                  SOLD
                </button>

                <button
                  onClick={handleUnsold}

                  disabled={
                    isPaused ||
                    !auctionStarted ||
                    auctionPaused
                  }

                  className="bg-red-500 hover:bg-red-400 text-black font-bold py-4 rounded-2xl"
                >
                  UNSOLD
                </button>

              </div>

              {/* CONTROLS */}

              <div className="grid grid-cols-2 gap-4">

                {!auctionStarted ? (

                  <button
                    onClick={() =>
                      setAuctionStarted(true)
                    }

                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-2xl"
                  >
                    START
                  </button>

                ) : (

                  <button
                    onClick={() =>
                      setAuctionPaused(
                        !auctionPaused
                      )
                    }

                    className={`font-bold py-4 rounded-2xl ${
                      auctionPaused
                        ? "bg-yellow-500 text-black"
                        : "bg-orange-500 text-black"
                    }`}
                  >

                    {auctionPaused
                      ? "RESUME"
                      : "PAUSE"}

                  </button>

                )}

                <button
                  onClick={() => {

                    setTimer(100);

                    setCurrentBid(3000);

                    setHighestBidder("");

                  }}

                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-2xl"
                >
                  RESET
                </button>

              </div>

              {/* SOLD PLAYERS */}

              <div className="mt-8">

                <h2 className="text-2xl font-bold mb-4">
                  Sold Players
                </h2>

                <div className="space-y-3 max-h-72 overflow-y-auto">

                  {(soldPlayers || []).length === 0 ? (

                    <p className="text-gray-500">
                      No sold players
                    </p>

                  ) : (

                    (soldPlayers || []).map(
                      (item, idx) => (

                        <div
                          key={idx}
                          className="bg-[#111c35] rounded-2xl p-4"
                        >

                          <div className="flex justify-between mb-2">

                            <span className="font-bold">
                              {
                                item.player
                              }
                            </span>

                            <span className="text-green-400 font-bold">
                              ₹
                              {
                                item.amount
                              }
                            </span>

                          </div>

                          <p className="text-gray-400 text-sm">
                            Purchased by{" "}
                            {item.team}
                          </p>

                        </div>
                      )
                    )
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}