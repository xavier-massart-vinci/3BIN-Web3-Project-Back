const router = require('express').Router();
const User = require('../models/Users');


router.get('/', (req, res) => {
    User.find().then((users) => {
        res.json(users);
    }).catch(() => {
        res.sendStatus(500);
    });
});





module.exports = router;
