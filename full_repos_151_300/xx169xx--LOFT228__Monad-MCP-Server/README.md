# 🚀 Monad MCP Server

![Monad](https://img.shields.io/badge/Monad-Testnet-blue)
![Node.js](https://img.shields.io/badge/Node.js-v16+-green)
![License](https://img.shields.io/badge/License-ISC-yellow)

MCP (Monad Control Panel) server for providing detailed information about wallets in the Monad Testnet network. This project allows you to easily retrieve data about balances and tokens via API.

<p align="center">
  <img src="https://docs.monad.xyz/img/monad-logo@2x.png" alt="Monad Logo" width="200"/>
</p>

## 📋 Features

The server provides access to the following information:
- 💰 Native token balance (MONAD)
- 🪙 ERC-20 token balances
- 📊 General wallet information
- ⚠️ Token error analysis

## 🛠️ Technologies

- [Node.js](https://nodejs.org/) - Server platform
- [Express](https://expressjs.com/) - Web framework
- [ethers.js](https://docs.ethers.org/) - Blockchain interaction library
- [Monad Testnet](https://docs.monad.xyz/) - Monad test network

## ⚙️ Installation and Running

### Prerequisites

- Node.js v16 or newer
- npm or yarn
- Internet access for connecting to Monad Testnet

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/LOFT228/Monad-MCP-Server.git
cd Monad-MCP-Server

# Install dependencies
npm install

# Start the server
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## 🌐 API Endpoints

### Home Page
```
GET /
```
Returns general information about the server and available endpoints.

### Wallet Information
```
GET /wallet/:address
```
Returns complete information about the wallet, including the native token balance and all known ERC-20 tokens.

### Native Token Balance
```
GET /wallet/:address/balance
```
Returns only the native token balance (MONAD).

### Specific Token Balance
```
GET /wallet/:address/token/:tokenAddress
```
Returns information about a specific ERC-20 token in the specified wallet.

## 📝 Example Response

```json
{
  "address": "0x418bF6023b30c53072bcDcc653d6e14C20ba569F",
  "nativeBalance": {
    "symbol": "MONAD",
    "name": "Monad",
    "balance": "0.121916140766047236",
    "rawBalance": "121916140766047236",
    "decimals": 18
  },
  "tokens": [
    // List of ERC-20 tokens if they exist in the wallet
  ],
  "tokenErrors": [
    // Information about errors when trying to retrieve token data
  ]
}
```

## ⚙️ Configuration

Server settings are located in the `config.js` file. There you can change:
- Server port
- RPC URL for connecting to Monad Testnet
- List of known tokens

```javascript
module.exports = {
  PORT: 8080,
  MONAD_RPC_URL: 'https://testnet-rpc.monad.xyz/',
  TOKENS: {
    // Add real token contracts here
    'TOKEN_NAME': 'TOKEN_CONTRACT_ADDRESS'
  }
};
```

## 🔍 Project Structure

```
mcp-monad/
├── config.js           # Project configuration
├── index.js            # Main server file
├── package.json        # Dependencies and scripts
├── utils/              # Utilities
│   └── blockchain.js   # Functions for working with blockchain
└── routes/             # API routes
    └── wallet.js       # Routes for wallet operations
```

## 🔮 Future Improvements

- [ ] Add NFT token support
- [ ] Implement request caching for improved performance
- [ ] Create a web interface for displaying information
- [ ] Add functionality for wallet transaction analysis
- [ ] Implement notifications for wallet changes

## 🤝 Contributing

Contributions to the project are always welcome! If you have ideas for improvements:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push the changes (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is distributed under the ISC license. See the `LICENSE` file for more information.

## 📬 Contact

LOFT228 - [@github](https://github.com/LOFT228)

Project link: [https://github.com/LOFT228/Monad-MCP-Server](https://github.com/LOFT228/Monad-MCP-Server)

---

<p align="center">
  Created with ❤️ for the Monad community
</p> 