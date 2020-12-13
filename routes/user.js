const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const session = require("express-session");

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if(emailRegex.test(email)){
        return true;
    }
    return false;
}

const users = []; // Fixa db

router.post("/register", async (req, res) => {
    const { email, password, repeatPassword} = req.body;
    const exists = users.some(u => u.email == email);
    if(exists){
        return res.status(400).send("Användare med epostadress: " + email + " finns redan.");
    }
    try {
        if(password != repeatPassword){
            return res.status(400).send("Lösenorden stämmer inte överens");
        } else if(!isValidEmail(email)){
            return res.status(400).send("Epostaddressen är ogiltig")
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = { userId: users.length + 1, email: email, password: hashedPassword }
            req.session.userId = user.userId;
            users.push(user); // byta ut mot db

            return res.status(200).json({ id: user.userId, email: email, status:200});
        }
    } catch (error) {
        return res.status(500).send();
    }
});

router.post("/login", async (req, res) => {
    const { email, password} = req.body;
    const user = users.find(u => u.email == email);

    if(!user){
        return res.status(400).send("E-postaddressen finns inte");
    }
    if(req.session.userId){
        res.status(200).json({ id: user.userId, email: email, status:200});
    }
    try {
        if(await bcrypt.compare(password, user.password)){
            req.session.userId = user.userId;
            return res.status(200).json({ id: user.userId, email: email, status:200});
        } else {
            res.status(403).send("Fel lösenord");
        }
    } catch (error) {
        return res.status(500).send();
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

router.get("/getuser", (req, res) => {
    const user = users.find(u => u.userId == req.session.userId)
    if(user){
        res.status(200).json(user);
    } else {
        res.status(400).json({status: 400});
    }
})

module.exports = router;