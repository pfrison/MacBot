var voiceConnection; // used to keep track of voice connection

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

exports.connectToVoiceChannel = connectToVoiceChannel;
exports.disconnectFormCurrentVoiceChannel = disconnectFormCurrentVoiceChannel;