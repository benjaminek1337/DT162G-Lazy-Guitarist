// Importer
require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const dbRouter = require("./routes/db.js");
const spotifyRouter = require("./routes/spotify.js")
const userRouter = require("./routes/user.js")
const bodyparser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
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

//Använd CORS
// app.use(cors({origin: [
//     "http://localhost:4200",
//     "https://web.postman.co",
//     "https://lazyguitarist.great-site.net",
//     "https://lazyguitarist.herokuapp.com"
//     ], 
//     credentials: true
// }));

const ALLOWED_ORIGINS = [
    'https://lazyguitarist.herokuapp.com/',
    'http://localhost:3000'
  ]

app.all("/*", (req, res, next) => {
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Origin', "https://lazyguitarist.herokuapp.com/");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
    next();
});

// Skapa statisk sökväg KANSKE INTE BEHÖVER PGA INGEN FRONT END HÄR, KANSKE HA I NG SEN
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,"/register")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.use(session({
    name: "sid",
    resave: true,
    saveUninitialized: false,
    secret: "is/a,fakkn:scrt*TOevry1",
    cookie: {
        httpOnly: false,
        sameSite: "strict",
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
