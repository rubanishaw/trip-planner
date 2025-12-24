// --- trip planner version 04 ---

import React, { useState, useMemo, useEffect } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next"

// --- Images & QR Data ---

const maishaMilanoFirenze =
  "https://rubani-001.s3.us-east-2.amazonaws.com/maisha-milano-firenze.png?q=80&w=300&h=300&auto=format&fit=crop";
const rubaniMilanoFirenze =
  "https://rubani-001.s3.us-east-2.amazonaws.com/rubani-milano-firenze.png?q=80&w=300&h=300&auto=format&fit=crop";
const maishaFirenzeRome =
  "https://rubani-001.s3.us-east-2.amazonaws.com/maisha-firenze-rome.png?q=80&w=300&h=300&auto=format&fit=crop";
const rubaniFirenzeRome =
  "https://rubani-001.s3.us-east-2.amazonaws.com/rubani-firenze-rome.png?q=80&w=300&h=300&auto=format&fit=crop";

const qrCodes = {
  "train-milan-florence": {
    Maisha: maishaMilanoFirenze,
    Rubani: rubaniMilanoFirenze,
  },
  "train-florence-rome": {
    Maisha: maishaFirenzeRome,
    Rubani: rubaniFirenzeRome,
  },
};

// --- Helper Components ---

function ImageWithFallback(props) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;

  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ""}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  );
}

// --- Data: City Guide ---

