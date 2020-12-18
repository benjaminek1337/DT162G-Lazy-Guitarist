// Importer
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const dbRouter = require("./routes/db.js");
const spotifyRouter = require("./routes/spotify.js")
const userRouter = require("./routes/user.js")
const bodyparser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const mongostore = require("connect-mongo")(session);
const proxy = require("http-proxy-middleware");

mongoose.connect(`mongodb+srv://${process.env.DB_CREDENTIALS}@${process.env.DB_URI}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useCreateIndex: true, 
    useUnifiedTopology: true 
});

const proxyOptions = {
    target: "https://lazyguitarist.herokuapp.com",
    changeOrigin: true,
    secure: true
};

const appProxy = proxy(proxyOptions);
// Instansera express
const app = express();

// Använd bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.set('trust proxy', 1)

//Använd CORS
app.use(cors({origin: [
    "http://localhost:4200",
    "https://web.postman.co",
    "https://lazyguitarist.great-site.net"
    // Lägg till webbhosten sen
    ], 
    credentials: true
}));

// Skapa statisk sökväg KANSKE INTE BEHÖVER PGA INGEN FRONT END HÄR, KANSKE HA I NG SEN
// app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    name: "sid",
    resave: true,
    saveUninitialized: false,
    secret: "is/a,fakkn:scrt*TOevry1",
    cookie: {
        httpOnly: false,
        sameSite: "none",
        secure: process.env.NODE_ENV === "production"
    },
    store: new mongostore({
        mongooseConnection: mongoose.connection
    })
}));

app.use("/api", appProxy)

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
