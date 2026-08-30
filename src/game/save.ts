import type { SaveState } from "./types";
import { generateDailyContracts, todayKey } from "./contracts";

const KEY = "ledger.save.v1";
const SAVE_VERSION = 1;

const defaults = (): SaveState => {
  const dateKey = todayKey(0);
  return {
    version: SAVE_VERSION,
    callsign: "",
    cash: 0,
    reputation: 0,
    bountiesClaimed: 0,
    dayOffset: 0,
    lastDateKey: dateKey,
    daily: {
      dateKey,
      contracts: generateDailyContracts(dateKey, 0),
      allClearBonusPaid: false,
    },
  };
};

function migrate(raw: SaveState): SaveState {
  const base = defaults();
  return {
    ...base,
    ...raw,
    version: SAVE_VERSION,
    daily: { ...base.daily, ...(raw.daily ?? {}) },
  };
}

export function loadSave(): SaveState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as SaveState;
    const save = migrate(parsed);
    const now = todayKey(save.dayOffset);
    if (save.daily.dateKey !== now) {
      save.daily = {
        dateKey: now,
        contracts: generateDailyContracts(now, save.bountiesClaimed),
        allClearBonusPaid: false,
      };
      save.lastDateKey = now;
    }
    return save;
  } catch {
    return defaults();
  }
}

export function persistSave(save: SaveState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* private mode */
  }
}

export function dailyBonus(claimed: number) {
  return Math.round(420 * (1 + 0.18 * claimed));
}
