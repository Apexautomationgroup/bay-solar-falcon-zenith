export type ContractStatus = "open" | "negotiating" | "accepted" | "cleared" | "expired";

export type BountyContract = {
  id: string;
  name: string;
  alias: string;
  brief: string;
  district: string;
  difficulty: "low" | "mid" | "high";
  basePayout: number;
  offered: number;
  agreed: number | null;
  maxAsk: number;
  minAccept: number;
  bountyHeat: number;
  center: { x: number; z: number };
  radius: number;
  status: ContractStatus;
  haggleAttempts: number;
};

export type SaveState = {
  version: number;
  callsign: string;
  cash: number;
  reputation: number;
  bountiesClaimed: number;
  dayOffset: number;
  lastDateKey: string;
  daily: {
    dateKey: string;
    contracts: BountyContract[];
    allClearBonusPaid: boolean;
  };
};

export type NightResult = {
  cashEarned: number;
  bountyHeat: number;
  kills: string[];
  extracted: boolean;
  caught: boolean;
};

export type GameMountOptions = {
  callsign: string;
  contracts: BountyContract[];
  onExtract: (result: NightResult) => void;
  onCaught: (result: NightResult) => void;
};
