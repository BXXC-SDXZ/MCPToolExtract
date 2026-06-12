import { FX, KYC, Username } from "@keetanetwork/anchor";
import { lib as KeetaNetLib, UserClient } from "@keetanetwork/keetanet-client";
import type { Env, WhaleAlert } from "./types.js";

const KTA_NATIVE_TOKEN    = "keeta_anqdilpazdekdu4acw65fj7smltcp26wbrildkqtszqvverljpwpezmd44ssg";
const KTA_NATIVE_ONE      = BigInt("1000000000000000000"); // 1 KTA (18 decimals)
const KTA_NATIVE_SMALL    = BigInt("1000000000000000");    // 0.001 KTA
const KTA_NATIVE_DECIMALS = 1e18;
const STABLECOIN_DECIMALS = 1_000_000;

const WHALE_THRESHOLD_KTA     = 10_000;
const INSTITUTIONAL_THRESHOLD = 100_000;
const MEGA_WHALE_THRESHOLD    = 1_000_000;

async function accountFromPassphrase(phrase: string, index = 0) {
  const seed = await (KeetaNetLib.Account as any).seedFromPassphrase(phrase.trim());
  return KeetaNetLib.Account.fromSeed(seed, index);
}

let _cachedAccount: any = null;
let _cachedClient: any = null;
let _cachedSeed = "";

export async function getOracleClient(seed: string): Promise<{ account: any; client: any }> {
  if (_cachedClient && _cachedSeed === seed) return { account: _cachedAccount, client: _cachedClient };
  _cachedAccount = await accountFromPassphrase(seed);
  _cachedClient  = (UserClient as any).fromNetwork("main", _cachedAccount);
  _cachedSeed    = seed;
  return { account: _cachedAccount, client: _cachedClient };
}

const KTA_BASE_ADDRESS = "0xc0634090F2Fe6c6d75e61Be2b949464aBB498973";

type GeckoPool = {
  id: string;
  attributes: {
    name?: string;
    reserve_in_usd?: string;
    base_token_price_usd?: string;
    price_change_percentage?: { h1?: number; h24?: number };
    volume_usd?: { h24?: string; m5?: string };
  };
};

