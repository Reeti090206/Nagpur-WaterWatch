// API Service Layer with Live Fetching & Client-Side Fallback for Nagpur WaterWatch

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Fallback Mock Data for Seamless Demo
export const MOCK_LOCATIONS = [
  {
    id: 1,
    name: "Ambazari Lake Road",
    area: "Ambazari",
    latitude: 21.1305,
    longitude: 79.0495,
    description: "Low-lying road near Ambazari Lake, prone to runoff accumulation during heavy rains.",
    current_severity: "moderate",
    current_water_level: 22.5,
    is_vulnerable: true,
    vulnerability_reason: "Low-lying terrain near lake, poor drainage outlets",
    drainage_capacity: "low",
    historical_frequency: 12,
    last_incident_at: "2026-09-02T14:30:00Z",
    is_active: true
  },
  {
    id: 2,
    name: "Sitabuldi Main Road",
    area: "Sitabuldi",
    latitude: 21.1458,
    longitude: 79.0882,
    description: "Central commercial area with aging storm water drains.",
    current_severity: "low",
    current_water_level: 12.0,
    is_vulnerable: true,
    vulnerability_reason: "Aging storm drain infrastructure in dense commercial zone",
    drainage_capacity: "medium",
    historical_frequency: 8,
    last_incident_at: "2026-08-28T10:15:00Z",
    is_active: true
  },
  {
    id: 3,
    name: "Pardi Naka Underpass",
    area: "Pardi",
    latitude: 21.1567,
    longitude: 79.0921,
    description: "Railway underpass that collects water during monsoon.",
    current_severity: "severe",
    current_water_level: 45.0,
    is_vulnerable: true,
    vulnerability_reason: "Low-elevation underpass acts as water collection point",
    drainage_capacity: "low",
    historical_frequency: 15,
    last_incident_at: "2026-09-10T16:45:00Z",
    is_active: true
  },
  {
    id: 4,
    name: "Automotive Square",
    area: "Automotive Square",
    latitude: 21.1340,
    longitude: 79.0730,
    description: "Major traffic junction with insufficient drainage capacity.",
    current_severity: "low",
    current_water_level: 8.0,
    is_vulnerable: true,
    vulnerability_reason: "High traffic area with moderate drainage capacity",
    drainage_capacity: "medium",
    historical_frequency: 7,
    last_incident_at: "2026-08-15T11:00:00Z",
    is_active: true
  },
  {
    id: 5,
    name: "Pratap Nagar Square",
    area: "Pratap Nagar",
    latitude: 21.1210,
    longitude: 79.0690,
    description: "Residential area near nullah prone to overflow.",
    current_severity: "moderate",
    current_water_level: 28.0,
    is_vulnerable: true,
    vulnerability_reason: "Adjacent to nullah that overflows during heavy rain",
    drainage_capacity: "low",
    historical_frequency: 10,
    last_incident_at: "2026-09-05T08:20:00Z",
    is_active: true
  },
  {
    id: 6,
    name: "Dharampeth College Road",
    area: "Dharampeth",
    latitude: 21.1425,
    longitude: 79.0765,
    description: "Road segment with inadequate slope for runoff.",
    current_severity: "normal",
    current_water_level: 2.0,
    is_vulnerable: true,
    vulnerability_reason: "Flat terrain, water stagnation during prolonged rain",
    drainage_capacity: "medium",
    historical_frequency: 5,
    last_incident_at: "2026-07-20T18:00:00Z",
    is_active: true
  },
  {
    id: 7,
    name: "Manewada Road Bridge",
    area: "Manewada",
    latitude: 21.1680,
    longitude: 79.1030,
    description: "Bridge approach road dips below grade near nullah crossing.",
    current_severity: "moderate",
    current_water_level: 19.0,
    is_vulnerable: true,
    vulnerability_reason: "Approach road below grade level at nullah crossing",
    drainage_capacity: "low",
    historical_frequency: 9,
    last_incident_at: "2026-09-08T13:10:00Z",
    is_active: true
  },
  {
    id: 8,
    name: "Hingna T-Point",
    area: "Hingna",
    latitude: 21.1100,
    longitude: 79.0150,
    description: "Suburban junction with rapid development outpacing drainage upgrades.",
    current_severity: "low",
    current_water_level: 9.5,
    is_vulnerable: true,
    vulnerability_reason: "Rapid urbanization without matching drainage infrastructure",
    drainage_capacity: "low",
    historical_frequency: 6,
    last_incident_at: "2026-08-30T19:30:00Z",
    is_active: true
  }
];

