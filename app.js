// Importer
const express = require("express");
const path = require("path");
const apiRouter = require("./routes/api.js");
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
//app.use("/api", apiRouter);
    
// Port för anslutning
const port = process.env.PORT || 3000;
    
// Starta servern
app.listen(port, () => {
    console.log("Server running on port " + port);
});

//TEST
const SpotifyWebApi = require("spotify-web-api-node");
const credentials = require("./data/credentials.json");
const scopes = ['user-read-private', 'user-read-email'];
const state = 'some-state-of-my-choice';

const spotifyApi = new SpotifyWebApi({
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
    redirectUri: "http://localhost:3000/callback"
});

app.get("/auth", (req, res) => {
    const authUrl = spotifyApi.createAuthorizeURL(scopes, state)
    res.redirect(authUrl);
});

let savedurl;
app.get("/artist", async (req, res) => {
    if(!spotifyApi.getAccessToken()){
        savedurl = "/artist";
        return res.redirect("/auth");
    }
    let output;
    spotifyApi.searchTracks('track:Suffer artist:Bad Religion')
    .then(function(data) {
        output = data.body.tracks;
        console.log(data.body);
    }, function(err) {
        console.log('Something went wrong!', err);
    });
    res.json(output);
});

app.get("/callback", (req, res) => {
    const code = req.query.code

    spotifyApi.authorizationCodeGrant(code).then((data) => {
        console.log('The token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);
        console.log('The refresh token is ' + data.body['refresh_token']);
        
        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);
        }
    );
    setTimeout(() => {res.redirect(savedurl)}, 100);
});





// spotifyApi.refreshAccessToken().then(
// function(data) {
//     console.log('The access token has been refreshed!');

//     // Save the access token so that it's used in future calls
//     spotifyApi.setAccessToken(data.body['access_token']);
// },
// function(err) {
//     console.log('Could not refresh access token', err);
// }
// );




