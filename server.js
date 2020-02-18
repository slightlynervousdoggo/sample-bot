require('dotenv').config()

const startBot = require('./bot')
const connectDB = require('./config/db')

// Connect Database
connectDB();

// Start the bot
startBot();