/**
 * MCP Server - Main Entry Point
 */

// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const winston = require('winston');
const socketIO = require('socket.io');
const http = require('http');

// Load environment variables
dotenv.config();

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mcp')
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MCP Server', version: '0.1.0' });
});

// API routes
app.use('/api/services', require('./routes/services'));
app.use('/api/auth', require('./routes/auth'));

// WebSocket handling
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);
  
  socket.on('register', (data) => {
    // Handle service registration
    logger.info('Service registered:', data);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err.message);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`MCP Server running on port ${PORT}`);
});

module.exports = { app, server };