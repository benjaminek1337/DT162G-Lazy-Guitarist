// Importer
const express = require("express");
const session = require("express-session");
const path = require("path");
const dbRouter = require("./routes/db.js");
const spotifyRouter = require("./routes/spotify.js")
const userRouter = require("./routes/user.js")
const bodyparser = require("body-parser");
const cors = require("cors");
//const cookieparser = require("cookie-parser");
const fetch = require("node-fetch");
    
// Instansera express
const app = express();

// Använd bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Använd CORS
app.use(cors({origin: [
    "http://localhost:4200"
    ], credentials: true
}));

// Använd Cookie-parser
//app.use(cookieparser());
    
// Skapa statisk sökväg
app.use(express.static(path.join(__dirname, 'public')));

// const {
//     NODE_ENV = "development",
//     SESS_NAME = "sid",
//     SESS_SECRET = "is/a,fakkn:scrt*TOevry1"
// } = process.env
const NODE_ENV = "development";
const IN_PROD = NODE_ENV === "production"

app.use(session({
    name: "sid",
    resave: false,
    saveUninitialized: false,
    secret: "is/a,fakkn:scrt*TOevry1",
    cookie: {
        httpOnly: false,
        sameSite: true,
        secure: IN_PROD
    }
}));
// Använd router
app.use("/api/db", dbRouter);
app.use("/api/spotify", spotifyRouter);
app.use("/api/user", userRouter);
    
// Port för anslutning
const port = process.env.PORT || 3000;



    
// Starta servern
app.listen(port, () => {
    console.log("Server running on port " + port);
});
