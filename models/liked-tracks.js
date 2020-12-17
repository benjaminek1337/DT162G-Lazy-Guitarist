const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likedTracksSchema = new Schema({
    userId: String,
    trackId: String,
    liked: Boolean,
    disliked: Boolean
});

module.exports = mongoose.model("LikedTracks", likedTracksSchema);