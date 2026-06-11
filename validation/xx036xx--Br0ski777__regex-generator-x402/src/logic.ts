import type { Hono } from "hono";


// ATXP: requirePayment only fires inside an ATXP context (set by atxpHono middleware).
// For raw x402 requests, the existing @x402/hono middleware handles the gate.
// If neither protocol is active (ATXP_CONNECTION unset), tryRequirePayment is a no-op.
async function tryRequirePayment(price: number): Promise<void> {
  if (!process.env.ATXP_CONNECTION) return;
  try {
    const { requirePayment } = await import("@atxp/server");
    const BigNumber = (await import("bignumber.js")).default;
    await requirePayment({ price: BigNumber(price) });
  } catch (e: any) {
    if (e?.code === -30402) throw e;
  }
}

function explainRegex(pattern: string): string {
  const explanations: string[] = [];
  const tokens: [RegExp, string][] = [
    [/^\^/, "Start of string"], [/^\$$/, "End of string"],
    [/^\\d/, "Any digit (0-9)"], [/^\\D/, "Any non-digit"],
    [/^\\w/, "Any word character"], [/^\\W/, "Any non-word character"],
    [/^\\s/, "Any whitespace"], [/^\\S/, "Any non-whitespace"],
    [/^\./, "Any character"], [/^\+/, "One or more"],
    [/^\*/, "Zero or more"], [/^\?/, "Optional"],
    [/^\[([^\]]+)\]/, "Character class"], [/^\(([^)]*)\)/, "Capture group"], [/^\|/, "OR"],
  ];
  let remaining = pattern;
  while (remaining.length > 0) {
    let matched = false;
    for (const [regex, desc] of tokens) {
      const m = remaining.match(regex);
      if (m) { explanations.push(`'${m[0]}' = ${desc}`); remaining = remaining.slice(m[0].length); matched = true; break; }
    }
    if (!matched) { explanations.push(`'${remaining[0]}' = Literal`); remaining = remaining.slice(1); }
  }
  return explanations.join("; ");
}

export function registerRoutes(app: Hono) {
  app.post("/api/test", async (c) => {
    await tryRequirePayment(0.001);
    const body = await c.req.json().catch(() => null);
    if (!body?.pattern || !body?.testStrings || !Array.isArray(body.testStrings))
      return c.json({ error: "Missing required fields: pattern, testStrings (array)" }, 400);
    let regex: RegExp;
    const flags = body.flags || "g";
    try { regex = new RegExp(body.pattern, flags); } catch (e: any) { return c.json({ error: `Invalid regex: ${e.message}` }, 400); }
    const results = body.testStrings.slice(0, 20).map((str: string) => {
      const re = new RegExp(body.pattern, flags);
      const matches: Array<{ match: string; index: number; groups: string[] }> = [];
      let m: RegExpExecArray | null;
      if (flags.includes("g")) {
        while ((m = re.exec(str)) !== null) { matches.push({ match: m[0], index: m.index, groups: m.slice(1) }); if (m[0].length === 0) re.lastIndex++; }
      } else { m = re.exec(str); if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) }); }
      return { input: str, matches, matchCount: matches.length, isMatch: matches.length > 0 };
    });
    return c.json({ pattern: body.pattern, flags, explanation: explainRegex(body.pattern), totalMatches: results.reduce((s: number, r: any) => s + r.matchCount, 0), results });
  });
}