const cityGuideData = {
  London: {
    food: [
      { name: "The Morgan Arms", category: "Gastropub", distance: "8–10 min walk from Airbnb", notes: "Cozy corner pub with good Sunday roast.", mapsQuery: "The Morgan Arms, 43 Morgan St, Bow, London" },
      { name: "Arepa & Co (Bow)", category: "Venezuelan", distance: "8–10 min walk from Airbnb", notes: "Arepas, plantain and cocktails by the canal.", mapsQuery: "Arepa & Co, 254 Paradise Row, London" },
      { name: "Greedy Cow", category: "Burgers & grill", distance: "15–18 min walk / short bus", notes: "Laid-back spot for burgers and comfort food.", mapsQuery: "Greedy Cow, 2 Grove Rd, London" },
      { name: "E Pellicci", category: "East End café", distance: "15–20 min walk", notes: "Classic London greasy spoon, great breakfast.", mapsQuery: "E Pellicci, 332 Bethnal Green Rd, London" },
      { name: "Dishoom Shoreditch", category: "Indian", distance: "15–20 min by Tube", notes: "Bombay-style café; naan & black daal are musts.", mapsQuery: "Dishoom Shoreditch, 7 Boundary St, London" },
    ],
    activities: [
      { name: "Victoria Park", category: "Park / walks", distance: "10–15 min walk", notes: "Big green space with lakes, cafes and Sunday market.", mapsQuery: "Victoria Park, London" },
      { name: "Regent's Canal Walk", category: "Scenic walk", distance: "5 min from Airbnb to the towpath", notes: "Walk along the canal toward Victoria Park or Limehouse Basin.", mapsQuery: "Regent's Canal Mile End Park" },
      { name: "Mile End Park & Climbing Wall", category: "Park & activity", distance: "5–8 min walk", notes: "Green strip with views over the canal; climbing centre nearby.", mapsQuery: "Mile End Park Leisure Centre and Stadium, London" },
      { name: "Roman Road Market", category: "Local street market", distance: "10–12 min walk", notes: "Typical East End high street; best on market days.", mapsQuery: "Roman Road Market, London" },
      { name: "Tower of London & Tower Bridge", category: "Historic sights", distance: "20–25 min by Tube", notes: "Classic London icons; good combo for a morning.", mapsQuery: "Tower of London" },
      { name: "IDEO London", category: "Visit / office", distance: "20–30 min by Tube from Airbnb", notes: "Visit coworkers at the IDEO London studio.", mapsQuery: "IDEO London, 8 Back Hill Herbal House 5th and 6th Floors, London EC1R 5EN, United Kingdom" },
    ],
  },
  Milan: {
    food: [
      { name: "Ristorante Osteria Fara", category: "Traditional Italian", distance: "5–7 min walk from Hilton Milan", notes: "Warm trattoria-style place for pastas and mains.", mapsQuery: "Osteria Fara, Via Alfredo Cappellini 23, Milano" },
      { name: "Pizzeria Spontini (Centrale)", category: "Pizza al trancio", distance: "6–8 min walk", notes: "Thick-slice Milanese pizza, very casual and quick.", mapsQuery: "Pizzeria Spontini Stazione Centrale, Milano" },
      { name: "Il Tavolino", category: "Pizza & Italian", distance: "10–12 min walk", notes: "Neapolitan-style pizza near the station.", mapsQuery: "Il Tavolino, Via Gustavo Fara 23, Milano" },
      { name: "Trattoria La Baita", category: "Lombard cuisine", distance: "10–15 min walk", notes: "Homey spot with regional dishes and reasonable prices.", mapsQuery: "Trattoria La Baita, Via Principe Eugenio 28, Milano" },
      { name: "Panificio Pattini", category: "Bakery & café", distance: "8–10 min walk", notes: "Grab espresso and pastries before your train.", mapsQuery: "Panificio Pattini Milano" },
    ],
    activities: [
      { name: "Duomo di Milano", category: "Cathedral & rooftop", distance: "10–12 min by Metro", notes: "Climb or take lift to the rooftop for city views.", mapsQuery: "Duomo di Milano" },
      { name: "Galleria Vittorio Emanuele II", category: "Historic arcade", distance: "By the Duomo", notes: "19th-century shopping gallery & cafes.", mapsQuery: "Galleria Vittorio Emanuele II, Milano" },
      { name: "Brera District", category: "Neighborhood stroll", distance: "15–20 min by Metro or tram", notes: "Streets with galleries, bars and small boutiques.", mapsQuery: "Brera, Milano" },
      { name: "Castello Sforzesco & Parco Sempione", category: "Castle & park", distance: "15–20 min by Metro", notes: "Castle courtyard with a big park behind it.", mapsQuery: "Castello Sforzesco, Milano" },
      { name: "Navigli Canals", category: "Evening drinks & walk", distance: "20–25 min by Metro", notes: "Canal-side bars and aperitivo; best around sunset.", mapsQuery: "Navigli, Milano" },
    ],
  },
  Florence: {
    food: [
      { name: "Trattoria Sostanza (Il Troia)", category: "Classic trattoria", distance: "10–12 min walk from S. Maria Novella", notes: "Famous for butter chicken and bistecca; book ahead.", mapsQuery: "Trattoria Sostanza, Via del Porcellana 25r, Firenze" },
      { name: "Trattoria Mario", category: "Tuscan lunch spot", distance: "10–12 min walk", notes: "Bustling, no-frills; great ribollita and steak.", mapsQuery: "Trattoria Mario, Via Rosina 2r, Firenze" },
      { name: "Mercato Centrale", category: "Food hall", distance: "8–10 min walk", notes: "Upstairs hall with many stalls—easy for a casual dinner.", mapsQuery: "Mercato Centrale Firenze" },
      { name: "Gelateria La Carraia", category: "Gelato", distance: "12–15 min walk", notes: "Popular gelato spot across the river; generous portions.", mapsQuery: "Gelateria La Carraia, Piazza Nazario Sauro, Firenze" },
      { name: "Ditta Artigianale", category: "Specialty coffee", distance: "10–15 min walk", notes: "Modern coffee bar if you want third-wave espresso.", mapsQuery: "Ditta Artigianale Firenze" },
    ],
    activities: [
      { name: "Galleria dell’Accademia di Firenze", category: "Art museum", distance: "10–15 min walk", notes: "Art museum with Michelangelo sculptures, including David.", mapsQuery: "Galleria dell’Accademia di Firenze" },
      { name: "Cathedral of Santa Maria del Fiore", category: "Cathedral", distance: "8–10 min walk", notes: "Landmark 1200s cathedral. Book timed tickets to climb the dome.", mapsQuery: "Cattedrale di Santa Maria del Fiore, Firenze" },
      { name: "Ponte Vecchio", category: "Bridge / sunset walk", distance: "10–12 min walk", notes: "Iconic bridge lined with jewelry shops.", mapsQuery: "Ponte Vecchio, Firenze" },
      { name: "Uffizi Gallery", category: "Art museum", distance: "10–12 min walk", notes: "Reserve ahead; can easily fill a half-day.", mapsQuery: "Uffizi Gallery, Florence" },
      { name: "Piazzale Michelangelo", category: "Viewpoint", distance: "20–25 min walk or short bus", notes: "Best panoramic sunset view over Florence.", mapsQuery: "Piazzale Michelangelo, Firenze" },
      { name: "Mercato Centrale & San Lorenzo", category: "Market area", distance: "8–10 min walk", notes: "Food market plus leather stalls in nearby streets.", mapsQuery: "Mercato Centrale Firenze" },
    ],
  },
  Rome: {
    food: [
      { name: "Trattoria Vecchia Roma", category: "Traditional Roman", distance: "10–12 min walk from DoubleTree Monti", notes: "Classic Roman pastas; cacio e pepe & amatriciana are great.", mapsQuery: "Trattoria Vecchia Roma, Via Ferruccio 12B, Roma" },
      { name: "Ristorante La Carbonara (Monti)", category: "Roman trattoria", distance: "8–10 min walk", notes: "Busy, cozy spot in Monti; good for carbonara.", mapsQuery: "La Carbonara, Via Panisperna 214, Roma" },
      { name: "Pizzeria La Montecarlo", category: "Thin-crust pizza", distance: "15–20 min walk / short Metro", notes: "Lively pizzeria near Piazza Navona.", mapsQuery: "Pizzeria La Montecarlo, Vicolo Savelli 13, Roma" },
      { name: "Pasticceria Regoli", category: "Pastry & coffee", distance: "8–10 min walk", notes: "Great maritozzi (cream buns) and morning coffee.", mapsQuery: "Pasticceria Regoli, Via dello Statuto 60, Roma" },
      { name: "Gelateria Fatamorgana (Monti)", category: "Gelato", distance: "8–10 min walk", notes: "Creative gelato flavors in the Monti neighborhood.", mapsQuery: "Fatamorgana Monti, Piazza degli Zingari 5, Roma" },
      { name: "Roscioli Salumeria con Cucina", category: "Roman trattoria / wine bar", distance: "20–25 min by Metro/bus", notes: "Famous deli-restaurant for pastas, cured meats and great wine.", mapsQuery: "Roscioli Salumeria con Cucina, Via dei Giubbonari 21, Roma" },
    ],
    activities: [
      { name: "Colosseum & Roman Forum", category: "Ancient ruins", distance: "15–20 min walk / short Metro", notes: "Block out a half-day; guided tours help the history land.", mapsQuery: "Colosseum, Rome" },
      { name: "Trastevere", category: "Neighborhood walk", distance: "20–25 min by bus/Metro", notes: "Cute lanes, bars and restaurants; lovely in the evening.", mapsQuery: "Trastevere, Roma" },
      { name: "Vatican Museums & Sistine Chapel", category: "Museums", distance: "20–30 min by Metro/bus", notes: "Book timed tickets to avoid huge queues.", mapsQuery: "Vatican Museums, Viale Vaticano, Roma" },
      { name: "Piazza San Pietro", category: "Square / Vatican", distance: "20–30 min by Metro/bus", notes: "Landmark square where crowds gather for the Pope's address.", mapsQuery: "Piazza San Pietro, Città del Vaticano" },
      { name: "Galleria Borghese", category: "Art museum / villa", distance: "20–25 min by Metro/bus", notes: "Villa housing 15th- to 18th-century artworks. Booking essential.", mapsQuery: "Galleria Borghese, Roma" },
      { name: "Trevi Fountain & Spanish Steps", category: "City walk", distance: "20–25 min walk or short Metro", notes: "Do as an evening walk loop; atmospheric lit up at night.", mapsQuery: "Trevi Fountain, Roma" },
    ],
  },
};

// --- Data: Events ---

