var app = require('express')();
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey = fs.readFileSync('./private.pem', 'utf8');
var certificate = fs.readFileSync('./file.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };
var ServerPorts = null;
var fs = require('fs');
var ServerPorts = JSON.parse(fs.readFileSync('ports.txt'));
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
const mysql = require('mysql');
const db = mysql.createConnection({
    host: "192.168.0.132",
    user: "root",
    password: "123456",
    database: "demo"
});

// db.connect(err => {
//     if (err) {
//         console.error("❌ Database connection failed:", err.code);
//         return;
//     }
//     console.log("✅ Connected to database!");
// });

// // Handle disconnects
// db.on('error', function(err) {
//     console.error("⚠️ Database Error:", err.code);
//     if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//         console.log("Reconnecting...");
//         db.connect();
//     }
// });

// Memory Buffer for Unique ASCII Tags
const tagBuffer = new Set();

// Convert HEX `ep` to ASCII
function hexToAscii(hex) {
    try {
        return Buffer.from(hex, 'hex').toString('ascii').trim(); // Convert and trim spaces
    } catch (error) {
        console.error("Invalid HEX:", hex);
        return null;
    }
}

// Function to Add Unique ASCII Tags to Buffer
function bufferTags(eventData) {
    eventData.forEach(tag => {
        const asciiTag = hexToAscii(tag.ep)

        // if (asciiTag) {
        //     if (asciiTag === null) {
        //         return;
        //     } else {
        //         tagBuffer.add(asciiTag); // Store only unique ASCII values
        //     }

        // }
        if (asciiTag) {

            tagBuffer.add(asciiTag); // Store only unique ASCII values

        }
    });
}

// Batch Insert Every 5 Seconds
// setInterval(() => {
//     if (tagBuffer.size > 0) {
//         let values = Array.from(tagBuffer).map(tag => `('${tag}')`).join(",");
//         let sql = `INSERT IGNORE INTO rfid_dump (tagno) VALUES ${values}`;

//         db.query(sql, (err, result) => {
//             if (err) console.error("Error inserting tags:", err);
//             else console.log(`${result.affectedRows} new unique tags inserted.`);
//         });

//         tagBuffer.clear(); // Clear buffer after insert
//     }
// }, 5000); // Runs every 5 seconds

//var ReqCount = 0;

httpServer.listen(ServerPorts.port, function() {
    console.log('HTTP Server is running on: http://localhost:%s', ServerPorts.port);
});
httpsServer.listen(ServerPorts.sslport, function() {
    console.log('HTTPS Server is running on: https://localhost:%s', ServerPorts.sslport);
});


httpServer.keepAliveTimeout = 30 * 1000;

var HashMap = require('hashmap');
var tabTags = new HashMap();

function InsertTags(tags) {
    if (tags.length > 0) {
        tags.forEach(tag => {
            if (tag.hasOwnProperty('ep')) {
                if (tabTags.has(tag.ep)) {
                    var tag_ = tabTags.get(tag.ep);
                    if (tag.hasOwnProperty('bd'))
                        tag_.bd = tag.bd;
                    if (tag.hasOwnProperty('at'))
                        tag_.at = tag.at;
                    if (tag.hasOwnProperty('rc'))
                        tag_.rc += tag.rc;
                    if (tag.hasOwnProperty('fq'))
                        tag_.fq = tag.fq;
                    if (tag.hasOwnProperty('pt'))
                        tag_.pt = tag.pt;
                    if (tag.hasOwnProperty('ri'))
                        tag_.ri = tag.ri;
                    if (tag.hasOwnProperty('rv'))
                        tag_.rv = tag.rv;
                    if (tag.hasOwnProperty('ft'))
                        tag_.ft = tag.ft;
                    if (tag.hasOwnProperty('lt'))
                        tag_.lt = tag.lt;
                } else
                    tabTags.set(tag.ep, tag);
            } else if (tag.hasOwnProperty('epc')) {
                if (tabTags.has(tag.epc)) {
                    var tag_ = tabTags.get(tag.epc);
                    tag_.bd = tag.bank_data;
                    tag_.at = tag.antenna;
                    tag_.rc += tag.read_count;
                    tag_.pt = tag.protocol;
                    tag_.ri = tag.rssi;
                    tag_.ft = tag.firstseen_timestamp;
                    tag_.lt = tag.lastseen_timestamp;
                } else {
                    var tag_ofm = {};
                    tag_ofm.ep = tag.epc;
                    tag_ofm.bd = tag.bank_data;
                    tag_ofm.at = tag.antenna;
                    tag_ofm.rc = tag.read_count;
                    tag_ofm.pt = tag.protocol;
                    tag_ofm.ri = tag.rssi;
                    tag_ofm.ft = tag.firstseen_timestamp;
                    tag_ofm.lt = tag.lastseen_timestamp;
                    tag_ofm.rv = 0;
                    tag_ofm.fq = '';
                    tabTags.set(tag.epc, tag_ofm);
                }
            }
        });
    }
}
var onceflag = 0;
var hbcount = 0;
var gpistates = '';
var devstate = '0';
var path = require('path');
var bodyParser = require('body-parser'); //����req.body��ȡֵ��
const { log } = require('console');
app.use(bodyParser.json());


app.post('/reader', function(req, res) {
    // console.log("amith")
    // console.log(req.body);

    if (req.body.event_type === 'tag_read' || req.body.event_type === 'tag_coming') {
        req.body.event_data.forEach(tag => {
            const asciiTag = hexToAscii(tag.ep);
            if (asciiTag) {
                tagBuffer.add(asciiTag); // Store unique tags
            }
        });
        // console.log(tagBuffer.size);
    } else if (req.body.event_type == 'heart_beat')
        hbcount = req.body.event_data;
    else if (req.body.event_type == 'gpi_changed') {
        var tmpstr = '';
        req.body.event_data.gpi_states.forEach(function(gst) {
            tmpstr += gst.state;
        });
        gpistates = tmpstr;
    } else if (req.body.event_type == 'reader_exception') {
        devstate = 'code:' + req.body.event_data.err_code + ' info:' + req.body.event_data.err_string;
        console.log('reader_exception:' + 'code:' + req.body.event_data.err_code + ' info:' + req.body.event_data.err_string);
    }
    res.end();

});
app.options('/', function(req, res) {
    res.writeHead(200, {
        'Content-Length': '0',
        'Allow': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Method': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Max-Age': '1728000',
        'Access-Control-Allow-Origin': '*'
    });
    res.end();
});

app.get('/', function(req, res) {
    if (req.protocol === 'http') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json; charset=utf-8'
        });
        var evtobj = {};
        evtobj.hbcount = hbcount;
        evtobj.gpistates = gpistates;
        evtobj.devstate = devstate;
        evtobj.tags = tabTags.values();
        res.write(JSON.stringify(evtobj));
        res.end();
        tabTags.clear();
    }
});


app.post('/insertTags', (req, res) => {
    if (tagBuffer.size === 0) {
        return res.json({ message: "No new tags to insert." });
    }

    const eventid = Date.now(); // Generate a unique event ID (timestamp)
    let values = Array.from(tagBuffer).map(tag => `('${tag}', ${eventid})`).join(",");

    let sql = `INSERT IGNORE INTO rfid_dump (tagno, eventid) VALUES ${values}`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error("❌ Error inserting tags:", err);
            return res.status(500).json({ error: "Database insertion failed." });
        }

        console.log(`✅ ${result.affectedRows} new unique tags inserted with eventid: ${eventid}`);
        tagBuffer.clear(); // Clear buffer after insert

        res.json({ message: `Inserted ${result.affectedRows} tags`, eventid: eventid });
    });
});


app.get('/bufferedTags', (req, res) => {
    console.log(tagBuffer instanceof Set ? tagBuffer.size : tagBuffer.length);

    res.json({ bufferedTags: Array.from(tagBuffer) });
});


// **API to Clear Buffer**
app.delete('/clearBuffer', (req, res) => {
    tagBuffer.clear();
    res.json({ message: "Buffer cleared successfully!" });
});