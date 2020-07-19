const fs = require("fs");

var voiceConnection; // used to keep track of voice connection
var soundStream; // used to keep track of the sound played

function connectToVoiceChannel( channel ) {
    // disconnect from previous channel
    let wait = 0;
    if ( voiceConnection ) {
        voiceChannelHandler.disconnectFormCurrentVoiceChannel();
        wait = 1000;
    }
    
    setTimeout(() => {
        // actually connect
        if (channel != null) {
            channel.join()
                    .then((connection) => {
                        voiceConnection = connection;
                        console.log("I'm in the voice channel. Scanning in progress.");
                    })
                    .catch((e) => { console.error(e); });
        } else
            console.error("Cannot get in the voice channel.");
    }, wait);
}

function disconnectFormCurrentVoiceChannel() {
    let connectedBefore = false;
    if ( voiceConnection ) {
        connectedBefore = true;
        
        voiceConnection.disconnect();
        voiceConnection = undefined;
    }
    return connectedBefore;
}

function isConnected() {
    if ( voiceConnection )
        return true;
    else
        return false;
}

function playSound(filePath, callback) {
    if ( voiceConnection && fs.existsSync(filePath) ) {
        soundStream = voiceConnection.play(filePath)
        soundStream.on("end", () => {
            soundStream = undefined;
            callback();
        });
        return true;
    } else
        return false;
}

function stopSound() {
    if ( soundStream ) {
        soundStream.pause()
        return true;
    } else
        return false;
}

exports.connectToVoiceChannel = connectToVoiceChannel;
exports.disconnectFormCurrentVoiceChannel = disconnectFormCurrentVoiceChannel;
exports.isConnected = isConnected;
exports.playSound = playSound;
exports.stopSound = stopSound;