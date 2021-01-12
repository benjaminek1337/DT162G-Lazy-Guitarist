const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const Playlists = require("../models/playlists.js")

const spotifyApi = new SpotifyWebApi({ // Skapar ett spotify-webAPI objekt
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.LOCALHOST_3000_CALLBACK
});


// Client Credential grejs, servern autenticerar sig mot spotify då det behövs.
// Får en access token
const authenticate = async() => {
    try {
        await spotifyApi.clientCredentialsGrant()
        .then((data) => {
            spotifyApi.setAccessToken(data.body['access_token']);
            console.log("Authenticated");
        }),
        (err) => {
            console.log("Sumtin done goofed... error: " + err);
        }
    } catch (error) {
        console.log("Spotify auth failed: Error: " + error);
    }
}

// Authorization Code grejs
// FUNKARE MED res.locals i USER så ersätt localurl mot nått liknande
let originalUrl;
router.get("/auth", (req, res) => {
    //req.session.redirecturl = req.query.url;
    originalUrl = req.query.url;
    const scopes = ["streaming", "user-read-email", "user-read-private", "user-modify-playback-state"];
    const authUrl = spotifyApi.createAuthorizeURL(scopes)
    res.redirect(authUrl);
});

// Får en authkod från spotify, skapar en cookie och skickar den till klient
router.get("/callback", (req, res) => {
    //console.log(req.session.redirecturl)
    const code = req.query.code;
    const error = req.query.error;
    if(!error){
        spotifyApi.authorizationCodeGrant(code)
        .then((data) => {
                console.log("User authenticated with access code: " + data.body['access_token']);
                res
                .status(201)
                .cookie("access_token", data.body['access_token'], {
                    expires: new Date(Date.now() + 1 * 3600000)
                })
                .redirect((originalUrl != undefined) ? originalUrl : "/");
                originalUrl = "";
            }
        ), (err) => {
            console.log(err);
        }
    } else {
        console.log("Authentication not approved")
        res.status(401).redirect((originalUrl != undefined) ? originalUrl : "/")
        originalUrl = "";
    }
});

let interval;

authenticate();
clearInterval(interval);
interval = setInterval(() => { // Intervall som refreshar serverns authentication token mot spotify strax innan den går ut
    authenticate();
}, 3550000)

// Alla calls kollar efter en access token först, finns den inte körs autenticerare. Sen söka
// mot spotifys API, returnera outputen

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

// Hämta ett spår baserat på id
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

// Hämta spellista från spotify genom spellistans Id
router.get("/playlist=:id", async (req, res) => {
    if(!spotifyApi.getAccessToken()){
        await authenticate();
    }
    try {
        const id = req.params.id;
        spotifyApi.getPlaylist(id)
        .then((data) => {
            console.log("Retrieved playlist from id: " + id);
            res.send(data.body);
        }, (err) => {
            console.log('Something went wrong!', err);
        });   
    } catch (error) {
        console.log(error);
    }
}),

// Spara spellista till DB
// Kommer att implementeras senare
router.post("/db-playlist", async (req, res) => {
    const { playlistId, name } = req.body;
    const playlist = new Playlists();
    try {
        playlist.playlistId = playlistId;
        playlist.name = name;
        playlist.save();
        console.log("Playlist saved");
        res.status(200).send("Playlist saved");
    } catch (error) {
        res.status(500).send();
    }
});

// Hämta en spellista från DB baserat på ID
router.get("/db-playlist=:id", async (req, res) => {
    const id = req.params.id;
    try {
        const playlist = await Playlists.findOne({ playlistId: id }).exec();
        res.status(200).json(playlist);
    } catch (error) {
        res.status(500).send();
    }
});

// Hämta alla spellistor från DB
// Kommer att implementeras senare
router.get("db-playlists", (req, res) => {
    try {
        Playlists.find((err, Playlists) => {
            if(err){
                return res.status(400).send(err);
            }
            res.status(200).json(Playlists);
        })
    } catch (error) {
        res.status(500).send();
    }
});

// Ta bort en spellista från DB baserat på ID
// Kommer att implementeras senare
router.delete("/db-playlist=:id", async (req, res) => {
    const id = req.params.id;
    try {
        Playlists.findOneAndDelete({playlistId: id}, (err, data) => {
                if(err){
                    return res.status(500).send("Error: " + err)
                }
            res.status(200).send("Spellista raderad")
        });
    } catch (error) {
        res.status(500).send();
    }
});

module.exports = router;