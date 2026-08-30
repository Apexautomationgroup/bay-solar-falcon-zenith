import type { BountyContract } from "./types";

const ROSTER = [
  { name: "Mara Kline", alias: "THE ACCOUNTANT", brief: "Cooks books for the scrap barons. Walks the east lots after dusk.", district: "East Lots", difficulty: "low" as const, base: 420, heat: 220, x: 0, z: 22, r: 9 },
  { name: "Joss Hale", alias: "THE COURIER", brief: "Runs sealed crates between camps. Never looks back.", district: "River Cut", difficulty: "mid" as const, base: 560, heat: 340, x: 47, z: -12, r: 10 },
  { name: "Ivy Renn", alias: "THE FIXER", brief: "Sells names. Yours is already on a list.", district: "North Stacks", difficulty: "mid" as const, base: 610, heat: 380, x: -40, z: 47, r: 10 },
  { name: "Cal Voss", alias: "FUEL THIEF", brief: "Siphons the last diesel from wrecks on the ring road.", district: "Ring Road", difficulty: "low" as const, base: 390, heat: 200, x: -48, z: -18, r: 9 },
  { name: "Nera Quinn", alias: "RADIO GHOST", brief: "Jams camp frequencies. People go missing when she talks.", district: "Relay Hill", difficulty: "high" as const, base: 780, heat: 520, x: 38, z: 42, r: 11 },
  { name: "Boomer Tate", alias: "SCRAP BARON", brief: "Owns the wrecker crews. Loud, proud, well-armed friends.", district: "Yard 9", difficulty: "high" as const, base: 840, heat: 560, x: -22, z: -48, r: 11 },
  { name: "Lena Orth", alias: "TOLL KEEPER", brief: "Shakes down riders at the south choke. Takes more than coin.", district: "South Choke", difficulty: "mid" as const, base: 540, heat: 310, x: 18, z: -38, r: 9 },
  { name: "Rook Senn", alias: "NIGHT HOWLER", brief: "Leads a pack through the alleys. Don't let him see you first.", district: "Alley Grid", difficulty: "high" as const, base: 720, heat: 480, x: -8, z: 8, r: 10 },
  { name: "Pax Dreel", alias: "CAMP RAT", brief: "Steals from the kitchen stores. The camp wants him quiet.", district: "Market Row", difficulty: "low" as const, base: 360, heat: 180, x: 28, z: 18, r: 8 },
  { name: "Sable Orr", alias: "THE WIDOW", brief: "Collects debts the old way. Always two steps ahead.", district: "Old Chapel", difficulty: "mid" as const, base: 640, heat: 400, x: -32, z: 22, r: 10 },
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashDate(dateKey: string) {
  let h = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function todayKey(dayOffset: number) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

export function payoutMultiplier(bountiesClaimed: number) {
  return 1 + Math.min(2.4, bountiesClaimed * 0.14);
}

export function generateDailyContracts(dateKey: string, bountiesClaimed: number): BountyContract[] {
  const rng = mulberry32(hashDate(dateKey) ^ 0x9e3779b9);
  const pool = [...ROSTER];
  const picked: typeof ROSTER = [];
  while (picked.length < 3 && pool.length) {
    const i = Math.floor(rng() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  const mult = payoutMultiplier(bountiesClaimed);
  const repBonus = Math.min(12, bountiesClaimed);
  return picked.map((p, idx) => {
    const offered = Math.round(p.base * mult);
    const maxAsk = Math.round(offered * (1.1 + 0.035 * repBonus));
    const minAccept = Math.round(offered * 0.78);
    return {
      id: `${dateKey}-${idx}-${p.alias.replace(/\s+/g, "-")}`,
      name: p.name,
      alias: p.alias,
      brief: p.brief,
      district: p.district,
      difficulty: p.difficulty,
      basePayout: p.base,
      offered,
      agreed: null,
      maxAsk,
      minAccept,
      bountyHeat: Math.round(p.heat * (0.9 + 0.08 * repBonus)),
      center: { x: p.x, z: p.z },
      radius: p.r,
      status: "open",
      haggleAttempts: 0,
    };
  });
}

export function tryHaggle(c: BountyContract, ask: number): { ok: boolean; price: number; message: string } {
  const clamped = Math.round(Math.max(c.minAccept, ask));
  if (clamped <= c.maxAsk) {
    return { ok: true, price: clamped, message: "They spit in their palm. Deal." };
  }
  if (clamped > c.maxAsk * 1.28 || c.haggleAttempts >= 2) {
    return { ok: false, price: c.offered, message: "They walk. Take the posted rate or leave it." };
  }
  const counter = Math.round(c.maxAsk * 0.94);
  return { ok: true, price: counter, message: `They laugh it off. Counter: $${counter.toLocaleString()}.` };
}
