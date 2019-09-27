const express = require('express');
const app = express();

// this is good to use for Heroku deployment to get the port
const PORT = process.env.PORT || 5000;

// just a test route for now
app.get('/', (req, res) => res.send('API running'));


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));