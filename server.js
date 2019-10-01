const express = require('express');
const connectDB = require('./config/db');
const app = express();

// this is good to use for Heroku deployment to get the port
const PORT = process.env.PORT || 5000;

// connect to database (from db.js)
connectDB();

// initialize middleware
// we used to have to install body-parser, but now it is a built-in middleware 
// function of express! It parses incoming JSON payloads
app.use(express.json({ extended: false }));

// just a test route for now
app.get('/', (req, res) => res.send('API running'));

// define routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/users', require('./routes/api/users'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));