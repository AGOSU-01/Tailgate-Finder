import { useEffect, useState } from "react";
import { campuses, getCampusBars, getCampusTailgates, type Campus, type PromotedBar, type Tailgate } from "./campusData";
import "./App.css";
type Game = {
  id: string;
  startsAt: number;
  year: number;
  date: string;
  opponent: string;
  time: string;
  status: string;
  homeScore?: string;
  opponentScore?: string;
};
type ScheduleState = "loading" | "ready" | "empty" | "error";
type ESPNScheduleEvent = {
  id?: string;
  date?: string;
  seasonType?: { type?: number };
  status?: { type?: { completed?: boolean; state?: string } };
  competitions?: {
    date?: string;
    timeValid?: boolean;
    neutralSite?: boolean;
    status?: { type?: { completed?: boolean; state?: string } };
    competitors?: {
      homeAway?: string;
      team?: { id?: string; shortDisplayName?: string; displayName?: string };
      score?: { displayValue?: string; value?: number };
    }[];
  }[];
};
type ESPNSchedulePayload = { events?: ESPNScheduleEvent[] };
type JoinRequest = {
  id: string;
  listingName: string;
  attendeeName: string;
  email: string;
  partySize: number;
  game: string;
  campusName: string;
};

type SponsorLead = {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  campusName: string;
};

const JOIN_REQUESTS_KEY = "tailgate-finder-join-requests";
const USER_TAILGATES_KEY = "tailgate-finder-user-tailgates";
const SPONSOR_LEADS_KEY = "tailgate-finder-sponsor-leads";
const SCHEDULE_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

function readStoredItems<T,>(key: string): T[] {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T[]) : [];
  } catch {
    return [];
  }
}

function storeItems<T,>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Keep the demo usable when browser storage is unavailable.
  }
}

function parseHomeSchedule(payload: ESPNSchedulePayload, campus: Campus): Game[] {
  return (payload.events ?? [])
    .flatMap((event) => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors ?? [];
      const homeTeam = competitors.find(
        (competitor) => competitor.team?.id === campus.espnId && competitor.homeAway === "home",
      );
      const opponent = competitors.find((competitor) => competitor.team?.id !== campus.espnId);
      if (!competition || !homeTeam || !opponent?.team || !event.id || !event.date || competition.neutralSite) return [];

      const date = new Date(event.date);
      const kickoffIsKnown = competition.timeValid !== false;
      const displayDate = kickoffIsKnown
        ? new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZone: campus.timeZone,
          }).format(date)
        : new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          }).format(new Date(`${event.date.slice(0, 10)}T12:00:00Z`));
      const kickoff = kickoffIsKnown
        ? new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: campus.timeZone,
            timeZoneName: "short",
          }).format(date)
        : "Time TBD";
      const eventStatus = competition.status ?? event.status;
      const homeScore = homeTeam.score?.displayValue ?? (homeTeam.score?.value === undefined ? undefined : String(homeTeam.score.value));
      const opponentScore = opponent.score?.displayValue ?? (opponent.score?.value === undefined ? undefined : String(opponent.score.value));

      return [{
        id: event.id,
        startsAt: date.getTime(),
        year: date.getUTCFullYear(),
        date: displayDate,
        opponent: opponent.team.shortDisplayName ?? opponent.team.displayName ?? "Opponent TBD",
        time: kickoff,
        status: eventStatus?.type?.completed ? "Final" : eventStatus?.type?.state === "in" ? "In progress" : "Scheduled",
        homeScore,
        opponentScore,
      }];
    })
    .sort((left, right) => left.startsAt - right.startsAt);
}

