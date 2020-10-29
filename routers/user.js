  
const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const User = require('../models/user');
const requireLogin = require('../middlewares/requireLogin');

router.get('/alluser',requireLogin,(req,res)=>{
    User.find()
    .select("-password")
    .select("-role")
    .then(users=>{
        res.json({users:users})
    })
    .catch(err=>{
        console.error(err);
    })
})


module.exports = router;