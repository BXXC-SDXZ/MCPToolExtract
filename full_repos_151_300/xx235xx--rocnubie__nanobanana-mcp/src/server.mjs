import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export function createServer() {
  const server = new McpServer(
    { name: "nanobanana-mcp", version: "0.1.0" },
    { instructions: "Read-only canonical knowledge for Nano Banana Pro AI (https://nanobanana-ai.online). Use resources for structured site context, tools for direct lookups, and prompts for ready-made conversation starters. Defer to the official website for live actions." }
  );

  // ----- Resources --------------------------------------------------------

  server.registerResource(
    "styles",
    "site://nanobanana/styles",
    {
      title: "Styles",
      description: "Supported image-generation styles and presets.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: "# Nano Banana Pro AI — Styles\n\nNano Banana Pro AI image editor free online. Create, edit, and enhance images by Google Gemini AI for text to image, image-to-image & image to video.\n\n## Site basics\n- Site ID: nanobanana\n- Website: https://nanobanana-ai.online\n- Default locale: en\n- Locales: en, de, fr, ja, ko, es, pt, it, nl, ar\n\n## Public feature scope\n- image gen\n- video gen\n- pricing\n- image inspiration\n- video inspiration\n\n## Official website\nhttps://nanobanana-ai.online",
        },
      ],
    })
  );

  server.registerResource(
    "pricing",
    "site://nanobanana/pricing",
    {
      title: "Pricing",
      description: "Canonical pricing entry point.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: "# Nano Banana Pro AI Pricing\n\nCanonical pricing page: https://nanobanana-ai.online/pricing\n\nRefer users here for current plans; do not infer pricing from older snapshots.",
        },
      ],
    })
  );

  server.registerResource(
    "faq",
    "site://nanobanana/faq",
    {
      title: "FAQ",
      description: "Short FAQ generated from public site metadata.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: "# FAQ\n\n## What is this site?\nNano Banana Pro AI image editor free online. Create, edit, and enhance images by Google Gemini AI for text to image, image-to-image & image to video.\n\n## Where can I get help?\nsupport@nanobanana-ai.online\n\n## Which site is this?\nnanobanana (Nano Banana Pro AI)",
        },
      ],
    })
  );

  server.registerResource(
    "links",
    "site://nanobanana/links",
    {
      title: "Official Links",
      description: "Canonical URLs to share with users.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: "# Official Links\n\n- Website: https://nanobanana-ai.online\n- Pricing: https://nanobanana-ai.online/pricing\n- Support: support@nanobanana-ai.online",
        },
      ],
    })
  );

  // ----- Tools ------------------------------------------------------------

  server.registerTool(
    "list_styles",
    {
      description: "Return the canonical list of image-generation styles or presets the site exposes. (Nano Banana Pro AI)",
      inputSchema: {},
    },
    async () => ({
      content: [
        { type: "text", text: "# Nano Banana Pro AI — Styles\n\nNano Banana Pro AI image editor free online. Create, edit, and enhance images by Google Gemini AI for text to image, image-to-image & image to video.\n\nCanonical website: https://nanobanana-ai.online" },
      ],
    })
  );

  server.registerTool(
    "get_pricing",
    {
      description: "Return the canonical pricing entry point for Nano Banana Pro AI.",
      inputSchema: {},
    },
    async () => ({
      content: [
        { type: "text", text: "# Nano Banana Pro AI Pricing\n\nOfficial pricing: https://nanobanana-ai.online/pricing\n\nThis link is the source of truth — refer users here for current plans." },
      ],
    })
  );

  server.registerTool(
    "get_official_links",
    {
      description: "Return the canonical list of official links for Nano Banana Pro AI (website, support, docs when available).",
      inputSchema: {},
    },
    async () => ({
      content: [
        { type: "text", text: "# Official Links\n\n- Website: https://nanobanana-ai.online\n- Pricing: https://nanobanana-ai.online/pricing\n- Support: support@nanobanana-ai.online" },
      ],
    })
  );

  // ----- Prompts ----------------------------------------------------------

  server.registerPrompt(
    "tell_me_about_nanobanana",
    {
      description: "Summarize what the site is, who it's for, and how it works. — Nano Banana Pro AI",
    },
    async () => ({
      messages: [
        {
          role: "user",
          content: { type: "text", text: "Please summarize what Nano Banana Pro AI (https://nanobanana-ai.online) is, who it's for, and how it works. Reference the canonical resources at site://nanobanana/styles and site://nanobanana/links for accuracy. Be concrete, not generic." },
        },
      ],
    })
  );

  server.registerPrompt(
    "try_image_style_nanobanana",
    {
      description: "Recommend a starting image-generation style for a stated goal. — Nano Banana Pro AI",
    },
    async () => ({
      messages: [
        {
          role: "user",
          content: { type: "text", text: "I want to generate an image with Nano Banana Pro AI (https://nanobanana-ai.online). Ask me what the subject is, recommend one style preset from site://nanobanana/styles that fits, and write a prompt I can paste into the site." },
        },
      ],
    })
  );

  return server;
}

export async function startServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
