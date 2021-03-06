const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth")
const { check, validationResult } = require('express-validator');
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const User = require("../../models/User");

// @route  GET api/auth
// @desc   Get details of Usser
// @access private

router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({msg: "Server Error"})
    }
   
})

// @route  POST api/auth
// @desc   Login and Generate token
// @access public

router.post("/", [
    check('email', "Please enter a valid email").isEmail(),
    check('password',"Password is required ").exists()
    
] ,async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
    
        if (!user) {
            return res.status(400).json({errors:[{msg:"Invalid Credentials"}]})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({errors:[{msg:"Invalid Credentials"}]})
        }

        const payLoad = {
            user: {
                id:user.id
            }
        }
        
        jwt.sign(payLoad, config.get("jwtSecret"), { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    
    } catch (err) {
        console.error(error.message);
        res.status(500).send("Server error");
        }

  
})

module.exports = router