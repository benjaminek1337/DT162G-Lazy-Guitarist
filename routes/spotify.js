const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const credentials = require("../data/credentials.json");

const spotifyApi = new SpotifyWebApi({
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret
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
        spotifyApi.searchTracks(track)
        .then((data) => {
            console.log(data.body);
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
        spotifyApi.searchTracks(req.params.artist)
        .then((data) => {
            console.log(data.body);
            res.send(data.body);
        }, (err) => {
            console.log('Something went wrong!', err);
        });     
    } catch (error) {
        console.log(error);
    }
    
});

// Authorization Code grejs, lär nog inte använda. TODO isf - callback url, scope och state

router.get("/auth", (req, res) => {
    const authUrl = spotifyApi.createAuthorizeURL(scopes, state)
    res.redirect(authUrl);
});

router.get("/callback", (req, res) => {
    const code = req.query.code

    spotifyApi.authorizationCodeGrant(code)
    .then((data) => {
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);
        console.log("Authenticated");
        }
    ), (err) => {
        console.log(err);
        return redirect("https://www.youtube.com/watch?v=MK6TXMsvgQg");
    }
    setTimeout(() => {res.redirect(savedurl)}, 200);
});



module.exports = router;