const initialEvents = [
  // Flights – Maisha
  { id: "m-flight-1", person: "Maisha", type: "Flight", city: "London", date: "2025-11-20", dateText: "Thu 20 Nov 2025", time: "19:50 → 09:00 (+1)", title: "ATL → LHR · Delta DL0032", location: "Atlanta (ATL) to London Heathrow (LHR)", details: "Overnight flight arriving London the morning of Fri 21 Nov.", notes: "Check in at least 3 hours before departure.", places: [{ label: "Atlanta (ATL)", query: "Hartsfield-Jackson Atlanta International Airport" }, { label: "London Heathrow (LHR)", query: "London Heathrow Airport" }] },
  { id: "m-flight-2", person: "Maisha", type: "Flight", city: "Milan", date: "2025-11-25", dateText: "Tue 25 Nov 2025", time: "07:35 → 10:35", title: "LHR → LIN · British Airways BA566", location: "London Heathrow (LHR) to Milan Linate (LIN)", details: "Morning hop from London to Milan.", notes: "Operated by British Airways – economy. Terminal 5 at Heathrow.", places: [{ label: "London Heathrow (LHR, T5)", query: "London Heathrow Terminal 5" }, { label: "Milan Linate (LIN)", query: "Milan Linate Airport" }] },
  { id: "m-flight-3", person: "Maisha", type: "Flight", city: "Rome", date: "2025-12-01", dateText: "Mon 1 Dec 2025", time: "12:40 → 18:05", title: "FCO → ATL · Delta DL0067", location: "Rome Fiumicino (FCO) to Atlanta (ATL)", details: "Afternoon departure returning to Atlanta.", notes: "Plan to arrive at FCO ~3 hours early.", places: [{ label: "Rome Fiumicino (FCO)", query: "Rome Fiumicino Airport" }, { label: "Atlanta (ATL)", query: "Hartsfield-Jackson Atlanta International Airport" }] },

  // Flights – Rubani
  { id: "r-flight-1a", person: "Rubani", type: "Flight", city: "London", date: "2025-11-21", dateText: "Fri 21 Nov 2025", time: "14:00 → 16:39", title: "ORD → YYZ · Air Canada AC 506", location: "Chicago O'Hare (ORD, T2) to Toronto Pearson (YYZ, T1)", details: "First leg toward London.", notes: "Economy Standard. Remember passport for US exit & Canada transit.", places: [{ label: "Chicago O'Hare (ORD, T2)", query: "O'Hare International Airport Terminal 2" }, { label: "Toronto Pearson (YYZ, T1)", query: "Toronto Pearson Airport Terminal 1" }] },
  { id: "r-flight-1b", person: "Rubani", type: "Flight", city: "London", date: "2025-11-21", dateText: "Fri 21 Nov 2025", time: "18:10 → 06:30 (+1)", title: "YYZ → LHR · Air Canada AC 854", location: "Toronto Pearson (YYZ, T1) to London Heathrow (LHR, T2)", details: "Overnight flight, arriving in London on Sat 22 Nov.", notes: "Meal + breakfast included on board.", places: [{ label: "Toronto Pearson (YYZ, T1)", query: "Toronto Pearson Airport Terminal 1" }, { label: "London Heathrow (LHR, T2)", query: "London Heathrow Airport Terminal 2" }] },
  { id: "r-flight-2", person: "Rubani", type: "Flight", city: "Milan", date: "2025-11-25", dateText: "Tue 25 Nov 2025", time: "07:35 → 10:35", title: "LHR → LIN · British Airways BA566", location: "London Heathrow (LHR, T5) to Milan Linate (LIN)", details: "Morning flight from London to Milan.", notes: "Economy Basic; 1 small handbag + 1 cabin bag included.", places: [{ label: "London Heathrow (LHR, T5)", query: "London Heathrow Airport Terminal 5" }, { label: "Milan Linate (LIN)", query: "Milan Linate Airport" }] },
  { id: "r-flight-3a", person: "Rubani", type: "Flight", city: "Rome", date: "2025-12-01", dateText: "Mon 1 Dec 2025", time: "11:15 → 14:55", title: "FCO → YYZ · Air Canada AC 891", location: "Rome Fiumicino (FCO, T3) to Toronto Pearson (YYZ, T1)", details: "Daytime flight from Rome.", notes: "Meal + snack on board.", places: [{ label: "Rome Fiumicino (FCO, T3)", query: "Rome Fiumicino Airport Terminal 3" }, { label: "Toronto Pearson (YYZ, T1)", query: "Toronto Pearson Airport Terminal 1" }] },
  { id: "r-flight-3b", person: "Rubani", type: "Flight", city: "Rome", date: "2025-12-01", dateText: "Mon 1 Dec 2025", time: "16:50 → 17:48", title: "YYZ → ORD · Air Canada AC 8909", location: "Toronto Pearson (YYZ, T1) to Chicago O'Hare (ORD, T2)", details: "Final leg home to Chicago.", notes: "Connection through Toronto; remember to clear US formalities.", places: [{ label: "Toronto Pearson (YYZ, T1)", query: "Toronto Pearson Airport Terminal 1" }, { label: "Chicago O'Hare (ORD, T2)", query: "O'Hare International Airport Terminal 2" }] },

  // Stays – both
  { id: "stay-london", person: "Both", type: "Stay", city: "London", date: "2025-11-21", dateText: "Fri 21 – Tue 25 Nov 2025", time: "4 nights", title: "Airbnb with host Paul", location: "9, 130a Eric Street, Greater London E3 4SS", details: "Base for exploring London.", notes: "Total cost: $1,701.21 for the stay." },
  { id: "stay-milan", person: "Both", type: "Stay", city: "Milan", date: "2025-11-25", dateText: "Tue 25 – Wed 26 Nov 2025", time: "1 night", title: "Hilton Milan", location: "Via Luigi Galvani 12, 20124 Milan", details: "Quick city stop between London & Florence.", notes: "Total cost: 253.05 EUR." },
  { id: "stay-florence", person: "Both", type: "Stay", city: "Florence", date: "2025-11-26", dateText: "Wed 26 – Sat 29 Nov 2025", time: "3 nights", title: "Airbnb – Piazza Santa Maria Novella 13", location: "P.za di Santa Maria Novella, 13, 50123 Firenze", details: "Great base for walking the historic center.", notes: "Total cost: $741.41." },
  { id: "stay-rome", person: "Both", type: "Stay", city: "Rome", date: "2025-11-29", dateText: "Sat 29 Nov – Mon 1 Dec 2025", time: "2 nights", title: "DoubleTree by Hilton Rome Monti", location: "Piazza dell'Esquilino 1, 00185 Rome", details: "Easy access to Termini and central Rome sights.", notes: "Total cost: 631.92 EUR." },

  // Trains – both (with QR)
  { id: "train-milan-florence", person: "Both", type: "Train", city: "Florence", date: "2025-11-26", dateText: "Wed 26 Nov 2025", time: "12:10 → 14:04", title: "Milano Centrale → Firenze S.M. Novella · Frecciarossa 9535", location: "Premium class · Coach 6 Seats 7A (Maisha), 8A (Rubani)", details: "High-speed train from Milan to Florence.", notes: "PNR C7D25N · Premium Class · Coach 6 · Seats 7A / Ticket: 2681553267 (Maisha), 8A / Ticket: 2681553266 (Rubani)", places: [{ label: "Milano Centrale", query: "Milano Centrale railway station" }, { label: "Firenze S.M. Novella", query: "Firenze Santa Maria Novella railway station" }] },
  { id: "train-florence-rome", person: "Both", type: "Train", city: "Rome", date: "2025-11-29", dateText: "Sat 29 Nov 2025", time: "09:14 → 10:49", title: "Firenze S.M. Novella → Roma Termini · Frecciarossa 9515", location: "1st class · Coach 4 Seats 5D (Maisha), 6D (Rubani)", details: "High-speed train from Florence to Rome.", notes: "PNR C7GTB5 · 1st Class · Coach 4 · Seats 5D / Ticket: 2681553271 (Maisha), 6D / Ticket: 2681553270 (Rubani)", places: [{ label: "Firenze S.M. Novella", query: "Firenze Santa Maria Novella railway station" }, { label: "Roma Termini", query: "Roma Termini railway station" }] },
];

