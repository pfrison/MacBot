const Discord = require("discord.js");
const client = new Discord.Client();
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");

// our libs
const commandHandler = require("./commandHandler");
const voiceChannelHandler = require("./voiceChannelHandler");
const screenShot = require("./screenShot");
const soundBoard = require("./soundBoard");
const remoteControl = require("./remoteControl");
const members = require("./members");
const channels = require("./channels");
const e621 = require("./e621");
const chatBot = require("./chatBot");

// The token is obviously in another file (which will not be push into github thanks to .gitignore)
// Please create a file "token.js" next to this file and enter the following code in it :
// module.exports = Object.freeze({TOKEN: <the token in a string>});
const token = require("./token").TOKEN;
const PORT = 8081;
const botID = "724755124223737876"

client.on("ready", () => {
	console.log("Aye aye commander, I'm in.");
	client.user.setActivity(null);
	members.refreshMembers();
	channels.refreshChannels();
	channels.cacheDMMessages();
	remoteControl.registerBotUser(client.user);

	// delete message dead code
	/*channels.getNSFWChannel().messages.fetch(xxxxxxxxxxx).then((message) => {
		message.delete();
	})*/
});

// message in chat
client.on("message", (message) => {
	channels.cacheDMMessages();
	commandHandler.onMessage(message);
});

// Detect when a member speaking status change (talking / not talking)
client.on("guildMemberSpeaking", (member, speakingStatus) => {
	/*if ( member && speakingStatus ) {
		const user = member.user;
		console.log("Speaking event (" + speakingStatus + ") : " + user.username);
	}*/
});

// reaction on my message
client.on("messageReactionAdd", (reaction, user) => {
	reaction.fetch().then((reaction) => {
		if ( reaction.message.author.id === botID && reaction.message.channel.id !== channels.nsfwChannelId ) {
			if ( reaction.emoji.name === '❤️' )
				e621.handleReaction(reaction.message);
		}
	});
});

// PLEASE use this function to restore the bot state before you end the code LIKE A FUCKING SAVAGE WITH CRTL+C YOU FUCKING MONKEY
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
function gracefulShutdown() {
    console.log("Caught interrupt signal captain ! Preparing to leave now.");
	voiceChannelHandler.disconnectFormCurrentVoiceChannel();
	screenShot.clean();
	remoteControl.clean(false);
    console.log("Everything ended like planned. Good bye commander.");
    process.exit();
};

// global use on express
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// launch soundBoard web server
soundBoard.initSoundBoard(app);

// inits
remoteControl.initRemote(app, client.user);

members.initMembers(client);

channels.initChannels(client);

chatBot.initChatBot();

// express listening
app.listen(PORT);

// Leave this at the end. If you don't leave his at the end of the code I will track you down and use your face to clean my windows. 
client.login(token);