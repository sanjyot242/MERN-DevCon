const express = require("express");
const auth = require("../../middleware/auth");
const { check, validationResult } = require('express-validator');

const Profile = require("../../models/Profile");
const User = require("../../models/User");

const router = express.Router();


// @route  GET api/profile/me
// @desc   Get  users profile
// @access private

router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user',
            ['name', 'avatar']);
        
        if (!profile) {
            return res.status(400).json({ msg: "There is no profile for this user" });
        }

        res.json(profile)
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
        
    }
})


// @route  POST api/profile
// @desc   Create or Update Profile
// @access private

router.post('/',
    [
        auth,
        [
            check('status', "Status is required").notEmpty(),
            check('skills', "Skills are required").notEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

       

        const {
            company,
            website,
            location,
            status,
            skills,
            bio,
            githubusername,
            youtube,
            facebook,
            instagram,
            twitter,
            linkedin
        } = req.body;


        //building profile object

        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }


        // Build social object
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;
        
        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }

            //create 
            profile = new Profile(profileFields);

            await profile.save()

            res.json(profile);

            
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }

    }
);

// @route  GET api/profile/
// @desc   Get profiles 
// @access private

router.get("/", auth, async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        
            res.json(profiles);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route  GET api/profile/user/:user_id
// @desc   Get profile by user id
// @access private

router.get('/user/:user_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user:req.params.user_id}).populate('user', ['name', 'avatar']);
        
        if (!profile) {
            res.status(400).json({ msg: "profile not found" });
        }
        res.json(profile);
        
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            res.status(400).json({ msg: "profile not found" });
        }
        res.status(500).send('Server Error');
    }
})



// @route  Delete api/profile/
// @desc   Delete Profile and User 
// @access private

router.delete('/', auth, async (req, res) => {
    try {
        //@todo Remove users post
        //remove Profile
        await Profile.findOneAndDelete({ user: req.user.id });
        //Remove User 
        await User.findOneAndDelete({ _id: req.user.id })
        
        res.json({msg:'User Deleted'})

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put(
    '/experience',
    auth,
    check('title', 'Title is required').notEmpty(),
    check('company', 'Company is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.experience.unshift(req.body);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
);
  
// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete an experience
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //get remove index 
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


// @route    PUT api/profile/education
// @desc     Add profile Education
// @access   Private
router.put(
    '/education',
    auth,
    check('school', 'school is required').notEmpty(),
    check('degree', 'degree is required').notEmpty(),
    check('fieldofstudy','field of study is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.education.unshift(req.body);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete an education
// @access   Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //get remove index 
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})





module.exports = router
