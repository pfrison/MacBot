const robot = require("robotjs");
const screenshot = require("screenshot-desktop");
const sharp = require("sharp");
const imageToBase64 = require("image-to-base64");
const pngToJpeg = require("png-to-jpeg");
const fs = require("fs");

const members = require("./members");
const channels = require("./channels");

const screenSize = robot.getScreenSize();

const CLICK_UP = "up";
const CLICK_DOWN = "down";
const LEFT_CLICK = "left";
const MIDDLE_CLICK = "middle";
const RIGHT_CLICK = "right";

const screenLocation = "./tmp/remoteScreen.png";
const codeLocation = "./tmp/code.txt";
const connectDelay = 60 * 60 * 1000; // = 60 mins in ms
const connectTime = 2 * 60 * 1000; // = 2 mins in ms

var connectCode;
var sessionCode;
var allowConnection = false;
var botUser;

var delayedIps = [];

function initRemote(app) {
    robot.setMouseDelay(10);
    robot.setKeyboardDelay(10);

    // fetch or create code from file
    if ( fs.existsSync(codeLocation) )
        connectCode = fs.readFileSync(codeLocation, 'utf-8').split('\n')[0];
    else
        generateNewCode();

    app.get("/remote/remoteWorker.js", function(req, res) {
        if ( allowConnection ) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.sendFile("./remoteWorker.js", { root: __dirname });
        } else
            res.end("ERR");
    });

    app.get("/remote", function (req, res) {
        if ( allowConnection ) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.sendFile("./remote.html", { root: __dirname });
        } else
            res.end("<h1 style='color: red; text-align: center;'>Remote is closed</h1>");
    });

    app.get("/remote/delayStatus", function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if ( allowConnection && req.ip ) {
            for (let i=0; i<delayedIps.length; i++) {
                if ( delayedIps[i].ip === req.ip ) {
                    res.end( Math.ceil(connectDelay - ((new Date().getTime() - delayedIps[i].delayStartAt)) ).toString() );
                    return;
                }
            }
            res.end("OK");
        } else
            res.end("ERR");
    });

    app.get("/remote/connect", function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        // test ip for delay
        if ( allowConnection && req.ip ) {
            for (let i=0; i<delayedIps.length; i++) {
                if ( delayedIps[i].ip === req.ip ) {
                    res.end("ERR");
                    return;
                }
            }
            delayedIps.push({ ip: req.ip, delayStartAt: (new Date().getTime()) });
            setTimeout(() => {
                for (let i=0; i<delayedIps.length; i++) {
                    if ( delayedIps[i].ip === req.ip ) {
                        delayedIps.splice(i, 1);
                        return;
                    }
                }
            }, connectDelay);
        } else {
            res.end("ERR");
            return;
        }

        if ( !connectCode || !req.query.code || !req.query.user )
            res.end("ERR");
        else if ( req.query.code !== connectCode )
            res.end("NO");
        else {
            // test is user is allowed
            let user = req.query.user;
            let verifiedMembers = members.getAllVerifiedMembers();
            if ( verifiedMembers ) {
                let matched = members.getAllVerifiedMembers().filter((member) => {
                    if ( (member.nickname === user || member.user.id === user || member.user.username === user)
                            && !member.bot )
                        return true;
                    else return false;
                });
    
                if (matched.array().length > 0) {
                    // TODO connection message
                    channels.getTeletravailChannel().send(user + " have taken control of the admin computer !");

                    generateSessionCode();
                    connectCode = undefined;
                    res.send(sessionCode);

                    setTimeout(() => {
                        clean();
                    }, connectTime);
                } else
                    res.end("ERR");
            } else
                res.end("ERR");
        }
    });

    app.get("/remote/remoteUpdateScreen", function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if ( allowConnection && sessionCode && req.query.sessionCode === sessionCode ) {
            screenshot({ filename: screenLocation, format: "png" }).then((imgPath) => {
                imageToBase64( imgPath ).then((base64) => {
                    var img = new Buffer(base64, "base64");
                    sharp( img )
                        .resize(1280, 720)
                        .toBuffer()
                        .then((data) => {
                            pngToJpeg({ quality: 70 })(data).then((data) => {
                                res.statusCode = 200;
                                res.end( data.toString("base64") );
                            }).catch(() => { res.end("ERR"); });
                        }).catch(() => { res.end("ERR"); });
                }).catch(() => { res.end("ERR"); });
            }).catch(() => { res.end("ERR"); });
        } else
            res.end("ERR");
    });

    app.get("/remote/moveMouse", function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if ( allowConnection && req.query.sessionCode && sessionCode && req.query.sessionCode === sessionCode && req.query.x && req.query.y ) {
            res.end("OK");
            setCursorAt(req.query.x, req.query.y);
        } else
            res.end("ERR");
    });

    app.get("/remote/mouseClick", function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if ( allowConnection && req.query.sessionCode && sessionCode && req.query.sessionCode === sessionCode
                    && req.query.x && req.query.y && req.query.which && req.query.status ) {
            if ( (req.query.which !== "left" && req.query.which !== "middle" && req.query.which !== "right")
                    || (req.query.status !== "up" && req.query.status !== "down") ) {
                res.end("ERR");
                return;
            }

            res.end("OK");
            clickAt(req.query.x, req.query.y, req.query.status, req.query.which);
        } else
            res.end("ERR");
    });

    app.get("/remote/keyPress", function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if ( allowConnection && req.query.sessionCode && sessionCode && req.query.sessionCode === sessionCode && req.query.key && req.query.status ) {
            try {
                toggleKey(req.query.status, req.query.key);
                res.end("OK");
            } catch { res.end("ERR"); }
        } else
            res.end("ERR");
    });

    app.get("/remote/disableRemote", function (req, res) {
        allowConnection = false;
        if (botUser)
            botUser.setActivity(null);

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end("OK");
        clean();
    });

    app.get("/remote/enableRemote", function (req, res) {
        if ( req.ip.includes("127.0.0.1") ) {
            allowConnection = true;
            if (botUser)
                botUser.setActivity("Remote control", {type: "LISTENING"});

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end("OK");
            clean();
        } else
            res.end("FORBIDDEN");
    });
}

