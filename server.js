var express = require('express');
var app = require('express')();
var path = require('path');

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'client')));

app.use(function (req, res, next) {
    console.log('req ' + req.originalUrl);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function contactObj(name, contactNumber) {
    this.name = name;
    this.contactNumber = contactNumber;
    this.image = 'http://www.polyvore.com/cgi/img-thing?.out=jpg&size=l&tid=118669518;'
}
var contacts = [
        {
            name: 'demo1'
            , contactNumber: '7838943334'
            , image: 'http://www.polyvore.com/cgi/img-thing?.out=jpg&size=l&tid=146744260'
        }, {
            name: 'demo2'
            , contactNumber: '7838943334'
            , image: 'http://www.polyvore.com/cgi/img-thing?.out=jpg&size=l&tid=118669518'
        }, {
            name: 'demo3'
            , contactNumber: '7838943334'
            , image: 'http://orig10.deviantart.net/4910/f/2015/210/7/0/__render__anime_boys_by_kaicchii-d93ar7j.png'
        }
];

var users = {};

io.on('connection', function (socket) {
    console.log("a usr connected");
    socket.on('sendMessage', function (data) {
        console.log("msz usr connected " + data);
        data = JSON.parse(data);
        var messagetobeSend = {};
        messagetobeSend.from = data.from;
        messagetobeSend.message = data.message;
        if (io.sockets.connected[data.to.socketId])
            io.sockets.connected[data.to.socketId].emit('recieveMessage', JSON.stringify(messagetobeSend));
    });

    socket.on('getContacts', function () {
        console.log('get contact request');
        for (var key in users) {
            if (io.sockets.connected[key])
                io.sockets.connected[key].emit('setContactDetails', JSON.stringify(contacts));
        }
        //socket.emit('setContactDetails', JSON.stringify(contacts));
    });

    socket.on('registerUser', function (userDetails) {
        console.log('registerUser request');
        console.log(userDetails);
        userDetails = JSON.parse(userDetails);
        var ipArr = socket.handshake.address.split(':');
        var newContact = new contactObj(userDetails.name, userDetails.contactNumber);
        newContact.ip = ipArr[ipArr.length - 1];
        newContact.socketId = socket.id;
        contacts.push(newContact);
        users[socket.id] = newContact;

        for (var key in users) {
            if (io.sockets.connected[key])
                io.sockets.connected[key].emit('setContactDetails', JSON.stringify(contacts));
        }
        //socket.emit('setContactDetails', JSON.stringify(contacts));
    });
});

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    }
    , filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({
    storage: storage
}).single('userPhoto');

app.post('/api/photo', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

app.get('/', function (req, res) {
    res.send('chatinggg time');
});

var ngrok = require('ngrok');
ngrok.connect(4000, function (err, url) {
    console.log(url)
});

http.listen(8080, function () {
    console.log('listening on *:8080');
});