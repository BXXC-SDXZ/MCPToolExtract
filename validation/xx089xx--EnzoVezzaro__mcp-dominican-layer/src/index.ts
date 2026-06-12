// Dominican Congress Watcher - MCP Server
// Uses TypeScript and MCP SDK to provide live updates from SenadoRD and Cámara de Diputados

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import puppeteer from "puppeteer";
import axios from "axios";
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { parse as csvParse } from 'csv-parse';
import * as xlsx from 'xlsx';

// Create the MCP server
const server = new McpServer({
  name: "Dominican Congress MCP",
  version: "1.0.0"
});

// Tool: Fetch Legislative Agenda
server.tool("fetch-legislative-agenda", {
  chamber: z.enum(["senado", "diputados"]),
}, async ({ chamber }) => {
  const agenda = await crawlAgenda(chamber);
  return {
    content: [{ type: "text", text: agenda }]
  };
});

// Tool: Get Legislator Activity
server.tool("get-legislator-activity", {
  name: z.string(),
}, async ({ name }) => {
  const summary = await getLegislatorHistory(name);
  return {
    content: [{ type: "text", text: summary }]
  };
});

// Tool: Summarize Today's Legislative Activity
server.tool("summarize-today", {}, async () => {
  const summary = await summarizeTodayCongress();
  return {
    content: [{ type: "text", text: summary }]
  };
});

// Tool: New Bills
server.tool("new bills", {
  chamber: z.enum(["senado", "diputados"]),
}, async ({ chamber }) => {
  const updates = await checkNewBills(chamber);
  return {
    content: [{ type: "text", text: updates }]
  };
});

// Tool: Parse PDF
server.tool("parse-pdf", {
  pdfUrl: z.string().url()
}, async ({ pdfUrl }) => {
  try {
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const data = await pdf(response.data);
    return {
      content: [{ type: "text", text: data.text }]
    };
  } catch (error: any) {
    console.error(`Error processing PDF ${pdfUrl}: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error processing PDF: ${error.message}` }],
      isError: true
    };
  }
});

