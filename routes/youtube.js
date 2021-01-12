const express = require("express");
const router = express.Router();
const { google } = require("googleapis");

// Hämta en lista med data om youtubevideor utifrån en söksträng mot Youtubes API
router.get("/search=:q", (req, res) => {
    try {
        google.youtube("v3").search.list({
            key: process.env.YOUTUBE_API_KEY,
            part: "snippet",
            maxResults: 20,
            q: req.params.q + " lesson"
        }).then(response => {
            const { data } = response;
            res.status(200).send(data.items);
        }, err => {
            console.log(err)
            res.status(400).send(err);
        })
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})


module.exports = router;