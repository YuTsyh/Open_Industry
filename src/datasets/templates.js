export const companyTemplate = {
  name: "",
  ticker: "",
  market: "TW",
  roles: [],
  exposure: 0,
  technicalLevel: "Mid-range",
  confidence: "medium",
  summary: "",
  customers: [],
  suppliers: [],
  competitors: [],
  alternatives: [],
  moat: "",
  sources: [],
  industryExposures: {},
  roleDetails: [],
  capabilityLadder: [],
  swot: {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  },
  liveFeeds: {
    price: { status: "planned", cadence: "", sourceKeys: [] },
    priceSnapshot: {
      status: "source-ready",
      last: null,
      currency: "",
      asOf: "",
      provider: "",
      sourceKeys: []
    },
    filings: { status: "planned", cadence: "", sourceKeys: [] },
    news: { status: "planned", cadence: "", sourceKeys: [] },
    options: { status: "not-applicable", cadence: "", sourceKeys: [] }
  }
};

export const industryTemplate = {
  id: "",
  name: "",
  en: "",
  count: 0,
  hero: "",
  summary: "",
  companyIds: [],
  snapshot: {
    drivers: [],
    bottlenecks: [],
    spillover: "",
    confidence: "medium"
  },
  topology: {
    lanes: []
  }
};

export const technologyTemplate = {
  name: "",
  difficulty: "Intermediate",
  maturity: "",
  maturityScore: 50,
  relatedIndustries: [],
  summary: "",
  technicalNotes: "",
  process: [],
  advantages: [],
  limits: [],
  bottlenecks: [],
  roles: []
};
