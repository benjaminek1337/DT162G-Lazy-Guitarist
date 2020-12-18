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

const dbConnectionString = (process.env.NODE_ENV === "production") 
? `mongodb+srv://${process.env.DB_CREDENTIALS}@${process.env.DB_URI}?retryWrites=true&w=majority` 
: "mongodb://localhost:27017/lazyguitarist-local";


mongoose.connect(dbConnectionString, {
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


app.all("/*", (req, res, next) => {
    res.set('Access-Control-Allow-Credentials', 'true');
    if(process.env.NODE_ENV === "production")
        res.set('Access-Control-Allow-Origin', "https://lazyguitarist.herokuapp.com/");
    else
        res.set('Access-Control-Allow-Origin', "http://localhost:4200");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
    next();
});

app.use(session({
    name: "sid",
    resave: true,
    saveUninitialized: false,
    secret: "is/a,fakkn:scrt*TOevry1",
    cookie: {
        httpOnly: false,
        sameSite: true,
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

console.log(process.env.NODE_ENV)
if(process.env.NODE_ENV === "production"){
    app.use(express.static(`${__dirname}/public`));
    app.get('*', (req, res) => {
        // res.sendFile(
        //     path.resolve(__dirname, 'public', 'index.html')
        // );
        res.sendFile("./public/index.html");
    });
}
    
// Port för anslutning
const port = process.env.PORT || 3000;
    
// Starta servern
app.listen(port, () => {
    console.log("Server running on port " + port);
});
