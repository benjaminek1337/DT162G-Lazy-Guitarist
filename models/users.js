const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    username:String,
    email: String,
    password: String,
    skill: String
});

module.exports = mongoose.model("Users", usersSchema);