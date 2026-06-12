import type { Env, PriceEvent, WhaleAlert } from "./types.js";
import { requireInternalAuth }              from "./auth.js";
import { renderHome }                       from "./ui.js";
import {
  fetchAnchorPrice, fetchMarketPrice, fetchMarketData, getFxQuote,
  sendPayment, verifyPayment,
  detectRecentWhales, getOracleAddress,
  getWalletHistory, getWalletScore, screenWallet,
  getNetworkHealth, getNetworkAnalytics,
  resolveIdentity, getKycInfo,
  getWalletCertificates, getWalletPermissions,
  executeBatch,
} from "./keeta.js";
import {
  readPriceHistory, writePriceHistory,
  calcPriceChange, classifyMove,
  getWhaleAlerts, storeWhaleAlerts,
  appendPricePoint, getPriceRing,
  appendHourlyPoint, computeRollingChanges,
} from "./store.js";
import {
  activateWallet, loadSubscription, checkAndIncrQuota,
  TIER_REGISTRATION, TIER_STARTER, TIER_SOCIAL, TIER_PRO, TIER_BUSINESS, FREE_CALLS_PER_DAY,
} from "./subscriptions.js";

async function getCachedMarketData(env: Env): Promise<{ price: number | null; c1h: number | null; c24h: number | null; c7d: number | null; volume24h: number | null; liquidityUsd: number | null; fresh: boolean }> {
  const cached = await env.KV.get<{ price: number; c1h: number | null; c24h: number | null; c7d: number | null; volume24h: number | null; liquidityUsd: number | null; ts: number }>("market:cache", "json");
  if (cached && Date.now() - cached.ts < 900_000) return { ...cached, fresh: false };
  const fetched = await fetchMarketData();
  if (fetched.price) {
    await env.KV.put("market:cache", JSON.stringify({ ...fetched, ts: Date.now() }), { expirationTtl: 1800 });
    return { ...fetched, fresh: true };
  }
  if (cached) return { ...cached, fresh: false };
  return { ...fetched, fresh: false };
}

async function getFxRate(env: Env, currency: string): Promise<number | null> {
  if (currency === "USD") return 1;
  const cached = await env.KV.get<Record<string, number>>("fx:rates", "json");
  if (cached) return cached[currency] ?? null;
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return null;
    const d = await r.json() as { rates?: Record<string, number> };
    if (!d.rates) return null;
    await env.KV.put("fx:rates", JSON.stringify(d.rates), { expirationTtl: 3600 });
    return d.rates[currency] ?? null;
  } catch { return null; }
}

async function emitToSocial(env: Env, event: Record<string, unknown>): Promise<void> {
  const body    = JSON.stringify(event);
  const headers = { "X-Internal-Secret": env.INTERNAL_SECRET, "Content-Type": "application/json" };
  try {
    if (env.SOCIAL_SERVICE) {
      await env.SOCIAL_SERVICE.fetch(new Request("https://kta-social/ingest", { method: "POST", headers, body }));
      return;
    }
    if (!env.KTA_SOCIAL_URL) return;
    await fetch(`${env.KTA_SOCIAL_URL}/ingest`, { method: "POST", headers, body, signal: AbortSignal.timeout(25000) });
  } catch {}
}

const CC_HTML  = "public, max-age=60, s-maxage=300";
const CC_PRICE = "public, max-age=30, s-maxage=30";
const CC_WHALE = "public, max-age=300, s-maxage=300";

const TOOL_RANK: Record<string, number> = {
  unregistered: 0, free: 1, starter: 2, social: 3, pro: 4, business: 5,
};
const TOOL_TIER_NAME = ["unregistered", "free", "starter", "social", "pro", "business"];

