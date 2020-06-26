const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  	console.log("Aye aye commander, I'm in.");
});

var voiceConnection;

client.on('message', message => {
	if ( !message.content )
		return;
	const args = message.content.split(' ');
	
	if ( args[0] === 'macpop' || args[0] === 'Macpop' || args[0] === 'MacPop' ) {
		if ( args[1] === "help" )
			message.channel.send('Command list :\n'
					+ '"owo come" : send the bot to your voice channel.\n'
					+ '"owo leave" : tell the bot to leave the voice channel.');
		else if ( args[1] === 'come' ) {
			let wait = 0;
			if ( voiceConnection ) {
				disconnectFormCurrentVoiceChannel();
				wait = 1000;
			}
			
			setTimeout(() => {
				if ( message.member.voice.channel )
					connectToVoiceChannel( message.member.voice.channel );
				else
					message.channel.send('Your not connected to any voice channel dumbass.\n'
							+ 'You are fucking stupid and I hate you.');
			}, wait);
		} else if ( args[1] === 'leave' ) {
			if ( voiceConnection )
				disconnectFormCurrentVoiceChannel();
			else
				message.channel.send('What the fuck, I am not connected to any voice channel.\n'
					+ 'Leave me the fuck alone you piece of shit.');
		}
	}
});

client.on('guildMemberSpeaking', (member, speakingStatus) => {
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
					console.log("I'm in the voice channel. Scanning in progress.");
				})
				.catch((e) => { console.error(e); });
	} else
		console.error("Cannot get in the voice channel.");
}

function disconnectFormCurrentVoiceChannel() {
	voiceConnection.disconnect();
	voiceConnection = undefined;
}

process.on('SIGINT', function() {
    console.log("Caught interrupt signal captain ! Preparing to leave now.");
	if ( voiceConnection )
		disconnectFormCurrentVoiceChannel();
    console.log("Everything ended like planned. Good bye commander.");
    process.exit();
});

client.login('NzI0NzU1MTI0MjIzNzM3ODc2.XvPuhw.kP0WGBMO6hp4LhglbuJIJfFIWEU');