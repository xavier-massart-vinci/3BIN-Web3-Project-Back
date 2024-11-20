const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post('/register', async (req, res) => {
    const {username, password} = req.body;
    if(!username || !password){
        return res.sendStatus(400);
    }
    
    User.findOne({ username }).then( async (existingUser) => {
        if (existingUser) {
            return res.sendStatus(409);
        }
        try{
            const hashedPassword = await bcrypt.hash(password, 13);
            const newUser = new User({username, password: hashedPassword});
            newUser.save().then((user) => {
                const token = jwt.sign({username: user.username}, process.env.JWT_SECRET);
                return res.json({token, user}).status(201);
            }).catch(() => {
                res.sendStatus(400);
            })
        } catch {   
            res.sendStatus(500);
        }
    }).catch(() => {
      res.sendStatus(500);
    });
    
})


router.post('/login', async (req, res) => {
    const {username, password} = req.body;
    if(!username || !password){
        return res.sendStatus(400);
    }
    try{
        User.findOne({username})
        .then(async (user) => {
            if(!user){
                return res.sendStatus(401);
            }
            if(await bcrypt.compare(password, user.password)){
                const token = jwt.sign({username: user.username}, process.env.JWT_SECRET);
                return res.json({token, user});
            }
            return res.sendStatus(401);
        })
    }catch{
        res.sendStatus(500);
    }
})

module.exports = router;