export async function fetchMarketData(): Promise<{
  price: number | null;
  c1h: number | null;
  c24h: number | null;
  c7d: number | null;
  volume24h: number | null;
  liquidityUsd: number | null;
}> {
  try {
    const sr = await fetch(
      "https://api.geckoterminal.com/api/v2/search/pools?query=KTA&network=base&page=1",
      { signal: AbortSignal.timeout(8000), headers: { "Accept": "application/json" } },
    );
    if (sr.ok) {
      const sd = await sr.json() as { data?: GeckoPool[] };
      const pool = (sd.data ?? []).find(p =>
        p.attributes.name?.toUpperCase().startsWith("KTA") &&
        parseFloat(p.attributes.reserve_in_usd ?? "0") > 100
      ) ?? sd.data?.[0];
      if (pool) {
        const liquidityUsd = parseFloat(pool.attributes.reserve_in_usd ?? "0") || null;
        const volume24h    = parseFloat(pool.attributes.volume_usd?.h24 ?? "0") || null;
        const price        = parseFloat(pool.attributes.base_token_price_usd ?? "0") || null;
        const c1h          = pool.attributes.price_change_percentage?.h1 ?? null;
        const c24h         = pool.attributes.price_change_percentage?.h24 ?? null;
        if (price && isFinite(price) && price > 0) {
          let c7d: number | null = null;
          try {
            const poolAddress = pool.id.replace(/^[^_]+_/, "");
            const or = await fetch(
              `https://api.geckoterminal.com/api/v2/networks/base/pools/${poolAddress}/ohlcv/day?limit=8&currency=usd`,
              { signal: AbortSignal.timeout(6000), headers: { "Accept": "application/json" } },
            );
            if (or.ok) {
              const od = await or.json() as { data?: { attributes?: { ohlcv_list?: number[][] } } };
              const list = od.data?.attributes?.ohlcv_list ?? [];
              const oldest = list.find(c => c[4] > 0);
              if (oldest && oldest[4] > 0) c7d = ((price - oldest[4]) / oldest[4]) * 100;
            }
          } catch {}
          return { price, c1h, c24h, c7d, volume24h, liquidityUsd };
        }
      }
    }
  } catch {}

  try {
    const r = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${KTA_BASE_ADDRESS}`,
      { signal: AbortSignal.timeout(8000), headers: { "Accept": "application/json" } },
    );
    if (r.ok) {
      const d = await r.json() as { pairs?: Array<{ priceUsd?: string; liquidity?: { usd?: number }; volume?: { h24?: number }; priceChange?: { h1?: number; h24?: number } }> };
      const pair = (d.pairs ?? []).filter(p => (p.liquidity?.usd ?? 0) > 100).sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
      const price = parseFloat(pair?.priceUsd ?? "");
      if (isFinite(price) && price > 0)
        return { price, c1h: pair?.priceChange?.h1 ?? null, c24h: pair?.priceChange?.h24 ?? null, c7d: null, volume24h: pair?.volume?.h24 ?? null, liquidityUsd: pair?.liquidity?.usd ?? null };
    }
  } catch {}

  return { price: null, c1h: null, c24h: null, c7d: null, volume24h: null, liquidityUsd: null };
}

export async function fetchMarketPrice(): Promise<number | null> {
  return (await fetchMarketData()).price;
}

export async function fetch7dChange(currentPrice: number): Promise<number | null> {
  try {
    const sr = await fetch(
      "https://api.geckoterminal.com/api/v2/search/pools?query=KTA&network=base&page=1",
      { signal: AbortSignal.timeout(7000), headers: { "Accept": "application/json" } },
    );
    if (!sr.ok) return null;
    const sd = await sr.json() as {
      data?: Array<{ id: string; attributes: { name?: string; reserve_in_usd?: string } }>
    };
    const pool = sd.data?.find(p => p.attributes.name?.toUpperCase().startsWith("KTA")) ?? sd.data?.[0];
    if (!pool) return null;

    const poolAddress = pool.id.replace(/^[^_]+_/, "");
    const or = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/base/pools/${poolAddress}/ohlcv/day?limit=8&currency=usd`,
      { signal: AbortSignal.timeout(7000), headers: { "Accept": "application/json" } },
    );
    if (!or.ok) return null;
    const od = await or.json() as { data?: { attributes?: { ohlcv_list?: number[][] } } };

    const list = od.data?.attributes?.ohlcv_list;
    if (!list || list.length < 2) return null;
    const price7d = list[0][4]; // oldest candle close
    if (!price7d || price7d <= 0) return null;
    return ((currentPrice - price7d) / price7d) * 100;
  } catch {
    return null;
  }
}

export async function fetchAnchorPrice(phrase: string): Promise<{ price: number | null; debug?: string }> {
  let userClient: any = null;
  try {
    const account  = await accountFromPassphrase(phrase);
    userClient     = (UserClient as any).fromNetwork("main", account);
    const fxClient = new (FX.Client as any)(userClient, { signer: account, account });

    for (const amount of [KTA_NATIVE_SMALL, KTA_NATIVE_ONE]) {
      const estimates = await fxClient.getEstimates({
        from: KTA_NATIVE_TOKEN, to: "$USDC", amount, affinity: "from",
      });
      if (!estimates || !estimates.length) continue;
      for (const wrapper of estimates) {
        const converted = wrapper?.estimate?.convertedAmount;
        if (!converted || converted === BigInt(0)) continue;
        const pricePerKta = (Number(converted) / STABLECOIN_DECIMALS) / (Number(amount) / KTA_NATIVE_DECIMALS);
        return { price: pricePerKta };
      }
    }

    return { price: null, debug: "no non-zero estimate from any provider" };
  } catch (e) {
    return { price: null, debug: String(e) };
  } finally {
    try { userClient?.destroy?.(); } catch {}
  }
}

