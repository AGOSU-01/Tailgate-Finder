import { useMemo, useRef, useState } from "react";
import "./App.css";

type Tailgate = {
  id: number;
  name: string;
  host: string;
  type: string;
  distance: string;
  price: string;
  spots: string;
  color: string;
  position: { top: string; left: string };
};
type Game = {
  id: number;
  date: string;
  opponent: string;
  day: string;
  time: string;
};
type PromotedBar = {
  id: number;
  name: string;
  address: string;
  offer: string;
  position: { top: string; left: string };
};

const games: Game[] = [
  {
    id: 1,
    date: "Sep 05",
    opponent: "Ball State",
    day: "Saturday",
    time: "3:30 PM",
  },
  {
    id: 2,
    date: "Sep 19",
    opponent: "Kent State",
    day: "Saturday",
    time: "Noon",
  },
  { id: 3, date: "Sep 26", opponent: "Illinois", day: "Saturday", time: "TBA" },
  { id: 4, date: "Oct 10", opponent: "Maryland", day: "Saturday", time: "TBA" },
  { id: 5, date: "Nov 07", opponent: "Oregon", day: "Saturday", time: "TBA" },
  {
    id: 6,
    date: "Nov 14",
    opponent: "Northwestern",
    day: "Saturday",
    time: "TBA",
  },
  {
    id: 7,
    date: "Nov 28",
    opponent: "Michigan",
    day: "Saturday",
    time: "Noon",
  },
];

const tailgates: Tailgate[] = [
  {
    id: 1,
    name: "The Scarlet Lot",
    host: "Mia Thompson",
    type: "Ohio State alumni",
    distance: "0.2 mi",
    price: "$18",
    spots: "32 spots left",
    color: "orange",
    position: { top: "32%", left: "42%" },
  },
  {
    id: 2,
    name: "Buckeye Breakfast Club",
    host: "Jake Reynolds",
    type: "Free gathering",
    distance: "0.2 mi",
    price: "Free",
    spots: "Open invite",
    color: "blue",
    position: { top: "31%", left: "54%" },
  },
  {
    id: 3,
    name: "North End Cookout",
    host: "The 614 Crew",
    type: "Ticketed tailgate",
    distance: "0.3 mi",
    price: "$25",
    spots: "8 spots left",
    color: "yellow",
    position: { top: "48%", left: "31%" },
  },
  {
    id: 4,
    name: "Alumni Row",
    host: "OSU Young Alumni",
    type: "Ohio State alumni",
    distance: "0.3 mi",
    price: "$15",
    spots: "20 spots left",
    color: "orange",
    position: { top: "55%", left: "30%" },
  },
  {
    id: 5,
    name: "The Green Room",
    host: "Columbus Crew",
    type: "Free gathering",
    distance: "0.4 mi",
    price: "Free",
    spots: "Open invite",
    color: "blue",
    position: { top: "68%", left: "44%" },
  },
  {
    id: 6,
    name: "Big Noon BBQ",
    host: "The 614 Crew",
    type: "Ticketed tailgate",
    distance: "0.4 mi",
    price: "$30",
    spots: "12 spots left",
    color: "yellow",
    position: { top: "67%", left: "58%" },
  },
];

const promotedBars: PromotedBar[] = [
  {
    id: 1,
    name: "The Varsity Club",
    address: "278 W Lane Ave",
    offer: "20% off with game ticket",
    position: { top: "27%", left: "66%" },
  },
  {
    id: 2,
    name: "The Blackwell",
    address: "2110 Tuttle Park Pl",
    offer: "Game-day brunch reservations",
    position: { top: "34%", left: "73%" },
  },
  {
    id: 3,
    name: "Ethyl & Tank",
    address: "19 E 13th Ave",
    offer: "No-cover pregame party",
    position: { top: "21%", left: "78%" },
  },
  {
    id: 4,
    name: "Out-R-Inn",
    address: "252 W 10th Ave",
    offer: "Buckeye watch party",
    position: { top: "49%", left: "76%" },
  },
  {
    id: 5,
    name: "Ugly Tuna Saloona",
    address: "1546 N High St",
    offer: "Game-day drink specials",
    position: { top: "14%", left: "86%" },
  },
  {
    id: 6,
    name: "Little Bar",
    address: "219 S High St",
    offer: "Pregame reservations",
    position: { top: "78%", left: "84%" },
  },
  {
    id: 7,
    name: "The Thirsty Scholar",
    address: "1816 N High St",
    offer: "No-cover kickoff party",
    position: { top: "25%", left: "88%" },
  },
];

