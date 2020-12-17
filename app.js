// Importer
if(process.env.NODE_ENV !== "production"){
    const dotenv = require("dotenv");
    dotenv.config();
    console.log(process.env.NODE_ENV, process.env.CLIENT_SECRET)
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

mongoose.connect(`mongodb+srv://${process.env.MONGO_CREDENTIALS}@${process.env.MONGO_URI}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useCreateIndex: true, 
    useUnifiedTopology: true 
});
    
// Instansera express
const app = express();

// Använd bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Använd CORS
app.use(cors({origin: [
    "http://localhost:4200",
    "https://web.postman.co"
    // Lägg till heroku!!!
    ], credentials: true
}));

// Skapa statisk sökväg KANSKE INTE BEHÖVER PGA INGEN FRONT END HÄR, KANSKE HA I NG SEN
app.use(express.static(path.join(__dirname, 'public')));

const {
    NODE_ENV = "development",
} = process.env

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