export const MOCK_WEATHER = {
  rainfall_mm: 32.5,
  intensity: "heavy",
  humidity: 88,
  temperature_c: 27.4,
  wind_speed_kmh: 18.2,
  weather_condition: "Heavy rain with thunderstorm",
  forecast_rainfall_mm: 45.0,
  data_source: "SIMULATED / DEMO DATA",
  is_simulated: true,
  observed_at: new Date().toISOString()
};

export const MOCK_STATS = {
  total_locations: 8,
  active_sensors: 8,
  severe_locations: 1,
  moderate_locations: 3,
  low_locations: 3,
  normal_locations: 1,
  pending_reports: 4,
  active_predictions: 8,
  latest_rainfall_mm: 32.5,
  weather_condition: "Heavy rain with thunderstorm",
  data_source: "SIMULATED / DEMO DATA",
  last_updated: new Date().toISOString()
};

export async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend API offline, using demo stats", e);
  }
  return MOCK_STATS;
}

export async function fetchLocations(severity?: string) {
  try {
    const url = severity ? `${API_BASE_URL}/locations/?severity=${severity}` : `${API_BASE_URL}/locations/`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend API offline, using demo locations", e);
  }
  if (severity) {
    return MOCK_LOCATIONS.filter(l => l.current_severity === severity);
  }
  return MOCK_LOCATIONS;
}

