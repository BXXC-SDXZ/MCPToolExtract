import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import dotenv from 'dotenv';
import { ProductByHandleRequest } from "./@types/index.js";


// Carrega as variáveis de ambiente
dotenv.config();

const shop = process.env.SHOPIFY_SHOP;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN;

if (!shop || !storefrontToken) {
  throw new Error('Variáveis de ambiente SHOPIFY_SHOP e SHOPIFY_STOREFRONT_TOKEN são obrigatórias');
}

// Create server instance
const server = new McpServer({
  name: "products-info",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Helper function for making NWS API requests
async function makeShopifyRequest<T>({shop, storefrontToken, query}:{
  shop: string;
  storefrontToken: string;
  query: string
}): Promise<T | null> {
  const headers = {
    Accept: "application/json",
    'X-Shopify-Access-Token': storefrontToken
  };

  try {
    const response = await axios.post(`https://${shop}/admin/api/2025-04/graphql.json`, { query }, { headers });
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data?.data;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

server.tool(
  "get-products",
  "Get products info",
  async () => {
    const query = `
      query {
    productByHandle(handle: "supercoffee-chocolate-lingua-de-gato-classic-size") {
      id
      handle
      title
      productType
      description
      vendor
      priceRangeV2 {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
    `

    const response = await makeShopifyRequest<ProductByHandleRequest>({query, shop, storefrontToken})

    if (!response) {
      throw new Error("Failed to fetch product data");
    }

    return {
      content: [
        {
          type: "text",
          text: `Produto: ${response.productByHandle.title}`,
        },
        {
          type: "text",
          text: `Descrição: ${response.productByHandle.description}`,
        },
        {
          type: "text",
          text: `Preço: ${response.productByHandle.priceRangeV2.minVariantPrice.amount} ${response.productByHandle.priceRangeV2.minVariantPrice.currencyCode}`,
        },
        {
          type: "text",
          text: `Fornecedor: ${response.productByHandle.vendor}`,
        }
      ]
    }
  },
);



async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
