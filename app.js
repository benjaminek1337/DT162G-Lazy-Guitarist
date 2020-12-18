// Importer
const dotenv = require("dotenv");
dotenv.config();
if(process.env.NODE_ENV !== "production"){
    // User needs to create own .env file, containing stuffz
}
const express = require("express");
const session = require("express-session");
const path = require("path");
const dbRouter = require("./routes/db.js");
const spotifyRouter = require("./routes/spotify.js")
const userRouter = require("./routes/user.js")
const bodyparser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const { strict } = require("assert");
const mongostore = require("connect-mongo")(session);

mongoose.connect(`mongodb+srv://${process.env.DB_CREDENTIALS}@${process.env.DB_URI}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useCreateIndex: true, 
    useUnifiedTopology: true 
});
    
// Instansera express
const app = express();

// Använd bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.set('trust proxy', 1)
// Använd CORS
app.use(cors({origin: [
    "http://localhost:4200",
    "https://web.postman.co",
    "https://lazyguitarist.great-site.net"
    // Lägg till webbhosten sen
    ], credentials: true
}));

// Skapa statisk sökväg KANSKE INTE BEHÖVER PGA INGEN FRONT END HÄR, KANSKE HA I NG SEN
// app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    name: "sid",
    resave: false,
    saveUninitialized: false,
    secret: "is/a,fakkn:scrt*TOevry1",
    cookie: {
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV === "production"
    },
    store: new mongostore({
        mongooseConnection: mongoose.connection
    })
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
