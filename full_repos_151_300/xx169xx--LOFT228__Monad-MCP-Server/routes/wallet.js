const express = require('express');
const { getWalletInfo, getNativeBalance, getTokenBalance } = require('../utils/blockchain');
const router = express.Router();

// Отримання всієї інформації про гаманець
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Перевірка чи адреса валідна
    if (!address || address.length < 42) {
      return res.status(400).json({ 
        error: 'Invalid address',
        message: 'Please provide a valid Monad address'
      });
    }

    const walletInfo = await getWalletInfo(address);
    res.json(walletInfo);
  } catch (error) {
    console.error('Error in wallet info endpoint:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
});

// Отримання тільки баланса нативного токену
router.get('/:address/balance', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address || address.length < 42) {
      return res.status(400).json({ 
        error: 'Invalid address',
        message: 'Please provide a valid Monad address'
      });
    }

    const balance = await getNativeBalance(address);
    res.json(balance);
  } catch (error) {
    console.error('Error in native balance endpoint:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
});

// Отримання баланса конкретного токена
router.get('/:address/token/:tokenAddress', async (req, res) => {
  try {
    const { address, tokenAddress } = req.params;
    
    if (!address || address.length < 42 || !tokenAddress || tokenAddress.length < 42) {
      return res.status(400).json({ 
        error: 'Invalid parameters',
        message: 'Please provide valid Monad addresses'
      });
    }

    const tokenInfo = await getTokenBalance(tokenAddress, address);
    res.json(tokenInfo);
  } catch (error) {
    console.error('Error in token balance endpoint:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
});

module.exports = router; 