const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tracksSchema = new Schema({
    trackId: String,
    track: String,
    artist: String,
    album: String,
    likes: Number,
    dislikes: Number
});

module.exports = mongoose.model("Tracks", tracksSchema);