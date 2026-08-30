import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadSave, persistSave, dailyBonus } from "@/game/save";
import { generateDailyContracts, payoutMultiplier, todayKey, tryHaggle } from "@/game/contracts";
import { mountGame, type GameHandle } from "@/game/engine";
import type { BountyContract, NightResult, SaveState } from "@/game/types";
import "@/game/hud.css";

export const Route = createFileRoute("/")({ component: Home });

type Screen = "boot" | "name" | "camp" | "negotiate" | "night" | "debrief";

function Home() {
  const [save, setSave] = useState<SaveState | null>(null);
  const [screen, setScreen] = useState<Screen>("boot");
  const [draftName, setDraftName] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [ask, setAsk] = useState(0);
  const [haggleMsg, setHaggleMsg] = useState("");
  const [debrief, setDebrief] = useState<NightResult | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameHandle | null>(null);

  useEffect(() => {
    const s = loadSave();
    setSave(s);
    setDraftName(s.callsign);
    setScreen(s.callsign ? "camp" : "name");
  }, []);

  const commit = useCallback((next: SaveState) => {
    persistSave(next);
    setSave(next);
  }, []);

  const focused = save?.daily.contracts.find((c) => c.id === focusId) ?? null;
  const accepted = save?.daily.contracts.filter((c) => c.status === "accepted" || c.status === "cleared") ?? [];
  const openCount = save?.daily.contracts.filter((c) => c.status === "open" || c.status === "negotiating").length ?? 0;
  const clearedCount = save?.daily.contracts.filter((c) => c.status === "cleared").length ?? 0;
  const mult = payoutMultiplier(save?.bountiesClaimed ?? 0);

  function setCallsign() {
    if (!save) return;
    const name = draftName.trim().slice(0, 18);
    if (name.length < 2) return;
    commit({ ...save, callsign: name });
    setScreen("camp");
  }

  function openNegotiate(c: BountyContract) {
    if (c.status === "cleared" || c.status === "accepted") return;
    setFocusId(c.id);
    setAsk(c.offered);
    setHaggleMsg("");
    setScreen("negotiate");
  }

  function applyContract(id: string, patch: Partial<BountyContract>) {
    if (!save) return;
    commit({
      ...save,
      daily: {
        ...save.daily,
        contracts: save.daily.contracts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      },
    });
  }

  function acceptAt(price: number) {
    if (!focused) return;
    applyContract(focused.id, { status: "accepted", agreed: price });
    setScreen("camp");
  }

  function haggle() {
    if (!focused || !save) return;
    const res = tryHaggle({ ...focused, haggleAttempts: focused.haggleAttempts }, ask);
    setHaggleMsg(res.message);
    applyContract(focused.id, {
      haggleAttempts: focused.haggleAttempts + 1,
      offered: res.ok ? res.price : focused.offered,
      maxAsk: res.ok ? focused.maxAsk : Math.round(focused.maxAsk * 0.96),
    });
    if (res.ok) setAsk(res.price);
  }

  function rollOut() {
    if (!save) return;
    const jobs = save.daily.contracts.filter((c) => c.status === "accepted");
    if (!jobs.length) return;
    setScreen("night");
  }

  useEffect(() => {
    if (screen !== "night" || !save || !canvasRef.current) return;
    const jobs = save.daily.contracts.filter((c) => c.status === "accepted");
    const handle = mountGame(canvasRef.current, {
      callsign: save.callsign,
      contracts: jobs,
      onExtract: (r) => {
        setDebrief(r);
        setScreen("debrief");
      },
      onCaught: (r) => {
        setDebrief(r);
        setScreen("debrief");
      },
    });
    gameRef.current = handle;
    if (hudRef.current) handle.setHudHost(hudRef.current);
    return () => {
      handle.destroy();
      gameRef.current = null;
    };
  }, [screen, save]);

  function settleNight() {
    if (!save || !debrief) return;
    let next: SaveState = { ...save, cash: save.cash + (debrief.extracted ? debrief.cashEarned : Math.floor(debrief.cashEarned * 0.35)) };
    const killSet = new Set(debrief.kills);
    next.daily = {
      ...next.daily,
      contracts: next.daily.contracts.map((c) => {
        if (killSet.has(c.id)) return { ...c, status: "cleared" };
        if (c.status === "accepted" && debrief.caught) return { ...c, status: "open", agreed: null };
        return c;
      }),
    };
    const newly = next.daily.contracts.filter((c) => c.status === "cleared").length - save.daily.contracts.filter((c) => c.status === "cleared").length;
    next.bountiesClaimed += Math.max(0, newly);
    next.reputation = next.bountiesClaimed;
    const allClear = next.daily.contracts.every((c) => c.status === "cleared");
    if (allClear && !next.daily.allClearBonusPaid && debrief.extracted) {
      next.cash += dailyBonus(next.bountiesClaimed);
      next.daily = { ...next.daily, allClearBonusPaid: true };
    }
    commit(next);
    setDebrief(null);
    setScreen("camp");
  }

  function sleepNextDay() {
    if (!save) return;
    const offset = save.dayOffset + 1;
    const key = todayKey(offset);
    commit({
      ...save,
      dayOffset: offset,
      lastDateKey: key,
      daily: {
        dateKey: key,
        contracts: generateDailyContracts(key, save.bountiesClaimed),
        allClearBonusPaid: false,
      },
    });
  }

  const bonus = useMemo(() => dailyBonus(save?.bountiesClaimed ?? 0), [save?.bountiesClaimed]);

  if (!save) {
    return (
      <main className="mx-auto flex h-dvh max-w-lg flex-col justify-center gap-6 bg-bg px-6 text-fg">
        <p className="font-mono text-[11px] tracking-[0.28em] text-muted">FALL CAMP — ENLIST</p>
        <h1 className="font-display text-6xl leading-none tracking-wide">LEDGER</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          The city fell. Camps still pay for names. Take a callsign — it rides over your head so the camp knows who brought the bounty in.
        </p>
      </main>
    );
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-bg text-fg">
      {screen === "name" && (
        <section className="mx-auto flex h-full max-w-lg flex-col justify-center gap-6 px-6">
          <p className="font-mono text-[11px] tracking-[0.28em] text-muted">FALL CAMP — ENLIST</p>
          <h1 className="font-display text-6xl leading-none tracking-wide text-fg">LEDGER</h1>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            The city fell. Camps still pay for names. Take a callsign — it rides over your head so the camp knows who brought the bounty in.
          </p>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] tracking-[0.18em] text-muted">CALLSIGN</span>
            <input
              autoFocus
              value={draftName}
              maxLength={18}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setCallsign()}
              placeholder="DEACON, RYN, ASH…"
              className="h-12 rounded-md border border-border bg-elevated px-4 font-display text-2xl tracking-widest text-fg outline-none focus:border-rust"
            />
          </label>
          <button
            type="button"
            onClick={setCallsign}
            className="h-12 rounded-md bg-fg px-6 font-display text-xl tracking-[0.2em] text-ink"
          >
            TAKE THE BOARD
          </button>
        </section>
      )}

      {screen === "camp" && (
        <section className="flex h-full flex-col overflow-auto">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.28em] text-muted">CAMP BOARD · {save.daily.dateKey}</p>
              <h1 className="font-display text-5xl leading-none text-fg">{save.callsign}</h1>
            </div>
            <div className="flex gap-6 font-mono text-sm">
              <Stat label="STASH" value={"$" + save.cash.toLocaleString()} />
              <Stat label="CLAIMED" value={String(save.bountiesClaimed)} />
              <Stat label="PAY RATE" value={mult.toFixed(2) + "×"} />
            </div>
          </header>
          <p className="px-5 pt-4 text-sm leading-relaxed text-muted">
            Daily paper from the fixer. More names you close, the richer the next sheet. Haggle if you have the reputation. Clear all three for a camp bonus of ${bonus.toLocaleString()}.
          </p>
          <div className="grid gap-3 p-5 md:grid-cols-3">
            {save.daily.contracts.map((c) => (
              <article
                key={c.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-elevated p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.16em] text-muted">{c.district} · {c.difficulty.toUpperCase()}</p>
                    <h2 className="font-display text-3xl leading-none text-paper">{c.alias}</h2>
                    <p className="mt-1 text-sm text-fg">{c.name}</p>
                  </div>
                  <span className="font-mono text-[10px] tracking-widest text-rust-bright">{c.status.toUpperCase()}</span>
                </div>
                <p className="text-sm leading-relaxed text-muted">{c.brief}</p>
                <p className="font-display text-2xl text-olive">
                  ${(c.agreed ?? c.offered).toLocaleString()}
                </p>
                {c.status === "open" || c.status === "negotiating" ? (
                  <button
                    type="button"
                    onClick={() => openNegotiate(c)}
                    className="h-11 rounded-sm bg-fg font-display text-lg tracking-[0.16em] text-ink"
                  >
                    NEGOTIATE
                  </button>
                ) : (
                  <p className="font-mono text-xs text-muted">
                    {c.status === "accepted" ? "Pinned to tonight's ride." : "Paid. Name is off the board."}
                  </p>
                )}
              </article>
            ))}
          </div>
          <footer className="mt-auto flex flex-wrap gap-3 border-t border-border px-5 py-4">
            <button
              type="button"
              disabled={!accepted.filter((c) => c.status === "accepted").length}
              onClick={rollOut}
              className="h-12 min-w-40 rounded-md bg-rust px-6 font-display text-xl tracking-[0.18em] text-fg disabled:opacity-40"
            >
              RIDE OUT
            </button>
            <button
              type="button"
              onClick={sleepNextDay}
              className="h-12 rounded-md border border-border px-5 font-display text-lg tracking-[0.14em] text-muted"
            >
              SLEEP TILL DAWN
            </button>
            <p className="self-center font-mono text-xs text-subtle">
              {openCount} open · {clearedCount}/3 cleared · WASD move · E act
            </p>
          </footer>
        </section>
      )}

      {screen === "negotiate" && focused && (
        <section className="mx-auto flex h-full max-w-lg flex-col justify-center gap-5 px-6">
          <p className="font-mono text-[10px] tracking-[0.24em] text-muted">FIXER TABLE · {focused.district}</p>
          <h2 className="font-display text-5xl leading-none text-paper">{focused.alias}</h2>
          <p className="text-sm leading-relaxed text-muted">{focused.brief}</p>
          <p className="font-mono text-xs text-muted">
            Posted ${focused.offered.toLocaleString()} · they will not go below ${focused.minAccept.toLocaleString()} · reputation ceiling ${focused.maxAsk.toLocaleString()}
          </p>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] tracking-[0.16em] text-muted">YOUR ASK ${ask.toLocaleString()}</span>
            <input
              type="range"
              min={focused.minAccept}
              max={Math.round(focused.maxAsk * 1.35)}
              value={ask}
              onChange={(e) => setAsk(Number(e.target.value))}
              className="w-full accent-rust"
            />
          </label>
          {haggleMsg && <p className="text-sm text-paper">{haggleMsg}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={haggle} className="h-12 rounded-md border border-border px-5 font-display text-lg tracking-widest text-fg">
              HAGGLE
            </button>
            <button type="button" onClick={() => acceptAt(ask <= focused.maxAsk ? ask : focused.offered)} className="h-12 rounded-md bg-fg px-5 font-display text-lg tracking-widest text-ink">
              TAKE THE JOB
            </button>
            <button type="button" onClick={() => setScreen("camp")} className="h-12 px-3 font-mono text-xs tracking-widest text-muted">
              BACK
            </button>
          </div>
        </section>
      )}

      {screen === "night" && (
        <div className="absolute inset-0">
          <div ref={canvasRef} className="absolute inset-0" />
          <div className="vignette" />
          <div className="scanlines" />
          <div ref={hudRef} className="ledger-hud">
            <div className="name-chip" id="callsignChip">
              {save.callsign}
            </div>
            <div className="stamp-panel">
              <div className="stamp-label">BOUNTY ON YOUR HEAD</div>
              <div className="stamp-value" id="bountyValue">
                $0
              </div>
              <div className="decay-note" id="decayNote" />
            </div>
            <div className="contract-panel">
              <div className="cp-label">TONIGHT</div>
              <div id="contractRows" />
            </div>
            <div className="cash-panel">
              <div className="stamp-label">EARNED</div>
              <div className="cash-value" id="cashValue">
                $0
              </div>
              <div className="speedo" id="speedoText" />
            </div>
            <div className="heat-badge">
              <span id="heatText" className="heat-clear">
                CLEAR
              </span>
            </div>
            <div className="objective">
              <div className="obj-eyebrow">OBJECTIVE</div>
              <div className="obj-text" id="objectiveText">
                Close the contracts. Extract at camp.
              </div>
            </div>
            <div id="weaponBar">
              {["KNIFE", "PISTOL", "SMG", "SNIPER"].map((n, i) => (
                <button key={n} type="button" className={"wbtn" + (i === 0 ? " active" : "")} data-weapon={i}>
                  <span className="wname">{n}</span>
                </button>
              ))}
            </div>
            <button type="button" id="actionBtn">
              ELIMINATE
            </button>
            <div id="joyBase">
              <div id="joyKnob" />
            </div>
          </div>
        </div>
      )}

      {screen === "debrief" && debrief && (
        <section className="mx-auto flex h-full max-w-lg flex-col justify-center gap-5 px-6 text-center">
          <p className="font-mono text-[10px] tracking-[0.28em] text-muted">{debrief.caught ? "TAKEN" : "NIGHT CLOSED"}</p>
          <h2 className="font-display text-6xl leading-none text-rust-bright">{debrief.caught ? "CAUGHT" : "EXTRACTED"}</h2>
          <p className="text-sm text-muted">
            {debrief.caught
              ? "They took a cut. What you carried still counts, but the open names go back on the board."
              : "Camp takes the paper. Stash grows. Tomorrow the sheet pays more."}
          </p>
          <p className="font-display text-3xl text-olive">${debrief.cashEarned.toLocaleString()} earned</p>
          <p className="font-mono text-xs text-muted">{debrief.kills.length} names closed · heat ${Math.round(debrief.bountyHeat).toLocaleString()}</p>
          <button type="button" onClick={settleNight} className="h-12 rounded-md bg-fg font-display text-xl tracking-[0.2em] text-ink">
            RETURN TO CAMP
          </button>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] tracking-[0.18em] text-muted">{label}</div>
      <div className="font-display text-2xl leading-none text-fg">{value}</div>
    </div>
  );
}
