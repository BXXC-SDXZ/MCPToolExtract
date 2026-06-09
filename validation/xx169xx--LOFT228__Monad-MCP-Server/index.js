const express = require('express');
const cors = require('cors');
const config = require('./config');
const walletRoutes = require('./routes/wallet');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Базовий маршрут для перевірки роботи сервера
app.get('/', (req, res) => {
  res.json({
    message: 'Monad MCP Server is running',
    endpoints: {
      walletInfo: '/wallet/:address',
      nativeBalance: '/wallet/:address/balance',
      tokenBalance: '/wallet/:address/token/:tokenAddress'
    }
  });
});

// Реєстрація маршрутів
app.use('/wallet', walletRoutes);

// Обробка 404 помилок
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested endpoint does not exist' 
  });
});

// Обробка помилок
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Server error',
    message: err.message || 'Something went wrong' 
  });
});

// Запуск сервера
const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Monad MCP server running on port ${PORT}`);
  console.log(`RPC URL: ${config.MONAD_RPC_URL}`);
}); 