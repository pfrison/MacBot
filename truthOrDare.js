const querystring = require("querystring");
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const HTTPClient = require("./HTTPClient");

const TRUTH = 0;
const DARE = 1;

function randomTruth(channel, rtord) {
    makeRequest(channel, TRUTH);
}

function randomDare(channel, rtord) {
    makeRequest(channel, DARE);
}

function makeRequest(chatChannel, rtord) {
    let post_data = querystring.stringify({
        "rtord" : rtord,
        "rating" : 1,
        "inclusion" : 1,
        "set" : 0
    });

    let options = {
        host: "www.getdare.com",
        port: 443,
        path: "/x/srv/gdXML.php",
        method: "POST",
        headers: {
            "User-Agent" : "MacBot/1.0 (by Yoyorony)",
            "Content-Type" : "application/x-www-form-urlencoded",
            "Content-Length" : Buffer.byteLength(post_data)
        },
        body: post_data
    };

    objects = {
        "chatChannel": chatChannel
    };

    HTTPClient.requestXML(options, objects, onResult, onError);
}

function onResult( resultCode, xml, objects ) {
    if ( resultCode !== 200)
        onError( objects );
    else {
        if ( !xml || !xml.tord.item.text ) {
            onError( objects );
            return;
        }

        let unescaped = entities.decode(xml.tord.item.text);

        objects.chatChannel.send( unescaped );
    }
}

function onError( objects ) {
    objects.chatChannel.send("The site returned an error.\n"
            + "Looks like we got the dumbest person alive here !");
}

exports.randomTruth = randomTruth;
exports.randomDare = randomDare;