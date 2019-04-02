var mosca = require('mosca');
var http = require('axios');
var moment = require('moment');
var apiUrl = 'http://localhost:8000';
var settings = {
    http: {
        port: 3000,
        bundle: true,
        static: './'
    }
};
var server = new mosca.Server(settings);
//var listParking = [];
var isSendingToSensor = true;

var message = {
    topic: '/push',
    payload: 'abcde', // or a Buffer
    qos: 0, // 0, 1, or 2
    retain: false // or true
};

server.on('clientConnected', function (client) {
    console.log('client connected', client.id);
});

// fired when a message is received
server.on('published', function (packet, client) {
    console.log('Published', packet.payload.toString());
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    const raw = packet.payload.toString();
    console.log(raw);
    const payload = raw.split('-');
    http.post(apiUrl + '/api/mcb_transaction/create', {
        datemcb: moment().format('YYYY-MM-DD'),
        timemcb: moment().format('hh:mm:ss'),
        current: 10,
        voltage: payload[1],
        power: payload[0],
        mcb_id: 4,
        block_id: 7,
        category_mcb_id: 3,
    })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
    // console.log('topic', packet);
});

function isJson(payload) {
    try {
        JSON.parse(payload);
        return true;
    } catch (error) {
        return false;
    }
}

function isUndefined(payload) {
    let response = true;
    Object.keys(payload).map(val => {
        if (payload[val] === 'undefined') {
            response = false;
        }
    });
    return response;

}

server.publish(message, function () {
    console.log('done!');
});

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
    setInterval(() => {
        isSendingToSensor = !isSendingToSensor;
    }, 1000);
    console.log('Mosca server is up and running');
}