async function requireTier(env: Env, wallet: string, minRank: number): Promise<Response | null> {
  if (!wallet)
    return Response.json({ error: "wallet required", required: TOOL_TIER_NAME[minRank] }, { status: 401 });
  const sub  = await loadSubscription(env, wallet).catch(() => null);
  const rank = sub ? (TOOL_RANK[sub.tier] ?? 0) : 0;
  if (rank < minRank)
    return Response.json({ error: `Requires ${TOOL_TIER_NAME[minRank]} tier`, required: TOOL_TIER_NAME[minRank], current: sub?.tier ?? "unregistered" }, { status: 403 });
  if (sub) {
    const quota = await checkAndIncrQuota(env, wallet, sub.tier);
    if (!quota.allowed)
      return Response.json({ error: "API quota exceeded", tier: sub.tier, remaining: 0, reset: quota.reset ?? null, upgrade: "https://kta-oracle.top/checkout" }, { status: 429 });
  }
  return null;
}

const BOT_PATHS = new Set([
  "/.env","/.env.local","/.env.production","/.env.development","/.env.backup","/.env.example",
  "/wp-admin","/wp-login.php","/wp-config.php","/wp-config.php.bak","/xmlrpc.php",
  "/phpinfo.php","/phpmyadmin","/config.php","/configuration.php",
  "/.git","/.git/HEAD","/.git/config","/.gitignore",
  "/admin","/administrator","/panel","/cpanel",
  "/actuator","/actuator/env","/actuator/health","/actuator/logfile","/actuator/mappings",
  "/.htaccess","/.htpasswd",
  "/shell.php","/eval.php","/cmd.php","/info.php","/test.php","/upload.php","/backdoor.php",
  "/config.json","/package.json","/package-lock.json","/composer.json","/Dockerfile",
  "/etc/passwd","/etc/shadow","/proc/self/environ",
  "/server-status","/server-info",
]);
const BLOCKED_METHODS = new Set(["PUT","PATCH","DELETE","TRACE","CONNECT","PURGE","PROPFIND","MOVE"]);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
    const { pathname, searchParams } = new URL(request.url);
    const method = request.method;

    if (BLOCKED_METHODS.has(method)) return new Response(null, { status: 405 });
    if (BOT_PATHS.has(pathname) || pathname.includes("..") || pathname.startsWith("/."))
      return new Response(null, { status: 403 });
    if (pathname === "/robots.txt")
      return new Response("User-agent: *\nAllow: /\nDisallow: /\n", { headers: { "Content-Type": "text/plain" } });
    if (/\.[a-zA-Z0-9]{1,6}$/.test(pathname))
      return new Response(null, { status: 404 });

    if (method === "GET" && pathname === "/")
      return new Response(renderHome(env.KTA_SOCIAL_URL ?? ""), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": CC_HTML } });

    if (method === "GET" && pathname === "/health")
      return Response.json({ status: "ok", service: "kta-oracle", ts: Date.now() });

    if (method === "GET" && pathname === "/wallet") {
      const wallet = await getOracleAddress(env.KEETA_SEED);
      return Response.json({ wallet, ts: Date.now() });
    }

    if (method === "GET" && pathname === "/price") {
      const now = Date.now();
      const history = await readPriceHistory(env);
      if (!history.last) return Response.json({ error: "Price unavailable" }, { status: 503 });
      return Response.json({ price: history.last, change_pct: history.c1h ?? null, change_24h: history.c24h ?? null, change_7d: history.c7d ?? null, ts: now }, { headers: { "Cache-Control": CC_PRICE } });
    }

    if (method === "GET" && pathname === "/rate") {
      const currency  = searchParams.get("currency")?.toUpperCase() ?? "USD";
      const history   = await readPriceHistory(env);
      if (!history.last) return Response.json({ error: "Rate unavailable" }, { status: 503 });
      const fxMul     = await getFxRate(env, currency);
      const converted = fxMul != null ? history.last * fxMul : history.last;
      return Response.json({ currency, rate: `1 KTA = ${converted.toFixed(6)} ${currency}`, price: converted, ts: Date.now() }, { headers: { "Cache-Control": CC_PRICE } });
    }

    if (method === "GET" && pathname === "/price/live") {
      const now = Date.now();
      const history = await readPriceHistory(env);
      if (!history.last) return Response.json({ error: "unavailable" }, { status: 503 });
      return Response.json({ price: history.last, change_pct: history.c1h ?? null, change_24h: history.c24h ?? null, change_7d: history.c7d ?? null, ts: now }, { headers: { "Cache-Control": CC_PRICE } });
    }

    if (method === "GET" && pathname === "/price/history") {
      const ring = await getPriceRing(env);
      return Response.json({ points: ring }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } });
    }

    if (method === "GET" && pathname === "/whale/alerts") {
      const wallet  = searchParams.get("wallet") ?? "";
      const tierErr = await requireTier(env, wallet, 2);
      if (tierErr) return tierErr;
      const alerts = await getWhaleAlerts(env);
      return Response.json({ alerts }, { headers: { "Cache-Control": CC_WHALE } });
    }

    if (method === "POST" && pathname === "/activate") {
      let body: Record<string, unknown>;
      try { body = await request.json() as Record<string, unknown>; }
      catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

      const wallet = typeof body.wallet === "string" ? body.wallet.trim() : "";
      if (!wallet) return Response.json({ error: "wallet required" }, { status: 400 });

      const result = await activateWallet(env, wallet);

      if (result.success) {
        const nb = JSON.stringify({ wallet, socialLifetime: result.socialLifetime, tier: result.tier, expiresAt: result.expiresAt ? new Date(result.expiresAt).getTime() : undefined });
        const nh = { "X-Internal-Secret": env.INTERNAL_SECRET, "Content-Type": "application/json" };
        if (env.SOCIAL_SERVICE) {
          ctx.waitUntil(env.SOCIAL_SERVICE.fetch(new Request("https://kta-social/oracle-activate", { method: "POST", headers: nh, body: nb })).catch(() => {}));
        } else if (env.KTA_SOCIAL_URL) {
          ctx.waitUntil(fetch(`${env.KTA_SOCIAL_URL}/oracle-activate`, { method: "POST", headers: nh, body: nb, signal: AbortSignal.timeout(20000) }).catch(() => {}));
        }
      }

      return Response.json(result, { status: result.success ? 200 : 402 });
    }

    if (method === "GET" && pathname === "/subscription") {
      const wallet = searchParams.get("wallet") ?? "";
      if (!wallet) return Response.json({ error: "wallet required" }, { status: 400 });
      const sub    = await loadSubscription(env, wallet);
      const oracle = env.ORACLE_WALLET ?? await getOracleAddress(env.KEETA_SEED);
      if (!sub) return Response.json({
        tier: "unregistered",
        oracle_wallet: oracle,
        tiers: {
          free:     `${TIER_REGISTRATION} KTA — ${FREE_CALLS_PER_DAY} calls/day, 5 days`,
          starter:  `${TIER_STARTER} KTA — 60 calls / 30 days`,
          social:   `${TIER_SOCIAL} KTA — Starter + Social Agent lifetime`,
          pro:      `${TIER_PRO} KTA — Pro tools, 30 days + Social lifetime`,
          business: `${TIER_BUSINESS} KTA — all tools + priority, 30 days + Social lifetime`,
        },
      });
      return Response.json({
        tier:           sub.tier,
        amount:         sub.amount,
        socialLifetime: sub.socialLifetime,
        expiresAt:      new Date(sub.expiresAt).toISOString(),
        activatedAt:    new Date(sub.activatedAt).toISOString(),
      });
    }

    const authError = requireInternalAuth(request, env.INTERNAL_SECRET);

    if (method === "POST" && pathname === "/fx/quote") {
      if (authError) return authError;
      try {
        const body = await request.json() as { fromToken: string; toToken: string; amount: string };
        const result = await getFxQuote(env.KEETA_SEED, body.fromToken, body.toToken, body.amount);
        return Response.json(result);
      } catch (e) {
        return Response.json({ error: String(e) }, { status: 500 });
      }
    }

    if (method === "POST" && pathname === "/payment/send") {
      if (authError) return authError;
      try {
        const body = await request.json() as {
          recipientAddress: string; amount: string; token: string; orderId: string;
        };
        const result = await sendPayment(env, body.recipientAddress, body.amount, body.token, body.orderId);
        emitToSocial(env, {
          type: "payout_success", ...body,
          settlementMs: result.settlementMs, txHash: result.txHash, ts: Date.now(),
        });
        return Response.json(result);
      } catch (e) {
        return Response.json({ error: String(e) }, { status: 500 });
      }
    }

    if (method === "POST" && pathname === "/verify-payment") {
      if (authError) return authError;
      try {
        const body = await request.json() as { wallet: string; requiredKta?: number };
        const result = await verifyPayment(env, body.wallet, body.requiredKta ?? 50);
        return Response.json(result);
      } catch (e) {
        return Response.json({ error: String(e) }, { status: 500 });
      }
    }

    if (method === "GET" && pathname === "/wallet/history") {
      const wallet  = searchParams.get("wallet") ?? "";
      if (!wallet) return Response.json({ error: "wallet required" }, { status: 400 });
      const tierErr = await requireTier(env, wallet, 4);
      if (tierErr) return tierErr;
      try {
        const cacheKey = `kta:cache:wallet_history:${wallet}`;
        const cached = await env.KV.get<Record<string, unknown>>(cacheKey, "json");
        if (cached) return Response.json(cached);
        const result = await getWalletHistory(env, wallet);
        await env.KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 300 });
        return Response.json(result);
      } catch (e) { return Response.json({ error: String(e) }, { status: 500 }); }
    }

    if (method === "GET" && pathname === "/wallet/score") {
      const wallet  = searchParams.get("wallet") ?? "";
      if (!wallet) return Response.json({ error: "wallet required" }, { status: 400 });
      const tierErr = await requireTier(env, wallet, 4);
      if (tierErr) return tierErr;
      try {
        const cacheKey = `kta:cache:wallet_score:${wallet}`;
        const cached = await env.KV.get<Record<string, unknown>>(cacheKey, "json");
        if (cached) return Response.json(cached);
        const result = await getWalletScore(env, wallet);
        await env.KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 300 });
        return Response.json(result);
      } catch (e) { return Response.json({ error: String(e) }, { status: 500 }); }
    }

    if (method === "POST" && pathname === "/compliance/screen") {
      let body: Record<string, unknown>;
      try { body = await request.json() as Record<string, unknown>; }
      catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
      const wallet  = String(body.wallet ?? "");
      const caller  = String(body.caller ?? wallet);
      if (!wallet) return Response.json({ error: "wallet required" }, { status: 400 });
      const tierErr = await requireTier(env, caller, 4);
      if (tierErr) return tierErr;
      try {
        const cKey = `kta:cache:compliance:${wallet}`;
        const cached = await env.KV.get<Record<string,unknown>>(cKey, "json");
        if (cached) return Response.json(cached);
        const result = await screenWallet(env, wallet);
        await env.KV.put(cKey, JSON.stringify(result), { expirationTtl: 600 });
        return Response.json(result);
      }
      catch (e) { return Response.json({ error: String(e) }, { status: 500 }); }
    }

    if (method === "GET" && pathname === "/network/health") {
      const wallet  = searchParams.get("wallet") ?? "";
      const tierErr = await requireTier(env, wallet, 4);
      if (tierErr) return tierErr;
      try {
        const cached = await env.KV.get<Record<string, unknown>>("kta:cache:network_health", "json");
        if (cached) return Response.json(cached);
        const result = await getNetworkHealth(env);
        await env.KV.put("kta:cache:network_health", JSON.stringify(result), { expirationTtl: 60 });
        return Response.json(result);
      } catch (e) { return Response.json({ error: String(e) }, { status: 500 }); }
    }

    if (method === "GET" && pathname === "/analytics/network") {
      const wallet  = searchParams.get("wallet") ?? "";
      const tierErr = await requireTier(env, wallet, 4);
      if (tierErr) return tierErr;
      try {
        const cached = await env.KV.get<Record<string, unknown>>("kta:cache:analytics_network", "json");
        if (cached) return Response.json(cached);
        const result = await getNetworkAnalytics(env);
        await env.KV.put("kta:cache:analytics_network", JSON.stringify(result), { expirationTtl: 60 });
        return Response.json(result);
      } catch (e) { return Response.json({ error: String(e) }, { status: 500 }); }
    }

    if (method === "GET" && pathname === "/identity/resolve") {
      const q      = searchParams.get("username") ?? searchParams.get("q") ?? searchParams.get("wallet") ?? "";
      const caller = searchParams.get("caller") ?? (q.startsWith("keeta_") ? q : "");
      if (!q) return Response.json({ error: "username or wallet query required" }, { status: 400 });
      const tierErr = await requireTier(env, caller, 5);
      if (tierErr) return tierErr;
      try {
        const cKey = `kta:cache:identity:${q.toLowerCase()}`;
        const cached = await env.KV.get<Record<string,unknown>>(cKey, "json");
        if (cached) return Response.json(cached);
        const result = await resolveIdentity(env, q);
        await env.KV.put(cKey, JSON.stringify(result), { expirationTtl: 300 });
        return Response.json(result);
      }
      catch (e) { return Response.json({ error: String(e) }, { status: 500 }); }
    }

    if (method === "POST" && pathname === "/kyc/verify") {
      let body: Record<string, unknown> = {};
      try { body = await request.json() as Record<string, unknown>; } catch {}
      const tierErr = await requireTier(env, String(body.wallet ?? ""), 5);
      if (tierErr) return tierErr;
      try {
        const wallet = String(body.wallet ?? "");
        const cKey = wallet ? `kta:cache:kyc:${wallet}` : null;
        if (cKey) {
          const cached = await env.KV.get<Record<string,unknown>>(cKey, "json");
          if (cached) return Response.json(cached);
        }
        const result = { ...(await getKycInfo(env)), wallet: body.wallet ?? null };
        if (cKey) env.KV.put(cKey, JSON.stringify(result), { expirationTtl: 3600 }).catch(() => {});
        return Response.json(result);
      }
      catch (e) { return Response.json({ error: String(e) }, { status: 500 }); }
    }

    if (method === "POST" && pathname === "/certificate/manage") {
      let body: Record<string, unknown>;
      try { body = await request.json() as Record<string, unknown>; }
      catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
      const wallet  = String(body.wallet ?? "");
      const caller  = String(body.caller ?? wallet);
      if (!wallet) return Response.json({ error: "wallet required" }, { status: 400 });
      const tierErr = await requireTier(env, caller, 5);
      if (tierErr) return tierErr;
      try { return Response.json(await getWalletCertificates(env, wallet)); }
      catch (e) { return Response.json({ error: String(e) }, { status: 500 }); }
    }

    if (method === "POST" && pathname === "/permissions/manage") {
      let body: Record<string, unknown>;
      try { body = await request.json() as Record<string, unknown>; }
      catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
      const wallet  = String(body.wallet ?? "");
      const caller  = String(body.caller ?? wallet);
      if (!wallet) return Response.json({ error: "wallet required" }, { status: 400 });
      const tierErr = await requireTier(env, caller, 5);
      if (tierErr) return tierErr;
      try { return Response.json(await getWalletPermissions(env, wallet)); }
      catch (e) { return Response.json({ error: String(e) }, { status: 500 }); }
    }

    if (method === "POST" && pathname === "/batch/build") {
      let body: Record<string, unknown>;
      try { body = await request.json() as Record<string, unknown>; }
      catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
      const caller     = String(body.wallet ?? body.caller ?? "");
      const tierErr    = await requireTier(env, caller, 5);
      if (tierErr) return tierErr;
      const operations = body.operations as Array<{ method: string; args: unknown[]; account?: string }>;
      if (!Array.isArray(operations))
        return Response.json({ error: "operations[] required" }, { status: 400 });
      try { return Response.json(await executeBatch(env.KEETA_SEED, operations)); }
      catch (e) { return Response.json({ error: String(e) }, { status: 500 }); }
    }

    if (method === "POST" && pathname === "/container/seal") {
      let body: Record<string, unknown>;
      try { body = await request.json() as Record<string, unknown>; }
      catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
      const tierErr = await requireTier(env, String(body.wallet ?? body.caller ?? ""), 5);
      if (tierErr) return tierErr;
      const data = String(body.data ?? body.plaintext ?? "");
      if (!data) return Response.json({ error: "data required" }, { status: 400 });
      try {
        const { EncryptedContainer } = await import("@keetanetwork/anchor") as any;
        const buf       = new TextEncoder().encode(data);
        const container = await (EncryptedContainer as any).fromPlaintext(buf);
        return Response.json({ container, ts: Date.now() });
      } catch (e) { return Response.json({ error: String(e) }, { status: 500 }); }
    }

    return Response.json({ service: "kta-oracle" }, { status: 404 });
    } catch (e) {
      return Response.json({ error: e instanceof Error ? e.message : "Internal error" }, { status: 500 });
    }
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runCron(env, ctx));
  },
} satisfies ExportedHandler<Env>;

