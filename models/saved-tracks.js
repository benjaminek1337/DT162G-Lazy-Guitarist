const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const savedTracksSchema = new Schema({
    userId: String,
    trackId: String,
    progress: String,
    liked: Boolean,
    disliked: Boolean
});

module.exports = mongoose.model("SavedTracks", savedTracksSchema);