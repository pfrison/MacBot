const voiceChannelHandler = require("./voiceChannelHandler");
const e621 = require("./e621");

const BRUH_CHANCE = 1/50;
const NO_CHANCE = 1/10;

const botPrefix = "macpop"; // in fucking lower case you fucking monkey
const helpCommand = "Command list :\n"
        + "\"" + botPrefix + " come\" : send the bot to your voice channel.\n"
        + "\"" + botPrefix + " leave\" : tell the bot to leave the voice channel.\n"
        + "\"" + botPrefix + " e621 [optional tags]\" : fetch a random image from e621.net, with or without tags.\n";
        
function onMessage( message ) {
    if ( !message.content || message.author.bot )
        return;
    const args = message.content.split(" ");
    for (let i=0; i<args.length; i++)
        args[i] = args[i].toLowerCase();
    
    let noBruh = false;
    
    // command handler. DO NOT FUCKING FORGET THE LOWER CASE
    if ( args[0] === botPrefix ) {
        // have a chance to say "no."" to any command
        if ( Math.random() < NO_CHANCE ) {
            message.channel.send("No.");
            return;
        }

        noBruh = true;
        if ( args[1] === "come" ) {
            if ( message.member.voice.channel )
                voiceChannelHandler.connectToVoiceChannel( message.member.voice.channel );
            else
                message.channel.send("You're not connected to any voice channel dumbass.\n"
                        + "You are fucking stupid and I hate you.");
        } else if ( args[1] === "leave" ) {
            let connectedBefore = voiceChannelHandler.disconnectFormCurrentVoiceChannel();
            if ( !connectedBefore )
                message.channel.send("What the fuck, I am not connected to any voice channel.\n"
                        + "Leave me the fuck alone you piece of shit.");
        } else if ( args[1] === "e621" ) {
            if (args.length <= 2)
                e621.randomE621(message.channel);
            else {
                let tags = "";
                for (let i=2; i<args.length; i++)
                    tags += args[i] + "+";
                e621.randomE621(message.channel, tags);
            }
        } else {
            if ( args[1] !== "help" )
                message.channel.send("I don't speak idiot you useless cunt.\n"
                        + "Please learn to use my commands you fucking savage monkey.");
            message.channel.send(helpCommand);
        }
    }
    
    // <word>-ine to pain au <word> translation
    for (let i=0; i<args.length; i++) {
        if ( args[i].length >= 4 && args[i].substring( args[i].length - 3, args[i].length ) === "ine" ) {
            let painAu = args[i].substring(0, args[i].length - 3);
            message.channel.send("On ne dit pas \"" + args[i] + "\" mais \"pain au " + painAu + "\" !");
            noBruh = true;
        }
    }
    
    // chance to say "bruh"
    if ( !noBruh && Math.random() < BRUH_CHANCE )
        message.channel.send("bruh");
};

exports.onMessage = onMessage;