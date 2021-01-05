// Importer
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const https = require("https");
const Users = require("../models/users.js");
const Tracks = require("../models/tracks.js")
const SavedTracks = require("../models/saved-tracks.js");
const LikedTracks = require("../models/liked-tracks.js");

// Enklare funktion för att validera e-postadress
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if(emailRegex.test(email)){
        return true;
    }
    return false;
}

// Registrera ny användare, hasha pw, spara till db, returnera användarinfo som JSON
router.post("/register", async (req, res) => {
    const user = new Users();
    try{
        const { email, password, repeatPassword} = req.body;
        const exists = await Users.exists({ email: email })
        if(exists){
            return res.status(400).send("Användare med epostadress: " + email + " finns redan.");
        } else if(!isValidEmail(email)){
            return res.status(400).send("Epostaddressen är ogiltig");
        } else if(password != repeatPassword){
            return res.status(400).send("Lösenorden stämmer inte överens");
        }
        const username = email.split("@");
        const hashedPassword = await bcrypt.hash(password, 10);
        user.email = email;
        user.password = hashedPassword;
        user.username = username[0];
        user.save(r => {
        })
        req.session.userId = user._id;
        return res.status(200).json({id: user._id, email: user.email, username: user.username});
        
    } catch (error) {
        return res.status(500).send();
    }
});

// Logga in, jämföra inmatat pw mot hashat i db, skapa user-session, skicka användarinfo genom JSON
router.post("/login", async (req, res) => {
    try {
        if(req.session.userId){
            return res.status(200).json({id: user._id, email: user.email, username: user.username});
        }
        const { email, password } = req.body;
        const user = await Users.findOne({email: email}).exec();
        if(!user){
            return res.status(400).send("Epostadress finns ej registrerad");
        } else if(await bcrypt.compare(password, user.password)){
            req.session.userId = user._id;
            return res.status(200).json({id: user._id, email: user.email, username: user.username});
        } else {
            res.status(403).send("Fel lösenord");
        }
        
    } catch (error) {
        res.status(500).send("Error: " + error)
    }
});

// Ta bort user-session
router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if(err) {
            return res.status(500).send("Somethings gone terrybli wröng: " + err);
        }
        res.clearCookie("sid");
        res.status(200).send("200");
    })
});

// Hämta användare via user-sessionid, skicka användardata via JSON
router.get("/getuser", async (req, res) => {
    const user = await Users.findOne({_id: req.session.userId}).exec();
    if(user){
        res.status(200).json({id: user._id, email: user.email, username: user.username});
    } else {
        res.status(400).json({status: 400});
    }
});

