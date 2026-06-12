# MCP Geocoder - TypeScript with Google Maps SDK

This implementation uses TypeScript and the Google Maps JavaScript client to create an MCP geocoder tool.

## Features

- Written in TypeScript for improved type safety
- Uses the official Google Maps JavaScript SDK
- Modern async/await implementation

## Setup

1. **Install dependencies**:

```bash
# Install dependencies using npm
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install
```

2. **Configure your Google Maps API key**:

```bash
# Create .env file manually
echo "GOOGLE_MAPS_API_KEY=your-api-key-here" > .env

# Or copy the example file and edit it
cp .env.example .env
```

## Usage

Run the MCP server:

```bash
# Using npm script
npm start

# Using yarn
yarn start

# Using pnpm
pnpm start

# Or run directly with tsx
npx tsx geocoder.ts
```

## Integration with MCP

To use this tool with MCP:

```bash
# Start the server in one terminal
npm start

# In another terminal, use the MCP CLI to connect to it
mcp connect stdio --source-command="npm start" --name="geocoder"
```

## How It Works

This implementation leverages the official Google Maps JavaScript client library, which provides several advantages:

1. Type-safe API interaction with TypeScript
2. Modern promise-based API
3. Strong validation and error handling

The implementation:
1. Creates a Google Maps client
2. Uses the client's geocode method to look up the address
3. Extracts location data from the response
4. Returns a standardized result format

## Error Handling

The implementation includes:
- Promise-based error handling
- Strong typing with TypeScript
- Null checking and validation of response data
