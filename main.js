const Discord = require("discord.js");
const client = new Discord.Client();

const botPrefix = "macpop"; // in fucking lower case you fucking monkey
const helpCommand = "Command list :\n"
		+ "\"" + botPrefix + " come\" : send the bot to your voice channel.\n"
		+ "\"" + botPrefix + " leave\" : tell the bot to leave the voice channel.";

var voiceConnection; // used to keep track of voice connection

client.on("ready", () => {
  	console.log("Aye aye commander, I'm in.");
});

<<<<<<< HEAD
client.on("message", message => {
=======
client.on("message", (message) => {
>>>>>>> code cleaning / commeting + bot prefix is now a constant
	if ( !message.content )
		return;
	const args = message.content.split(" ");
	
	// command handler. DO NOT FUCKING FORGET THE LOWER CASE
	if ( args[0].toLowerCase() === botPrefix ) {
		if ( args[1].toLowerCase() === "come" ) {
			let wait = 0;
			if ( voiceConnection ) {
				disconnectFormCurrentVoiceChannel();
				wait = 1000;
			}
			
			setTimeout(() => {
				if ( message.member.voice.channel )
					connectToVoiceChannel( message.member.voice.channel );
				else
					message.channel.send("Your not connected to any voice channel dumbass.\n"
							+ "You are fucking stupid and I hate you.");
			}, wait);
		} else if ( args[1].toLowerCase() === "leave" ) {
			if ( voiceConnection )
				disconnectFormCurrentVoiceChannel();
			else
				message.channel.send("What the fuck, I am not connected to any voice channel.\n"
						+ "Leave me the fuck alone you piece of shit.");
		} else {
<<<<<<< HEAD
			if ( args[1].toLowerCase() !== "help" ) {
=======
			if ( args[1].toLowerCase() !== "help" )
>>>>>>> code cleaning / commeting + bot prefix is now a constant
				message.channel.send("I don't speak idiot you useless cunt.\n"
						+ "Please learn to use these commands you fucking savage monkey.");
			message.channel.send(helpCommand);
		}
	}
});

// Detect when a member speaking status change (talking / not talking)
client.on("guildMemberSpeaking", (member, speakingStatus) => {
	if ( member && speakingStatus ) {
		const user = member.user;
		console.log("Speaking event (" + speakingStatus + ") : " + user.username);
	}
});

function connectToVoiceChannel( channel ) {
	if (channel != null) {
		channel.join()
				.then((connection) => {
					voiceConnection = connection;
					console.log("I"m in the voice channel. Scanning in progress.");
				})
				.catch((e) => { console.error(e); });
	} else
		console.error("Cannot get in the voice channel.");
}
function disconnectFormCurrentVoiceChannel() {
	voiceConnection.disconnect();
	voiceConnection = undefined;
}

// PLEASE use this function to restore the bot state before you end the code LIKE A FUCKING SAVAGE WITH CRTL+C YOU FUCKING MONKEY
process.on("SIGINT", function() {
    console.log("Caught interrupt signal captain ! Preparing to leave now.");
	if ( voiceConnection )
		disconnectFormCurrentVoiceChannel();
    console.log("Everything ended like planned. Good bye commander.");
    process.exit();
});

// Leave this at the end. If you don't leave his at the end of the code I will track you down and use your face to clean my windows. 
client.login("NzI0NzU1MTI0MjIzNzM3ODc2.XvPuhw.kP0WGBMO6hp4LhglbuJIJfFIWEU");