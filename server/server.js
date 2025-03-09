// server.js

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Import your login router
// Since login.js is in a routes folder, use ./routes/login
const loginRouter = require('./routes/login');

app.use(express.json());

// Mount the login router under a path, e.g. '/auth'
app.use('/auth', loginRouter);

app.get('/', (req, res) => {
  res.send('Hello from the main server route!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});