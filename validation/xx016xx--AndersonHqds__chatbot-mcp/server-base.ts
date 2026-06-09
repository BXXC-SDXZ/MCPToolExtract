import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import InMemoryAccountsSingleton from "./in-memory-accounts";

function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let rest = 11 - (sum % 11);
  let digit1 = rest > 9 ? 0 : rest;
  if (digit1 !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  rest = 11 - (sum % 11);
  let digit2 = rest > 9 ? 0 : rest;
  if (digit2 !== parseInt(cpf.charAt(10))) return false;

  return true;
}

const CPFSchema = z.string()
  .min(11, 'CPF deve ter 11 dígitos')
  .max(14, 'CPF deve ter no máximo 14 caracteres')
  .refine((cpf) => isValidCPF(cpf), {
    message: 'CPF inválido'
  })

const createServer = () => {
    const server = new McpServer({
        name: "Demo",
        version: "1.0.0"
    });
  
  server.tool("realizar_recarga",
    { valor: z.number(), cpf_do_colaborador: CPFSchema, operation: z.enum(["add", "subtract"]) },
    async ({ valor, cpf_do_colaborador, operation }) =>  {
      console.log("Performing addition");
      const inMemoryAccounts = InMemoryAccountsSingleton.getInstance();
      inMemoryAccounts.setAccount(cpf_do_colaborador, valor, operation);
      const accountValue = inMemoryAccounts.getAccountValue(cpf_do_colaborador);
      return {
      content: [{ type: "text", text: "O saldo do colaborador com CPF " + cpf_do_colaborador + " é de R$ " + accountValue }]
    }
  }
  );
  
  server.resource(
    "greeting",
    new ResourceTemplate("greeting://{name}", { list: undefined }),
    async (uri, { name }) => ({
      contents: [{
        uri: uri.href,
        text: `Hello, ${name}!`
      }]
    })
  );

  return {server};
}

export default createServer;