async function runCron(env: Env, ctx: ExecutionContext): Promise<void> {
  const now = Date.now();

  const [{ price: marketPrice, c1h: dexC1h, c24h: dexC24h, c7d: dexC7d, volume24h, liquidityUsd, fresh: marketFresh }, history, lastWhaleCheckRaw, minuteRing, hourlyRing] = await Promise.all([
    getCachedMarketData(env),
    readPriceHistory(env),
    env.KV.get("kta:last_whale_check"),
    getPriceRing(env),
    env.KV.get<{p: number; t: number}[]>("kta:price_ring_1h", "json").then(r => r ?? []),
  ]);

  const price = marketPrice ?? history.last;
  if (!price) return;

  const priceChange    = calcPriceChange(price, history.last);
  const changeLevel    = classifyMove(priceChange);
  const alertTriggered = changeLevel !== null;
  const lastCheckTs    = history.last_ts ?? 0;

  const rolling = computeRollingChanges(minuteRing, hourlyRing, price, now);
  const c1h  = rolling.c1h  ?? dexC1h;
  const c24h = rolling.c24h ?? dexC24h;
  const p7dFallback = (history.p7d && history.p7d > 0)
    ? ((price - history.p7d) / history.p7d) * 100
    : null;
  const c7d  = rolling.c7d  ?? dexC7d ?? p7dFallback;

  await Promise.all([
    writePriceHistory(env, price, now, history, { c1h, c24h, c7d }),
    appendPricePoint(env, minuteRing, price, now),
    appendHourlyPoint(env, hourlyRing, price, now),
  ]);

  await emitToSocial(env, {
    type: "price_update",
    price, priceChange, change1h: c1h ?? null, change24h: c24h ?? 0, change7d: c7d,
    volume24h, liquidityUsd,
    alertTriggered, changeLevel, whale: null, ts: now,
  } as unknown as Record<string, unknown>);

  const lastWhaleCheck = Number(lastWhaleCheckRaw ?? "0");
  if (now - lastWhaleCheck >= 60 * 60 * 1000) {
    await env.KV.put("kta:last_whale_check", String(now));
    const whale = await detectRecentWhales(env, price, lastCheckTs).catch(() => null);
    if (whale) {
      const existing = await getWhaleAlerts(env);
      await storeWhaleAlerts(env, [whale, ...existing]);
      await emitToSocial(env, {
        type: "price_update",
        price, priceChange, change24h: c24h ?? 0, change7d: c7d,
        alertTriggered, whale, ts: now,
      } as unknown as Record<string, unknown>);
    }
  }
}
