var mosca = require('mosca');
var axios = require('axios');
var settings = {
    http: {
        port: 3000,
        bundle: true,
        static: './'
    },
    port: 1883
};
var server = new mosca.Server(settings);
var message = {
    topic: 'push',
    payload: 'abcde', // or a Buffer
    qos: 0, // 0, 1, or 2
    retain: false // or true
};

var BASE_URL = 'http://api.smartkwh.online';

server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});

// fired when a message is received
server.on('published', function(packet, client) {
    console.log('Published', packet.payload.toString());
    console.log('topic', packet.topic);
    var dt = new Date();
    var strMicro = packet.payload.toString();
    var splitStr = strMicro.split('/');
    var data = {
        blok_id: splitStr[0],
        tanggal: splitStr[1],
        waktu: splitStr[2],
        va: splitStr[3],
        vb: splitStr[4],
        vc: splitStr[5],
        vab: splitStr[6],
        vbc: splitStr[7],
        vca: splitStr[8],
        ia: splitStr[9],
        ib: splitStr[10],
        ic: splitStr[11],
        pa: splitStr[12],
        pb: splitStr[13],
        pc: splitStr[14],
        pt: splitStr[15],
        pfa: splitStr[16],
        pfb: splitStr[17],
        pfc: splitStr[18],
        ep: splitStr[19],
        eq: splitStr[20]
    };

    // server.publish(
    //     {
    //         topic: 'monitor',
    //         payload: JSON.stringify(data),
    //         qos: 0,
    //         retain: false
    //     },
    //     function() {
    //         console.log('published to monitor');
    //     }
    // );

    if (splitStr.length > 10) {
        axios
            .post(BASE_URL + '/api/transaksi_mcb/create', data)
            .then(res => {
                console.log(`res: ${res.toString()}`);
            })
            .catch(error => {
                console.error(error);
            });
    }
});

server.publish(message, function() {
    console.log('done!');
});

server.on('ready!', setup);

// fired when the mqtt server is ready
function setup() {
    //console.log('Mosca server is up and running');
    console.log('MQTT Server sedang berjalan');
}
