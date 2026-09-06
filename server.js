// Entry point for hosting platforms (like Render) running node server.js from root
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'server', '.env') });
require('dotenv').config();
require('./server/server.js');
