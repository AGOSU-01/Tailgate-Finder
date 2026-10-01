export type Campus = {
  id: string;
  name: string;
  shortName: string;
  stadium: string;
  city: string;
  espnId: string;
  timeZone: string;
};

export type Tailgate = {
  id: number | string;
  name: string;
  host: string;
  type: string;
  distance: string;
  price: string;
  spots: string;
  color: string;
  position: { top: string; left: string };
  location?: string;
  isUserListing?: boolean;
  campusId?: string;
};

export type PromotedBar = {
  id: number;
  name: string;
  address: string;
  offer: string;
  position: { top: string; left: string };
};

export const campuses: Campus[] = [
  { id: "illinois", name: "University of Illinois Urbana-Champaign", shortName: "Illinois", stadium: "Memorial Stadium", city: "Champaign, IL", espnId: "356", timeZone: "America/Chicago" },
  { id: "indiana", name: "Indiana University Bloomington", shortName: "Indiana", stadium: "Memorial Stadium", city: "Bloomington, IN", espnId: "84", timeZone: "America/Indiana/Indianapolis" },
  { id: "iowa", name: "University of Iowa", shortName: "Iowa", stadium: "Kinnick Stadium", city: "Iowa City, IA", espnId: "2294", timeZone: "America/Chicago" },
  { id: "maryland", name: "University of Maryland", shortName: "Maryland", stadium: "SECU Stadium", city: "College Park, MD", espnId: "120", timeZone: "America/New_York" },
  { id: "michigan", name: "University of Michigan", shortName: "Michigan", stadium: "Michigan Stadium", city: "Ann Arbor, MI", espnId: "130", timeZone: "America/Detroit" },
  { id: "michigan-state", name: "Michigan State University", shortName: "Michigan State", stadium: "Spartan Stadium", city: "East Lansing, MI", espnId: "127", timeZone: "America/Detroit" },
  { id: "minnesota", name: "University of Minnesota", shortName: "Minnesota", stadium: "Huntington Bank Stadium", city: "Minneapolis, MN", espnId: "135", timeZone: "America/Chicago" },
  { id: "nebraska", name: "University of Nebraska-Lincoln", shortName: "Nebraska", stadium: "Memorial Stadium", city: "Lincoln, NE", espnId: "158", timeZone: "America/Chicago" },
  { id: "northwestern", name: "Northwestern University", shortName: "Northwestern", stadium: "Martin Stadium", city: "Evanston, IL", espnId: "77", timeZone: "America/Chicago" },
  { id: "ohio-state", name: "The Ohio State University", shortName: "Ohio State", stadium: "Ohio Stadium", city: "Columbus, OH", espnId: "194", timeZone: "America/New_York" },
  { id: "oregon", name: "University of Oregon", shortName: "Oregon", stadium: "Autzen Stadium", city: "Eugene, OR", espnId: "2483", timeZone: "America/Los_Angeles" },
  { id: "penn-state", name: "Pennsylvania State University", shortName: "Penn State", stadium: "Beaver Stadium", city: "University Park, PA", espnId: "213", timeZone: "America/New_York" },
  { id: "purdue", name: "Purdue University", shortName: "Purdue", stadium: "Ross-Ade Stadium", city: "West Lafayette, IN", espnId: "2509", timeZone: "America/Indiana/Indianapolis" },
  { id: "rutgers", name: "Rutgers University-New Brunswick", shortName: "Rutgers", stadium: "SHI Stadium", city: "Piscataway, NJ", espnId: "164", timeZone: "America/New_York" },
  { id: "ucla", name: "University of California, Los Angeles", shortName: "UCLA", stadium: "Rose Bowl Stadium", city: "Pasadena, CA", espnId: "26", timeZone: "America/Los_Angeles" },
  { id: "usc", name: "University of Southern California", shortName: "USC", stadium: "Los Angeles Memorial Coliseum", city: "Los Angeles, CA", espnId: "30", timeZone: "America/Los_Angeles" },
  { id: "washington", name: "University of Washington", shortName: "Washington", stadium: "Husky Stadium", city: "Seattle, WA", espnId: "264", timeZone: "America/Los_Angeles" },
  { id: "wisconsin", name: "University of Wisconsin-Madison", shortName: "Wisconsin", stadium: "Camp Randall Stadium", city: "Madison, WI", espnId: "275", timeZone: "America/Chicago" },
];

const samplePositions = [
  { top: "31%", left: "38%" },
  { top: "36%", left: "57%" },
  { top: "57%", left: "35%" },
  { top: "66%", left: "63%" },
];

export function getCampusTailgates(campus: Campus): Tailgate[] {
  const campusIndex = campuses.findIndex((item) => item.id === campus.id);
  return [
    {
      id: campusIndex * 10 + 1,
      campusId: campus.id,
      name: `${campus.shortName} Alumni Tailgate`,
      host: `${campus.shortName} Alumni Crew`,
      type: "Alumni tailgate",
      distance: "0.2 mi (demo)",
      price: "$18",
      spots: "32 sample spots",
      color: "orange",
      location: `Near ${campus.stadium}`,
      position: samplePositions[0],
    },
    {
      id: campusIndex * 10 + 2,
      campusId: campus.id,
      name: `${campus.shortName} Fan Meetup`,
      host: `${campus.shortName} Game Day Crew`,
      type: "Free gathering",
      distance: "0.3 mi (demo)",
      price: "Free",
      spots: "Open sample invite",
      color: "blue",
      location: "Campus neighborhood",
      position: samplePositions[1],
    },
    {
      id: campusIndex * 10 + 3,
      campusId: campus.id,
      name: `${campus.shortName} Stadium Cookout`,
      host: "The Home Crew",
      type: "Ticketed tailgate",
      distance: "0.4 mi (demo)",
      price: "$25",
      spots: "18 sample spots",
      color: "yellow",
      location: `Stadium district, ${campus.city}`,
      position: samplePositions[2],
    },
    {
      id: campusIndex * 10 + 4,
      campusId: campus.id,
      name: `${campus.shortName} Visitor Parking Example`,
      host: "Demo Parking Board",
      type: "Parking",
      distance: "0.5 mi (demo)",
      price: "$20",
      spots: "Sample parking option",
      color: "blue",
      location: `Around ${campus.city}`,
      position: samplePositions[3],
    },
  ];
}

export function getCampusBars(campus: Campus): PromotedBar[] {
  return [
    {
      id: 1,
      name: `${campus.shortName} Stadium Taproom (Demo)`,
      address: `Near ${campus.stadium}`,
      offer: "Sample pregame gathering",
      position: { top: "25%", left: "73%" },
    },
    {
      id: 2,
      name: `${campus.shortName} Kickoff Kitchen (Demo)`,
      address: campus.city,
      offer: "Sample game-day brunch",
      position: { top: "45%", left: "82%" },
    },
    {
      id: 3,
      name: `${campus.shortName} Campus Corner (Demo)`,
      address: `Campus district, ${campus.city}`,
      offer: "Sample fan meetup",
      position: { top: "72%", left: "74%" },
    },
  ];
}