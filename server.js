const exprees = require('express');
const app = exprees();
var server = require("http").Server(app);

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { MONGOURI } = require('./config/keys');
const { json } = require('body-parser');
const User = require('./models/user');
const Chat  = require('./models/chat');
const PORT = process.env.PORT || 8000;

const io = require('socket.io').listen(server);

const users = {};


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser());

mongoose.connect(MONGOURI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

mongoose.connection.on('connected',()=>{
    console.log('MongoDb is connecting!')
})
mongoose.connection.on('error',(err)=>{
    console.log('MongoDb connection error!',err)
})

app.use(require('./routers/auth'));
app.use(require('./routers/chat'));
app.use(require('./routers/user'));



if(process.env.NODE_ENV=="production"){
    app.use(express.static('client/build'))
    const path = require('path')
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })
}

server.listen(PORT, ()=>{
	console.log("Connected to port:" + PORT);
})