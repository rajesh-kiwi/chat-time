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

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
process.env.PORT = 3000;

function contactObj(name, contactNumber) {
    this.name = name;
    this.contactNumber = contactNumber;
    this.image = 'http://www.polyvore.com/cgi/img-thing?.out=jpg&size=l&tid=118669518;'
}
var contacts = [{
    name: 'demo1'
    , contactNumber: '7838943334'
    , image: 'http://www.polyvore.com/cgi/img-thing?.out=jpg&size=l&tid=146744260'
}];

var users = {};
var usersByIp = {};

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
    });

    socket.on('registerUser', function (userDetails) {
        console.log('registerUser request');
        console.log(userDetails);
        userDetails = JSON.parse(userDetails);
        var ipArr = socket.handshake.address.split(':');
        var newContact = new contactObj(userDetails.name, userDetails.contactNumber);
        newContact.ip = ipArr[ipArr.length - 1];
        newContact.socketId = socket.id;

//
//        if (newContact.ip in usersByIp) {
//            delete usersByIp[newContact.ip];
//            var tempArr = contacts.filter(function (contact) {
//                return contact.ip != newContact.ip;
//            });
//            contacts = tempArr;
//            console.log(tempArr);
//            // delete from users obj
//
//        }

        contacts.push(newContact);
        users[socket.id] = newContact;
        usersByIp[newContact.ip] = newContact;

        for (var key in users) {
            if (io.sockets.connected[key])
                io.sockets.connected[key].emit('setContactDetails', JSON.stringify(contacts));
        }
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

//var ngrok = require('ngrok');
//ngrok.connect(port, function (err, url) {
//    console.log(url)
//});

http.listen(process.env.PORT || 4000, function () {
    console.log('listening on *: '+process.env.PORT || 4000);
});



//#!/bin/env node

//var express = require('express');
//var fs = require('fs');
//var bodyParser = require('body-parser');
//
///**
// *  Define the sample application.
// */
//var SampleApp = function () {
//    var self = this;
//
//    self.setupVariables = function () {
//        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
//        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
//
//        if (typeof self.ipaddress === "undefined") {
//            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
//            self.ipaddress = "127.0.0.1";
//        };
//    };
//
//    self.populateCache = function () {
//        if (typeof self.zcache === "undefined") {
//            self.zcache = {
//                'index.html': ''
//            };
//        }
//    };
//
//    self.cache_get = function (key) {
//        return self.zcache[key];
//    };
//
//    self.terminator = function (sig) {
//        if (typeof sig === "string") {
//            console.log('%s: Received %s - terminating sample app ...'
//                , Date(Date.now()), sig);
//            process.exit(1);
//        }
//        console.log('%s: Node server stopped.', Date(Date.now()));
//    };
//
//    self.setupTerminationHandlers = function () {
//        process.on('exit', function () {
//            self.terminator();
//        });
//
//        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT'
//         , 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
//        ].forEach(function (element, index, array) {
//            process.on(element, function () {
//                self.terminator(element);
//            });
//        });
//    };
//
//    self.createRoutes = function () {
//        self.routes = {};
//
//        self.routes['/asciimo'] = function (req, res) {
//            var link = "http://i.imgur.com/kmbjB.png";
//            res.send("<html><body><img src='" + link + "'></body></html>");
//        };
//
//        self.routes['/'] = function (req, res) {
//            res.setHeader('Content-Type', 'text/html');
//            res.send(self.cache_get('index.html'));
//        };
//    };
//    self.initializeServer = function () {
//        self.createRoutes();
//        //self.app = express.createServer();
//        self.app = express();
//        self.app.use(bodyParser.json());
//        self.app.use(require('cookie-parser')());
//        self.app.use(bodyParser.urlencoded({
//            extended: true
//        }));
//
//        var http = require('http').Server(self.app);
//        var io = require('socket.io')(http);
//
//        self.app.use(function (req, res, next) {
//            console.log('req ' + req.originalUrl);
//            res.header("Access-Control-Allow-Origin", "*");
//            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//            next();
//        });
//
//        var contacts = [{
//            name: 'demo1'
//            , contactNumber: '7838943334'
//            , image: 'http://www.polyvore.com/cgi/img-thing?.out=jpg&size=l&tid=146744260'
//        }];
//
//        var users = {};
//        var usersByIp = {};
//
//        io.on('connection', function (socket) {
//            console.log("a usr connected");
//            socket.on('sendMessage', function (data) {
//                console.log("msz usr connected " + data);
//                data = JSON.parse(data);
//                var messagetobeSend = {};
//                messagetobeSend.from = data.from;
//                messagetobeSend.message = data.message;
//                if (io.sockets.connected[data.to.socketId])
//                    io.sockets.connected[data.to.socketId].emit('recieveMessage', JSON.stringify(messagetobeSend));
//            });
//
//            socket.on('getContacts', function () {
//                console.log('get contact request');
//                for (var key in users) {
//                    if (io.sockets.connected[key])
//                        io.sockets.connected[key].emit('setContactDetails', JSON.stringify(contacts));
//                }
//            });
//
//            socket.on('registerUser', function (userDetails) {
//                console.log('registerUser request');
//                console.log(userDetails);
//                userDetails = JSON.parse(userDetails);
//                var ipArr = socket.handshake.address.split(':');
//                var newContact = new contactObj(userDetails.name, userDetails.contactNumber);
//                newContact.ip = ipArr[ipArr.length - 1];
//                newContact.socketId = socket.id;
//
//                //
//                //        if (newContact.ip in usersByIp) {
//                //            delete usersByIp[newContact.ip];
//                //            var tempArr = contacts.filter(function (contact) {
//                //                return contact.ip != newContact.ip;
//                //            });
//                //            contacts = tempArr;
//                //            console.log(tempArr);
//                //            // delete from users obj
//                //
//                //        }
//
//                contacts.push(newContact);
//                users[socket.id] = newContact;
//                usersByIp[newContact.ip] = newContact;
//
//                for (var key in users) {
//                    if (io.sockets.connected[key])
//                        io.sockets.connected[key].emit('setContactDetails', JSON.stringify(contacts));
//                }
//            });
//        });
//
//        var multer = require('multer');
//        var storage = multer.diskStorage({
//            destination: function (req, file, callback) {
//                callback(null, './uploads');
//            }
//            , filename: function (req, file, callback) {
//                callback(null, file.fieldname + '-' + Date.now());
//            }
//        });
//        var upload = multer({
//            storage: storage
//        }).single('userPhoto');
//
//        self.app.post('/api/photo', function (req, res) {
//            upload(req, res, function (err) {
//                if (err) {
//                    return res.end("Error uploading file.");
//                }
//                res.end("File is uploaded");
//            });
//        });
//
//        self.app.get('/', function (req, res) {
//            res.send('chatinggg time');
//        });
//
//
//
//
//
//    };
//
//    self.initialize = function () {
//        self.setupVariables();
//        self.populateCache();
//        self.setupTerminationHandlers();
//        self.initializeServer();
//    };
//
//    self.start = function () {
////        self.app.listen(self.port, self.ipaddress, function () {
////            console.log('%s: Node server started on %s:%d ...'
////                , Date(Date.now()), self.ipaddress, self.port);
////        });
//        var http = require('http').Server(self.app);
//        http.listen(self.port, function () {
//            console.log('listening on *:'+self.port);
//        });
//    };
//
//};
//
//var zapp = new SampleApp();
//zapp.initialize();
//zapp.start();