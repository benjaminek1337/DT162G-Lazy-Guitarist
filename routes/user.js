const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Users = require("../models/users.js");
const Tracks = require("../models/tracks.js")
const SavedTracks = require("../models/saved-tracks.js");
const LikedTracks = require("../models/liked-tracks.js");

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if(emailRegex.test(email)){
        return true;
    }
    return false;
}

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

router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if(err) {
            return res.status(500).send("Somethings gone terrybli wröng: " + err);
        }
        //console.log(req.query.url)
        res.clearCookie("sid");
        res.status(200).send("200"); // Redirecta till ursprungsurl
    })
});

router.get("/getuser", async (req, res) => {
    const user = await Users.findOne({_id: req.session.userId}).exec();
    if(user){
        res.status(200).json({id: user._id, email: user.email, username: user.username});
    } else {
        res.status(400).json({status: 400});
    }
});

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

async function createNewTrack(trackId, artist, track, album){
    // Localhost, ändra till skarp vid prod
    if(process.env)
    fetch("http://localhost:3000/api/")

    const newTrack = new Tracks();
    newTrack.track = track;
    newTrack.artist = artist;
    newTrack.album = album;
    newTrack.trackId = trackId;
    newTrack.likes = 0;
    newTrack.dislikes = 0;
    newTrack.save();
    console.log("Track saved")
}

async function saveTrackForUser(trackId, userId){
    const savedTrack = new SavedTracks();
    savedTrack.userId = userId;
    savedTrack.trackId = trackId;
    savedTrack.progress = "Vill lära mig";
    savedTrack.liked = false;
    savedTrack.disliked = false;
    savedTrack.save();
    console.log("Saved track for user");
}

router.post("/savetrack", async (req, res) => {
    const { trackId, track, artist, album } = req.body;
    const trackExists = await Tracks.exists({trackId: trackId});
    if(!req.session.userId){
        return res.status(500).send("Serverfel. Prova logga in och ut.")
    }
    if(!trackExists){
        try {
            await createNewTrack(trackId, artist, track, album);
        } catch (error) {
            res.status(500).send();
        }
    }
    const savedTrackExists = await SavedTracks.exists({trackId: trackId, userId: req.session.userId});
    if(!savedTrackExists){
        try {
            await saveTrackForUser(trackId, req.session.userId);
            res.status(200).send("Spår sparat");
        } catch (error) {
            res.status(500).send();
        }
    } else {
        res.status(400).send("Du har ju redan sparat spåret, lustigkurre.");
    }
});

router.put("/ratetrack", async (req, res) => {
    const { trackId, liked, disliked } = req.body;
    const trackExists = await Tracks.exists({trackId: trackId});
    if(!req.session.userId){
        return res.status(500).send("Serverfel. Prova logga in och ut.")
    }
    if(!trackExists){ // Fixa det här att det kraschar om man rejtar innan man sparat spåret
        try {
            let artist, track, album; // HÄMTA DESSA FRÅN NÅNSTANS
            await createNewTrack(trackId, artist, track, album);
        } catch (error) {
            res.status(500).send();
        }
    }
    const savedTrackExists = await SavedTracks.exists({trackId: trackId, userId: req.session.userId});
    if(!savedTrackExists){
        try {
            await saveTrackForUser(trackId, req.session.userId);
        } catch (error) {
            res.status(500).send();
        }
    } else {
        try {
            await SavedTracks.findOneAndUpdate({trackId: trackId, userId: req.session.userId}, 
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
    try {
        await Tracks.findOneAndUpdate({trackId: trackId}, 
        {$set:{
            likes: await getLikes(trackId), 
            dislikes: await getDislikes(trackId)}
        },
        {new: true}, (err, data) => {
            if(err){
                return res.status(500).send("Error: " + err)
            }
        });
        res.status(200).send(liked);
        console.log("Rating completed");
    } catch (error) {
        res.status(500).send();
    }
});

async function getLikes(id){
    //let likes = 0;

    const likedTracks = await LikedTracks.find({trackId: id, liked: true}).exec();
    // for (let i = 0; i < likedTracks.length; i++) {
    //     const element = likedTracks[i];
    //     if(element.liked)
    //         likes += 1;
    // }
    return likedTracks.length;
};

async function getDislikes(id){
    // let dislikes = 0;
    const dislikedTracks = await LikedTracks.find({trackId: id, disliked: true}).exec();
    // for (let i = 0; i < likedTracks.length; i++) {
    //     const element = likedTracks[i];
    //     if(element.disliked)
    //         dislikes += 1;
    // }
    return dislikedTracks.length;
};

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

router.get("/track=:trackId", async (req, res) => {
    const trackId = req.params.trackId;
    try {
        const track = await Tracks.findOne({trackId: trackId}).exec();
        res.status(200).json(track);
    } catch (error) {
        res.status(400).json({exists: "Nope"});
    }
});

router.get("/savedtrack=:trackId", async (req, res) => {
    const trackId = req.params.trackId;
    try {
        const track = await SavedTracks.findOne({trackId: trackId, userId: req.session.userId}).exec();
        res.status(200).json(track);
    } catch (error) {
        res.status(400).json({exists: "Nope"});
    }
});

router.get("/likedtrack=:trackId", async (req, res) => {
    const trackId = req.params.trackId;
    try {
        const track = await LikedTracks.findOne({trackId: trackId, userId: req.session.userId}).exec();
        res.status(200).json(track);
    } catch (error) {
        res.status(400).json({exists: "Nope"});
    }
});

router.delete("/savedtrack/:trackId", async (req, res) => {
    const trackId = req.params.trackId;
    try {
        SavedTracks.findByIdAndDelete({trackId: trackId, userId: req.session.userId}, (err) => {
            if(err){
                return res.status(400).send(err);
            } 
            res.status(200).send("Spår raderat");
        });
    } catch (error) {
        res.status(500).send();
    }
});


module.exports = router;