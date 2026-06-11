# Chatbot MCP

Um chatbot inteligente que utiliza o Model Context Protocol (MCP) para processar requisições e realizar operações, com suporte a validação de CPF e operações de recarga.

## 🚀 Funcionalidades

- Processamento de linguagem natural usando GPT-4
- Validação robusta de CPF
- Sistema de recarga com operações de adição e subtração
- Interface via linha de comando
- API REST com suporte a MCP

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Chave de API do OpenAI

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd chatbot-mcp
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com sua chave da OpenAI:
```env
OPENAI_API_KEY=sua-chave-aqui
```

## 🚀 Como Executar

1. Inicie o servidor:
```bash
npx ts-node server.ts
```

2. Em outro terminal, inicie o cliente:
```bash
npx ts-node index.ts
```

## 💻 Uso

O chatbot suporta os seguintes comandos:

- Realizar recarga: "Realizar uma recarga de R$50 para o CPF 123.456.789-09"
- Realizar débito: "Realize um débito de x valor para o cpf y"
- Lembrando que você pode escolher as palavras, trocar débito por "Tire x valor do cpf y" etc...
### Exemplos de Uso

```bash
Query: Realizar uma recarga de R$50 para o CPF 123.456.789-09
Resposta: O saldo do colaborador com CPF 123.456.789-09 é de R$ 50
```

## 🛠️ Tecnologias Utilizadas

- TypeScript
- Express.js
- OpenAI GPT-4
- Model Context Protocol (MCP)
- Zod para validação
- CORS para segurança

## 📝 Estrutura do Projeto

```
chatbot-mcp/
├── src/
│   ├── index.ts          # Cliente MCP
│   ├── server.ts         # Servidor Express
│   ├── server-base.ts    # Configuração do servidor MCP
│   └── in-memory-accounts.ts # Gerenciamento de contas
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Validação de CPF

O sistema inclui uma validação robusta de CPF que:
- Aceita CPFs com ou sem formatação (123.456.789-09 ou 12345678909)
- Verifica o tamanho correto (11 dígitos)
- Valida os dígitos verificadores
- Rejeita CPFs com todos os dígitos iguais

## 📄 Licença

Este projeto está sob a licença ISC. 