function App() {
    const seasonYear = new Date().getFullYear();
  const [selectedCampusId, setSelectedCampusId] = useState("ohio-state");
  const [selectedId, setSelectedId] = useState<number | string>(91);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [scheduleData, setScheduleData] = useState<{
    campusId: string;
    status: ScheduleState;
    games: Game[];
  }>({ campusId: "", status: "loading", games: [] });
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All spots");
  const [showAllTailgates, setShowAllTailgates] = useState(
    () => readStoredItems<Tailgate>(USER_TAILGATES_KEY).length > 0,
  );
  const [showGames, setShowGames] = useState(false);
  const [showHostForm, setShowHostForm] = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [hostFormat, setHostFormat] = useState("");
  const [joinTarget, setJoinTarget] = useState<Tailgate | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(() =>
    readStoredItems<JoinRequest>(JOIN_REQUESTS_KEY),
  );
  const [userTailgates, setUserTailgates] = useState<Tailgate[]>(() =>
    readStoredItems<Tailgate>(USER_TAILGATES_KEY),
  );
  const [sponsorLeads, setSponsorLeads] = useState<SponsorLead[]>(() =>
    readStoredItems<SponsorLead>(SPONSOR_LEADS_KEY),
  );
  const [notice, setNotice] = useState("");
  const [mapSearchText, setMapSearchText] = useState("");
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapFrameVersion, setMapFrameVersion] = useState(0);
  const selectedCampus = campuses.find((campus) => campus.id === selectedCampusId) ?? campuses[9];
  useEffect(() => {
    const controller = new AbortController();
    const loadSchedule = async () => {
      try {
        const response = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${selectedCampus.espnId}/schedule?season=${seasonYear}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`ESPN schedule request failed: ${response.status}`);
        const payload = await response.json() as ESPNSchedulePayload;
        if (controller.signal.aborted) return;
        const games = parseHomeSchedule(payload, selectedCampus);
        setScheduleData({
          campusId: selectedCampus.id,
          status: games.length ? "ready" : "empty",
          games,
        });
        const nextGame = games.find((game) => game.status === "In progress")
          ?? games.find((game) => game.status !== "Final" && game.startsAt >= Date.now())
          ?? games.find((game) => game.status !== "Final");
        setSelectedGameId((currentId) => {
          const currentGame = games.find((game) => game.id === currentId);
          return currentGame && currentGame.status !== "Final" ? currentId : nextGame?.id ?? "";
        });
      } catch {
        if (!controller.signal.aborted) {
          setScheduleData({ campusId: selectedCampus.id, status: "error", games: [] });
          setSelectedGameId("");
        }
      }
    };
    void loadSchedule();
    const refreshTimer = window.setInterval(() => void loadSchedule(), SCHEDULE_REFRESH_INTERVAL_MS);
    const refreshOnReturn = () => {
      if (document.visibilityState === "visible") void loadSchedule();
    };
    document.addEventListener("visibilitychange", refreshOnReturn);
    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, [selectedCampus, seasonYear]);
  const isOhioState = selectedCampus.id === "ohio-state";
  const campusSchedule = scheduleData.campusId === selectedCampus.id
    ? scheduleData
    : { campusId: selectedCampus.id, status: "loading" as const, games: [] };
  const campusGames = campusSchedule.games;
  const scheduleState = campusSchedule.status;
  const upcomingGames = campusGames.filter((game) => game.status !== "Final");
  const finalGames = campusGames
    .filter((game) => game.status === "Final" && game.homeScore !== undefined && game.opponentScore !== undefined)
    .sort((left, right) => right.startsAt - left.startsAt);
  const selectedGame = upcomingGames.find((game) => game.id === selectedGameId);
  const campusTailgates = [
    ...getCampusTailgates(selectedCampus),
    ...userTailgates.filter((tailgate) => (tailgate.campusId ?? "ohio-state") === selectedCampus.id),
  ];
  const campusBars: PromotedBar[] = getCampusBars(selectedCampus);
  const filteredTailgates = campusTailgates.filter((tailgate) => {
    const matchesQuery =
    `${tailgate.name} ${tailgate.host} ${tailgate.type} ${tailgate.location ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesFilter =
      activeFilter === "All spots" ||
      (activeFilter === "Free" && tailgate.price === "Free") ||
      (activeFilter === "Ticketed" && tailgate.price !== "Free" && tailgate.type !== "Parking") ||
      (activeFilter === "Parking" && tailgate.type === "Parking");
    return matchesQuery && matchesFilter;
  });
  const visibleTailgates = showAllTailgates
    ? filteredTailgates
    : filteredTailgates.slice(0, 3);
  const handleJoin = (tailgate: Tailgate) => {
    if (!selectedGame) {
      setNotice("Live schedule is unavailable. Try again shortly.");
      return;
    }
    setJoinTarget(tailgate);
  };
  const submitJoinRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!joinTarget || !selectedGame) return;
    const form = new FormData(event.currentTarget);
    const request: JoinRequest = {
      id: crypto.randomUUID(),
      listingName: joinTarget.name,
      attendeeName: String(form.get("attendeeName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      partySize: Number(form.get("partySize")),
      game: `${selectedGame.date}, ${selectedGame.year} vs ${selectedGame.opponent} · ${selectedGame.time}`,
      campusName: selectedCampus.shortName,
    };
    const nextRequests = [...joinRequests, request];
    setJoinRequests(nextRequests);
    storeItems(JOIN_REQUESTS_KEY, nextRequests);
    setJoinTarget(null);
    setNotice(`Your request for ${joinTarget.name} is saved in My game plan.`);
  };
  const submitHostListing = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const format = String(form.get("format"));
    const price = format === "Free gathering" ? "Free" : `$${Number(form.get("price"))}`;
    const listingType = format === "Parking listing" ? "Parking" : format;
    const listing: Tailgate = {
      id: crypto.randomUUID(),
      name: String(form.get("name")).trim(),
      host: String(form.get("host")).trim(),
      location: String(form.get("location")).trim(),
      type: listingType,
      distance: "New listing",
      price,
      spots: `${Number(form.get("capacity"))} spots open`,
      color: format === "Free gathering" || format === "Parking listing" ? "blue" : "yellow",
      position: { top: "61%", left: "54%" },
      isUserListing: true,
      campusId: selectedCampus.id,
    };
    const nextListings = [...userTailgates, listing];
    setUserTailgates(nextListings);
    storeItems(USER_TAILGATES_KEY, nextListings);
    setSelectedId(listing.id);
    setShowAllTailgates(true);
    setShowHostForm(false);
    setHostFormat("");
    event.currentTarget.reset();
    setNotice(`${listing.name} is now listed in this browser demo.`);
  };
  const submitSponsorLead = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const lead: SponsorLead = {
      id: crypto.randomUUID(),
      businessName: String(form.get("businessName")).trim(),
      contactName: String(form.get("contactName")).trim(),
      email: String(form.get("email")).trim(),
      campusName: selectedCampus.shortName,
    };
    const nextLeads = [...sponsorLeads, lead];
    setSponsorLeads(nextLeads);
    storeItems(SPONSOR_LEADS_KEY, nextLeads);
    setShowSponsorForm(false);
    event.currentTarget.reset();
    setNotice(`${lead.businessName} has been added to the local sponsor-interest list.`);
  };
  const clearDemoData = () => {
    if (!window.confirm("Clear locally saved demo requests, listings, and sponsor leads?")) return;
    localStorage.removeItem(JOIN_REQUESTS_KEY);
    localStorage.removeItem(USER_TAILGATES_KEY);
    localStorage.removeItem(SPONSOR_LEADS_KEY);
    setJoinRequests([]);
    setUserTailgates([]);
    setSponsorLeads([]);
    setShowPlan(false);
    setNotice("Local demo data has been cleared.");
  };
  const searchMap = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = mapSearchText.trim();
    if (!term) return;
    setMapSearchQuery(term);
    setMapFrameVersion((version) => version + 1);
  };
  const recenterMap = () => {
    setMapSearchText("");
    setMapSearchQuery("");
    setMapFrameVersion((version) => version + 1);
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
          onClick={() => setShowPlan(!showPlan)}
        >
          My game plan <span className="avatar">{joinRequests.length}</span>
        </button>
      </header>
      <section className="hero-strip" id="top">
        <div>
          <p className="eyebrow">{isOhioState ? "OHIO STATE GAME-DAY DEMO" : "BIG TEN GAME-DAY DEMO"}</p>
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
          <span className="game-label">
            {scheduleState === "loading" ? "LOADING ESPN SCHEDULE" : scheduleState === "error" ? "ESPN SCHEDULE OFFLINE" : selectedGame ? `${selectedGame.status.toUpperCase()} / ESPN` : finalGames.length ? "SEASON COMPLETE / ESPN" : "NO HOME GAMES FOUND"}
          </span>
          <strong>{selectedGame ? <>{selectedCampus.shortName} <i>vs</i> {selectedGame.opponent}</> : selectedCampus.shortName}</strong>
          <span className="game-meta">{selectedGame ? `${selectedGame.date}, ${selectedGame.year} / ${selectedGame.time} / ${selectedCampus.stadium}` : finalGames.length ? `${finalGames.length} completed home games / results in schedule` : `${selectedCampus.stadium} / ${selectedCampus.city}`}</span>
          {selectedGame && <span className="game-score"><b>{selectedCampus.shortName.slice(0, 4).toUpperCase()}</b><small>VS</small><b>{selectedGame.opponent.slice(0, 4).toUpperCase()}</b></span>}
        </div>
      </section>
      {showPlan && (
        <section className="plan-panel" aria-live="polite">
          <div className="plan-heading">
            <div>
              <p className="eyebrow">SAVED IN THIS BROWSER</p>
              <h2>My game plan</h2>
            </div>
            <button type="button" onClick={() => setShowPlan(false)} aria-label="Close game plan">×</button>
          </div>
          {joinRequests.length === 0 ? (
            <p>No join requests yet. Choose a tailgate and send a request to add it here.</p>
          ) : (
            <ul className="plan-list">
              {joinRequests.map((request) => (
                <li key={request.id}>
                  <strong>{request.listingName}</strong>
                  <span>{request.campusName} · {request.game} · {request.partySize} {request.partySize === 1 ? "guest" : "guests"}</span>
                  <small>Request for {request.attendeeName} · {request.email}</small>
                </li>
              ))}
            </ul>
          )}
          <p className="demo-note">Requests are saved locally for this demo; they are not sent to a host.</p>
          {(userTailgates.length > 0 || sponsorLeads.length > 0) && (
            <p className="demo-note">Also in this browser: {userTailgates.length} host listing{userTailgates.length === 1 ? "" : "s"} and {sponsorLeads.length} sponsor-interest lead{ sponsorLeads.length === 1 ? "" : "s"}.</p>
          )}
          <button className="text-button" type="button" onClick={clearDemoData}>Reset local demo data</button>
        </section>
      )}
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
            {selectedCampus.shortName} {seasonYear} home games <span>⌄</span>
          </button>
          <label className="location-button campus-picker">
            <span className="sr-only">Choose a Big Ten campus</span>
            <select
              aria-label="Choose a Big Ten campus"
              value={selectedCampus.id}
              onChange={(event) => {
                const campusId = event.target.value;
                setSelectedCampusId(campusId);
                setSelectedId(campuses.findIndex((campus) => campus.id === campusId) * 10 + 1);
                setQuery("");
                setActiveFilter("All spots");
                setShowGames(false);
                recenterMap();
              }}
            >
              {campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.shortName}</option>)}
            </select>
          </label>
        </div>
        {showGames && (
          <div className="schedule-menu" id="schedule">
            <div className="schedule-heading">
              <div>
                <p className="eyebrow">ESPN LIVE SCHEDULE / {seasonYear}</p>
                <h2>Upcoming home games</h2>
                <a className="schedule-source" href={`https://www.espn.com/college-football/team/schedule/_/id/${selectedCampus.espnId}`} target="_blank" rel="noreferrer">Open {selectedCampus.shortName} schedule on ESPN ↗</a>
              </div>
              <span>{scheduleState === "loading" ? "Loading…" : `${upcomingGames.length} upcoming`}</span>
            </div>
            {scheduleState === "loading" && <p className="empty-state">Loading the current ESPN home schedule…</p>}
            {scheduleState === "error" && <p className="empty-state">ESPN could not be reached. Check your connection or open the official schedule above.</p>}
            {scheduleState === "empty" && <p className="empty-state">No home games were returned for this season.</p>}
            {scheduleState === "ready" && upcomingGames.length === 0 && <p className="empty-state">The season is complete. Final scores are saved below.</p>}
            {scheduleState === "ready" && upcomingGames.length > 0 && <div className="schedule-grid">
              {upcomingGames.map((game) => (
                <button
                  className={selectedGameId === game.id ? "game-option game-option-selected" : "game-option"}
                  key={game.id}
                  data-starts-at={game.startsAt}
                  type="button"
                  onClick={() => { setSelectedGameId(game.id); setShowGames(false); }}
                >
                  <strong>{game.date}</strong>
                  <span>{selectedCampus.shortName} vs {game.opponent}</span>
                  <small>{game.time} · {game.status}</small>
                </button>
              ))}
            </div>}
            {scheduleState === "ready" && finalGames.length > 0 && (
              <details className="final-scores">
                <summary>Final scores ({finalGames.length})</summary>
                <ul>
                  {finalGames.map((game) => (
                    <li key={game.id}>
                      <span>{game.date}</span>
                      <strong>{selectedCampus.shortName} {game.homeScore} · {game.opponent} {game.opponentScore}</strong>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
        <div className="content-grid">
          <div className="map-panel">
            <div className="map-heading">
              <div>
                <p className="eyebrow">GOOGLE MAPS / LIVE VIEW</p>
                <h2>{mapSearchQuery ? mapSearchQuery : `Around ${selectedCampus.stadium}`}</h2>
              </div>
              <div className="map-actions">
                <a
                  className="map-external"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery || `${selectedCampus.stadium}, ${selectedCampus.city}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >Open in Google Maps ↗</a>
                <button className="recenter" type="button" onClick={recenterMap}>◎ Recenter</button>
              </div>
            </div>
            <form className="map-search-form" onSubmit={searchMap}>
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Search Google Maps"
                value={mapSearchText}
                onChange={(event) => setMapSearchText(event.target.value)}
                placeholder="Search this map"
              />
              <button type="submit">Search</button>
            </form>
            <div className="map-canvas">
              <iframe
                key={`${selectedCampus.id}-${mapFrameVersion}`}
                className="google-map"
                title={`${selectedCampus.shortName} interactive Google Map`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapSearchQuery || `${selectedCampus.stadium}, ${selectedCampus.city}`)}&t=k&z=14&output=embed`}
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>
            <p className="map-note">Map controls are interactive. Tailgate and venue samples are not pinned to verified addresses.</p>
          </div>
          <aside className="list-panel">
            <div className="list-intro">
              <div>
                <p className="eyebrow">
                  {filteredTailgates.length} DEMO LISTINGS
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
              {["All spots", "Free", "Ticketed", "Parking"].map((filter) => (
                <button
                  className={activeFilter === filter ? "tab-active" : ""}
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  type="button"
                >
                      {filter === "All spots" ? "All" : filter}
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
                      {tailgate.isUserListing ? "YOUR LISTING" : "SAMPLE"}
                    </span>
                    <b>{tailgate.name.slice(0, 1)}</b>
                  </div>
                  <div className="listing-copy">
                    <div className="listing-top">
                      <span className="type-label">{tailgate.type}</span>
                      <span className="distance">{tailgate.distance}</span>
                    </div>
                    <h3>{tailgate.name}</h3>
                    <p>Hosted by {tailgate.host} · {tailgate.location ?? "Stadium area"} · {tailgate.spots}</p>
                    <div className="listing-bottom">
                      <strong>
                        {tailgate.price}
                        <small>
                          {tailgate.price === "Free" ? "" : tailgate.type === "Parking" ? " / vehicle" : " / person"}
                        </small>
                      </strong>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleJoin(tailgate);
                        }}
                      >
                        {tailgate.type === "Parking" ? "Reserve" : "Join"} <span>→</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {filteredTailgates.length === 0 && (
                <p className="empty-state">{query ? "No listings match that search." : `No listings are seeded for ${selectedCampus.shortName} yet. Host a demo listing to populate this campus.`}</p>
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
          <p className="eyebrow">SIMULATED LOCAL VENUE EXAMPLES</p>
          <h2>Bring game-day spots into the plan.</h2>
          <p>
            Fictional demo venue cards for {selectedCampus.shortName}. They are for class demonstration and are not real or confirmed businesses.
          </p>
          <button className="primary-button sponsor-cta" type="button" onClick={() => setShowSponsorForm(!showSponsorForm)}>
            {showSponsorForm ? "Close interest form" : "Register sponsor interest"}<span>↗</span>
          </button>
        </div>
        <div className="promoted-bars-grid">
          {campusBars.map((bar) => (
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
      {showSponsorForm && (
        <section className="host-form sponsor-form">
          <h2>Register interest at {selectedCampus.shortName}</h2>
          <form onSubmit={submitSponsorLead}>
            <div className="form-grid">
              <input name="businessName" aria-label="Business name" placeholder="Business name" required />
              <input name="contactName" aria-label="Contact name" placeholder="Contact name" required />
              <input name="email" aria-label="Business email address" type="email" placeholder="Email address" required />
            </div>
            <button className="primary-button" type="submit">Save interest locally <span>→</span></button>
          </form>
          <p className="demo-note">This records a local demo lead only; no business is contacted.</p>
          {sponsorLeads.length > 0 && <p className="demo-note">Local sponsor-interest leads recorded: {sponsorLeads.length}</p>}
        </section>
      )}
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
          <h2>Tell fans about your spot near {selectedCampus.shortName}</h2>
          <form onSubmit={submitHostListing}>
            <div className="form-grid">
              <input name="name" aria-label="Tailgate name" placeholder="Tailgate name" required maxLength={50} />
              <input name="host" aria-label="Host name" placeholder="Host name" required maxLength={50} />
              <input name="location" aria-label="Neighborhood or cross-street" placeholder="Neighborhood or cross-street" required maxLength={80} />
              <select name="format" aria-label="Tailgate format" value={hostFormat} onChange={(event) => setHostFormat(event.target.value)} required>
                <option value="" disabled>Choose a format</option>
                <option>Free gathering</option>
                <option>Ticketed tailgate</option>
                <option>Parking listing</option>
              </select>
              <input name="price" aria-label={hostFormat === "Parking listing" ? "Price per vehicle" : "Price per person"} type="number" min="1" max="500" placeholder={hostFormat === "Parking listing" ? "Price per vehicle ($)" : "Price per person ($)"} required={hostFormat !== "Free gathering" && hostFormat !== ""} disabled={hostFormat === "Free gathering"} />
              <input name="capacity" aria-label="Available guest spots" type="number" min="1" max="500" placeholder="Available guest spots" required />
            </div>
            <button className="primary-button" type="submit">Publish demo listing <span>→</span></button>
          </form>
          <p className="demo-note">Listings are stored in this browser only. The demo does not process payments or verify locations.</p>
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
      {joinTarget && selectedGame && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setJoinTarget(null);
        }}>
          <section className="join-dialog" role="dialog" aria-modal="true" aria-labelledby="join-title">
            <button className="dialog-close" type="button" onClick={() => setJoinTarget(null)} aria-label="Close join request">×</button>
            <p className="eyebrow">{selectedGame.date}, {selectedGame.year} / {selectedCampus.stadium}</p>
            <h2 id="join-title">Request to join {joinTarget.name}</h2>
            <p>Send a demo request for {selectedCampus.shortName} vs {selectedGame.opponent}. No payment is collected.</p>
            <form onSubmit={submitJoinRequest}>
              <label>Your name<input name="attendeeName" required maxLength={60} autoFocus /></label>
              <label>Email<input name="email" type="email" required /></label>
              <label>Guests<select name="partySize" defaultValue="1">{[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count}</option>)}</select></label>
              <button className="primary-button" type="submit">Save join request <span>→</span></button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
