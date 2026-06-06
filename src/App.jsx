
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
  "Muzammil Shaikh",
  "Shashikant Naik",
  "Salim Khan",
  "Azim",
  "Dr. Saquib Ahmad Khan",
  "Uzair",
  "Afsar",
  "Abdul Ahad",
  "Danish",
  "Ayaz C",
  "Mubarak Bhai",
  "Wasif",
  "Daanial Mirza",
  "Shaikh Reyaz",
  "Dr. Asif",
  "Zaid",
  "Asif",
  "Salim",
  "Shaikh Jameel",
  "Dillirao Bommidi",
  "Sabir (Salim's Friend)",
  "Guffran (Asif's Friend)",
  "Dinesh Bhai",
  "Khumaini Sayyed"
];

const users = [

  {
    username: "organizer1",
    password: "admin123",
    role: "organizer",
  },

  {
    username: "organizer2",
    password: "admin123",
    role: "organizer",
  },

  {
    username: "Uzair",
    password: "1234",
    role: "owner",
    team: "Gladiator XI",
  },

  {
    username: "Muzammil",
    password: "1234",
    role: "owner",
    team: "Thunder Strikers",
  },

  {
    username: "Dilli",
    password: "1234",
    role: "owner",
    team: "Turf Titans",
  },

  {
    username: "viewer",
    password: "1234",
    role: "viewer",
  },

];

export default function App() {

  // LOGIN STATES

  const [user, setUser] =
    useState(null);

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  // AUCTION STATES

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
    useState(150);

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

  // LOGIN

  const handleLogin = () => {

    const foundUser =
      users.find(
        (u) =>
          u.username === username &&
          u.password === password
      );

    if (!foundUser) {

      alert(
        "Invalid credentials"
      );

      return;
    }

    setUser(foundUser);
  };

  // LOGOUT

  const handleLogout = () => {

    setUser(null);

    setUsername("");

    setPassword("");
  };

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
            data.timer || 150
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

      const pauseInterval =
        setInterval(() => {

          setPauseTimer((prev) => {

            if (prev <= 1) {

              setIsPaused(false);

              setCurrentPlayerIndex(
                (old) => {
                  if (
                    old >= players.length - 1
                  ) {
                    return old;
                  }

                  return old + 1;
                }
              );

              setCurrentBid(3000);

              setHighestBidder("");

              return 15;
            }

            return prev - 1;
          });

        }, 1000);

      return () =>
        clearInterval(
          pauseInterval
        );
    }

    // MAIN TIMER

    const interval =
      setInterval(() => {

        setTimer((prev) => {

          if (prev <= 1) {

            handleUnsold();

            return 150;
          }

          return prev - 1;
        });

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

    setPauseTimer(15);

    setTimer(150);
  };

  // BID

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

  // SOLD

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

      moveToNextPlayer();

      return;
    }

    setUnsoldPlayers([
      ...(unsoldPlayers || []),
      currentPlayer,
    ]);

    moveToNextPlayer();
  };

  // LOGIN SCREEN

  if (!user) {

    return (

      <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6">

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-10 w-full max-w-md">

          <h1 className="text-4xl font-black text-white mb-2 text-center">
            Cricket Auction
          </h1>

          <p className="text-gray-400 text-center mb-8">
            Login to continue
          </p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full bg-[#111c35] text-white p-4 rounded-2xl mb-4 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full bg-[#111c35] text-white p-4 rounded-2xl mb-6 outline-none"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-2xl transition"
          >
            LOGIN
          </button>

        </div>

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#020817] text-white p-6">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-5xl font-black">
            Cricket Auction
          </h1>

          <p className="text-gray-400 mt-2">
            Logged in as {user.username}
          </p>

        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-400 text-black font-bold px-6 py-3 rounded-2xl"
        >
          Logout
        </button>

      </div>

      {/* CURRENT PLAYER */}

      <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-8 mb-8 text-center">

        <p className="text-gray-400 mb-3">
          Current Player
        </p>

        <h2 className="text-5xl font-black mb-6">
          {currentPlayer ||
            "Auction Finished"}
        </h2>

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

        <div className="mt-6">

          <p className="text-gray-400 mb-2">
            Current Bid
          </p>

          <h2 className="text-6xl font-black text-green-400">
            ₹{currentBid}
          </h2>

        </div>

        <div className="mt-4 text-xl">

          Highest Bidder:

          <span className="text-cyan-400 font-bold ml-2">
            {highestBidder ||
              "No bids"}
          </span>

        </div>

      </div>
            {/* CONTROL BUTTONS */}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">

        <button
          onClick={handleSold}

          disabled={
            user.role !== "organizer"
          }

          className="bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-2xl"
        >
          SOLD
        </button>

        <button
          onClick={handleUnsold}

          disabled={
            user.role !== "organizer"
          }

          className="bg-red-500 hover:bg-red-400 text-black font-bold py-4 rounded-2xl"
        >
          UNSOLD
        </button>

        {!auctionStarted ? (

          <button
            onClick={() =>
              setAuctionStarted(true)
            }

            disabled={
              user.role !== "organizer"
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

            disabled={
              user.role !== "organizer"
            }

            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-2xl"
          >

            {auctionPaused
              ? "RESUME"
              : "PAUSE"}

          </button>

        )}

        <button
          onClick={() => {

            setCurrentPlayerIndex(0);

            setTimer(150);

            setPauseTimer(15);

            setCurrentBid(3000);

            setHighestBidder("");

            setIsPaused(false);
            
            setAuctionStarted(false);

            setAuctionPaused(false);

            setSoldPlayers([]);

            setUnsoldPlayers([]);

            setTeams(initialTeams);

          }}

          disabled={
            user.role !== "organizer"
          }

          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-2xl"
        >
          RESET
        </button>

      </div>

      {/* TEAMS */}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

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
                    Slots Left
                  </span>

                  <span>
                    {team.slots}
                  </span>
                </div>

              </div>

              {/* BID BUTTON */}

              <button
                onClick={() =>
                  handleBid(team)
                }

                disabled={

                  team.slots <= 0 ||

                  isPaused ||

                  !auctionStarted ||

                  auctionPaused ||

                  (
                    user.role === "owner" &&
                    user.team !== team.name
                  ) ||

                  user.role === "viewer"

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
                      No players yet
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

      {/* SOLD PLAYERS */}

      <div className="mt-10">

        <h2 className="text-3xl font-bold mb-5">
          Sold Players
        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

          {(soldPlayers || []).map(
            (
              item,
              idx
            ) => (

              <div
                key={idx}
                className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5"
              >

                <div className="flex justify-between mb-3">

                  <h3 className="text-xl font-bold">
                    {item.player}
                  </h3>

                  <span className="text-green-400 font-bold">
                    ₹{item.amount}
                  </span>

                </div>

                <p className="text-gray-400">
                  Bought by {item.team}
                </p>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}