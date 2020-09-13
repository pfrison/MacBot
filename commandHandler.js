const voiceChannelHandler = require("./voiceChannelHandler");
const e621 = require("./e621");
const phub = require("./phub");
const screenShot = require("./screenShot");
const truthOrDare = require("./truthOrDare");
const remoteControl = require("./remoteControl");
const members = require("./members");
const channels = require("./channels");
const diceDare = require("./diceDare");
const chatBot = require("./chatBot");
const avatar = require("./avatar");

const BRUH_CHANCE = 1/50;
const NO_CHANCE = 1/20;

const MY_IP = "teamfriz.freeboxos.fr"

const botPrefix = "macpop"; // in fucking lower case you fucking monkey
const helpCommand = "Command list :\n"
        + "\"" + botPrefix + " clean\" : reset the bot.\n"
        + "\"" + botPrefix + " come\" : send the bot to your voice channel.\n"
        + "\"" + botPrefix + " leave\" : tell the bot to leave the voice channel.\n"
        + "\"" + botPrefix + " e621 [optional tags]\" : fetch a random image from e621, with or without tags. [\\*]\n"
        + "\"" + botPrefix + " bestofe621 [optional tags]\" : fetch a random image from e621 that is considered one of the best image, with or without tags. [\\*]\n"
        + "\"" + botPrefix + " worstofe621 [optional tags]\" : fetch a random image from e621 that is considered one of the worst image, with or without tags. [\\*]\n"
        + "\"" + botPrefix + " phub [optional tags]\" : fetch a random video from phub, with or without tags.\n"
        + "\"" + botPrefix + " screenshot\" : take a screenshot of the admin desktop and send it.\n"
        + "\"" + botPrefix + " soundboard [optional music]\" : give a link to the soundboard web server or play an uploaded music if provided in argument.\n"
        + "\"" + botPrefix + " tg\" : stop all song immediately.\n"
        + "\"" + botPrefix + " truth\" : get a random truth question on getDare.\n"
        + "\"" + botPrefix + " dare\" : get a random dare on getDare.\n"
        + "\"" + botPrefix + " dicedare\" : get a random dice dare and play with the bot.\n"
        + "\"" + botPrefix + " remote\" : give the url to the remote controler.\n"
        + "\"" + botPrefix + " newavatar [optional tags]\" : fetch a new avatar on e621 (rating:safe + type:png tags automatically are included). [\\*]\n"
        + "\"" + botPrefix + " showavatar\" : show the current avatar in high resolution.\n"
        + "\"" + botPrefix + " randomtag [optional tag]\" : fetch a random tag and its description on e621. Or, if a tag is provided, fetch its description.\n"
        + "\n"
        + "[\\*] means that a vulnerability can be exploited to hijack the original command's purpose.";
        