function generateNewCode() {
    connectCode = "";
    for (let i=0; i<4; i++)
        connectCode += Math.round(Math.random()).toString();
    fs.writeFileSync(codeLocation, connectCode);
}

function generateSessionCode() {
    sessionCode = "";
    for (let i=0; i<32; i++)
        sessionCode += Math.round(Math.random() * 16).toString(16);
}

function clickAt(x, y, status, which) {
    setCursorAt(x, y);
    robot.mouseToggle(status, which);
}

var controlDown = false;
var shiftDown = false;
var altDown = false;
function toggleKey(status, key) {
    setTimeout(() => {
        if (key === "control")
            controlDown = status === "down";
        else if (key === "shift")
            controlDown = status === "down";
        else if (key === "alt")
            controlDown = status === "down";
        else {
            let mods = [];
            if ( controlDown )
                mods.push("control");
            if ( shiftDown )
                mods.push("shift");
            if ( altDown )
                mods.push("alt");

            if ( mods.length > 0 )
                robot.keyToggle(key, status, mods);
            else
                robot.keyToggle(key, status);
        }
    }, 2000);
}

function setCursorAt(x, y) {
    if (x > 1) x = 1;
    else if (x < 0) x = 0;
    if (y > 1) y = 1;
    else if (y < 0) y = 0;

    xpix = x * screenSize.width;
    ypix = y * screenSize.height;

    robot.moveMouse(xpix, ypix);
}

function clean() {
    if ( fs.existsSync(screenLocation) )
        fs.unlinkSync(screenLocation);
    if ( sessionCode )
        generateNewCode();
    sessionCode = undefined;
}

function registerBotUser(user) {
    botUser = user;
}

exports.initRemote = initRemote;
exports.clean = clean;
exports.registerBotUser = registerBotUser;