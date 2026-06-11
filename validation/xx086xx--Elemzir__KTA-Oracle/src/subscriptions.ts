import { verifyPayment } from "./keeta.js";
import type { Env } from "./types.js";

export const TIER_REGISTRATION    = 0.1;
export const TIER_STARTER         = 10;
export const TIER_SOCIAL          = 50;
export const TIER_PRO             = 300;
export const TIER_BUSINESS        = 600;
export const TIER_FREE_VALIDITY_MS    = 5  * 24 * 60 * 60 * 1000;
export const TIER_STARTER_VALIDITY_MS = 30 * 24 * 60 * 60 * 1000;
export const TIER_VALIDITY_MS         = 30 * 24 * 60 * 60 * 1000;
export const FREE_CALLS_PER_DAY   = 20;
export const STARTER_CALLS_TOTAL  = 60;
export const PAID_CALLS_PER_MONTH = 150;
export const PRO_CALLS_PER_MONTH  = 300;


export type SubTier = "unregistered" | "free" | "starter" | "social" | "pro" | "business";

export interface SubRecord {
  tier:           SubTier;
  amount:         number;
  activatedAt:    number;
  expiresAt:      number;
  socialLifetime: boolean;
}

export interface ActivateResult {
  success:        boolean;
  tier:           SubTier;
  amount:         number;
  socialLifetime: boolean;
  expiresAt:      string | null;
  message:        string;
}


function resolveFullTier(amount: number): SubTier {
  if (amount >= TIER_BUSINESS)     return "business";
  if (amount >= TIER_PRO)          return "pro";
  if (amount >= TIER_SOCIAL)       return "social";
  if (amount >= TIER_STARTER)      return "starter";
  if (amount >= TIER_REGISTRATION) return "free";
  return "unregistered";
}

export async function loadSubscription(env: Env, wallet: string): Promise<SubRecord | null> {
  try {
    const raw = await env.KV.get(`oracle:sub:${wallet}`, "json") as SubRecord | null;
    if (!raw) return null;
    if (raw.expiresAt < Date.now()) return null;
    return raw;
  } catch {
    return null;
  }
}

export async function checkAndIncrQuota(
  env: Env,
  wallet: string,
  tier: SubTier,
): Promise<{ allowed: boolean; remaining: number | "unlimited"; reset?: string }> {
  if (tier === "business" || tier === "free" || tier === "unregistered")
    return { allowed: true, remaining: "unlimited" };

  if (tier === "starter") {
    const key   = `quota:starter:total:${wallet}`;
    const raw   = await env.KV.get(key);
    const count = raw ? parseInt(raw) : 0;
    if (count >= STARTER_CALLS_TOTAL)
      return { allowed: false, remaining: 0, reset: "subscription renewal" };
    await env.KV.put(key, String(count + 1), { expirationTtl: Math.round(TIER_STARTER_VALIDITY_MS / 1000) + 86400 });
    return { allowed: true, remaining: STARTER_CALLS_TOTAL - count - 1 };
  }

  const ym    = new Date().toISOString().slice(0, 7).replace("-", "");
  const limit = tier === "pro" ? PRO_CALLS_PER_MONTH : PAID_CALLS_PER_MONTH;
  const key   = `quota:${tier}:monthly:${wallet}:${ym}`;
  const raw   = await env.KV.get(key);
  const count = raw ? parseInt(raw) : 0;
  if (count >= limit)
    return { allowed: false, remaining: 0, reset: "next calendar month" };
  await env.KV.put(key, String(count + 1), { expirationTtl: 35 * 86400 });
  return { allowed: true, remaining: limit - count - 1 };
}

export async function activateWallet(env: Env, wallet: string): Promise<ActivateResult> {
  if (!wallet.startsWith("keeta_") || wallet.length < 20 || !/^keeta_[a-z0-9]+$/.test(wallet)) {
    return { success: false, tier: "unregistered", amount: 0, socialLifetime: false, expiresAt: null, message: "Invalid wallet address." };
  }

  const scan = await verifyPayment(env, wallet, 0);
  if (scan.error)
    return { success: false, tier: "unregistered", amount: 0, socialLifetime: false, expiresAt: null, message: `Chain scan failed: ${scan.error}` };
  const total = scan.amount;

  if (total < TIER_REGISTRATION) {
    return {
      success: false,
      tier: "unregistered",
      amount: total,
      socialLifetime: false,
      expiresAt: null,
      message: `No qualifying payment found (${total.toFixed(6)} KTA sent from this wallet to the oracle). Ensure you are entering the exact wallet address you sent KTA from.`,
    };
  }

  const TIER_RANK: Record<SubTier, number> = {
    unregistered: 0, free: 1, starter: 2, social: 3, pro: 4, business: 5,
  };
  const chainTier      = resolveFullTier(total);
  const existing       = await loadSubscription(env, wallet).catch(() => null);
  const tier: SubTier  = (existing && TIER_RANK[existing.tier] > TIER_RANK[chainTier]) ? existing.tier : chainTier;
  const socialLifetime = tier === "social" || tier === "pro" || tier === "business" || (existing?.socialLifetime ?? false);

  let validityMs: number;
  if (tier === "free")         validityMs = TIER_FREE_VALIDITY_MS;
  else if (tier === "starter") validityMs = TIER_STARTER_VALIDITY_MS;
  else                         validityMs = TIER_VALIDITY_MS;

  const expiresAt = Date.now() + validityMs;
  const record: SubRecord = { tier, amount: total, activatedAt: Date.now(), expiresAt, socialLifetime };
  const ttlSeconds = Math.round(validityMs / 1000);
  await env.KV.put(`oracle:sub:${wallet}`, JSON.stringify(record), { expirationTtl: ttlSeconds });

  const tierLabels: Record<SubTier, string> = {
    unregistered: "Unregistered",
    free:         `Free — ${FREE_CALLS_PER_DAY} calls/day, 5 days`,
    starter:      `Starter — ${STARTER_CALLS_TOTAL} calls / 30 days`,
    social:       `Social — ${PAID_CALLS_PER_MONTH} calls/month, 30 days + lifetime social alerts`,
    pro:          `Pro — ${PRO_CALLS_PER_MONTH} calls/month, 30 days + compliance tools`,
    business:     "Business — unlimited calls + all 19 tools, 30 days",
  };

  return {
    success: true,
    tier,
    amount: total,
    socialLifetime,
    expiresAt: new Date(expiresAt).toISOString(),
    message: `${tierLabels[tier]} activated.${socialLifetime ? " Social Agent lifetime included." : ""}`,
  };
}
