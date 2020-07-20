const express = require("express")
const app = express()
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const voiceChannelHandler = require("./voiceChannelHandler");

const SIZE_LIMIT = 20971520; // 20 MB = 20 * 1024 * 1024

function initSoundBoard(port) {
    app.use(fileUpload());
    app.use(bodyParser());
    app.get('/soundBoard', function (req, res) {
        let foot;
        try {
            if (req.query.tg === "1")
                voiceChannelHandler.stopSound();
            else if (req.query.sound)
                foot = onSoundCommand("./sounds/" + req.query.sound);
        } catch (err) {
            foot = "<p style='color: red;'>An error occured : " + err + "</p>";
        }

        sendPage(res, foot);
    });
    app.post('/soundBoard', function (req, res) {
        try {
            if (req.files && req.files.soundFile && req.body.soundName) {
                uploadSound(req.files.soundFile, req.body.soundName, (name, err) => {
                    let foot;
                    if (err)
                        foot = "<p style='color: red;'>An error occured : " + err + "</p>";
                    else
                        foot = "<p style='color: green;'>Successfully uploaded the sound with the name : " + name + "</p>";
                    sendPage(res, foot);
                });
            } else
                throw "No file provided.";
        } catch (err) {
            sendPage(res, "<p style='color: red;'>An error occured : " + err + "</p>");
        }
    });
    
    app.listen(port);
}

function sendPage(res, foot) {
    JSDOM.fromFile("./soundBoard.html").then(dom => {
        if ( foot )
            dom.window.document.querySelector("body").innerHTML += foot;

        // display all sounds
        fs.readdir("./sounds/", (err, files) => {
            let list = dom.window.document.querySelector("#soundList");
            list.innerHTML += "\n";
            for (let i=0; i<files.length; i++) {
                let item = "<li><a href='/soundBoard?sound=" + files[i] + "'>" + files[i] + "</a></li>\n";
                list.innerHTML += item;
            }
            res.end(dom.serialize());
        });
    });
}

function onSoundCommand(sound) {
    if ( fs.existsSync(sound) )
        voiceChannelHandler.playSound(sound);
    else
        throw "File doesn't exist.";
}

function uploadSound(file, name, callback) {
    if (name.indexOf('\0') !== -1) // check for null bytes
        throw "Null byte detected in file name. Are you trying to break my thing ?";
    if (file.size > SIZE_LIMIT)
        throw "File is too large (must be < 20 MB).";

    for (let i=0; i<name.length; i++) {
        if ( (name.charCodeAt(i) >= 97 && name.charCodeAt(i) <= 122) // [a-z]
                || (name.charCodeAt(i) >= 65 && name.charCodeAt(i) <= 90) // [A-Z]
                || (name.charCodeAt(i) >= 48 && name.charCodeAt(i) <= 57) // [0-9]
                || name.charCodeAt(i) == 46 || name.charCodeAt(i) == 95 || name.charCodeAt(i) == 45 ) // ._-
            continue;
        // delete char
        name = name.substring(0, i) + name.substring(i + 1);
        i--;
    }

    if ( !name )
        throw "Unvalid name provided.";
    if ( name.length > 100 )
        throw "Sound name is too long.";
    if ( fs.existsSync("./sounds/" + name) )
        throw "A file with that name already exist (" + name + ").";

    file.mv("./sounds/" + name, (err) => {
        callback(name, err);
    });
}

exports.initSoundBoard = initSoundBoard;