// Kolla att lösenorden matchar, byt lösenord, spara till DB
router.put("/changepassword", async (req, res) => {
    const { oldPassword, newPassword, repeatPassword } = req.body;
    const user = await Users.findOne({_id: req.session.userId}).exec();
    try {
        if(newPassword != repeatPassword){
            return res.status(400).send("Lösenorden matchar ej")
        } else if(await bcrypt.compare(oldPassword, user.password)){
            console.log("i rätt block")
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            Users.findOneAndUpdate({_id: req.session.userId}, 
                {$set:{password: hashedPassword}},
                {new: true}, (err, data) => {
                    if(err){
                        return res.send(500).send("Error: " + err)
                    }
                    return res.status(200).send("Uppdaterat");
                });
        } else {
            return res.status(400).send("Nuvarande lösenord stämmer ej")
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

// Byt användarinformation, spara till DB
router.put("/changecredentials", async (req, res) => {
    const { email, username } = req.body;
    try {
        if(!isValidEmail(email) || !username){
            return res.status(400).send("Antingen är emailen ogiltig, eller så är användarnamnet tomt.");
        }

        Users.findOneAndUpdate({_id: req.session.userId}, 
            {$set:{email: email, username: username}},
            {new: true}, (err, data) => {
                if(err){
                    return res.send(500).send("Error: " + err)
                }
                return res.status(200).send("Uppdaterat");
            });
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.delete("/deleteuser", async (req, res) => {
    try {
        Users.findByIdAndDelete(req.session.userId, (err, data) => {
            if(err){
                console.log("Kunde inte radera användare")
                return status(500).send()
            }
            console.log("User deleted")
        })
        SavedTracks.deleteMany({userId :req.session.userId}, (err, data) => {
            if(err){
                console.log("Kunde inte radera spåren")
                return status(500).send()
            }
            console.log("Users tracks deleted")
        });
        req.session.destroy(err => {
            if(err) {
                return res.status(500).send("Somethings gone terrybli wröng: " + err);
            }
            res.clearCookie("sid");
            console.log("User session terminated")
            return res.status(200).send("200");
        })
        
    } catch (error) {
        return status(500).send();
    }
});

// Funktion för att spara ett spår till DB
async function saveNewTrackToDB(trackId, artist, title, album, liked, disliked){
    const newTrack = new Tracks();
    newTrack.track = title;
    newTrack.artist = artist;
    newTrack.album = album;
    newTrack.trackId = trackId;
    newTrack.likes = (liked) ? 1 : 0;
    newTrack.dislikes = (disliked) ? 1 : 0;
    newTrack.save();
    console.log("Track saved")
}

// Funktion för att spara ett spår till användare
async function saveUserTrackToDB(trackId, userId, saved){
    const savedTrack = new SavedTracks();
    savedTrack.userId = userId;
    savedTrack.trackId = trackId;
    savedTrack.progress = "Vill lära mig";
    savedTrack.saved = saved;
    savedTrack.save();
    console.log("Saved track for user");
}

async function saveLikedTrackToDB(trackId, userId, liked, disliked){
    const likedTrack = new LikedTracks();
    likedTrack.userId = userId;
    likedTrack.trackId = trackId;
    likedTrack.liked = liked;
    likedTrack.disliked = disliked;
    likedTrack.save();
    console.log("User rated track");
}

// Sparar valt spår till db, samt sparar spåret till en post kopplat till användar-id
router.post("/savetrack", async (req, res) => {
    const { trackId, track, artist, album } = req.body;
    const trackExists = await Tracks.exists({trackId: trackId});
    if(!req.session.userId){
        return res.status(500).send("Serverfel. Prova logga in och ut.")
    }
    if(!trackExists){
        try {
            await saveNewTrackToDB(trackId, artist, track, album, false, false);
        } catch (error) {
            res.status(500).send();
        }
    }
    const savedTrack = await SavedTracks.findOne({trackId: trackId, userId: req.session.userId}).exec();
    if(!savedTrack){
        try {
            await saveUserTrackToDB(trackId, req.session.userId, true);
            res.status(200).send("Spår sparat");
        } catch (error) {
           return res.status(500).send();
        }
    } else {
        if(!savedTrack.saved){
            try {
                await SavedTracks.findOneAndUpdate({trackId: trackId, userId: req.session.userId}, 
                    {$set:{
                        saved: true
                        }
                    },
                    {new: true}, (err, data) => {
                        if(err){
                            return res.status(500).send("Error: " + err)
                        }
                    });
                    return res.status(200).send("Spår sparat")
            } catch (error) {
                res.status(500).send();
            }
        }
        res.status(400).send("Du har ju redan sparat spåret, lustigkurre.");
    }
});

// Sparar betygssättning som databaspost, kopplat till användar-id. Och om spår ej sparat i db, spara spåret
router.put("/ratetrack", async (req, res) => {
    const { trackId, liked, disliked, track, artist, album } = req.body;
    
    if(!req.session.userId){
        return res.status(500).send("Serverfel. Prova logga in och ut.")
    }
    
    const likedTrackExists = await LikedTracks.exists({trackId: trackId, userId: req.session.userId});
    if(!likedTrackExists){
        try {
            await saveLikedTrackToDB(trackId, req.session.userId, liked, disliked);
        } catch (error) {
            res.status(500).send();
        }
    } else {
        try {
            await LikedTracks.findOneAndUpdate({trackId: trackId, userId: req.session.userId}, 
                {$set:{
                    liked: liked, 
                    disliked: disliked
                    }
                },
                {new: true}, (err, data) => {
                    if(err){
                        return res.status(500).send("Error: " + err)
                    }
                });
        } catch (error) {
            res.status(500).send();
        }
    }

    const trackExists = await Tracks.exists({trackId: trackId});
    if(!trackExists){
        try {
            await saveNewTrackToDB(trackId, artist, track, album, liked, disliked);
            console.log("Rated new track");
            res.status(200).send(liked)
        } catch (error) {
            res.status(500).send();
        }
    } else {
        try {
            await Tracks.findOneAndUpdate({trackId: trackId}, 
            {$set:{
                likes: (!likedTrackExists && liked) ? (await getCurrentLikes(trackId) + 1) : await getLikes(trackId), 
                dislikes: (!likedTrackExists && disliked) ? (await getCurrentDisikes(trackId) + 1) : await getDislikes(trackId)}
            },
            {new: true}, (err, data) => {
                if(err){
                    return res.status(500).send("Error: " + err);
                }
            });
            console.log("Rating updated");
            res.status(200).send(liked)
        } catch (error) {
            res.status(500).send();
        }
    }
});

// Hämtar antalet likes till ett givet spår
async function getCurrentLikes(id){
    const track = await Tracks.findOne({trackId: id}).exec();
    return track.likes;
}

// Hämtar antalet dislikes till ett givet spår
async function getCurrentDisikes(id){
    const track = await Tracks.findOne({trackId: id}).exec();
    return track.dislikes;
}

// Sammanställer alla likes till ett spår
async function getLikes(id){
    const likedTracks = await LikedTracks.find({trackId: id, liked: true}).exec();
    return likedTracks.length;
};

// Sammanställer alla dislikes till ett spår
async function getDislikes(id){
    const dislikedTracks = await LikedTracks.find({trackId: id, disliked: true}).exec();
    return dislikedTracks.length;
};

// Sparar användarens progression på ett spår till DB
router.put("/progression", async (req, res) => {
    const { trackId, progress } = req.body;
    try {
        SavedTracks.findOneAndUpdate({trackId: trackId, userId: req.session.userId}, 
            {$set:{
                progress: progress}
            },
            {new: true}, (err, data) => {
                if(err){
                    return res.status(500).send("Error: " + err)
                }
        });
        console.log("Progression updated");
        res.status(200).send("Progression uppdaterad");
    } catch (error) {
        res.status(500).send();
    }
});

// Hämtar användares sparade spår
router.get("/savedtracks", async (req, res) => {
    try {
        SavedTracks.aggregate([
            { $match: {userId: req.session.userId, saved: true}},
            {
                "$lookup": {
                    "from": "tracks",
                    "localField": "trackId",
                    "foreignField": "trackId",
                    "as": "tracks"
                }
            },
            { "$unwind": "$tracks" },
            {
                "$project": {
                    "tracks.trackId": 1,
                    "tracks.track": 1,
                    "tracks.artist": 1,
                    "tracks.album":1,
                    "progress":1
                }
            }
        ]).exec((err, data) => {
            if(err) {
                return res.status(400).json({error: err});
            } else if (data.length == 0) {
                return res.status(400).json({message: "Du har inte sparat några spår än..."})
            }
            res.json(data);
        });
    } catch (error) {
        res.status(500).send();
    }
});

// Hämtar ett spår kopplat till spårets ID
router.get("/track=:trackId", async (req, res) => {
    const trackId = req.params.trackId;
    try {
        const track = await Tracks.findOne({trackId: trackId}).exec();
        res.status(200).json(track);
    } catch (error) {
        res.status(400).json({exists: "Nope"});
    }
});

// Hämtar ett sparat spår kopplat till spårets ID
router.get("/savedtrack=:trackId", async (req, res) => {
    const trackId = req.params.trackId;
    try {
        const track = await SavedTracks.findOne({trackId: trackId, userId: req.session.userId}).exec();
        res.status(200).json(track);
    } catch (error) {
        res.status(400).json({exists: "Nope"});
    }
});

// Hämtar ett gillat spår med spårets ID
router.get("/likedtrack=:trackId", async (req, res) => {
    const trackId = req.params.trackId;
    try {
        const track = await LikedTracks.findOne({trackId: trackId, userId: req.session.userId}).exec();
        res.status(200).json(track);
    } catch (error) {
        res.status(400).json({exists: "Nope"});
    }
});

// Raderar ett sparat spår kopplat till spårets id
router.delete("/savedtrack/:trackId", async (req, res) => {
    const trackId = req.params.trackId;
    try {
        SavedTracks.findOneAndDelete({trackId: trackId, userId: req.session.userId}, (err, data) => {
                if(err){
                    return res.status(500).send("Error: " + err)
                }
            res.status(200).send("Spår raderat")
        });
    } catch (error) {
        res.status(500).send();
    }
});


module.exports = router;