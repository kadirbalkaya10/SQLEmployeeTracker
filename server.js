//DEPENDENCIES
const express = require("express");
const renderApp = require("./lib/inquirerQuestions");
// We'll be creating a Connection Pool
const db = require("./lib/db");

// PORT \ APP

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//ROUTES
//Api Routes
renderApp();
//START APP
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
