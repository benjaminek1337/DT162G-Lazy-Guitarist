const { response } = require("express");
const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const credentials = require("../data/credentials.json");

const spotifyApi = new SpotifyWebApi({
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
    redirectUri: credentials.localhost3000callback
});

// Client Credential grejs, servern autenticerar sig mot spotify då det behövs.
// Får en access token
const authenticate = async() => {
    await spotifyApi.clientCredentialsGrant()
    .then((data) => {
        spotifyApi.setAccessToken(data.body['access_token']);
        console.log("Authenticated");
    }),
    (err) => {
        console.log("Sumtin done goofed... error: " + err);
    }
}

// Authorization Code grejs
let originalUrl;
router.get("/auth", (req, res) => {
    originalUrl = req.query.url;
    const scopes = ["streaming", "user-read-email", "user-read-private", "user-modify-playback-state"];
    const authUrl = spotifyApi.createAuthorizeURL(scopes)
    res.redirect(authUrl);
});

router.get("/callback", (req, res) => {
    const code = req.query.code

    spotifyApi.authorizationCodeGrant(code)
    .then((data) => {
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);
        console.log("User authenticated with access code: " + spotifyApi.getAccessToken());
        res
            .status(201)
            .cookie("access_token", spotifyApi.getAccessToken(), {
                expires: new Date(Date.now() + 1 * 3600000)
            })
            .redirect((originalUrl != undefined) ? "/" + originalUrl : "/");
            originalUrl = "";
        }
    ), (err) => {
        console.log(err);
    }
});

// Alla calls kollar efter en access token först, finns den inte körs autenticerare. Sen söka
// mot spotify, returnera outputen

// Sök artist och spår från artist
router.get("/artist=:artist&track=:track", async (req, res) => {
    if(!spotifyApi.getAccessToken()){
        await authenticate();
    }
    let output;
    spotifyApi.searchTracks(`track:${req.params.track} artist:${req.params.artist}`)
    .then((data) => {
        output = data.body;
        console.log(data.body);
        res.send(output);
    }, (err) => {
        console.log('Something went wrong!', err);
    });
    
});

// Sök spår med titel
router.get("/track=:track", async (req, res) => {
    if(!spotifyApi.getAccessToken()){
        await authenticate();
    }
    try { 
        const track = req.params.track;
        spotifyApi.searchTracks(track, {limit : 5})
        .then((data) => {
            console.log("Searched for: " + track);
            res.send(data.body);
        }, (err) => {
            console.log('Something went wrong!', err);
        });
    } catch (error) {
        console.log(error);
    }
});

// Sök artist
router.get("/artist=:artist", async (req, res) => {
    if(!spotifyApi.getAccessToken()){
        await authenticate();
    }
    try {
        const artist = req.params.artist;
        spotifyApi.searchArtists(artist, {limit : 3})
        .then((data) => {
            console.log("Searched for: " + artist);
            res.send(data.body);
        }, (err) => {
            console.log('Something went wrong!', err);
        });     
    } catch (error) {
        console.log(error);
    }
});

router.get("/trackUri=:uri", async (req, res) => {
    if(!spotifyApi.getAccessToken()){
        await authenticate();
    }
    try {
        const uri = req.params.uri;
        spotifyApi.getTrack(uri)
        .then((data) => {
            console.log("Searched for: " + uri);
            res.send(data.body);
        }, (err) => {
            console.log('Something went wrong!', err);
        });   
    } catch (error) {
        console.log(error);
    }

});


module.exports = router;