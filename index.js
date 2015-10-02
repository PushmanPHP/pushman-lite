// Imports and Requirements
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Redis = require('ioredis');

// Setup Redis
var redis = new Redis({
    host: 'HOSTNAME',
    db: 1
});

// Connect to MySQL
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'HOSTNAME',
  user     : 'USERNAME',
  password : 'PASSWORD',
  database : 'DATABASE'
});
connection.connect();

// Subscribe to all channels
redis.psubscribe('*');
redis.on('pmessage', function(pattern, channel, message) {
    message = JSON.parse(message);

    connection.query("SELECT * FROM `channel_keys` WHERE `name` = ? LIMIT 1", channel, function(err, rows, fields) {
        if(err) throw err;

        if(rows) {
            var result = rows[0];
            console.log('Loaded key for channel %s as: %s', channel, result.key);
            channel = result.key + ':' + channel;
            io.emit(channel + ':' + message.event, message.data);
            console.log('Broadcasted %s on %s.', message.event, channel);
        } else {
            io.emit(channel + ':' + message.event, message.data);
            console.log('Broadcasted %s on %s.', message.event, channel);
        }
    });
});

// Boot up the server.
server.listen(3000);

// Handle incoming socket.io connections.
io.on('connect', function(socket) {

    // Grab client details.
    var client = {id: socket.id, address: socket.handshake.address};
    console.log('%s connected from %s', client.id, client.address);

    // Log disconnects.
    socket.on('disconnect', function() {
        console.log('%s disconnected.', client.id);
    });

});