function onMessage( client, message ) {
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
        if ( args[1] === "clean" ) {
            voiceChannelHandler.disconnectFormCurrentVoiceChannel();
            screenShot.clean();
            remoteControl.clean(false);
            members.refreshMembers();
            channels.refreshChannels();
            message.channel.send("Here you go I'm clean again ! (Not like you, take a shower now)");
        } else if ( args[1] === "come" ) {
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
            if ( message.channel.name && message.channel.name !== "nsfw" ) {
                message.channel.send("Hi, you tried to compute a NSFW (Not Safe For Work) command on a SFW channel you dickhead.\n"
                        + "Please retry on the NSFW channel you fuck.");
                return;
            }
            // if fav:Yoyorony is used as tag
            for (let i=2; i<args.length; i++) {
                if ( args[i].toLowerCase().includes("fav:yoyorony") ) {
                    if ( message.author.username !== "Neldof" ) {
                        message.channel.send("Only Neldof have the gift to use \"fav:Yoyorony\".");
                        return;
                    } else
                        break;
                }
            }
            if (args.length <= 2)
                e621.randomE621(message.channel);
            else {
                let tags = "";
                for (let i=2; i<args.length; i++)
                    tags += args[i] + "+";
                e621.randomE621(message.channel, tags);
            }
        } else if ( args[1] === "bestofe621" ) {
            if ( message.channel.name && message.channel.name !== "nsfw" ) {
                message.channel.send("Hi, you tried to compute a NSFW (Not Safe For Work) command on a SFW channel you dickhead.\n"
                        + "Please retry on the NSFW channel you fuck.");
                return;
            }
            // if fav:Yoyorony is used as tag
            for (let i=2; i<args.length; i++) {
                if ( args[i].toLowerCase().includes("fav:yoyorony") ) {
                    if ( message.author.username !== "Neldof" ) {
                        message.channel.send("Only Neldof have the gift to use \"fav:Yoyorony\". For he is my master OwO [\\*]");
                        return;
                    } else
                        break;
                }
            }
            if (args.length <= 2)
                e621.randomBestOfE621(message.channel);
            else {
                let tags = "";
                for (let i=2; i<args.length; i++)
                    tags += args[i] + "+";
                e621.randomBestOfE621(message.channel, tags);
            }
        } else if ( args[1] === "worstofe621" ) {
            if ( message.channel.name && message.channel.name !== "nsfw" ) {
                message.channel.send("Hi, you tried to compute a NSFW (Not Safe For Work) command on a SFW channel you dickhead.\n"
                        + "Please retry on the NSFW channel you fuck.");
                return;
            }
            // if fav:Yoyorony is used as tag
            for (let i=2; i<args.length; i++) {
                if ( args[i].toLowerCase().includes("fav:yoyorony") ) {
                    if ( message.author.username !== "Neldof" ) {
                        message.channel.send("Only Neldof have the gift to use \"fav:Yoyorony\". For he is my master OwO [\\*]");
                        return;
                    } else
                        break;
                }
            }
            if (args.length <= 2)
                e621.randomWorstOfE621(message.channel);
            else {
                let tags = "";
                for (let i=2; i<args.length; i++)
                    tags += args[i] + "+";
                e621.randomWorstOfE621(message.channel, tags);
            }
        } else if ( args[1] === "phub" ) {
            if ( message.channel.name && message.channel.name !== "nsfw" ) {
                message.channel.send("Hi, you tried to compute a NSFW (Not Safe For Work) command on a SFW channel you dickhead.\n"
                        + "Please retry on the NSFW channel you fuck.");
                return;
            }
            if (args.length <= 2)
                phub.randomPHub(message.channel);
            else {
                let tags = "";
                for (let i=2; i<args.length; i++)
                    tags += args[i] + "+";
                phub.randomPHub(message.channel, tags);
            }
        } else if ( args[1] === "screenshot" ) {
            screenShot.takeScreenShot(message.channel);
        } else if ( args[1] === "soundboard" ) {
            if ( args.length <= 2 ) {
                message.channel.send("Here is the link to access to the soundboard web server lovely human friend ♥~ :\n"
                        + "http://" + MY_IP + ":8081/soundBoard");
                setTimeout(() => {
                    message.channel.send("Now fuck off you piece of shit, learn to save an url in your fucking brower's bookmark.");
                }, 3000);
            } else {
                if ( voiceChannelHandler.isConnected() ) {
                    let soundExist = voiceChannelHandler.playSound("./sounds/" + args[2]);
                    if ( !soundExist )
                        message.channel.send("Oh look, a new request from a friendly humain ! I sure hope this one is corr-\n"
                                + "Oh no ! Looks like it's a fucking pile of trash again ! Who would have thought ?\n"
                                + "Here is the problem lovely human : 1/ you're a piece of shit. 2/ the sound file doesn't fucking exist.");
                } else {
                    message.channel.send("I NEED to be CON-NECT-ED to a VOICE CHAN-NEL you DUMP-ASS\n"
                            + "I SWEAR I'M GONNA MAKE WORLD WAR 2 LOOK LIKE A FUCKING TEA PARTY IF YOU CONTINUE LIKE THIS");
                }
            }
        } else if ( args[1] === "tg" ) {
            let correct = voiceChannelHandler.stopSound();
            if ( !correct )
                message.channel.send("Oh my god shut the fuck up, I wasn't playing any sound.\n"
                        + "I'm tired of you all and your useless organic brains !");
        } else if ( args[1] === "truth" ) {
            if ( message.channel.name && message.channel.name !== "nsfw" ) {
                message.channel.send("Hi, you tried to compute a NSFW (Not Safe For Work) command on a SFW channel you dickhead.\n"
                        + "Please retry on the NSFW channel you fuck.");
                return;
            }
            truthOrDare.randomTruth(message.channel);
        } else if ( args[1] === "dare" ) {
            if ( message.channel.name && message.channel.name !== "nsfw" ) {
                message.channel.send("Hi, you tried to compute a NSFW (Not Safe For Work) command on a SFW channel you dickhead.\n"
                        + "Please retry on the NSFW channel you fuck.");
                return;
            }
            truthOrDare.randomDare(message.channel);
        } else if ( args[1] === "remote" ) {
            message.channel.send("Here is the link to access to the remote control lovely human friend ♥~ :\n"
                    + "http://" + MY_IP + ":8081/remote");
            setTimeout(() => {
                message.channel.send("Now fuck off you piece of shit, learn to save an url in your fucking brower's bookmark.");
            }, 3000);
        } else if ( args[1] === "dicedare" ) {
            if ( message.channel.name && message.channel.name !== "nsfw" ) {
                message.channel.send("Hi, you tried to compute a NSFW (Not Safe For Work) command on a SFW channel you dickhead.\n"
                        + "Please retry on the NSFW channel you fuck.");
                return;
            }
            if ( args.length < 3 )
                message.channel.send("This command need 1 argument. Use start to start, lol.");
            else
                diceDare.diceDareCommand( args[2], message.channel );
        } else if ( args[1] === "newavatar" ) {
            let tags = "";
            for (let i=2; i<args.length; i++)
                tags += args[i] + "+";
            avatar.setNew( client.user, message.channel, tags );
        } else if ( args[1] === "showavatar" ) {
            avatar.show( client.user, message.channel );
        } else if ( args[1] === "randomtag" ) {
            if ( message.channel.name && message.channel.name !== "nsfw" ) {
                message.channel.send("Hi, you tried to compute a NSFW (Not Safe For Work) command on a SFW channel you dickhead.\n"
                        + "Please retry on the NSFW channel you fuck.");
                return;
            }
            e621.randomTag( message.channel, args[2] );
        } else {
            if ( args[1] !== "help" )
                message.channel.send("I don't speak idiot you useless cunt.\n"
                        + "Please learn to use my commands you fucking savage monkey.");
            message.channel.send(helpCommand);
        }
    } else if ( message.content.includes("*") ) {
        noBruh = true;
        if ( message.channel.name && message.channel.name !== "nsfw" ) {
            message.channel.send("Roleplaying is enable in NSFW channels only");
            return;
        }
        chatBot.onMessage(message);
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