const Discord = require("discord.js");
const client = new Discord.Client();

// our libs
const commandHandler = require("./commandHandler");
const voiceChannelHandler = require("./voiceChannelHandler");
const screenShot = require("./screenShot");
const soundBoard = require("./soundBoard");

// The token is obviously in another file (which will not be push into github thanks to .gitignore)
// Please create a file "token.js" next to this file and enter the following code in it :
// module.exports = Object.freeze({TOKEN: <the token in a string>});
const token = require("./token").TOKEN;

client.on("ready", () => {
  	console.log("Aye aye commander, I'm in.");
});

// message in chat
client.on("message", commandHandler.onMessage);

// Detect when a member speaking status change (talking / not talking)
client.on("guildMemberSpeaking", (member, speakingStatus) => {
	if ( member && speakingStatus ) {
		const user = member.user;
		console.log("Speaking event (" + speakingStatus + ") : " + user.username);
	}
});

// PLEASE use this function to restore the bot state before you end the code LIKE A FUCKING SAVAGE WITH CRTL+C YOU FUCKING MONKEY
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
function gracefulShutdown() {
    console.log("Caught interrupt signal captain ! Preparing to leave now.");
	voiceChannelHandler.disconnectFormCurrentVoiceChannel();
	screenShot.clean();
    console.log("Everything ended like planned. Good bye commander.");
    process.exit();
};

// launch soundBoard web server
soundBoard.initSoundBoard(8081);

// Leave this at the end. If you don't leave his at the end of the code I will track you down and use your face to clean my windows. 
client.login(token);