function App() {
  const [selectedId, setSelectedId] = useState(1);
  const [selectedGameId, setSelectedGameId] = useState(2);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All spots");
  const [showAllTailgates, setShowAllTailgates] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showHostForm, setShowHostForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [zoom, setZoom] = useState(0.8);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const selectedGame =
    games.find((game) => game.id === selectedGameId) ?? games[0];
  const markerScale = Number(Math.pow(0.8 / zoom, 1.25).toFixed(3));
  const filteredTailgates = useMemo(
    () =>
      tailgates.filter((tailgate) => {
        const matchesQuery =
          `${tailgate.name} ${tailgate.host} ${tailgate.type}`
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesFilter =
          activeFilter === "All spots" ||
          (activeFilter === "Free" && tailgate.price === "Free") ||
          (activeFilter === "Ticketed" && tailgate.price !== "Free");
        return matchesQuery && matchesFilter;
      }),
    [activeFilter, query],
  );
  const visibleTailgates = showAllTailgates
    ? filteredTailgates
    : filteredTailgates.slice(0, 3);
  const handleJoin = (name: string) => {
    setNotice(`Request sent to ${name}. Check your inbox for the details.`);
    window.setTimeout(() => setNotice(""), 4000);
  };
  const changeZoom = (amount: number) =>
    setZoom((value) =>
      Math.min(1.8, Math.max(0.8, Number((value + amount).toFixed(2)))),
    );
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: mapOffset.x,
      offsetY: mapOffset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    setMapOffset({
      x: dragStart.current.offsetX + event.clientX - dragStart.current.x,
      y: dragStart.current.offsetY + event.clientY - dragStart.current.y,
    });
  };
  const stopDragging = () => {
    dragStart.current = null;
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Tailgate Finder home">
          <span className="brand-mark">TF</span>
          <span>
            tailgate<span>finder</span>
          </span>
        </a>
        <nav>
          <a className="nav-active" href="#explore">
            Explore
          </a>
          <a href="#schedule">Schedule</a>
          <a href="#for-hosts">For hosts</a>
        </nav>
        <button
          className="profile-button"
          type="button"
          onClick={() =>
            setNotice("Sign in is coming soon for the class prototype.")
          }
        >
          Sign in <span className="avatar">AJ</span>
        </button>
      </header>
      <section className="hero-strip" id="top">
        <div>
          <p className="eyebrow">2026 OHIO STATE FOOTBALL / GAME DAY</p>
          <h1>
            Find your people
            <br />
            <em>before kickoff.</em>
          </h1>
          <p className="hero-copy">
            The easiest way to discover tailgates, parking, and pregame energy
            around the stadium.
          </p>
        </div>
        <div className="game-card">
          <span className="live-dot"></span>
          <span className="game-label">NEXT HOME GAME</span>
          <strong>
            Ohio State <i>vs</i> {selectedGame.opponent}
          </strong>
          <span className="game-meta">
            {selectedGame.date}, 2026 / Ohio Stadium
          </span>
          <span className="game-score">
            <b>OSU</b>
            <small>VS</small>
            <b>{selectedGame.opponent.slice(0, 4).toUpperCase()}</b>
          </span>
        </div>
      </section>
      <section className="finder" id="explore">
        <div className="finder-toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tailgates, teams, or neighborhoods"
            />
          </div>
          <button
            className="date-button"
            type="button"
            onClick={() => setShowGames(!showGames)}
          >
            2026 home games <span>⌄</span>
          </button>
          <button className="location-button" type="button">
            Columbus, OH <span>⌄</span>
          </button>
        </div>
        {showGames && (
          <div className="schedule-menu" id="schedule">
            <div className="schedule-heading">
              <div>
                <p className="eyebrow">OHIO STATE HOME SCHEDULE</p>
                <h2>Choose a game day</h2>
              </div>
              <span>7 home games</span>
            </div>
            <div className="schedule-grid">
              {games.map((game) => (
                <button
                  className={
                    selectedGameId === game.id
                      ? "game-option game-option-selected"
                      : "game-option"
                  }
                  key={game.id}
                  type="button"
                  onClick={() => {
                    setSelectedGameId(game.id);
                    setShowGames(false);
                  }}
                >
                  <strong>{game.date}</strong>
                  <span>Ohio State vs {game.opponent}</span>
                  <small>{game.time}</small>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="content-grid">
          <div className="map-panel">
            <div className="map-heading">
              <div>
                <p className="eyebrow">LIVE GOOGLE MAP</p>
                <h2>Around Ohio Stadium</h2>
              </div>
              <div className="map-actions">
                <span className="drag-hint">Drag to explore</span>
                <button
                  className="recenter"
                  type="button"
                  onClick={() => {
                    setMapOffset({ x: 0, y: 0 });
                    setZoom(0.8);
                  }}
                >
                  ◎ Recenter
                </button>
              </div>
            </div>
            <div
              className="map-canvas"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
            >
              <div
                className="map-scene"
                style={{
                  transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${zoom})`,
                }}
              >
                <iframe
                  className="google-map"
                  title="Google Maps view of Ohio Stadium"
                  src="https://www.google.com/maps?q=Ohio+Stadium,+Columbus,+OH&t=k&z=14&output=embed"
                  loading="lazy"
                ></iframe>
                <span className="map-label label-one">Lane Ave</span>
                <span className="map-label label-two">Neil Ave</span>
                {tailgates.map((tailgate) => (
                  <button
                    key={tailgate.id}
                    aria-label={`Select ${tailgate.name}`}
                    className={`map-pin ${tailgate.color} ${tailgate.id === selectedId ? "pin-selected" : ""}`}
                    style={{ ...tailgate.position, transform: `translate(-50%, -50%) scale(${markerScale})` }}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => setSelectedId(tailgate.id)}
                  >
                    <span>
                      {tailgate.price === "Free" ? "$" : tailgate.price}
                    </span>
                  </button>
                ))}
                {promotedBars.map((bar) => (
                  <button
                    key={bar.id}
                    aria-label={`View ${bar.name}`}
                    className="bar-pin"
                    style={{ ...bar.position, transform: `translate(-50%, -50%) scale(${markerScale})` }}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => setNotice(`${bar.name}: ${bar.offer}`)}
                  >
                    <span>BAR</span>
                  </button>
                ))}
              </div>
              <div className="map-legend">
                <span>
                  <i className="legend-dot orange"></i>Tailgates
                </span>
                <span>
                  <i className="legend-dot blue"></i>Parking
                </span>
                <span>
                  <i className="legend-dot yellow"></i>Events
                </span>
              </div>
              <div className="map-zoom">
                <button
                  type="button"
                  aria-label="Zoom in"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => changeZoom(0.15)}
                >
                  +
                </button>
                <button
                  type="button"
                  aria-label="Zoom out"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => changeZoom(-0.15)}
                >
                  −
                </button>
              </div>
              <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            </div>
          </div>
          <aside className="list-panel">
            <div className="list-intro">
              <div>
                <p className="eyebrow">
                  {filteredTailgates.length} SPOTS NEAR YOU
                </p>
                <h2>Make a plan</h2>
              </div>
              <button
                className="filter-button"
                type="button"
                onClick={() =>
                  setNotice("Use the tabs to browse free or ticketed spots.")
                }
              >
                Filter <span>≡</span>
              </button>
            </div>
            <div className="filter-tabs">
              {["All spots", "Free", "Ticketed"].map((filter) => (
                <button
                  className={activeFilter === filter ? "tab-active" : ""}
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="tailgate-list">
              {visibleTailgates.map((tailgate) => (
                <article
                  className={`tailgate-card ${tailgate.id === selectedId ? "card-selected" : ""}`}
                  key={tailgate.id}
                  onClick={() => setSelectedId(tailgate.id)}
                >
                  <div className={`listing-image ${tailgate.color}`}>
                    <span>
                      {tailgate.type === "Free gathering" ? "FREE" : "LIVE"}
                    </span>
                    <b>{tailgate.name.slice(0, 1)}</b>
                  </div>
                  <div className="listing-copy">
                    <div className="listing-top">
                      <span className="type-label">{tailgate.type}</span>
                      <span className="distance">{tailgate.distance}</span>
                    </div>
                    <h3>{tailgate.name}</h3>
                    <p>Hosted by {tailgate.host}</p>
                    <div className="listing-bottom">
                      <strong>
                        {tailgate.price}
                        <small>
                          {tailgate.price === "Free" ? "" : " / person"}
                        </small>
                      </strong>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleJoin(tailgate.name);
                        }}
                      >
                        Join <span>→</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {filteredTailgates.length === 0 && (
                <p className="empty-state">No spots match that search yet.</p>
              )}
            </div>
            {filteredTailgates.length > 3 && (
              <button
                className="view-all"
                type="button"
                onClick={() => setShowAllTailgates(!showAllTailgates)}
              >
                {showAllTailgates
                  ? "Show fewer tailgates"
                  : `View all ${filteredTailgates.length} tailgates`}{" "}
                <span>{showAllTailgates ? "↑" : "→"}</span>
              </button>
            )}
          </aside>
        </div>
      </section>
      <section className="promoted-bars-band">
        <div>
          <p className="eyebrow">SPONSORED GAME-DAY PICKS</p>
          <h2>Local bars can own the pregame.</h2>
          <p>
            Bars pay $250 per Ohio State home game to appear on the map and
            reach fans planning their day.
          </p>
        </div>
        <div className="promoted-bars-grid">
          {promotedBars.map((bar) => (
            <button
              className="promoted-bar"
              type="button"
              key={bar.id}
              onClick={() => setNotice(`${bar.name}: ${bar.offer}`)}
            >
              <span className="bar-icon">B</span>
              <span>
                <strong>{bar.name}</strong>
                <small>
                  {bar.address} / {bar.offer}
                </small>
              </span>
              <b>→</b>
            </button>
          ))}
        </div>
      </section>
      <section className="host-band" id="for-hosts">
        <div>
          <p className="eyebrow">TURN YOUR SETUP INTO A STORY</p>
          <h2>Hosting a tailgate?</h2>
          <p>
            Bring your crew together and get discovered by fans looking for
            their next great game-day memory.
          </p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => setShowHostForm(!showHostForm)}
        >
          {showHostForm ? "Close form" : "List your tailgate"} <span>↗</span>
        </button>
      </section>
      {showHostForm && (
        <section className="host-form">
          <h2>Tell fans about your spot</h2>
          <div className="form-grid">
            <input placeholder="Tailgate name" />
            <input placeholder="Neighborhood or address" />
            <select defaultValue="">
              <option value="" disabled>
                Choose a format
              </option>
              <option>Free gathering</option>
              <option>Ticketed tailgate</option>
            </select>
            <input placeholder="Price per person" />
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setShowHostForm(false);
              setNotice("Your draft tailgate has been saved.");
            }}
          >
            Save draft <span>→</span>
          </button>
        </section>
      )}
      <footer>
        <span className="brand">
          <span className="brand-mark">TF</span>
          <span>
            tailgate<span>finder</span>
          </span>
        </span>
        <span>Find the energy. Bring the crew.</span>
        <span>© 2026 Tailgate Finder</span>
      </footer>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button type="button" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
