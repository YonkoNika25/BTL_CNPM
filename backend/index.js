// backend/src/index.js
require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/db'); // Để test connection


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});