const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playlistsSchema = new Schema({
    playlistId: String,
    name: String,
});

module.exports = mongoose.model("Playlists", playlistsSchema);