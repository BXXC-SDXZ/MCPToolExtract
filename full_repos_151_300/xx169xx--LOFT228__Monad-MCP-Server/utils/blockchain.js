const { ethers } = require('ethers');
const config = require('../config');

// ABI для ERC-20 токенів
const ERC20_ABI = [
  // Функція balanceOf
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  // Функція символу токена
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  },
  // Функція назви токена
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  },
  // Функція кількості десяткових знаків
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function"
  }
];

// Створення провайдера для Monad testnet
const provider = new ethers.JsonRpcProvider(config.MONAD_RPC_URL);

// Отримання балансу нативного токену (MONAD)
async function getNativeBalance(address) {
  try {
    const balance = await provider.getBalance(address);
    return {
      symbol: "MONAD",
      name: "Monad",
      balance: ethers.formatEther(balance),
      rawBalance: balance.toString(),
      decimals: 18
    };
  } catch (error) {
    console.error('Error getting native balance:', error);
    throw error;
  }
}

// Отримання балансу ERC-20 токену
async function getTokenBalance(tokenAddress, walletAddress) {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      provider
    );

    const [balance, symbol, name, decimals] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.symbol(),
      tokenContract.name(),
      tokenContract.decimals()
    ]);

    return {
      symbol,
      name,
      balance: ethers.formatUnits(balance, decimals),
      rawBalance: balance.toString(),
      decimals,
      tokenAddress
    };
  } catch (error) {
    console.error(`Error getting token balance for ${tokenAddress}:`, error);
    throw error;
  }
}

// Отримання всіх балансів гаманця
async function getWalletInfo(address) {
  try {
    // Отримання балансу нативного токену
    const nativeBalance = await getNativeBalance(address);

    // Отримання балансів всіх відомих токенів
    const tokenPromises = Object.entries(config.TOKENS).map(async ([symbol, tokenAddress]) => {
      try {
        return await getTokenBalance(tokenAddress, address);
      } catch (error) {
        console.error(`Error getting ${symbol} balance:`, error);
        // Повертаємо інформацію про помилку замість null
        return {
          symbol,
          tokenAddress,
          error: error.message || 'Unknown error',
          errorType: error.code || 'Unknown code'
        };
      }
    });

    const tokenResults = await Promise.all(tokenPromises);
    // Розділяємо на успішні результати та помилки
    const tokenBalances = tokenResults.filter(result => !result.error);
    const tokenErrors = tokenResults.filter(result => result.error);

    return {
      address,
      nativeBalance,
      tokens: tokenBalances,
      tokenErrors: tokenErrors
    };
  } catch (error) {
    console.error('Error getting wallet info:', error);
    throw error;
  }
}

module.exports = {
  provider,
  getNativeBalance,
  getTokenBalance,
  getWalletInfo
}; 