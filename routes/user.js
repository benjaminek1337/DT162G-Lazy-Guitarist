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

const users = [
    {
        userId:1, 
        email:"benjamin@test.se", 
        password:"$2y$10$OLAcTkGCGQloa5hFVOIXa.68latuN9SNjMod6VTaGJuhtStzvsAh6"
    }
]; // Fixa db

router.post("/register", async (req, res) => {
    const { email, password, repeatPassword} = req.body;
    const exists = users.some(u => u.email == email);
    if(exists){
        return res.status(400).send();
    }
    try {
        if(password == repeatPassword && isValidEmail(email)){
            const hashedPassword = await bcrypt.hash(password, 10);
            //const hashedPassword = password;

            const user = { userId: users.length + 1, email: email, password: hashedPassword }
            req.session.userId = user.userId;
            users.push(user); // byta ut mot db
            return res.redirect("/api/user/getuser");
        } else {
            return res.status(400).send();
        }
    } catch (error) {
        return res.status(500).send();
    }
});

router.post("/login", async (req, res) => {
    const { email, password} = req.body;
    const user = users.find(u => u.email == email);

    if(!user){
        return res.status(400).send();
    }
    if(req.session.userId != undefined){
        res.status(201).json(user);
    }
    try {
        if(await bcrypt.compare(password, user.password)){
            req.session.userId = user.userId;

            res.status(200).json(user);
        } else {
            res.status(403).send();
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
        req.query.url =
        res.clearCookie("sid");
        res.redirect("/"); // Redirecta till ursprungsurl
    })
});

router.use((req, res, next) => {
    const { userId } = req.session;
    if(userId){
        res.locals.user = users.find(u => u.userId == userId);
    }
    next();
})

router.get("/getuser", (req, res) => {
    const { user } = res.locals;
    if(user){
        res.status(200).json(user);
    } else {
        res.status(400).send();
    }
})

module.exports = router;