export async function getFxQuote(
  phrase: string, fromToken: string, toToken: string, amountRaw: string,
): Promise<{ rate: number | null; ts: number }> {
  let userClient: any = null;
  try {
    const account   = await accountFromPassphrase(phrase);
    userClient      = (UserClient as any).fromNetwork("main", account);
    const fxClient  = new (FX.Client as any)(userClient, { signer: account, account });
    const estimates = await fxClient.getEstimates({
      from: fromToken, to: toToken, amount: BigInt(amountRaw), affinity: "from",
    });
    const est = estimates?.[0]?.estimate;
    if (!est) return { rate: null, ts: Date.now() };
    const converted = est.convertedAmount;
    if (!converted) return { rate: null, ts: Date.now() };
    return { rate: Number(converted) / STABLECOIN_DECIMALS, ts: Date.now() };
  } catch {
    return { rate: null, ts: Date.now() };
  } finally {
    try { userClient?.destroy?.(); } catch {}
  }
}

export async function sendPayment(
  env: Env,
  recipientAddress: string,
  amount: string,
  token: string,
  orderId: string,
): Promise<{ success: true; txHash: string; settlementMs: number }> {
  const idx     = parseInt(env.KEETA_ACCOUNT_INDEX ?? "0");
  const signer  = await accountFromPassphrase(env.KEETA_SEED, idx);
  const client  = (UserClient as any).fromNetwork("main", signer);
  const dest    = KeetaNetLib.Account.fromPublicKeyString(recipientAddress);

  const t0           = Date.now();
  const result       = await client.send(dest, BigInt(amount));
  const settlementMs = Date.now() - t0;
  const txHash       = String(result?.hash ?? result ?? "");

  return { success: true, txHash, settlementMs };
}

