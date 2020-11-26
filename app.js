// Importer
const express = require("express");
const path = require("path");
const dbRouter = require("./routes/db.js");
const spotifyRouter = require("./routes/spotify.js")
const bodyparser = require("body-parser");
const cors = require("cors");
const cookieparser = require("cookie-parser");
const fetch = require("node-fetch");
    
// Instansera express
const app = express();

// Använd bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Använd CORS
app.use(cors());

// Använd Cookie-parser
app.use(cookieparser());
    
// Skapa statisk sökväg
app.use(express.static(path.join(__dirname, 'public')));

// Använd router
app.use("/api/db", dbRouter);
app.use("/api/spotify", spotifyRouter);
    
// Port för anslutning
const port = process.env.PORT || 3000;
    
// Starta servern
app.listen(port, () => {
    console.log("Server running on port " + port);
});
