const express = require("express");
const { check, validationResult } = require('express-validator');
const gravatar = require("gravatar");
const bcrypt = require('bcrypt');
const router = express.Router();
const config = require("config");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");


// @route  POST api/users
// @desc   Register user 
// @access public

router.post("/", [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password','Please enter a password with 6 or more characters').isLength({min:6})
],async (req, res) => {
    //handling errs from above
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()})
    }

    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        
        if (user) {
            return res.status(400).json({ errors: [{ msg: "User already exist" }] });
        }

        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d:'mm'
        });

        //creating an instance of user 
        user = new User({
            name,email,avatar,password
        })
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payLoad = {
            user: {
                id:user.id
            }
        }

        jwt.sign(payLoad, config.get('jwtSecret'), { expiresIn: 36000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
        //return json webtoken
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
})

module.exports = router