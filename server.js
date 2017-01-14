
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envConfigPath = path.join(__dirname, 'env.config');
if (fs.existsSync(envConfigPath)) {
  dotenv.config({
    path: envConfigPath,
  });
}

if (process.env.NODE_ENV === 'production') {
  require('oneapm');
}

module.exports = require('./build');
