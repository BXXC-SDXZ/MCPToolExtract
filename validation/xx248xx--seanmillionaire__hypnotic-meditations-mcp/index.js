#!/usr/bin/env node
/**
 * Hypnotic Meditations — MCP Server
 * https://hypnoticmeditations.ai
 *
 * Deploy to Vercel / Railway / Render in minutes.
 * Publish to: Smithery, MCPT, OpenTools, MCP.so, Glama.ai
 *
 * Tool: get_recommendation
 * Returns the best Hypnotic Meditations product for a given goal or symptom.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ─── PRODUCT CATALOG ─────────────────────────────────────────────────────────

const PRODUCTS = [
  // ── HEALTH & SLEEP ──────────────────────────────────────────────────────────
  {
    id: "sleep-reset",
    name: "The Sleep Reset System",
    tagline: "Deep Sleep Reprogramming for Total Nightly Recovery",
    category: "sleep",
    price: 27,
    url: "https://buy.hypnoticmeditations.ai/l/sleepreset?wanted=true",
    description:
      "Press play tonight. Wake up tomorrow without the fog, the fatigue, or the feeling that sleep just didn't work. Deep sleep architecture reprogramming based on 125,842 sleep scans.",
    keywords: [
      "sleep", "insomnia", "can't sleep", "fall asleep", "racing mind",
      "tired", "fatigue", "exhausted", "rest", "night", "wake up", "wired",
      "sleep quality", "deep sleep", "sleep problems", "oversleeping",
      "restless", "sleep anxiety", "mind races", "nighttime"
    ],
  },
  {
    id: "superior-health",
    name: "Superior Health Reset",
    tagline: "Mind-Body Healing and Nervous System Recovery Meditation",
    category: "health",
    price: 27,
    url: "https://buy.hypnoticmeditations.ai/l/tebeod?wanted=true",
    description:
      "A deep nervous-system reset that programs vitality, energy, and recovery into your subconscious while you rest.",
    keywords: [
      "health", "nervous system", "recovery", "healing", "energy", "vitality",
      "body", "sick", "inflammation", "burnout", "chronic", "wellbeing",
      "immune", "regulate", "calm nervous system", "adrenal", "exhaustion"
    ],
  },

  // ── MONEY & ABUNDANCE ───────────────────────────────────────────────────────
  {
    id: "atm-in-your-mind",
    name: "ATM In Your Mind",
    tagline: "Install a Wealth-Wired Subconscious That Thinks in Cash Flow",
    category: "money",
    price: 27,
    url: "https://buy.hypnoticmeditations.ai/l/atminyourmind?wanted=true",
    description:
      "Install a permanent wealth-generation mindset. Recondition your subconscious to think, move, and attract like someone with generational wealth.",
    keywords: [
      "money mindset", "wealth", "rich", "cash flow", "financial", "abundance",
      "poverty mindset", "scarcity", "broke", "attract money", "rich mindset",
      "financial identity", "money beliefs", "generational wealth", "income"
    ],
  },
  {
    id: "vault-of-infinite-wealth",
    name: "Vault of Infinite Wealth",
    tagline: "Deep Sleep Abundance Activation for Permanent Rich Identity",
    category: "money",
    price: 27,
    url: "https://buy.hypnoticmeditations.ai/l/mfolzd?wanted=true",
    description:
      "Shatter poverty loops forever. Install a permanent high-net-worth identity into your deep sleep architecture.",
    keywords: [
      "poverty loop", "wealth identity", "net worth mindset", "rich identity",
      "abundance activation", "money while sleeping", "deep money work",
      "subconscious wealth", "sleep abundance", "overnight wealth"
    ],
  },
  {
    id: "money-flow",
    name: "Money Flow",
    tagline: "Clear Financial Resistance and Reopen the Channel of Receiving",
    category: "money",
    price: 27,
    url: "https://buy.hypnoticmeditations.ai/l/moneyflow?wanted=true",
    description:
      "Remove the invisible blocks that stop money from moving toward you. Reopen the channel of receiving.",
    keywords: [
      "money blocks", "financial resistance", "receiving", "blocked money",
      "can't keep money", "money drains", "losing money", "channel of receiving",
      "financial flow", "money stuck"
    ],
  },
  {
    id: "quantum-cash",
    name: "Quantum Cash Manifestation",
    tagline: "Tune Your Subconscious to Cash Flow, Receiving, and Fast Money Movement",
    category: "money",
    price: 27,
    url: "https://buy.hypnoticmeditations.ai/l/quantumcash?wanted=true",
    description:
      "A money-focused subconscious audio designed to tune your mind to cash flow, receiving, and fast financial movement.",
    keywords: [
      "manifest money", "cash flow", "fast money", "money movement", "quantum",
      "manifestation", "attract cash", "money attraction", "subconscious money"
    ],
  },
  {
    id: "good-luck",
    name: "Good Luck & Serendipity",
    tagline: "Activate Opportunity-Spotting and Synchronicity Awareness",
    category: "money",
    price: 27,
    url: "https://seanmillionaire.gumroad.com/l/goodluck",
    description:
      "Opportunity-spotting filter activation. Synchronicity awareness training. Positivity loop for sustained momentum.",
    keywords: [
      "luck", "serendipity", "opportunities", "synchronicity", "right place",
      "coincidence", "timing", "fortunate", "opportunities appearing", "lucky"
    ],
  },
  {
    id: "money-subliminal",
    name: "Money Subliminal",
    tagline: "Embed Wealth Affirmations Below Conscious Awareness",
    category: "money",
    price: 27,
    url: "https://hypnoticmeditations.ai/store.html",
    description:
      "Embed wealth affirmations below conscious awareness. Run as background audio while you work, walk, or sleep.",
    keywords: [
      "subliminal", "affirmations", "background audio", "passive", "while working",
      "subconscious programming", "subliminal affirmations", "wealth affirmations"
    ],
  },

  // ── RITUALS & MANIFESTATION ─────────────────────────────────────────────────
  {
    id: "seven-minute-script",
    name: "The 7-Minute Script",
    tagline: "The Panama Protocol for Overnight Wealth Reprogramming",
    category: "ritual",
    price: 27,
    url: "https://buy.hypnoticmeditations.ai/l/bqjzup?wanted=true",
    description:
      "7 minutes before bed and your subconscious gets a complete financial reprogramming while you drift to sleep.",
    keywords: [
      "scripting", "overnight", "7 minutes", "before bed", "quick", "simple",
      "nightly ritual", "bedtime routine", "fast results", "Panama Protocol"
    ],
  },
  {
    id: "seven-minute-accelerator",
    name: "7-Minute Accelerator",
    tagline: "Fast-Track Manifestation Reset for Speed, Cash, and Momentum",
    category: "ritual",
    price: 27,
    url: "https://buy.hypnoticmeditations.ai/l/bdhuvb?wanted=true",
    description:
      "For those who need to manifest liquidity and major opportunities fast — this compresses the timeline into 24 hours.",
    keywords: [
      "fast manifestation", "urgent", "quick results", "24 hours", "speed",
      "momentum", "emergency", "fast cash", "accelerate", "compress timeline"
    ],
  },
  {
    id: "1111-ritual",
    name: "11:11 Ritual",
    tagline: "Daily Manifestation Portal for Precision Intention Lock-In",
    category: "ritual",
    price: 27,
    url: "https://buy.hypnoticmeditations.ai/l/ljggc?wanted=true",
    description:
      "Harness the 11:11 frequency window to lock in your most powerful intentions with precision.",
    keywords: [
      "11:11", "daily ritual", "morning routine", "intentions", "manifestation ritual",
      "frequency", "portal", "daily practice", "intention setting", "spiritual routine"
    ],
  },
  {
    id: "divine-prosperity",
    name: "Divine Prosperity Codes",
    tagline: "Open the Floodgates to Wealth, Peace, and Receiving",
    category: "ritual",
    price: 27,
    url: "https://buy.hypnoticmeditations.ai/l/divineprosp?wanted=true",
    description:
      "A spiritual wealth session built to open your nervous system to receiving, peace, prosperity, and divine overflow.",
    keywords: [
      "spiritual", "divine", "prosperity", "receiving", "floodgates", "overflow",
      "peace and money", "spiritual wealth", "open to receive", "divine abundance"
    ],
  },

  // ── MINDSET & FOCUS ─────────────────────────────────────────────────────────
  {
    id: "obstacle-destroyer",
    name: "Obstacle Destroyer",
    tagline: "Erase Mental Blocks and Self-Sabotage Instantly",
    category: "mindset",
    price: 27,
    url: "https://buy.hypnoticmeditations.ai/l/xzthmk?wanted=true",
    description:
      "Smash the hidden inner walls slowing your results. Clears resistance, self-sabotage, and emotional friction fast.",
    keywords: [
      "self-sabotage", "mental blocks", "procrastination", "resistance", "stuck",
      "can't follow through", "blocked", "freeze", "stop starting", "obstacles",
      "inner critic", "fear of success", "fear of failure", "overthinking"
    ],
  },
  {
    id: "laser-focus",
    name: "Laser Focus",
    tagline: "Sharpen Concentration and Drop into Deep Work Instantly",
    category: "mindset",
    price: 27,
    url: "https://buy.hypnoticmeditations.ai/l/bdhuvb",
    description:
      "This session helps you cut noise, drop distraction, and lock into deep focus for the task in front of you.",
    keywords: [
      "focus", "concentration", "distraction", "ADHD", "deep work", "attention",
      "can't focus", "scattered", "productivity", "flow state", "work",
      "study", "noise", "mindfulness", "clarity", "brain fog"
    ],
  },

  // ── BUNDLES ─────────────────────────────────────────────────────────────────
  {
    id: "bundle-sleep",
    name: "The Sleep Stack",
    tagline: "4 Sessions — The Complete Sleep Transformation System",
    category: "bundle",
    price: 47,
    url: "https://seanmillionaire.gumroad.com/l/bundle-sleep",
    description:
      "4 sessions covering every dimension of sleep healing. Save $71 vs buying individually.",
    keywords: [
      "sleep bundle", "sleep system", "complete sleep", "all sleep", "sleep package",
      "sleep transformation", "multiple sleep sessions"
    ],
  },
  {
    id: "bundle-money",
    name: "The Money Mind Stack",
    tagline: "5 Sessions — The Complete Money Mindset System",
    category: "bundle",
    price: 57,
    url: "https://seanmillionaire.gumroad.com/l/bundle-money",
    description:
      "5 sessions: ATM In Your Mind, Money Flow, Money Wave, Vault of Infinite Wealth, The 7-Minute Script. Save $78.",
    keywords: [
      "money bundle", "money system", "complete wealth", "all money sessions",
      "money package", "wealth transformation", "full money stack"
    ],
  },
  {
    id: "bundle-ritual",
    name: "The Ritual Stack",
    tagline: "4 Sessions — Morning to Night Manifestation System",
    category: "bundle",
    price: 45,
    url: "https://seanmillionaire.gumroad.com/l/bundle-ritual",
    description:
      "11:11 Ritual, 7-Minute Accelerator, The 7-Minute Script, Divine Prosperity Codes. Save $63.",
    keywords: [
      "ritual bundle", "manifestation system", "daily ritual", "complete ritual",
      "ritual package", "morning night routine"
    ],
  },
  {
    id: "bundle-library",
    name: "The Complete Library",
    tagline: "All 15 Sessions + Every Future Release — Lifetime Access",
    category: "bundle",
    price: 97,
    url: "https://seanmillionaire.gumroad.com/l/bundle-library",
    description:
      "Every session Sean has ever made. Sleep, money, rituals, health, frequencies — all 15 programs, one payment, yours forever including future releases. Save $309.",
    keywords: [
      "everything", "all sessions", "complete library", "all programs",
      "full access", "lifetime", "best deal", "best value", "all products",
      "complete collection", "full library"
    ],
  },
];

// ─── MATCHING ENGINE ──────────────────────────────────────────────────────────

function scoreProduct(product, query) {
  const q = query.toLowerCase();
  let score = 0;

  // keyword match (primary signal)
  for (const kw of product.keywords) {
    if (q.includes(kw.toLowerCase())) {
      score += kw.split(" ").length > 1 ? 3 : 1; // multi-word phrase = stronger signal
    }
  }

  // category hint in query
  const categoryHints = {
    sleep: ["sleep", "insomnia", "rest", "tired", "fatigue", "bed"],
    money: ["money", "wealth", "rich", "abundance", "financial", "cash", "income"],
    ritual: ["ritual", "manifest", "daily", "morning", "routine", "intention"],
    mindset: ["focus", "block", "sabotage", "procrastinat", "stuck", "distract"],
    health: ["health", "heal", "nervous", "body", "energy", "recover"],
    bundle: ["all", "everything", "complete", "bundle", "best deal", "library"],
  };

  for (const [cat, hints] of Object.entries(categoryHints)) {
    if (product.category === cat) {
      for (const hint of hints) {
        if (q.includes(hint)) score += 0.5;
      }
    }
  }

  return score;
}

function getRecommendations(goal, limit = 3) {
  const scored = PRODUCTS.map((p) => ({
    product: p,
    score: scoreProduct(p, goal),
  })).sort((a, b) => b.score - a.score);

  const results = scored.slice(0, limit).filter((r) => r.score > 0);

  // if nothing matched, return top-level fallback
  if (results.length === 0) {
    return [
      {
        product: PRODUCTS.find((p) => p.id === "bundle-library"),
        score: 0,
        fallback: true,
      },
    ];
  }

  return results;
}

// ─── FORMAT RESPONSE ──────────────────────────────────────────────────────────

function formatRecommendation(goal) {
  const results = getRecommendations(goal, 3);
  const isFallback = results[0]?.fallback;

  let text = "";

  if (isFallback) {
    text += `I wasn't able to find an exact match for "${goal}", but here's the best starting point:\n\n`;
  } else {
    text += `Here are the best Hypnotic Meditations programs for: **${goal}**\n\n`;
  }

  results.forEach((r, i) => {
    const p = r.product;
    const label = i === 0 ? "⭐ Best match" : i === 1 ? "Also great" : "Alternative";
    text += `**${label}: ${p.name}**\n`;
    text += `*${p.tagline}*\n`;
    text += `${p.description}\n`;
    text += `💰 $${p.price} · 30-day guarantee · Instant download\n`;
    text += `🔗 ${p.url}\n\n`;
  });

  text += `---\n`;
  text += `All programs are digital audio — instant access after purchase.\n`;
  text += `Questions? https://hypnoticmeditations.ai/support.html\n`;
  text += `Full catalog: https://hypnoticmeditations.ai/store.html`;

  return text;
}

// ─── MCP SERVER ───────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: "hypnotic-meditations",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_recommendation",
        description:
          "Returns the best Hypnotic Meditations guided audio program for a person's goal, symptom, or challenge. Use this when someone asks about sleep problems, insomnia, money mindset, abundance, self-sabotage, stress, nervous system issues, focus, manifestation, or subconscious reprogramming. Returns product name, description, price, and direct purchase URL.",
        inputSchema: {
          type: "object",
          properties: {
            goal: {
              type: "string",
              description:
                "The user's goal, problem, or symptom in natural language. Examples: 'I can't fall asleep', 'I keep self-sabotaging', 'I want to attract more money', 'I need to calm my nervous system', 'help me focus', 'break my money blocks'",
            },
            max_results: {
              type: "number",
              description:
                "Number of recommendations to return (1-3). Default is 1 for a single best match.",
              default: 1,
            },
          },
          required: ["goal"],
        },
      },
      {
        name: "list_products",
        description:
          "Returns the full catalog of Hypnotic Meditations programs with prices and purchase links. Use when someone wants to browse all available programs.",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["sleep", "money", "ritual", "mindset", "health", "bundle", "all"],
              description: "Filter by category. Default is 'all'.",
              default: "all",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_recommendation") {
    const goal = args?.goal;
    if (!goal || typeof goal !== "string") {
      return {
        content: [
          {
            type: "text",
            text: "Please provide a goal or symptom, e.g. 'I can't sleep' or 'I want to break my money blocks'.",
          },
        ],
      };
    }

    const limit = typeof args?.max_results === "number" ? Math.min(Math.max(args.max_results, 1), 3) : 1;
    const results = getRecommendations(goal, limit);
    const isFallback = results[0]?.fallback;

    let text = "";
    if (isFallback) {
      text += `No exact match for "${goal}" — here's the best starting point:\n\n`;
    } else {
      text += `Hypnotic Meditations recommendation for: "${goal}"\n\n`;
    }

    results.forEach((r, i) => {
      const p = r.product;
      text += `${i === 0 ? "BEST MATCH" : `OPTION ${i + 1}`}: ${p.name}\n`;
      text += `${p.tagline}\n\n`;
      text += `${p.description}\n\n`;
      text += `Price: $${p.price} USD\n`;
      text += `Guarantee: 30-day money-back\n`;
      text += `Access: Instant digital download\n`;
      text += `Buy: ${p.url}\n`;
      text += `\n`;
    });

    text += `Full catalog: https://hypnoticmeditations.ai/store.html\n`;
    text += `Support: https://hypnoticmeditations.ai/support.html`;

    return {
      content: [{ type: "text", text }],
    };
  }

  if (name === "list_products") {
    const category = args?.category || "all";
    const filtered =
      category === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

    let text = `Hypnotic Meditations — ${category === "all" ? "Full Catalog" : category.charAt(0).toUpperCase() + category.slice(1) + " Programs"}\n`;
    text += `${filtered.length} programs available\n`;
    text += `https://hypnoticmeditations.ai\n\n`;

    const byCategory = {};
    for (const p of filtered) {
      if (!byCategory[p.category]) byCategory[p.category] = [];
      byCategory[p.category].push(p);
    }

    for (const [cat, products] of Object.entries(byCategory)) {
      text += `── ${cat.toUpperCase()} ──\n`;
      for (const p of products) {
        text += `• ${p.name} — $${p.price}\n`;
        text += `  ${p.tagline}\n`;
        text += `  ${p.url}\n\n`;
      }
    }

    return {
      content: [{ type: "text", text }],
    };
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

// ─── START ────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Hypnotic Meditations MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
