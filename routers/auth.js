  
const express = require('express');
const router = express.Router()

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const { JWT_SECRET } = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');

const salt = bcrypt.genSaltSync(10);

router.get('/auth',requireLogin,(req,res)=>{
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        image: req.user.image,
    })
})

router.post('/signup',(req,res) => {
    const { name,email,password }  = req.body;
    if(!email || !password || !name) {
        return res.status(400).json({registerSuccess: false, error:"Please add all the fields!"});
    }
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
           return res.status(400).json({registerSuccess: false, error:"User already exists with that email!"});
        }
        bcrypt.hash(password, salt)
        .then(hash=>{
            const newUser = new User({
                name: name,
                email: email,
                password: hash
            })

            newUser.save()
            .then((user)=>{
                res.status(200).json({registerSuccess: true, massage:"Saved user successfully "});
            })
            .catch(err=>{
                console.error(err);
            })
        }) 
    })
    .catch(err=>{
        console.error(err);
    })
    res.json({registerSuccess: true, massage:"Successfully posted!"});

})

router.post('/signin',(req,res)=>{
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({loginSuccess: false,error:"Please provide email or password!"});
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            return res.status(400).json({loginSuccess: false,error:"Invalid email or password!"});
        }
        bcrypt.compare(password, savedUser.password)
        .then((match) => {
            if(match){
                const token = jwt.sign({_id: savedUser._id},JWT_SECRET)
                const {_id,name,email,image} = savedUser
                console.log(token);
                res
                    .cookie("x_auth",token)
                    .status(200)
                    .json({
                        loginSuccess: true, massage:"Login successfully!",token:token,user:{_id,email,name,image}
                    });
            }
            else{
                return res.status(400).json({loginSuccess: false,error:"Invalid email or password!"});
            }
        })
        .catch(err=>{
            console.error(err);
        })
    })
    .catch(err=>{
        console.error(err);
    })
})

router.get("/logout", requireLogin, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
});

module.exports = router;