export async function verifyPayment(
  env: Env,
  subscriberWallet: string,
  requiredKta: number,
): Promise<{ verified: boolean; amount: number; error?: string }> {
  const oracleAddr = env.ORACLE_WALLET ?? "";
  if (!oracleAddr) return { verified: false, amount: 0, error: "ORACLE_WALLET not configured" };
  if (!env.KEETA_SEED) return { verified: false, amount: 0, error: "KEETA_SEED not configured" };

  try {
    const { client, account: oracleAccount } = await getOracleClient(env.KEETA_SEED);
    const resolvedOracle = (oracleAccount as any).publicKeyString?.get?.() ?? oracleAddr;
    const oracleHistory  = await client.history(oracleAccount);
    const subStaples     = Array.isArray(oracleHistory) ? oracleHistory : [];

    let total = 0;

    for (const staple of subStaples) {
      try {
        const accounts = (staple as any)?.effects?.accounts as Record<string, unknown> | undefined;
        if (!accounts) continue;
        const oracleEntry = accounts[resolvedOracle] as Record<string, unknown> | undefined;
        if (!oracleEntry) continue;
        const balance = (oracleEntry.fields as any)?.balance as Record<string, unknown> | undefined;
        if (!balance) continue;
        const ktaEntries = balance[KTA_NATIVE_TOKEN];
        if (!Array.isArray(ktaEntries)) continue;
        for (const entry of ktaEntries as Array<Record<string, unknown>>) {
          const otherAddr = (entry.otherAccount as any)?.publicKeyString?.get?.() ?? String(entry.otherAccount ?? "");
          if (otherAddr !== subscriberWallet) continue;
          const raw = entry.value;
          if (raw == null) continue;
          const amt = typeof raw === "bigint" ? Number(raw) : Number(String(raw).replace("n", ""));
          if (!isFinite(amt) || amt <= 0) continue;
          total += amt / KTA_NATIVE_DECIMALS;
        }
      } catch {}
    }

    return total >= requiredKta
      ? { verified: true, amount: total }
      : { verified: false, amount: total };
  } catch (e) {
    return { verified: false, amount: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

export function classifyWhale(amountKta: number): WhaleAlert["classification"] {
  if (amountKta >= MEGA_WHALE_THRESHOLD)    return "mega_whale";
  if (amountKta >= INSTITUTIONAL_THRESHOLD) return "institutional";
  return "whale";
}

export async function detectRecentWhales(
  env: Env,
  currentPrice: number,
  _lastCheckTs: number,
): Promise<WhaleAlert | null> {
  if (!env.KEETA_SEED) return null;

  try {
    const { account: oracleAccount, client } = await getOracleClient(env.KEETA_SEED);
    const oracleAddr: string = (oracleAccount as any).publicKeyString?.get?.() ?? "";
    const history = await client.history(oracleAccount);
    const staples = Array.isArray(history) ? history : [];

    const lastBlockRaw = await env.KV.get("kta:last_whale_block");
    const lastBlock = lastBlockRaw ? BigInt(lastBlockRaw) : 0n;
    let maxBlock = lastBlock;

    for (const staple of staples) {
      try {
        const accounts = (staple as any)?.effects?.accounts as Record<string, unknown> | undefined;
        const oracleEntry = accounts?.[oracleAddr] as Record<string, unknown> | undefined;
        if (!oracleEntry) continue;
        const rawBlock = (staple as any)?.effects?.metadata?.blockCount;
        const blockCount = rawBlock != null
          ? (typeof rawBlock === "bigint" ? rawBlock : BigInt(String(rawBlock).replace("n", "")))
          : 0n;
        if (blockCount > 0n && blockCount <= lastBlock) continue;
        if (blockCount > maxBlock) maxBlock = blockCount;
        const balance = (oracleEntry.fields as any)?.balance as Record<string, unknown> | undefined;
        if (!balance) continue;
        const ktaEntries = balance[KTA_NATIVE_TOKEN];
        if (!Array.isArray(ktaEntries)) continue;
        for (const entry of ktaEntries as Array<Record<string, unknown>>) {
          const raw = entry.value;
          if (raw == null) continue;
          const amt = typeof raw === "bigint" ? Number(raw) : Number(String(raw).replace("n", ""));
          const amountKta = amt / KTA_NATIVE_DECIMALS;
          if (amountKta < WHALE_THRESHOLD_KTA) continue;
          if (maxBlock > lastBlock)
            await env.KV.put("kta:last_whale_block", maxBlock.toString());
          return {
            amountKta,
            valueUsd:       amountKta * currentPrice,
            classification: classifyWhale(amountKta),
            ts:             Date.now(),
          };
        }
      } catch {}
    }
    if (maxBlock > lastBlock)
      await env.KV.put("kta:last_whale_block", maxBlock.toString());
  } catch {}
  return null;
}

export async function getOracleAddress(phrase: string): Promise<string> {
  try {
    const account = await accountFromPassphrase(phrase);
    return (account as any).publicKeyString.get();
  } catch {
    return "";
  }
}

export async function getWalletHistory(
  env: Env,
  wallet: string,
): Promise<{ txs: Array<Record<string, unknown>>; count: number; ts: number }> {
  const { client } = await getOracleClient(env.KEETA_SEED);
  const target  = KeetaNetLib.Account.fromPublicKeyString(wallet);
  const history = await client.history(target);
  const txs: Array<Record<string, unknown>> = [];
  for (const staple of (Array.isArray(history) ? history.slice(0, 100) : [])) {
    try {
      const accounts = (staple as any)?.effects?.accounts as Record<string, unknown> | undefined;
      const walletEntry = accounts?.[wallet] as Record<string, unknown> | undefined;
      if (!walletEntry) continue;
      const balance = (walletEntry.fields as any)?.balance as Record<string, unknown> | undefined;
      if (!balance) continue;
      const ktaEntries = balance[KTA_NATIVE_TOKEN];
      if (!Array.isArray(ktaEntries)) continue;
      for (const entry of ktaEntries as Array<Record<string, unknown>>) {
        const otherAddr = (entry.otherAccount as any)?.publicKeyString?.get?.() ?? String(entry.otherAccount ?? "");
        const raw = entry.value;
        if (raw == null) continue;
        const amt = typeof raw === "bigint" ? Number(raw) : Number(String(raw).replace("n", ""));
        const outgoing = amt < 0;
        txs.push({
          from:   outgoing ? wallet    : otherAddr,
          to:     outgoing ? otherAddr : wallet,
          amount: (Math.abs(amt) / KTA_NATIVE_DECIMALS).toFixed(6),
          token:  KTA_NATIVE_TOKEN,
          ts:     0,
        });
      }
    } catch {}
  }
  return { txs: txs.slice(0, 50), count: txs.length, ts: Date.now() };
}

export async function getWalletScore(
  env: Env,
  wallet: string,
): Promise<{ score: number; grade: string; breakdown: Record<string, number>; ts: number }> {
  const { txs } = await getWalletHistory(env, wallet);
  const count       = txs.length;
  const totalVolume = txs.reduce((s, t) => s + parseFloat(String(t.amount ?? 0)), 0);
  const timestamps  = txs.map(t => Number(t.ts)).filter(Boolean).sort((a, b) => a - b);
  const ageDays     = timestamps.length > 0 ? (Date.now() - timestamps[0]) / 86_400_000 : 0;
  const actScore    = Math.min(100, count * 2);
  const volScore    = Math.min(100, (totalVolume / 10_000) * 100);
  const ageScore    = Math.min(100, ageDays * 2);
  const freqScore   = Math.min(100, count * 5);
  const score       = Math.round(actScore * 0.25 + volScore * 0.30 + ageScore * 0.20 + freqScore * 0.25);
  const grade       = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : score >= 20 ? "D" : "F";
  return { score, grade, breakdown: { activity: actScore, volume: Math.round(volScore), age: Math.round(ageScore), frequency: freqScore }, ts: Date.now() };
}

export async function screenWallet(
  env: Env,
  wallet: string,
): Promise<{ risk_level: string; flags: string[]; summary: string; ts: number }> {
  const { txs } = await getWalletHistory(env, wallet);
  const flags: string[] = [];
  const totalVolume = txs.reduce((s, t) => s + parseFloat(String(t.amount ?? 0)), 0);
  const maxSingle   = txs.length ? Math.max(...txs.map(t => parseFloat(String(t.amount ?? 0)))) : 0;
  if (maxSingle   > 100_000)  flags.push("large_single_transaction");
  if (txs.length  > 200)      flags.push("high_frequency_activity");
  if (totalVolume > 500_000)  flags.push("high_volume_wallet");
  if (txs.length  === 0)      flags.push("no_transaction_history");
  const riskFlags    = flags.filter(f => f !== "no_transaction_history");
  const risk_level   = riskFlags.length >= 2 ? "high" : riskFlags.length === 1 ? "medium" : "low";
  const summary      = risk_level === "high"
    ? `Wallet flagged: ${flags.join(", ")}. Manual review recommended.`
    : risk_level === "medium"
    ? `Elevated activity detected: ${flags.join(", ")}.`
    : txs.length === 0
    ? "No on-chain history found for this wallet."
    : `Wallet appears clean. ${txs.length} transactions, ${totalVolume.toFixed(2)} KTA total.`;
  return { risk_level, flags, summary, ts: Date.now() };
}

export async function getNetworkHealth(
  env: Env,
): Promise<{ status: string; latency_ms: number; head_block: number; network: string; ts: number }> {
  const { client } = await getOracleClient(env.KEETA_SEED);
  const t0         = Date.now();
  const head       = await client.head().catch(() => null);
  const latency_ms = Date.now() - t0;
  return {
    status:     head ? "ok" : "degraded",
    latency_ms,
    head_block: Number((head as any)?.height ?? (head as any)?.number ?? 0),
    network:    "main",
    ts:         Date.now(),
  };
}

export async function getNetworkAnalytics(
  env: Env,
): Promise<{ head_block: number; oracle_kta_balance: number; network: string; ts: number }> {
  const { account, client } = await getOracleClient(env.KEETA_SEED);
  const [head, bal] = await Promise.all([
    client.head().catch(() => null),
    client.balance(account, KTA_NATIVE_TOKEN).catch(() => null),
  ]);
  return {
    head_block:          Number((head as any)?.height ?? (head as any)?.number ?? 0),
    oracle_kta_balance:  Number((bal as any) ?? 0) / KTA_NATIVE_DECIMALS,
    network:             "main",
    ts:                  Date.now(),
  };
}

export async function resolveIdentity(
  env: Env,
  query: string,
): Promise<{ result: unknown; query: string; ts: number }> {
  const { account, client } = await getOracleClient(env.KEETA_SEED);
  const usernameClient      = new (Username.Client as any)(client, { signer: account, account });
  const result              = query.startsWith("keeta_")
    ? await usernameClient.search({ search: query }).catch(() => null)
    : await usernameClient.resolve(query).catch(() => null);
  return { result, query, ts: Date.now() };
}

export async function getKycInfo(
  env: Env,
): Promise<{ supported_countries: unknown; ts: number }> {
  const { account, client } = await getOracleClient(env.KEETA_SEED);
  const kycClient           = new (KYC.Client as any)(client, { signer: account, account });
  const supported_countries = await kycClient.getSupportedCountries().catch(() => []);
  return { supported_countries, ts: Date.now() };
}

export async function getWalletCertificates(
  env: Env,
  wallet: string,
): Promise<{ certificates: unknown; ts: number }> {
  const { client } = await getOracleClient(env.KEETA_SEED);
  const target     = KeetaNetLib.Account.fromPublicKeyString(wallet);
  const certificates = await client.getCertificates(target).catch(() => []);
  return { certificates, ts: Date.now() };
}

export async function getWalletPermissions(
  env: Env,
  wallet: string,
): Promise<{ acls: unknown; ts: number }> {
  const { client } = await getOracleClient(env.KEETA_SEED);
  const target     = KeetaNetLib.Account.fromPublicKeyString(wallet);
  const acls       = await client.listACLsByPrincipal(target).catch(() => []);
  return { acls, ts: Date.now() };
}

const BATCH_METHOD_ALLOWLIST = new Set([
  "send", "receive",
  "updatePermissions",
  "modifyCertificate",
  "modifyTokenSupply", "modifyTokenBalance",
  "setInfo", "setRep",
  "generateIdentifier",
]);

export async function executeBatch(
  phrase: string,
  operations: Array<{ method: string; args: unknown[]; account?: string }>,
): Promise<{ hashes: string[]; ts: number }> {
  const signer  = await accountFromPassphrase(phrase);
  const client  = (UserClient as any).fromNetwork("main", signer);
  const BuilderCls = (KeetaNetLib as any).Builder ?? (UserClient as any).Builder;
  const builder    = new BuilderCls(client, signer);
  for (const op of operations) {
    if (!BATCH_METHOD_ALLOWLIST.has(op.method)) continue;
    if (typeof (builder as any)[op.method] === "function") {
      const opts = op.account ? { account: KeetaNetLib.Account.fromPublicKeyString(op.account) } : {};
      await (builder as any)[op.method](...(op.args ?? []), opts);
    }
  }
  const computed = await builder.computeBlocks();
  const result   = await builder.publish(computed);
  const hashes   = Array.isArray(result) ? result.map(String) : [String(result)];
  return { hashes, ts: Date.now() };
}