// Tool: Datos Abiertos
server.tool("datos-abiertos", {
  q: z.string().optional(),
  organization: z.string().optional(),
  tags: z.string().optional(),
  groups: z.string().optional(),
  skip: z.string().optional(),
}, async ({ q, organization, tags, groups, skip }) => {
  const url = `https://datos.gob.do/api/datasets?q=${q || ''}&organization=${organization || ''}&tags=${tags || ''}&groups=${groups || ''}&skip=${skip || ''}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
    };
  } catch (error: any) {
    console.error(`Error obteniendo datos abiertos: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error obteniendo datos abiertos: ${error.message}` }],
      isError: true
    };
  }
});

// Tool: Parse CSV
server.tool("parse-csv", {
  csvUrl: z.string().url()
}, async ({ csvUrl }) => {
  try {
    const response = await axios.get(csvUrl, { responseType: 'stream' });
    const records: any[] = [];
    const parser = response.data.pipe(csvParse({
      delimiter: ',',
      columns: true,
      skip_empty_lines: true
    }));
    for await (const record of parser) {
      records.push(record);
    }
    return {
      content: [{ type: "text", text: JSON.stringify(records, null, 2) }]
    };
  } catch (error: any) {
    console.error(`Error procesando CSV ${csvUrl}: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error procesando CSV: ${error.message}` }],
      isError: true
    };
  }
});

// Tool: Parse XLSX
server.tool("parse-xlsx", {
  xlsxUrl: z.string().url()
}, async ({ xlsxUrl }) => {
  try {
    const response = await axios.get(xlsxUrl, { responseType: 'arraybuffer' });
    const workbook = xlsx.read(response.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    return {
      content: [{ type: "text", text: JSON.stringify(jsonData, null, 2) }]
    };
  } catch (error: any) {
    console.error(`Error procesando XLSX ${xlsxUrl}: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error procesando XLSX: ${error.message}` }],
      isError: true
    };
  }
});

// Resource: Daily Bulletin
server.resource(
  "daily-bulletin",
  new ResourceTemplate("bulletin://{date}", { list: undefined }),
  async (uri, { date }) => {
    const bulletin = await getCongressBulletin(date as string);
    return {
      contents: [{
        uri: uri.href,
        text: bulletin,
      }],
    };
  }
);

// --- Implementation Helpers ---

async function crawlAgenda(chamber: string): Promise<string> {
  const baseUrl = chamber === "senate"
    ? "https://www.senadord.gob.do/orden-del-dia/"
    : "https://camaradediputados.gob.do/ordenes-del-dia-del-pleno/";

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle0' }); // Wait for network activity to cease

  // Get main page text
  await page.evaluate(() => document.body.innerHTML);

  // Find PDF links
  const pdfLinks = await page.$$eval('a.wpfd_downloadlink', (links, pageUrl) =>
    links.map(link => ({
      href: new URL(link.getAttribute('href') || '', pageUrl).href, // Resolve relative URLs
      name: link.textContent?.trim() || link.getAttribute('href')?.split('/').pop() || 'unknown.pdf' // Get name from text or filename
    })), baseUrl); // Pass baseUrl to resolve relative URLs correctly

  let mainText = await page.evaluate(() => document.body.innerText);

  await browser.close();

  const combinedText = `Resume la agenda legislativa del siguiente texto extraído del sitio web del congreso (${chamber}).  The following PDFs were found, please parse them using the parse-pdf tool:\n${pdfLinks.map(link => link.href).join('\n')}\n\n${mainText}`;
  return combinedText;
}


async function getLegislatorHistory(name: string): Promise<string> {
  const url = `https://www.camaradediputados.gob.do/\nhttps://www.senadord.gob.do/`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  const text = await page.evaluate(() => document.body.innerText);
  await browser.close();

  return `Busca toda la información sobre la actividad reciente del legislador o legisladora llamado/a ${name} y resumenla de forma clara y cronológica:\n\n${text}`;
}

async function summarizeTodayCongress(): Promise<string> {
  const senate = await crawlAgenda("senate");
  const deputies = await crawlAgenda("deputies");

  const fullText = `Agenda Senado:\n${senate}\n\nAgenda Diputados:\n${deputies}`;
  return `Resume el trabajo legislativo del día a partir del siguiente texto combinado del Senado y Cámara de Diputados:\n\n${fullText}`;
}

async function checkNewBills(chamber: string): Promise<string> {
  const baseUrl = chamber === "senate"
    ? "http://www.senado.gov.do/wfilemaster/lista_expedientes.aspx?coleccion=53"
    : "https://camaradediputados.gob.do/";

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'accept-encoding': 'gzip, deflate',
      'accept-language': 'en-GB,en;q=0.8',
      'cache-control': 'no-cache',
      'connection': 'keep-alive',
      'host': 'www.senado.gov.do',
      'pragma': 'no-cache',
      'sec-gpc': '1',
      'upgrade-insecure-requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
    });

    await page.goto(baseUrl);
    const text = await page.evaluate(() => document.body.innerText);
    await browser.close();

    return `Busca y resume cualquier propuesta de ley nueva publicada recientemente en el siguiente texto:\n\n${text}`;
  } catch (error: any) {
    console.error(`Error obteniendo nuevas leyes: ${error.message}`);
    return `Error obteniendo nuevas leyes: ${error.message}`;
  }
}

async function getCongressBulletin(date: string): Promise<string> {
  const url = `https://www.senadord.gob.do/orden-del-dia/`; // Placeholder
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  const text = await page.evaluate(() => document.body.innerText);
  await browser.close();

  return `Extrae y resume el boletín legislativo del día ${date} del siguiente contenido web:\n\n${text}`;
}

const PORT = process.env.PORT || 8089;
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.log(`Dominican Congress MCP server running on port ${PORT}`);
});

export default server;