export async function fetchWeather() {
  try {
    const res = await fetch(`${API_BASE_URL}/weather/current`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend API offline, using demo weather", e);
  }
  return MOCK_WEATHER;
}

export async function fetchSensors() {
  try {
    const res = await fetch(`${API_BASE_URL}/sensors/`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend API offline, using demo sensors");
  }
  return MOCK_LOCATIONS.map((loc, idx) => ({
    id: idx + 1,
    sensor_id: `NGP-S${(idx + 1).toString().padStart(3, '0')}`,
    name: `Water Level Sensor ${idx + 1}`,
    location_name: loc.name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    status: "online",
    battery_level: 85 + (idx % 15),
    current_water_level: loc.current_water_level,
    last_reading_at: new Date().toISOString(),
    is_simulated: true
  }));
}

export async function fetchReports() {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend API offline, using demo reports");
  }
  return [
    {
      id: 101,
      latitude: 21.1567,
      longitude: 79.0921,
      location_name: "Pardi Naka Underpass",
      severity: "severe",
      description: "Water level is waist-high (approx 45cm). Two two-wheelers stuck. Avoid completely!",
      photo_url: null,
      status: "verified",
      confidence_score: 0.94,
      created_at: new Date(Date.now() - 25 * 60000).toISOString()
    },
    {
      id: 102,
      latitude: 21.1305,
      longitude: 79.0495,
      location_name: "Ambazari Lake Road",
      severity: "moderate",
      description: "Slow traffic due to water logging on left lane near lake gate.",
      photo_url: null,
      status: "pending",
      confidence_score: 0.78,
      created_at: new Date(Date.now() - 45 * 60000).toISOString()
    },
    {
      id: 103,
      latitude: 21.1210,
      longitude: 79.0690,
      location_name: "Pratap Nagar Square",
      severity: "moderate",
      description: "Nullah overflowing across road. Traffic diverted.",
      photo_url: null,
      status: "pending",
      confidence_score: 0.82,
      created_at: new Date(Date.now() - 75 * 60000).toISOString()
    },
    {
      id: 104,
      latitude: 21.1458,
      longitude: 79.0882,
      location_name: "Sitabuldi Main Road",
      severity: "low",
      description: "Puddles near bus stop, vehicles slowing down.",
      photo_url: null,
      status: "verified",
      confidence_score: 0.65,
      created_at: new Date(Date.now() - 110 * 60000).toISOString()
    }
  ];
}

export async function fetchPredictions() {
  try {
    const res = await fetch(`${API_BASE_URL}/predictions/`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend API offline, using demo predictions");
  }
  return MOCK_LOCATIONS.map((loc) => {
    let risk_level = loc.current_severity;
    let score = loc.current_water_level / 50.0;
    return {
      id: loc.id,
      location_id: loc.id,
      location_name: loc.name,
      risk_level: risk_level,
      risk_score: Math.min(Number(score.toFixed(2)), 0.98),
      probability: Math.min(Number(score.toFixed(2)), 0.98),
      predicted_water_level: loc.current_water_level * 1.25,
      rainfall_current_mm: 32.5,
      rainfall_cumulative_mm: 97.5,
      rainfall_intensity: "heavy",
      contributing_factors: JSON.stringify([
        `Heavy rainfall (32.5 mm)`,
        `Drainage capacity: ${loc.drainage_capacity}`,
        `Historical occurrences: ${loc.historical_frequency} incidents`,
        loc.vulnerability_reason
      ]),
      model_version: "rule-based-v1 (DEMO ENGINE)",
      is_demo: true,
      prediction_for: new Date(Date.now() + 60 * 60000).toISOString(),
      created_at: new Date().toISOString()
    };
  });
}

export async function analyzeRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
  try {
    const res = await fetch(`${API_BASE_URL}/routes/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
      }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend API offline, using client route analysis");
  }

  // Client-side fallback computation
  return {
    routes: [
      {
        route_index: 0,
        summary: "Route A (Via Subhash Nagar / Ambazari)",
        distance_km: 8.2,
        duration_min: 27,
        affected_segments: 2,
        max_severity: "severe",
        risk_score: 0.85,
        recommendation: "High Risk — Avoid if possible",
        segments: [
          { location_name: "Ambazari Lake Road", severity: "moderate", water_level: 22.5, distance_m: 120 },
          { location_name: "Pardi Naka Underpass", severity: "severe", water_level: 45.0, distance_m: 250 }
        ]
      },
      {
        route_index: 1,
        summary: "Route B (Via Ring Road / Wardha Road)",
        distance_km: 9.4,
        duration_min: 31,
        affected_segments: 1,
        max_severity: "low",
        risk_score: 0.22,
        recommendation: "Recommended Safe Route",
        segments: [
          { location_name: "Sitabuldi Main Road", severity: "low", water_level: 8.0, distance_m: 420 }
        ]
      }
    ],
    recommended_route: 1,
    recommendation_reason: "Route B is recommended despite being 1.2 km longer, as it bypasses the severe waterlogging (45cm) at Pardi Naka Underpass and moderate flooding at Ambazari Lake Road.",
    is_demo: true
  };
}

export async function submitCitizenReport(reportData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend offline, returning mock confirmation");
  }
  return {
    id: Math.floor(Math.random() * 9000) + 1000,
    ...reportData,
    status: "pending",
    created_at: new Date().toISOString()
  };
}

export async function verifyReport(reportId: number, status: string, reason?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/${reportId}/verify`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejection_reason: reason }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend offline, updating local mock state");
  }
  return { id: reportId, status, verified_at: new Date().toISOString() };
}

export async function loginUser(credentials: { username: string; password: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("nww_token", data.access_token);
        localStorage.setItem("nww_user", JSON.stringify(data.user));
      }
      return { success: true, data };
    }
    const err = await res.json().catch(() => ({ detail: "Invalid credentials" }));
    return { success: false, error: err.detail || "Login failed" };
  } catch (e: any) {
    // Client fallback demo login
    const role = credentials.username.includes("admin")
      ? "admin"
      : credentials.username.includes("authority")
      ? "authority"
      : "citizen";
    const fallbackUser = {
      id: 1,
      username: credentials.username,
      email: `${credentials.username}@nagpurwaterwatch.in`,
      role,
      full_name: credentials.username.toUpperCase(),
      phone: "+91 98765 43210"
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("nww_token", "demo-token-12345");
      localStorage.setItem("nww_user", JSON.stringify(fallbackUser));
    }
    return { success: true, data: { access_token: "demo-token-12345", user: fallbackUser } };
  }
}

export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("nww_token", data.access_token);
        localStorage.setItem("nww_user", JSON.stringify(data.user));
      }
      return { success: true, data };
    }
    const err = await res.json().catch(() => ({ detail: "Registration failed" }));
    return { success: false, error: err.detail || "Registration failed" };
  } catch (e: any) {
    const fallbackUser = {
      id: 99,
      username: userData.username,
      email: userData.email,
      role: "citizen",
      full_name: userData.full_name || userData.username,
      phone: userData.phone || ""
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("nww_token", "demo-token-reg");
      localStorage.setItem("nww_user", JSON.stringify(fallbackUser));
    }
    return { success: true, data: { access_token: "demo-token-reg", user: fallbackUser } };
  }
}
