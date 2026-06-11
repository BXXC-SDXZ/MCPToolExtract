import type { Env, WhaleAlert } from "./types.js";


export async function readPriceHistory(env: Env): Promise<{
  last:    number | null;
  last_ts: number | null;
  p1h:   number | null;
  ts1h:  number | null;
  p24h:  number | null;
  ts24h: number | null;
  p7d:   number | null;
  ts7d:  number | null;
  c1h:   number | null;
  c24h:  number | null;
  c7d:   number | null;
}> {
  const s = await env.KV.get<{
    price: number; ts: number;
    p1h: number | null; ts1h: number | null;
    p24h: number | null; ts24h: number | null;
    p7d: number | null; ts7d: number | null;
    c1h: number | null; c24h: number | null; c7d: number | null;
  }>("kta:price_state", "json");
  return {
    last: s?.price ?? null, last_ts: s?.ts ?? null,
    p1h: s?.p1h ?? null, ts1h: s?.ts1h ?? null,
    p24h: s?.p24h ?? null, ts24h: s?.ts24h ?? null,
    p7d: s?.p7d ?? null, ts7d: s?.ts7d ?? null,
    c1h: s?.c1h ?? null, c24h: s?.c24h ?? null, c7d: s?.c7d ?? null,
  };
}

export async function writePriceHistory(
  env: Env, price: number, now: number,
  prev: { p1h: number | null; ts1h: number | null; p24h: number | null; ts24h: number | null; p7d: number | null; ts7d: number | null },
  rolling: { c1h: number | null; c24h: number | null; c7d: number | null },
): Promise<void> {
  const upd1h  = !prev.ts1h  || now - prev.ts1h  >= 3_600_000;
  const upd24h = !prev.ts24h || now - prev.ts24h >= 24 * 3_600_000;
  const upd7d  = !prev.ts7d  || now - prev.ts7d  >= 7 * 24 * 3_600_000;
  await env.KV.put("kta:price_state", JSON.stringify({
    price, ts: now,
    p1h:  upd1h  ? price : prev.p1h,  ts1h:  upd1h  ? now : prev.ts1h,
    p24h: upd24h ? price : prev.p24h, ts24h: upd24h ? now : prev.ts24h,
    p7d:  upd7d  ? price : prev.p7d,  ts7d:  upd7d  ? now : prev.ts7d,
    c1h: rolling.c1h, c24h: rolling.c24h, c7d: rolling.c7d,
  }));
}

export function calcPriceChange(price: number, last: number | null): number {
  if (!last) return 0;
  return (price - last) / last;
}

export function classifyMove(priceChange: number): "minor" | "normal" | "notable" | "major" | "extreme" | null {
  const pct = Math.abs(priceChange) * 100;
  if (pct >= 25) return "extreme";
  if (pct >= 20) return "major";
  if (pct >= 15) return "notable";
  if (pct >= 10) return "normal";
  if (pct >= 5)  return "minor";
  return null;
}

export async function getWhaleAlerts(env: Env): Promise<WhaleAlert[]> {
  return (await env.KV.get<WhaleAlert[]>("kta:whale_alerts", "json")) ?? [];
}

export async function storeWhaleAlerts(env: Env, alerts: WhaleAlert[]): Promise<void> {
  await env.KV.put("kta:whale_alerts", JSON.stringify(alerts.slice(0, 10)));
}

export async function appendPricePoint(env: Env, ring: {p: number; t: number}[], price: number, ts: number): Promise<void> {
  const last = ring[ring.length - 1];
  if (last && ts - last.t < 10 * 60_000) return;
  ring.push({ p: price, t: ts });
  if (ring.length > 120) ring.splice(0, ring.length - 120);
  await env.KV.put("kta:price_ring", JSON.stringify(ring), { expirationTtl: 7 * 24 * 3600 });
}

export async function getPriceRing(env: Env): Promise<{p: number; t: number}[]> {
  return (await env.KV.get<{p: number; t: number}[]>("kta:price_ring", "json")) ?? [];
}

export async function appendHourlyPoint(env: Env, ring: {p: number; t: number}[], price: number, ts: number): Promise<void> {
  const last = ring[ring.length - 1];
  if (last && ts - last.t < 45 * 60_000) return;
  ring.push({ p: price, t: ts });
  if (ring.length > 225) ring.splice(0, ring.length - 225);
  await env.KV.put("kta:price_ring_1h", JSON.stringify(ring), { expirationTtl: 10 * 24 * 3600 });
}

export function computeRollingChanges(
  minuteRing: {p: number; t: number}[],
  hourlyRing: {p: number; t: number}[],
  currentPrice: number,
  now: number,
): { c1h: number | null; c24h: number | null; c7d: number | null } {
  function findNearest(ring: {p: number; t: number}[], targetTs: number, toleranceMs: number) {
    let best: {p: number; t: number} | null = null;
    let bestDiff = Infinity;
    for (const pt of ring) {
      const diff = Math.abs(pt.t - targetTs);
      if (diff < bestDiff) { bestDiff = diff; best = pt; }
    }
    return best && bestDiff <= toleranceMs ? best : null;
  }

  const pt1h  = findNearest(minuteRing, now - 3_600_000,          10 * 60_000);
  const pt24h = findNearest(hourlyRing, now - 24 * 3_600_000,     2 * 3_600_000);
  const pt7d  = findNearest(hourlyRing, now - 7 * 24 * 3_600_000, 4 * 3_600_000);

  return {
    c1h:  pt1h  ? ((currentPrice - pt1h.p)  / pt1h.p)  * 100 : null,
    c24h: pt24h ? ((currentPrice - pt24h.p) / pt24h.p) * 100 : null,
    c7d:  pt7d  ? ((currentPrice - pt7d.p)  / pt7d.p)  * 100 : null,
  };
}
