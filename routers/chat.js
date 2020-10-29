const express = require('express');
const router = express.Router();
const Chat  = require('../models/chat')


router.get("/getChats", (req, res) => {
     Chat.find({},{message:1})
        .exec((err, chats) => {
            const result = chats.map(item=>{
                return item.message
            })
            if(err) return res.status(400).send(err);
            res.status(200).send(result)
        })
    
});

module.exports = router;