// --- Weather Helper ---

const cityMeta = {
  London: { latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" },
  Milan: { latitude: 45.4642, longitude: 9.19, timezone: "Europe/Rome" },
  Florence: { latitude: 43.7696, longitude: 11.2558, timezone: "Europe/Rome" },
  Rome: { latitude: 41.9028, longitude: 12.4964, timezone: "Europe/Rome" },
};

function mapWeatherCodeToSummary(code) {
  if (code === 0) return { icon: "☀️", text: "Clear sky" };
  if (code === 1 || code === 2) return { icon: "🌤️", text: "Mostly sunny" };
  if (code === 3) return { icon: "☁️", text: "Cloudy" };
  if (code === 45 || code === 48) return { icon: "🌫️", text: "Foggy" };
  if (code === 51 || code === 53 || code === 55) return { icon: "🌧️", text: "Drizzle" };
  if (code === 61 || code === 63 || code === 65) return { icon: "🌧️", text: "Rain" };
  if (code === 80 || code === 81 || code === 82) return { icon: "🌦️", text: "Showers" };
  if (code === 71 || code === 73 || code === 75 || code === 77) return { icon: "🌨️", text: "Snow" };
  if (code === 95 || code === 96 || code === 99) return { icon: "⛈️", text: "Thunderstorms" };
  return { icon: "🌥️", text: "Mixed conditions" };
}

const fetchWeatherForecast = async (cityDateRanges) => {
  const entries = await Promise.all(
    cityDateRanges.map(async ({ city, startDate, endDate }) => {
      const meta = cityMeta[city];
      if (!meta) return [city, null];

      const url =
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${meta.latitude}&longitude=${meta.longitude}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
        `&timezone=${encodeURIComponent(meta.timezone)}` +
        `&start_date=${startDate}&end_date=${endDate}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        const daily = data.daily;
        if (!daily || !daily.time) return [city, null];

        const start = new Date(`${startDate}T12:00:00`);
        const end = new Date(`${endDate}T12:00:00`);
        const startMonth = start.toLocaleDateString("en-US", { month: "short" });
        const endMonth = end.toLocaleDateString("en-US", { month: "short" });
        const startDay = start.getDate();
        const endDay = end.getDate();
        const rangeLabel =
          startMonth === endMonth
            ? `${startMonth} ${startDay}-${endDay}`
            : `${startMonth} ${startDay}-${endMonth} ${endDay}`;

        const days = daily.time.map((isoDate, idx) => {
          const d = new Date(isoDate + "T12:00:00");
          const label = d.toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });

          const code = daily.weathercode[idx];
          const hi = daily.temperature_2m_max[idx];
          const lo = daily.temperature_2m_min[idx];
          const mapped = mapWeatherCodeToSummary(code);

          return {
            label,
            summary: `${mapped.icon} ${mapped.text}`,
            high: `${Math.round(hi)}°C`,
            low: `${Math.round(lo)}°C`,
            date: d,
          };
        });

        return [city, { rangeLabel, days }];
      } catch (err) {
        console.error(`Weather error for ${city}`, err);
        return [city, null];
      }
    })
  );

  return entries.reduce((acc, [city, data]) => {
    if (data) acc[city] = data;
    return acc;
  }, {});
};

// --- Main Component ---

export default function TripApp({ showQRCodes = true }) {
  const [events] = useState(initialEvents);
  const [cityFilter, setCityFilter] = useState("all");
  const [personFilters, setPersonFilters] = useState({
    Maisha: true,
    Rubani: true,
  });
  const [typeFilter, setTypeFilter] = useState("all");
  const [mode, setMode] = useState("plan");
  const [guideFilter, setGuideFilter] = useState("all");
  const [weatherData, setWeatherData] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [qrModal, setQrModal] = useState(null);

  const cityDateRanges = useMemo(
    () => [
      { city: "London", startDate: "2025-11-21", endDate: "2025-11-25" },
      { city: "Milan", startDate: "2025-11-25", endDate: "2025-11-26" },
      { city: "Florence", startDate: "2025-11-26", endDate: "2025-11-29" },
      { city: "Rome", startDate: "2025-11-29", endDate: "2025-12-01" },
    ],
    []
  );

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoadingWeather(true);
      setWeatherError(null);
      try {
        const forecasts = await fetchWeatherForecast(cityDateRanges);
        setWeatherData(forecasts);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
        setWeatherError(
          "Unable to load latest weather data. Please try refreshing."
        );
      } finally {
        setIsLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [cityDateRanges]);

  const activePersons = useMemo(
    () => Object.keys(personFilters).filter((p) => personFilters[p]),
    [personFilters]
  );

  const filteredEvents = useMemo(() => {
    return events
      .slice()
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
      )
      .filter((ev) => {
        const matchesPerson =
          activePersons.includes(ev.person) ||
          (ev.person === "Both" && activePersons.length > 0);

        const matchesCity = cityFilter === "all" || ev.city === cityFilter;

        const matchesType =
          typeFilter === "all" || ev.type.toLowerCase() === typeFilter;

        return matchesPerson && matchesCity && matchesType;
      });
  }, [events, activePersons, cityFilter, typeFilter]);

  const renderQRBlock = (event) => {
    const codes = qrCodes[event.id];
    if (!codes) return null;

    const segmentLabel = event.title;

    return (
      <div className="qr-block">
        <div className="qr-title">Train QR / PNR</div>
        <div className="qr-row">
          {codes.Maisha && (
            <button
              type="button"
              className="qr-person qr-clickable"
              onClick={() =>
                setQrModal({
                  src: codes.Maisha,
                  alt: "Maisha train QR",
                  label: `Train QR code for Maisha – ${segmentLabel}`,
                })
              }
            >
              <div className="qr-label">Maisha</div>
              <ImageWithFallback
                src={codes.Maisha}
                alt="Maisha train QR"
                className="qr-img"
              />
            </button>
          )}

          {codes.Rubani && (
            <button
              type="button"
              className="qr-person qr-clickable"
              onClick={() =>
                setQrModal({
                  src: codes.Rubani,
                  alt: "Rubani train QR",
                  label: `Train QR code for Rubani – ${segmentLabel}`,
                })
              }
            >
              <div className="qr-label">Rubani</div>
              <ImageWithFallback
                src={codes.Rubani}
                alt="Rubani train QR"
                className="qr-img"
              />
            </button>
          )}
        </div>
      </div>
    );
  };

  const handleRefreshWeather = async () => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    try {
      const forecasts = await fetchWeatherForecast(cityDateRanges);
      setWeatherData(forecasts);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to refresh weather data:", error);
      setWeatherError(
        "Unable to refresh weather data. Using previously loaded forecast."
      );
    } finally {
      setIsLoadingWeather(false);
    }
  };

  return (
    <div className="root">
      <style>{`
        :root {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color-scheme: light dark;
          --bg: #060712;
          --bg-elevated: rgba(20, 24, 38, 0.96);
          --bg-soft: rgba(32, 36, 54, 0.9);
          --border-subtle: rgba(255, 255, 255, 0.08);
          --accent: #ffd369;
          --accent-soft: rgba(255, 211, 105, 0.12);
          --accent-strong: #ffb347;
          --text: #f7f7ff;
          --muted: #a0a3b1;
          --pill-bg: rgba(255, 255, 255, 0.08);
          --shadow-soft: 0 18px 60px rgba(0, 0, 0, 0.6);
          --radius-xl: 24px;
          --radius-lg: 18px;
          --radius-md: 12px;
          --radius-sm: 8px;
        }

        body, .root {
          margin: 0;
          min-height: 100vh;
          background: radial-gradient(circle at top, #1b2140 0, var(--bg) 55%);
          color: var(--text);
          display: flex;
          align-items: stretch;
          justify-content: center;
        }

        .root {
          padding: 8px;
          width: 100%;
          box-sizing: border-box;
        }

        @media (min-width: 480px) {
          .root { padding: 12px; }
        }

        @media (min-width: 640px) {
          .root { padding: 16px; }
        }

        @media (min-width: 768px) {
          .root { padding: 20px; }
        }

        @media (min-width: 1024px) {
          .root { padding: 24px; }
        }

        .app-shell {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          background: linear-gradient(135deg, rgba(20, 24, 38, 0.97), rgba(11, 13, 24, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: var(--shadow-soft);
          display: flex;
          flex-direction: column;
          gap: 12px;
          backdrop-filter: blur(18px);
          border-radius: 16px;
          padding: 12px;
        }

        @media (min-width: 480px) {
          .app-shell {
            border-radius: 20px;
            padding: 16px;
            gap: 14px;
          }
        }

        @media (min-width: 640px) {
          .app-shell {
            max-width: 600px;
            border-radius: 24px;
          }
        }

        @media (min-width: 768px) {
          .app-shell {
            max-width: 720px;
            border-radius: 28px;
            padding: 18px;
            gap: 16px;
          }
        }

        @media (min-width: 1024px) {
          .app-shell {
            max-width: 960px;
            border-radius: 32px;
            padding: 20px 20px 24px;
          }
        }

        @media (min-width: 1280px) {
          .app-shell {
            max-width: 1200px;
          }
        }

        /* --- Updated Header Layout & Chip Styles (Cleaner Look) --- */

        header {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (min-width: 640px) {
          header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .trip-title {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .trip-title h1 {
          margin: 0;
          font-size: 1.25rem;
          letter-spacing: 0.03em;
          line-height: 1.2;
        }

        @media (min-width: 480px) {
          .trip-title h1 {
            font-size: 1.4rem;
          }
        }

        .trip-title span {
          font-size: 0.85rem;
          color: var(--muted);
          line-height: 1.3;
        }

        @media (min-width: 480px) {
          .trip-title span {
            font-size: 0.9rem;
          }
        }

        .header-controls {
          display: inline-flex;
          gap: 6px;
          padding: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .header-btn {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.78rem;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          background: transparent;
          color: #a0a3b1;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .header-btn.active {
          background: rgba(255, 211, 105, 0.12);
          color: #ffb347;
          font-weight: 600;
        }

        /* --- Secondary Controls Bar (Filters) --- */

        .controls-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        @media (min-width: 640px) {
          .controls-bar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .filter-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid var(--border-subtle);
          color: var(--muted);
        }

        .filter-pill label {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          color: var(--text);
        }

        .filter-pill input[type="checkbox"] {
          accent-color: var(--accent-strong);
          cursor: pointer;
          width: 14px;
          height: 14px;
        }

        .filter-pill select {
          background: rgba(255, 255, 255, 0.06);
          border: none;
          border-radius: 4px;
          color: var(--text);
          font-size: 0.78rem;
          padding: 2px 4px;
          cursor: pointer;
        }

        .category-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .cat-chip {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.04);
          color: var(--muted);
          border: 1px solid rgba(255, 255, 255, 0.06);
          cursor: pointer;
        }

        .cat-chip.active {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text);
          border-color: rgba(255, 255, 255, 0.15);
        }

        /* --- Layout --- */

        .layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          align-items: flex-start;
        }

        @media (min-width: 768px) {
          .layout {
            gap: 16px;
          }
        }

        @media (min-width: 1024px) {
          .layout {
            grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
          }
        }

        @media (min-width: 1280px) {
          .layout {
            grid-template-columns: minmax(0, 2.2fr) minmax(280px, 1.3fr);
          }
        }

        .panel {
          background: var(--bg-elevated);
          border-radius: var(--radius-lg);
          padding: 12px 12px 14px;
          border: 1px solid var(--border-subtle);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        @media (min-width: 640px) {
          .panel {
            border-radius: var(--radius-xl);
          }
        }

        .panel-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 10px;
        }

        @media (min-width: 480px) {
          .panel-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .panel-header h2 {
          font-size: 0.95rem;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.17em;
          color: var(--muted);
        }

        .panel-header span {
          font-size: 0.78rem;
          color: var(--muted);
        }

        .scroll-list {
          max-height: calc(100vh - 240px);
          overflow: auto;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
        }

        .scroll-list::-webkit-scrollbar {
          width: 6px;
        }

        .scroll-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 999px;
        }

        /* --- Cards & Pills --- */

        .card {
          background: var(--bg-soft);
          border-radius: var(--radius-md);
          padding: 12px;
          margin-bottom: 10px;
          border: 1px solid transparent;
          transition: border-color 0.15s ease, transform 0.12s ease, box-shadow 0.12s ease;
        }

        @media (min-width: 480px) {
          .card {
            border-radius: var(--radius-lg);
          }
        }

        @media (hover: hover) {
          .card:hover {
            border-color: rgba(255, 255, 255, 0.15);
            transform: translateY(-1px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55);
          }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          gap: 6px;
        }

        @media (min-width: 480px) {
          .card-header {
            align-items: center;
          }
        }

        .pill {
          font-size: 0.7rem;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: var(--pill-bg);
          color: var(--muted);
          border: 1px solid rgba(255, 255, 255, 0.07);
          white-space: nowrap;
        }

        @media (min-width: 480px) {
          .pill {
            padding: 3px 8px;
            border-radius: 999px;
            letter-spacing: 0.12em;
          }
        }

        .pill.flight {
          background: rgba(138, 180, 255, 0.16);
          color: #8ab4ff;
          border-color: rgba(138, 180, 255, 0.35);
        }

        .pill.stay {
          background: rgba(129, 199, 132, 0.14);
          color: #9ae6b4;
          border-color: rgba(154, 230, 180, 0.4);
        }

        .pill.train {
          background: rgba(255, 213, 128, 0.14);
          color: #ffd369;
          border-color: rgba(255, 211, 105, 0.4);
        }

        .pill.person {
          opacity: 0.9;
        }

        .card-title {
          font-size: 0.92rem;
          font-weight: 600;
          margin: 0 0 6px;
          line-height: 1.3;
        }

        .card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 10px;
          font-size: 0.75rem;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .card-detail {
          font-size: 0.8rem;
          color: #e6e6ff;
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .card-notes {
          font-size: 0.76rem;
          color: var(--muted);
          opacity: 0.95;
          line-height: 1.4;
        }

        /* --- Weather Specifics --- */

        .weather-scroll {
          max-height: calc(100vh - 240px);
          overflow-y: auto;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
        }

        .weather-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .weather-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 999px;
        }

        .weather-city {
          border-radius: var(--radius-md);
          padding: 12px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, rgba(32, 36, 54, 0.95), rgba(22, 26, 44, 0.96));
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        @media (min-width: 480px) {
          .weather-city {
            border-radius: var(--radius-lg);
          }
        }

        .weather-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 6px;
        }

        .weather-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .weather-header span {
          font-size: 0.78rem;
          color: var(--muted);
        }

        .weather-days {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          margin-top: 8px;
        }

        @media (min-width: 400px) {
          .weather-days {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 768px) {
          .weather-days {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }
        }

        .weather-day {
          border-radius: var(--radius-md);
          padding: 10px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 0.75rem;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        @media (hover: hover) {
          .weather-day:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          }
        }

        .weather-day-date {
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 0.85rem;
          letter-spacing: 0.02em;
        }

        .weather-summary {
          margin-bottom: 6px;
          line-height: 1.3;
          min-height: 2.6em;
          display: flex;
          align-items: center;
        }

        .weather-summary span {
          font-size: 1.1rem;
          margin-right: 6px;
        }

        .weather-temps {
          display: flex;
          justify-content: space-between;
          font-size: 0.74rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          padding: 5px 8px;
          margin-top: 6px;
        }

        .weather-temp-high {
          color: #ffd369;
        }

        .weather-temp-low {
          color: #8ab4ff;
        }

        .weather-footer {
          font-size: 0.7rem;
          color: var(--muted);
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        @media (min-width: 640px) {
          .weather-footer {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .weather-refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          color: var(--text);
          cursor: pointer;
          transition: background 0.15s ease;
        }

        @media (min-width: 480px) {
          .weather-refresh-btn {
            padding: 6px 10px;
            font-size: 0.72rem;
            color: var(--muted);
            border-radius: 999px;
          }
        }

        @media (hover: hover) {
          .weather-refresh-btn:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        }

        .weather-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
          color: var(--muted);
          font-size: 0.85rem;
          text-align: center;
        }

        .loading-spinner {
          margin-bottom: 12px;
          animation: spin 1.5s linear infinite;
          width: 32px;
          height: 32px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          padding: 12px;
          font-size: 0.8rem;
          color: #ff8a8a;
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.2);
          border-radius: 10px;
          margin: 10px 0;
          text-align: center;
        }

        .city-icon {
          margin-right: 6px;
          font-size: 1.1em;
          vertical-align: text-bottom;
        }

        /* --- QR Styles --- */

        .qr-block {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
        }

        .qr-title {
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .qr-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }

        @media (min-width: 480px) {
          .qr-row {
            justify-content: flex-start;
          }
        }

        .qr-person {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
        }

        .qr-label {
          color: var(--muted);
          margin-bottom: 2px;
        }

        .qr-img {
          width: 70px;
          height: 70px;
          object-fit: contain;
          border-radius: 8px;
          background: white;
          padding: 4px;
        }

        @media (min-width: 400px) {
          .qr-img {
            width: 80px;
            height: 80px;
          }
        }

        .no-weather {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
          text-align: center;
          color: var(--muted);
          font-size: 0.85rem;
        }

        .qr-clickable {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        .qr-clickable:focus-visible {
          outline: 2px solid var(--accent-strong);
          outline-offset: 3px;
        }

        .qr-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 9999;
        }

        .qr-modal-content {
          position: relative;
          background: var(--bg-elevated);
          padding: 16px;
          border-radius: 16px;
          border: 1px solid var(--border-subtle);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-top: 100px;
        }

        .qr-modal-img {
          max-width: 260px;
          max-height: 260px;
          width: 100%;
          height: auto;
          background: white;
          border-radius: 12px;
          padding: 8px;
          object-fit: contain;
        }

        .qr-modal-caption {
          font-size: 0.8rem;
          color: var(--muted);
          text-align: center;
        }

        .qr-modal-close {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--text);
          font-size: 0.85rem;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* City guide specifics */

        .city-guide-block {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed rgba(255, 255, 255, 0.12);
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        @media (min-width: 640px) {
          .city-guide-block {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .city-guide-section {
          font-size: 0.75rem;
        }

        .city-guide-title {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .city-guide-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .city-guide-item-name {
          font-weight: 600;
          font-size: 0.78rem;
        }

        .city-guide-item-name a {
          color: var(--accent-strong);
          text-decoration: none;
        }

        .city-guide-item-name a:hover {
          text-decoration: underline;
        }

        .city-guide-meta {
          font-size: 0.7rem;
          color: var(--muted);
        }

        .city-guide-notes {
          font-size: 0.7rem;
          color: #e6e6ff;
        }
      `}</style>

      <div className="app-shell">
        {/* Cleaner Header: Title on left, Mode toggle on right */}
        <header>
          <div className="trip-title">
            <h1>Europe Trip • Maisha &amp; Rubani</h1>
            <span>London → Milan → Florence → Rome • 20 Nov – 1 Dec 2025</span>
          </div>
          <div className="header-controls">
            <button
              className={`header-btn ${mode === "plan" ? "active" : ""}`}
              onClick={() => setMode("plan")}
            >
              Itinerary
            </button>
            <button
              className={`header-btn ${mode === "guide" ? "active" : ""}`}
              onClick={() => setMode("guide")}
            >
              City Guide
            </button>
          </div>
        </header>

        {/* Separated Controls Bar for Filters */}
        <div className="controls-bar">
          {/* Left: Global Filters (Person / City) */}
          <div className="filter-row">
            <div className="filter-pill">
              <span>👤</span>
              <label>
                <input
                  type="checkbox"
                  checked={personFilters.Maisha}
                  onChange={(e) =>
                    setPersonFilters((f) => ({
                      ...f,
                      Maisha: e.target.checked,
                    }))
                  }
                />
                Maisha
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={personFilters.Rubani}
                  onChange={(e) =>
                    setPersonFilters((f) => ({
                      ...f,
                      Rubani: e.target.checked,
                    }))
                  }
                />
                Rubani
              </label>
            </div>

            <div className="filter-pill">
              <span>🏙️</span>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="all">All cities</option>
                <option value="London">London</option>
                <option value="Milan">Milan</option>
                <option value="Florence">Florence</option>
                <option value="Rome">Rome</option>
              </select>
            </div>
          </div>

          {/* Right: Sub-filters (Chips) */}
          <div className="category-chips">
            {mode === "plan" ? (
              <>
                <button
                  className={`cat-chip ${typeFilter === "all" ? "active" : ""}`}
                  onClick={() => setTypeFilter("all")}
                >
                  All Types
                </button>
                <button
                  className={`cat-chip ${typeFilter === "flight" ? "active" : ""}`}
                  onClick={() => setTypeFilter("flight")}
                >
                  Flights
                </button>
                <button
                  className={`cat-chip ${typeFilter === "stay" ? "active" : ""}`}
                  onClick={() => setTypeFilter("stay")}
                >
                  Stays
                </button>
                <button
                  className={`cat-chip ${typeFilter === "train" ? "active" : ""}`}
                  onClick={() => setTypeFilter("train")}
                >
                  Trains
                </button>
              </>
            ) : (
              <>
                <button
                  className={`cat-chip ${guideFilter === "all" ? "active" : ""}`}
                  onClick={() => setGuideFilter("all")}
                >
                  All Places
                </button>
                <button
                  className={`cat-chip ${guideFilter === "food" ? "active" : ""}`}
                  onClick={() => setGuideFilter("food")}
                >
                  Food
                </button>
                <button
                  className={`cat-chip ${guideFilter === "activities" ? "active" : ""}`}
                  onClick={() => setGuideFilter("activities")}
                >
                  See &amp; Do
                </button>
              </>
            )}
          </div>
        </div>

        {qrModal && (
          <div
            className="qr-modal-backdrop"
            onClick={() => setQrModal(null)}
          >
            <div
              className="qr-modal-content"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={qrModal.label}
            >
              <button
                className="qr-modal-close"
                onClick={() => setQrModal(null)}
                aria-label="Close QR code"
              >
                ✕
              </button>

              <img
                src={qrModal.src}
                alt={qrModal.alt}
                className="qr-modal-img"
              />

              <div className="qr-modal-caption">{qrModal.label}</div>
            </div>
          </div>
        )}

        <div className="layout">
          {/* LEFT PANEL: Itinerary OR City Guide depending on mode */}
          <section className="panel">
            <div className="panel-header">
              <h2>{mode === "plan" ? "Itinerary Timeline" : "City Guide"}</h2>
              <span>
                {mode === "plan"
                  ? "Your daily schedule"
                  : "Curated local spots"}
              </span>
            </div>

            <div className="scroll-list" aria-label="Main content">
              {mode === "plan" ? (
                filteredEvents.length === 0 ? (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--muted)",
                      margin: "8px 4px",
                    }}
                  >
                    No items match your current filters.
                  </p>
                ) : (
                  filteredEvents.map((ev) => {
                    const typeClass =
                      ev.type === "Flight"
                        ? "flight"
                        : ev.type === "Train"
                        ? "train"
                        : "stay";

                    return (
                      <article key={ev.id} className="card">
                        <div className="card-header">
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <span className={`pill ${typeClass}`}>
                              {ev.type}
                            </span>
                            <span className="pill">{ev.city}</span>
                          </div>
                          <span className="pill person">{ev.person}</span>
                        </div>

                        <h3 className="card-title">{ev.title}</h3>

                        <div className="card-meta">
                          <span>📅 {ev.dateText}</span>
                          <span>⏰ {ev.time}</span>
                        </div>

                        <p className="card-detail">{ev.details}</p>

                        <p className="card-detail">
                          {ev.places && ev.places.length > 0 ? (
                            ev.places.map((place, idx) => (
                              <span key={place.label}>
                                {idx > 0 && (
                                  <span style={{ color: "var(--muted)" }}>
                                    {" "}
                                    ·{" "}
                                  </span>
                                )}
                                <a
                                  href={`https://www.google.com/maps/search/${encodeURIComponent(
                                    place.query || place.label
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "var(--accent-strong)",
                                    textDecoration: "none",
                                  }}
                                >
                                  {place.label}
                                </a>
                              </span>
                            ))
                          ) : (
                            <a
                              href={`https://www.google.com/maps/search/${encodeURIComponent(
                                ev.location
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "var(--accent-strong)",
                                textDecoration: "none",
                              }}
                            >
                              {ev.location}
                            </a>
                          )}
                        </p>

                        <p className="card-notes">
                          {ev.notes || "No additional notes"}
                        </p>

                        {showQRCodes &&
                          ev.type === "Train" &&
                          renderQRBlock(ev)}
                      </article>
                    );
                  })
                )
              ) : (
                // City Guide mode
                (() => {
                  const entries = Object.entries(cityGuideData).filter(
                    ([city]) => cityFilter === "all" || city === cityFilter
                  );

                  if (entries.length === 0) {
                    return (
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--muted)",
                          margin: "8px 4px",
                        }}
                      >
                        No city guide entries for this filter.
                      </p>
                    );
                  }

                  return entries.map(([city, guide]) => {
                    const showFood =
                      guideFilter === "all" || guideFilter === "food";
                    const showActivities =
                      guideFilter === "all" || guideFilter === "activities";

                    return (
                      <article key={city} className="card">
                        <div className="card-header">
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <span className="pill">{city}</span>
                          </div>
                        </div>

                        <h3 className="card-title">{city} picks</h3>

                        <div className="city-guide-block">
                          {showFood && (
                            <div className="city-guide-section">
                              <div className="city-guide-title">
                                Food &amp; drinks
                              </div>
                              <ul className="city-guide-list">
                                {guide.food.map((place, idx) => (
                                  <li key={`${city}-food-${idx}`}>
                                    <div className="city-guide-item-name">
                                      <a
                                        href={`https://www.google.com/maps/search/${encodeURIComponent(
                                          place.mapsQuery || place.name
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {place.name}
                                      </a>
                                    </div>
                                    <div className="city-guide-meta">
                                      {place.category} · {place.distance}
                                    </div>
                                    {place.notes && (
                                      <div className="city-guide-notes">
                                        {place.notes}
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {showActivities && (
                            <div className="city-guide-section">
                              <div className="city-guide-title">
                                To see &amp; do
                              </div>
                              <ul className="city-guide-list">
                                {guide.activities.map((act, idx) => (
                                  <li key={`${city}-activity-${idx}`}>
                                    <div className="city-guide-item-name">
                                      <a
                                        href={`https://www.google.com/maps/search/${encodeURIComponent(
                                          act.mapsQuery || act.name
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {act.name}
                                      </a>
                                    </div>
                                    <div className="city-guide-meta">
                                      {act.category} · {act.distance}
                                    </div>
                                    {act.notes && (
                                      <div className="city-guide-notes">
                                        {act.notes}
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  });
                })()
              )}
            </div>
          </section>

          {/* RIGHT PANEL: Weather only (clean overview) */}
          <section className="panel">
            <div className="panel-header">
              <h2>Weather Overview</h2>
              <span>
                {cityFilter === "all"
                  ? "Forecast (°C)"
                  : `${cityFilter} forecast (°C)`}
              </span>
            </div>

            <div className="weather-scroll">
              {isLoadingWeather ? (
                <div className="loading-indicator">
                  <svg
                    className="loading-spinner"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeOpacity="0.2"
                    />
                    <path
                      d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.76121C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div>Loading forecast...</div>
                </div>
              ) : weatherError ? (
                <div className="error-message">
                  {weatherError}
                  <button
                    onClick={handleRefreshWeather}
                    style={{
                      marginTop: "10px",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      background: "rgba(255,255,255,0.1)",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : !weatherData || Object.keys(weatherData).length === 0 ? (
                <div className="no-weather">
                  <p>No weather data available</p>
                  <button
                    onClick={handleRefreshWeather}
                    className="weather-refresh-btn"
                    style={{ marginTop: "10px" }}
                  >
                    Try fetching weather
                  </button>
                </div>
              ) : (
                <>
                  {Object.entries(weatherData)
                    .filter(
                      ([city]) => cityFilter === "all" || city === cityFilter
                    )
                    .map(([city, data]) => {
                      const cityIcons = {
                        London: "🇬🇧",
                        Milan: "🇮🇹",
                        Florence: "🇮🇹",
                        Rome: "🇮🇹",
                      };

                      if (!data || !data.days || data.days.length === 0) {
                        return (
                          <div key={city} className="weather-city">
                            <div className="weather-header">
                              <h3>
                                <span className="city-icon">
                                  {cityIcons[city] || "🌍"}
                                </span>
                                {city}
                              </h3>
                              <span>Forecast unavailable</span>
                            </div>
                            <div className="no-weather">
                              <p>We couldn’t load the forecast for this city.</p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={city} className="weather-city">
                          <div className="weather-header">
                            <h3>
                              <span className="city-icon">
                                {cityIcons[city] || "🌍"}
                              </span>
                              {city}
                            </h3>
                            <span>{data.rangeLabel}</span>
                          </div>
                          <div className="weather-days">
                            {data.days.map((day, idx) => (
                              <div
                                key={`${city}-${idx}`}
                                className="weather-day"
                              >
                                <div className="weather-day-date">
                                  {day.label}
                                </div>
                                <div className="weather-summary">
                                  <span>{day.summary.split(" ")[0]}</span>
                                  {day.summary.split(" ").slice(1).join(" ")}
                                </div>
                                <div className="weather-temps">
                                  <span className="weather-temp-high">
                                    High: {day.high}
                                  </span>
                                  <span className="weather-temp-low">
                                    Low: {day.low}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                  <div className="weather-footer">
                    <button
                      onClick={handleRefreshWeather}
                      className="weather-refresh-btn"
                      disabled={isLoadingWeather}
                    >
                      ↻ Refresh Forecast
                    </button>
                    <span>
                      Last updated:{" "}
                      {lastUpdated
                        ? new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(lastUpdated)
                        : "Never"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
